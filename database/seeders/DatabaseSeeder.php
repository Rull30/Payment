<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::create([
            'name' => 'Alex Wirawan',
            'email' => 'demo@example.com',
            'password' => Hash::make('password'),
            'business_name' => 'Acme Creative Studio',
            'sender_name' => 'Alex Wirawan',
            'bank_details' => [
                'bank_name' => 'BCA (Bank Central Asia)',
                'account_number' => '8270912384',
                'account_holder' => 'Alex Wirawan',
            ],
        ]);

        $clientA = Client::create([
            'user_id' => $user->id,
            'name' => 'PT Digital Maju Bersama',
            'phone' => '+6281234567890',
            'email' => 'finance@digitalmaju.co.id',
            'address' => 'Jl. Jenderal Sudirman Kav. 45, Jakarta Selatan',
        ]);

        $clientB = Client::create([
            'user_id' => $user->id,
            'name' => 'Studio Kopi Senja',
            'phone' => '+6281987654321',
            'email' => 'owner@kopisenja.com',
            'address' => 'Jl. Gandaria 1 No. 12, Jakarta Selatan',
        ]);

        $clientC = Client::create([
            'user_id' => $user->id,
            'name' => 'Dr. Hendra Pratama',
            'phone' => '+6281122334455',
            'email' => 'hendra.p@clinic.id',
            'address' => 'Ruko Dharmawangsa Blok B-3, Surabaya',
        ]);

        // 1. Sent Invoice (Due soon)
        $inv1 = Invoice::create([
            'user_id' => $user->id,
            'client_id' => $clientA->id,
            'uuid' => (string) Str::uuid(),
            'invoice_number' => 'INV-202609-0001',
            'issue_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
            'due_date' => Carbon::now()->addDays(2)->format('Y-m-d'),
            'status' => 'sent',
            'notes' => 'Pembayaran via transfer bank sesuai rincian rekening tertera. Mohon konfirmasi bukti transfer via WhatsApp.',
            'total_amount' => 7500000.00,
        ]);
        InvoiceItem::create([
            'invoice_id' => $inv1->id,
            'description' => 'UI/UX Redesign - Web Application & Dashboard',
            'quantity' => 1,
            'unit_price' => 4500000.00,
            'subtotal' => 4500000.00,
        ]);
        InvoiceItem::create([
            'invoice_id' => $inv1->id,
            'description' => 'Design System Tokens & Component Library',
            'quantity' => 1,
            'unit_price' => 3000000.00,
            'subtotal' => 3000000.00,
        ]);
        $inv1->recalculateTotal();

        // 2. Overdue Invoice
        $inv2 = Invoice::create([
            'user_id' => $user->id,
            'client_id' => $clientB->id,
            'uuid' => (string) Str::uuid(),
            'invoice_number' => 'INV-202609-0002',
            'issue_date' => Carbon::now()->subDays(18)->format('Y-m-d'),
            'due_date' => Carbon::now()->subDays(4)->format('Y-m-d'),
            'status' => 'overdue',
            'notes' => 'Invoice jatuh tempo 4 hari yang lalu. Mohon selesaikan pelunasan segera.',
            'total_amount' => 3200000.00,
        ]);
        InvoiceItem::create([
            'invoice_id' => $inv2->id,
            'description' => 'Social Media Content Kit & Menu Packaging',
            'quantity' => 1,
            'unit_price' => 3200000.00,
            'subtotal' => 3200000.00,
        ]);
        $inv2->recalculateTotal();

        // 3. Paid Invoice
        $inv3 = Invoice::create([
            'user_id' => $user->id,
            'client_id' => $clientC->id,
            'uuid' => (string) Str::uuid(),
            'invoice_number' => 'INV-202609-0003',
            'issue_date' => Carbon::now()->subDays(25)->format('Y-m-d'),
            'due_date' => Carbon::now()->subDays(10)->format('Y-m-d'),
            'status' => 'paid',
            'notes' => 'Lunas. Terima kasih atas kerja samanya.',
            'total_amount' => 5000000.00,
        ]);
        InvoiceItem::create([
            'invoice_id' => $inv3->id,
            'description' => 'Medical Booking Landing Page Development',
            'quantity' => 1,
            'unit_price' => 5000000.00,
            'subtotal' => 5000000.00,
        ]);
        $inv3->recalculateTotal();

        // 4. Draft Invoice
        $inv4 = Invoice::create([
            'user_id' => $user->id,
            'client_id' => $clientA->id,
            'uuid' => (string) Str::uuid(),
            'invoice_number' => 'INV-202609-0004',
            'issue_date' => Carbon::now()->format('Y-m-d'),
            'due_date' => Carbon::now()->addDays(14)->format('Y-m-d'),
            'status' => 'draft',
            'notes' => 'Draft invoice untuk sprint bulan Oktober.',
            'total_amount' => 6000000.00,
        ]);
        InvoiceItem::create([
            'invoice_id' => $inv4->id,
            'description' => 'Inertia.js & React Frontend Integration Phase 2',
            'quantity' => 1,
            'unit_price' => 6000000.00,
            'subtotal' => 6000000.00,
        ]);
        $inv4->recalculateTotal();
    }
}
