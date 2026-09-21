<?php

namespace App\Console\Commands;

use App\Models\InvoiceInstallment;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckInvoiceRemindersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:check-reminders {--mark-sent : Mark reminders as sent}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan pending invoice installments due in 3 days (H-3) and flag reminders';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today()->toDateString();
        $targetDate = Carbon::today()->addDays(3)->toDateString();

        $this->info("Scanning installments due between {$today} and {$targetDate} (H-3)...");

        // 1. Auto-flag overdue installments
        $overdueCount = InvoiceInstallment::where('status', 'pending')
            ->where('due_date', '<', $today)
            ->update(['status' => 'overdue']);

        if ($overdueCount > 0) {
            $this->warn("Updated {$overdueCount} past-due installments to 'overdue' status.");
        }

        // 2. Query upcoming H-3 installments
        $upcoming = InvoiceInstallment::with(['invoice.client', 'invoice.user'])
            ->where('status', 'pending')
            ->whereBetween('due_date', [$today, $targetDate])
            ->orderBy('due_date')
            ->get();

        if ($upcoming->isEmpty()) {
            $this->info('No pending installments due within the next 3 days.');

            return Command::SUCCESS;
        }

        $rows = $upcoming->map(function (InvoiceInstallment $item) {
            return [
                'Invoice' => $item->invoice->invoice_number,
                'Client' => $item->invoice->client->name ?? '-',
                'WhatsApp' => $item->invoice->client->phone ?? '-',
                'Tenor' => "Cicilan {$item->installment_number}/{$item->total_installments}",
                'Nominal' => $item->formatted_amount,
                'Due Date' => $item->due_date->format('d M Y'),
                'Days Left' => $item->days_until_due.' hari',
            ];
        });

        $this->table(['Invoice', 'Client', 'WhatsApp', 'Tenor', 'Nominal', 'Due Date', 'Days Left'], $rows);

        if ($this->option('mark-sent')) {
            $now = Carbon::now();
            foreach ($upcoming as $item) {
                $item->update(['reminder_sent_at' => $now]);
            }
            $this->info("Marked {$upcoming->count()} reminders as sent at {$now->toDateTimeString()}.");
        }

        return Command::SUCCESS;
    }
}
