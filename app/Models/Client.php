<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'email',
        'address',
    ];

    /**
     * Get the user that owns the client.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all invoices for the client.
     *
     * @return HasMany<Invoice, $this>
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Sanitize phone number for WhatsApp wa.me links.
     * Removes non-digit characters and normalizes leading zero if standard.
     */
    public function getSanitizedPhoneAttribute(): string
    {
        $phone = preg_replace('/[^0-9]/', '', (string) $this->phone);

        if (str_starts_with($phone, '0')) {
            // Default Indonesian / common prefix if starts with 0
            $phone = '62'.substr($phone, 1);
        }

        return $phone;
    }
}
