<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Inertia\Inertia;
use Inertia\Response;

class PublicInvoiceController extends Controller
{
    /**
     * Display a clean, distraction-free public view of an invoice for clients.
     */
    public function show(string $uuid): Response
    {
        $invoice = Invoice::where('uuid', $uuid)
            ->with(['client', 'items', 'installments', 'user:id,name,email,business_name,sender_name,bank_details'])
            ->firstOrFail();

        return Inertia::render('Invoices/PublicShow', [
            'invoice' => $invoice,
        ]);
    }
}
