<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'client_id',
        'uuid',
        'invoice_number',
        'issue_date',
        'due_date',
        'status',
        'notes',
        'total_amount',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'formatted_total',
        'is_overdue',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issue_date' => 'date:Y-m-d',
            'due_date' => 'date:Y-m-d',
            'total_amount' => 'decimal:2',
        ];
    }

    /**
     * Boot the model to auto-generate UUID and serial invoice number.
     */
    protected static function booted(): void
    {
        static::creating(function (Invoice $invoice) {
            if (empty($invoice->uuid)) {
                $invoice->uuid = (string) Str::uuid();
            }

            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = static::generateInvoiceNumber();
            }
        });
    }

    /**
     * Generate an invoice serial code: INV-YYYYMM-XXXX.
     */
    public static function generateInvoiceNumber(): string
    {
        $yearMonth = Carbon::now()->format('Ym');
        $latest = static::where('invoice_number', 'like', "INV-{$yearMonth}-%")
            ->orderBy('id', 'desc')
            ->first();

        if ($latest) {
            $parts = explode('-', $latest->invoice_number);
            $sequence = isset($parts[2]) ? (int) $parts[2] + 1 : 1;
        } else {
            $sequence = 1;
        }

        return sprintf('INV-%s-%04d', $yearMonth, $sequence);
    }

    /**
     * Get the owner user of this invoice.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the client for this invoice.
     *
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the line items belonging to the invoice.
     *
     * @return HasMany<InvoiceItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Get the installment schedules belonging to the invoice.
     *
     * @return HasMany<InvoiceInstallment, $this>
     */
    public function installments(): HasMany
    {
        return $this->hasMany(InvoiceInstallment::class)->orderBy('installment_number');
    }

    /**
     * Synchronize overall invoice status based on installment payment states.
     */
    public function syncInstallmentStatus(): void
    {
        if ($this->installments()->count() === 0) {
            return;
        }

        $allPaid = $this->installments()->where('status', '!=', 'paid')->count() === 0;
        if ($allPaid) {
            $this->status = 'paid';
            $this->save();

            return;
        }

        $hasOverdue = $this->installments()->where('status', 'overdue')
            ->orWhere(function ($q) {
                $q->where('status', 'pending')
                    ->where('due_date', '<', Carbon::today()->toDateString());
            })->exists();

        if ($hasOverdue && $this->status !== 'paid') {
            $this->status = 'overdue';
            $this->save();

            return;
        }

        if ($this->status === 'paid' && ! $allPaid) {
            $this->status = 'unpaid';
            $this->save();
        }
    }

    /**
     * Recalculate and update the total amount from items.
     */
    public function recalculateTotal(): void
    {
        $this->total_amount = $this->items()->sum('subtotal');
        $this->save();
    }

    /**
     * Get formatted total currency.
     */
    public function getFormattedTotalAttribute(): string
    {
        return 'Rp '.number_format((float) $this->total_amount, 0, ',', '.');
    }

    /**
     * Check if invoice is overdue.
     */
    public function getIsOverdueAttribute(): bool
    {
        if ($this->status === 'paid') {
            return false;
        }

        return Carbon::parse($this->due_date)->isPast() && ! Carbon::parse($this->due_date)->isToday();
    }

    /**
     * Scope for filtering invoices by status.
     *
     * @param  Builder<Invoice>  $query
     */
    public function scopeFilterStatus(Builder $query, ?string $status): Builder
    {
        if (! $status || $status === 'all') {
            return $query;
        }

        if ($status === 'overdue') {
            return $query->where(function ($q) {
                $q->where('status', 'overdue')
                    ->orWhere(function ($sub) {
                        $sub->where('status', '!=', 'paid')
                            ->where('due_date', '<', Carbon::today());
                    });
            });
        }

        return $query->where('status', $status);
    }

    /**
     * Scope for searching invoices by number or client name.
     *
     * @param  Builder<Invoice>  $query
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (! $search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('invoice_number', 'like', "%{$search}%")
                ->orWhereHas('client', function ($clientQuery) use ($search) {
                    $clientQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
        });
    }
}
