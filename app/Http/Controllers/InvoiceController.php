<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceInstallment;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices with metric counters, filters, and H-3 installment reminders.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $status = $request->input('status', 'all');
        $search = $request->input('search');

        $query = $user->invoices()
            ->with(['client', 'items', 'installments'])
            ->latest('issue_date');

        if ($status && $status !== 'all') {
            $query->filterStatus($status);
        }

        if ($search) {
            $query->search($search);
        }

        $invoices = $query->paginate(10)->withQueryString();

        // Calculate key metrics
        $allInvoices = $user->invoices()->get();
        $totalReceivables = $allInvoices->whereIn('status', ['sent', 'overdue', 'unpaid'])->sum('total_amount');
        $paidThisMonth = $allInvoices->where('status', 'paid')
            ->filter(fn (Invoice $inv) => Carbon::parse($inv->updated_at)->isCurrentMonth())
            ->sum('total_amount');
        $overdueCount = $allInvoices->filter(fn (Invoice $inv) => $inv->is_overdue || $inv->status === 'overdue')->count();
        $draftCount = $allInvoices->where('status', 'draft')->count();

        // Fetch upcoming H-3 reminders for this user
        $today = Carbon::today()->toDateString();
        $h3Date = Carbon::today()->addDays(3)->toDateString();

        $upcomingReminders = InvoiceInstallment::whereHas('invoice', fn ($q) => $q->where('user_id', $user->id))
            ->where('status', 'pending')
            ->whereBetween('due_date', [$today, $h3Date])
            ->with(['invoice.client'])
            ->orderBy('due_date')
            ->get();

        return Inertia::render('Dashboard', [
            'invoices' => $invoices,
            'upcoming_reminders' => $upcomingReminders,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'metrics' => [
                'total_receivables' => (float) $totalReceivables,
                'total_receivables_formatted' => 'Rp '.number_format((float) $totalReceivables, 0, ',', '.'),
                'paid_this_month' => (float) $paidThisMonth,
                'paid_this_month_formatted' => 'Rp '.number_format((float) $paidThisMonth, 0, ',', '.'),
                'overdue_count' => $overdueCount,
                'draft_count' => $draftCount,
                'total_invoices' => $allInvoices->count(),
            ],
            'business' => [
                'business_name' => $user->business_name ?? $user->name,
                'sender_name' => $user->sender_name ?? $user->name,
                'bank_details' => $user->bank_details ?? [
                    'bank_name' => '',
                    'account_number' => '',
                    'account_holder' => '',
                ],
            ],
        ]);
    }

    /**
     * Show the form for creating a new invoice.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $clients = $user->clients()->orderBy('name')->get();

        return Inertia::render('Invoices/Create', [
            'clients' => $clients,
            'suggested_invoice_number' => Invoice::generateInvoiceNumber(),
            'today' => Carbon::today()->format('Y-m-d'),
            'default_due_date' => Carbon::today()->addDays(7)->format('Y-m-d'),
        ]);
    }

    /**
     * Store a newly created invoice in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'invoice_number' => ['required', 'string', 'max:32'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:issue_date'],
            'status' => ['required', 'in:draft,sent,paid,overdue'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'payment_type' => ['nullable', 'in:full,installment'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'installments' => ['nullable', 'array'],
            'installments.*.installment_number' => ['required_with:installments', 'integer', 'min:1'],
            'installments.*.total_installments' => ['required_with:installments', 'integer', 'min:1'],
            'installments.*.amount' => ['required_with:installments', 'numeric', 'min:0'],
            'installments.*.due_date' => ['required_with:installments', 'date'],
            'installments.*.notes' => ['nullable', 'string', 'max:255'],
        ]);

        $client = $user->clients()->findOrFail($validated['client_id']);

        DB::transaction(function () use ($user, $client, $validated) {
            $invoice = $user->invoices()->create([
                'client_id' => $client->id,
                'invoice_number' => $validated['invoice_number'],
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'],
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
                'total_amount' => 0,
            ]);

            foreach ($validated['items'] as $itemData) {
                $subtotal = (int) $itemData['quantity'] * (float) $itemData['unit_price'];
                $invoice->items()->create([
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $subtotal,
                ]);
            }

            $invoice->recalculateTotal();

            // Save installments if payment type is installment
            if (($validated['payment_type'] ?? 'full') === 'installment' && ! empty($validated['installments'])) {
                foreach ($validated['installments'] as $inst) {
                    $invoice->installments()->create([
                        'installment_number' => $inst['installment_number'],
                        'total_installments' => $inst['total_installments'],
                        'amount' => $inst['amount'],
                        'due_date' => $inst['due_date'],
                        'status' => 'pending',
                        'notes' => $inst['notes'] ?? null,
                    ]);
                }
                $invoice->syncInstallmentStatus();
            }
        });

        return redirect()->route('dashboard')->with('message', 'Invoice created successfully.');
    }

    /**
     * Show the form for editing an existing invoice.
     */
    public function edit(Request $request, Invoice $invoice): Response
    {
        $user = $request->user();

        if ($invoice->user_id !== $user->id) {
            abort(403);
        }

        $invoice->load(['client', 'items', 'installments']);
        $clients = $user->clients()->orderBy('name')->get();

        return Inertia::render('Invoices/Edit', [
            'invoice' => $invoice,
            'clients' => $clients,
        ]);
    }

    /**
     * Update the specified invoice in storage.
     */
    public function update(Request $request, Invoice $invoice): RedirectResponse
    {
        $user = $request->user();

        if ($invoice->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'invoice_number' => ['required', 'string', 'max:32'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:issue_date'],
            'status' => ['required', 'in:draft,sent,paid,overdue'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'payment_type' => ['nullable', 'in:full,installment'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'installments' => ['nullable', 'array'],
            'installments.*.installment_number' => ['required_with:installments', 'integer', 'min:1'],
            'installments.*.total_installments' => ['required_with:installments', 'integer', 'min:1'],
            'installments.*.amount' => ['required_with:installments', 'numeric', 'min:0'],
            'installments.*.due_date' => ['required_with:installments', 'date'],
            'installments.*.status' => ['nullable', 'in:pending,paid,overdue'],
            'installments.*.notes' => ['nullable', 'string', 'max:255'],
        ]);

        $user->clients()->findOrFail($validated['client_id']);

        DB::transaction(function () use ($invoice, $validated) {
            $invoice->update([
                'client_id' => $validated['client_id'],
                'invoice_number' => $validated['invoice_number'],
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'],
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Replace line items
            $invoice->items()->delete();
            foreach ($validated['items'] as $itemData) {
                $subtotal = (int) $itemData['quantity'] * (float) $itemData['unit_price'];
                $invoice->items()->create([
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $subtotal,
                ]);
            }

            $invoice->recalculateTotal();

            // Sync installments
            $invoice->installments()->delete();
            if (($validated['payment_type'] ?? 'full') === 'installment' && ! empty($validated['installments'])) {
                foreach ($validated['installments'] as $inst) {
                    $invoice->installments()->create([
                        'installment_number' => $inst['installment_number'],
                        'total_installments' => $inst['total_installments'],
                        'amount' => $inst['amount'],
                        'due_date' => $inst['due_date'],
                        'status' => $inst['status'] ?? 'pending',
                        'notes' => $inst['notes'] ?? null,
                    ]);
                }
                $invoice->syncInstallmentStatus();
            }
        });

        return redirect()->route('dashboard')->with('message', 'Invoice updated successfully.');
    }

    /**
     * Update the overall invoice status directly (e.g. mark as Paid or Sent).
     */
    public function updateStatus(Request $request, Invoice $invoice): RedirectResponse
    {
        $user = $request->user();

        if ($invoice->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:draft,sent,paid,overdue'],
        ]);

        $invoice->update(['status' => $validated['status']]);

        // If marked paid, optionally mark all installments paid as well
        if ($validated['status'] === 'paid') {
            $invoice->installments()->update([
                'status' => 'paid',
                'paid_at' => Carbon::now(),
            ]);
        }

        return back()->with('message', 'Invoice status updated.');
    }

    /**
     * Toggle or update installment status (e.g. mark paid / pending).
     */
    public function updateInstallmentStatus(Request $request, InvoiceInstallment $installment): RedirectResponse
    {
        $user = $request->user();

        if ($installment->invoice->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:pending,paid,overdue'],
        ]);

        $installment->update([
            'status' => $validated['status'],
            'paid_at' => $validated['status'] === 'paid' ? Carbon::now() : null,
        ]);

        $installment->invoice->syncInstallmentStatus();

        return back()->with('message', 'Status cicilan berhasil diperbarui.');
    }

    /**
     * Mark an installment's reminder as sent.
     */
    public function markReminderSent(Request $request, InvoiceInstallment $installment): RedirectResponse
    {
        $user = $request->user();

        if ($installment->invoice->user_id !== $user->id) {
            abort(403);
        }

        $installment->update([
            'reminder_sent_at' => Carbon::now(),
        ]);

        return back()->with('message', 'Pengingat WhatsApp berhasil dicatat.');
    }

    /**
     * Remove the specified invoice from storage.
     */
    public function destroy(Request $request, Invoice $invoice): RedirectResponse
    {
        $user = $request->user();

        if ($invoice->user_id !== $user->id) {
            abort(403);
        }

        $invoice->delete();

        return redirect()->route('dashboard')->with('message', 'Invoice deleted successfully.');
    }
}
