<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_invoice_can_be_viewed_without_authentication(): void
    {
        $user = User::factory()->create([
            'business_name' => 'Acme Studio',
            'bank_details' => [
                'bank_name' => 'BCA',
                'account_number' => '123456789',
                'account_holder' => 'Acme User',
            ],
        ]);

        $client = Client::create([
            'user_id' => $user->id,
            'name' => 'John Client',
            'phone' => '+6281234567890',
        ]);

        $invoice = Invoice::create([
            'user_id' => $user->id,
            'client_id' => $client->id,
            'issue_date' => Carbon::today()->format('Y-m-d'),
            'due_date' => Carbon::today()->addDays(7)->format('Y-m-d'),
            'status' => 'sent',
            'total_amount' => 1500000,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'description' => 'Website Design',
            'quantity' => 1,
            'unit_price' => 1500000,
            'subtotal' => 1500000,
        ]);

        $response = $this->get('/i/'.$invoice->uuid);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Invoices/PublicShow')
            ->where('invoice.invoice_number', $invoice->invoice_number)
            ->where('invoice.total_amount', '1500000.00')
        );
    }

    public function test_authenticated_user_can_view_dashboard_with_metrics(): void
    {
        $user = User::factory()->create();
        $client = Client::create([
            'user_id' => $user->id,
            'name' => 'Test Client',
            'phone' => '08123456789',
        ]);

        $invoice = Invoice::create([
            'user_id' => $user->id,
            'client_id' => $client->id,
            'issue_date' => Carbon::today()->format('Y-m-d'),
            'due_date' => Carbon::today()->addDays(7)->format('Y-m-d'),
            'status' => 'sent',
            'total_amount' => 2000000,
        ]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dashboard')
            ->has('invoices.data', 1)
            ->has('metrics')
        );
    }

    public function test_user_can_create_invoice_and_subtotals_calculate_accurately(): void
    {
        $user = User::factory()->create();
        $client = Client::create([
            'user_id' => $user->id,
            'name' => 'Client Bravo',
            'phone' => '+628987654321',
        ]);

        $response = $this->actingAs($user)->post(route('invoices.store'), [
            'client_id' => $client->id,
            'invoice_number' => 'INV-202609-9999',
            'issue_date' => Carbon::today()->format('Y-m-d'),
            'due_date' => Carbon::today()->addDays(10)->format('Y-m-d'),
            'status' => 'draft',
            'notes' => 'Test payment instructions',
            'items' => [
                [
                    'description' => 'Development Service A',
                    'quantity' => 2,
                    'unit_price' => 1500000,
                ],
                [
                    'description' => 'Consultation Service B',
                    'quantity' => 1,
                    'unit_price' => 500000,
                ],
            ],
        ]);

        $response->assertRedirect(route('dashboard'));

        $invoice = Invoice::where('invoice_number', 'INV-202609-9999')->first();
        $this->assertNotNull($invoice);
        $this->assertEquals(3500000.00, $invoice->total_amount);
        $this->assertCount(2, $invoice->items);
    }

    public function test_user_can_update_invoice_status(): void
    {
        $user = User::factory()->create();
        $client = Client::create([
            'user_id' => $user->id,
            'name' => 'Client Charlie',
            'phone' => '+628111222333',
        ]);

        $invoice = Invoice::create([
            'user_id' => $user->id,
            'client_id' => $client->id,
            'issue_date' => Carbon::today()->format('Y-m-d'),
            'due_date' => Carbon::today()->addDays(5)->format('Y-m-d'),
            'status' => 'sent',
            'total_amount' => 1000000,
        ]);

        $response = $this->actingAs($user)->patch(route('invoices.status', $invoice->id), [
            'status' => 'paid',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals('paid', $invoice->fresh()->status);
    }

    public function test_client_sanitized_phone_formats_correctly_for_whatsapp(): void
    {
        $user = User::factory()->create();

        $clientWithZero = Client::create([
            'user_id' => $user->id,
            'name' => 'Local Number',
            'phone' => '0812-3456-7890',
        ]);
        $this->assertEquals('6281234567890', $clientWithZero->sanitized_phone);

        $clientWithPlus = Client::create([
            'user_id' => $user->id,
            'name' => 'International Number',
            'phone' => '+62 819-8765-4321',
        ]);
        $this->assertEquals('6281987654321', $clientWithPlus->sanitized_phone);
    }

    public function test_user_can_create_invoice_with_installments_and_schedule(): void
    {
        $user = User::factory()->create();
        $client = Client::create([
            'user_id' => $user->id,
            'name' => 'Client Si A',
            'phone' => '+6281234567890',
        ]);

        $response = $this->actingAs($user)->post(route('invoices.store'), [
            'client_id' => $client->id,
            'invoice_number' => 'INV-202609-1001',
            'issue_date' => Carbon::today()->format('Y-m-d'),
            'due_date' => Carbon::today()->addMonths(3)->format('Y-m-d'),
            'status' => 'sent',
            'payment_type' => 'installment',
            'items' => [
                [
                    'description' => 'Jasa Pembuatan Software',
                    'quantity' => 1,
                    'unit_price' => 10000000,
                ],
            ],
            'installments' => [
                [
                    'installment_number' => 1,
                    'total_installments' => 3,
                    'amount' => 3333333.33,
                    'due_date' => Carbon::today()->format('Y-m-d'),
                    'notes' => 'Cicilan 1',
                ],
                [
                    'installment_number' => 2,
                    'total_installments' => 3,
                    'amount' => 3333333.33,
                    'due_date' => Carbon::today()->addMonth()->format('Y-m-d'),
                    'notes' => 'Cicilan 2',
                ],
                [
                    'installment_number' => 3,
                    'total_installments' => 3,
                    'amount' => 3333333.34,
                    'due_date' => Carbon::today()->addMonths(2)->format('Y-m-d'),
                    'notes' => 'Cicilan 3',
                ],
            ],
        ]);

        $response->assertRedirect(route('dashboard'));

        $invoice = Invoice::where('invoice_number', 'INV-202609-1001')->first();
        $this->assertNotNull($invoice);
        $this->assertCount(3, $invoice->installments);
        $this->assertEquals(10000000.00, $invoice->total_amount);
    }

    public function test_dashboard_displays_upcoming_h3_reminders(): void
    {
        $user = User::factory()->create();
        $client = Client::create([
            'user_id' => $user->id,
            'name' => 'Client Si A',
            'phone' => '+6281234567890',
        ]);

        $invoice = Invoice::create([
            'user_id' => $user->id,
            'client_id' => $client->id,
            'issue_date' => Carbon::today()->format('Y-m-d'),
            'due_date' => Carbon::today()->addMonth()->format('Y-m-d'),
            'status' => 'sent',
            'total_amount' => 10000000,
        ]);

        // Tenor due in 2 days (within H-3)
        $installment = $invoice->installments()->create([
            'installment_number' => 1,
            'total_installments' => 3,
            'amount' => 3333333,
            'due_date' => Carbon::today()->addDays(2)->toDateString(),
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)->get(route('dashboard'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dashboard')
            ->has('upcoming_reminders', 1)
            ->where('upcoming_reminders.0.id', $installment->id)
        );
    }

    public function test_user_can_toggle_installment_status_and_auto_sync_invoice(): void
    {
        $user = User::factory()->create();
        $client = Client::create([
            'user_id' => $user->id,
            'name' => 'Client Si A',
            'phone' => '+6281234567890',
        ]);

        $invoice = Invoice::create([
            'user_id' => $user->id,
            'client_id' => $client->id,
            'issue_date' => Carbon::today()->format('Y-m-d'),
            'due_date' => Carbon::today()->addMonth()->format('Y-m-d'),
            'status' => 'sent',
            'total_amount' => 5000000,
        ]);

        $inst1 = $invoice->installments()->create([
            'installment_number' => 1,
            'total_installments' => 2,
            'amount' => 2500000,
            'due_date' => Carbon::today()->toDateString(),
            'status' => 'pending',
        ]);

        $inst2 = $invoice->installments()->create([
            'installment_number' => 2,
            'total_installments' => 2,
            'amount' => 2500000,
            'due_date' => Carbon::today()->addMonth()->toDateString(),
            'status' => 'pending',
        ]);

        // Pay installment 1
        $this->actingAs($user)->patch(route('installments.status', $inst1->id), ['status' => 'paid']);
        $this->assertEquals('paid', $inst1->fresh()->status);
        $this->assertEquals('sent', $invoice->fresh()->status);

        // Pay installment 2 -> invoice should automatically sync to 'paid'
        $this->actingAs($user)->patch(route('installments.status', $inst2->id), ['status' => 'paid']);
        $this->assertEquals('paid', $inst2->fresh()->status);
        $this->assertEquals('paid', $invoice->fresh()->status);
    }
}
