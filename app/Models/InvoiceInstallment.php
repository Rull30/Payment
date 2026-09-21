<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceInstallment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'invoice_id',
        'installment_number',
        'total_installments',
        'amount',
        'due_date',
        'status',
        'reminder_sent_at',
        'paid_at',
        'notes',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'formatted_amount',
        'days_until_due',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'installment_number' => 'integer',
            'total_installments' => 'integer',
            'amount' => 'decimal:2',
            'due_date' => 'date:Y-m-d',
            'reminder_sent_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * Get the invoice that owns this installment.
     *
     * @return BelongsTo<Invoice, $this>
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get formatted amount currency.
     */
    public function getFormattedAmountAttribute(): string
    {
        return 'Rp '.number_format((float) $this->amount, 0, ',', '.');
    }

    /**
     * Calculate days until due date (negative if past due).
     */
    public function getDaysUntilDueAttribute(): int
    {
        $today = Carbon::today();
        $due = Carbon::parse($this->due_date);

        return (int) $today->diffInDays($due, false);
    }

    /**
     * Scope query to find pending installments due within given days (default 3 days).
     *
     * @param  Builder<InvoiceInstallment>  $query
     */
    public function scopeDueInDays(Builder $query, int $days = 3): Builder
    {
        $today = Carbon::today()->toDateString();
        $targetDate = Carbon::today()->addDays($days)->toDateString();

        return $query->where('status', 'pending')
            ->whereBetween('due_date', [$today, $targetDate]);
    }

    /**
     * Scope query to find overdue pending installments.
     *
     * @param  Builder<InvoiceInstallment>  $query
     */
    public function scopeOverdue(Builder $query): Builder
    {
        $today = Carbon::today()->toDateString();

        return $query->where('status', 'pending')
            ->where('due_date', '<', $today);
    }
}
