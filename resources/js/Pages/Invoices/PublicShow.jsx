import StatusBadge from '@/Components/StatusBadge';
import { useApp } from '@/Contexts/AppContext';
import { Head } from '@inertiajs/react';
import {
    Check,
    Copy,
    CreditCard,
    Globe,
    Moon,
    Printer,
    Sun,
} from 'lucide-react';
import { useState } from 'react';

export default function PublicShow({ invoice }) {
    const { theme, toggleTheme, locale, toggleLocale, t } = useApp();
    const [copiedAccount, setCopiedAccount] = useState(false);

    const business = invoice.user || {};
    const bankDetails = business.bank_details || {};
    const client = invoice.client || {};

    const handlePrint = () => {
        window.print();
    };

    const handleCopyAccount = async () => {
        if (!bankDetails.account_number) return;
        try {
            await navigator.clipboard.writeText(bankDetails.account_number);
            setCopiedAccount(true);
            setTimeout(() => setCopiedAccount(false), 2000);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    const formatRupiah = (val) => {
        return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
    };

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 py-6 sm:py-10 px-4 antialiased text-zinc-900 dark:text-zinc-100 print:bg-white print:text-black print:p-0 transition-colors duration-200">
            <Head title={`Invoice ${invoice.invoice_number}`} />

            {/* Print & Action Bar (Hidden when printed) */}
            <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">
                        {business.business_name || 'RemindPay'}
                    </span>
                    <span className="text-xs text-zinc-400">/</span>
                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{invoice.invoice_number}</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Language Switch */}
                    <button
                        type="button"
                        onClick={toggleLocale}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <Globe className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                        <span className="uppercase">{locale}</span>
                    </button>

                    {/* Dark Mode Switch */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
                        ) : (
                            <Moon className="w-4 h-4 text-zinc-600" strokeWidth={1.75} />
                        )}
                    </button>

                    {/* Print Button */}
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    >
                        <Printer className="w-3.5 h-3.5" strokeWidth={1.75} />
                        {t('publicInvoice.printBtn')}
                    </button>
                </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-10 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:bg-white print:text-black transition-colors duration-200">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 pb-8">
                    <div>
                        <div className="inline-block px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 print:bg-zinc-100 border border-zinc-200 dark:border-zinc-700 print:border-zinc-200 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 print:text-zinc-600 mb-2">
                            {t('publicInvoice.badge')}
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 print:text-black font-mono">
                            {invoice.invoice_number}
                        </h1>
                        <div className="mt-2 flex items-center gap-2">
                            <StatusBadge status={invoice.status} isOverdue={invoice.is_overdue} />
                        </div>
                    </div>

                    {/* Issuer Business Details */}
                    <div className="text-left sm:text-right text-xs text-zinc-600 dark:text-zinc-400 print:text-zinc-600 space-y-1">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 print:text-black text-sm">
                            {business.business_name || business.name}
                        </p>
                        {business.sender_name && (
                            <p className="text-zinc-600 dark:text-zinc-400 print:text-zinc-600">{business.sender_name}</p>
                        )}
                        <p className="text-zinc-500 print:text-zinc-500">{business.email}</p>
                    </div>
                </div>

                {/* Billing & Date Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 text-xs">
                    {/* Bill To */}
                    <div>
                        <span className="text-[11px] font-medium uppercase text-zinc-400 dark:text-zinc-500 tracking-wider block mb-1">
                            {t('publicInvoice.billedTo')}
                        </span>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 print:text-black text-sm">{client.name}</p>
                        {client.phone && (
                            <p className="text-zinc-600 dark:text-zinc-400 print:text-zinc-600 font-mono mt-0.5">{client.phone}</p>
                        )}
                        {client.email && (
                            <p className="text-zinc-500 print:text-zinc-500">{client.email}</p>
                        )}
                        {client.address && (
                            <p className="text-zinc-600 dark:text-zinc-400 print:text-zinc-600 mt-1 whitespace-pre-line leading-relaxed">
                                {client.address}
                            </p>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="sm:text-right space-y-2">
                        <div>
                            <span className="text-[11px] font-medium uppercase text-zinc-400 dark:text-zinc-500 tracking-wider block">
                                {t('publicInvoice.issueDate')}
                            </span>
                            <span className="font-mono tabular-nums font-medium text-zinc-800 dark:text-zinc-200 print:text-black">
                                {invoice.issue_date}
                            </span>
                        </div>
                        <div>
                            <span className="text-[11px] font-medium uppercase text-zinc-400 dark:text-zinc-500 tracking-wider block">
                                {t('publicInvoice.dueDate')}
                            </span>
                            <span className={`font-mono tabular-nums font-medium ${invoice.is_overdue ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200 print:text-black'}`}>
                                {invoice.due_date}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="py-6">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 bg-zinc-50/70 dark:bg-zinc-800/50 print:bg-zinc-50 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 print:text-zinc-600 uppercase tracking-wider">
                                <th className="py-2.5 px-3">{t('publicInvoice.itemDescription')}</th>
                                <th className="py-2.5 px-3 text-center w-16">{t('publicInvoice.qty')}</th>
                                <th className="py-2.5 px-3 text-right w-32">{t('publicInvoice.unitPrice')}</th>
                                <th className="py-2.5 px-3 text-right w-36">{t('publicInvoice.subtotal')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-zinc-200">
                            {invoice.items && invoice.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200 print:text-black">
                                        {item.description}
                                    </td>
                                    <td className="py-3 px-3 text-center font-mono tabular-nums text-zinc-600 dark:text-zinc-400 print:text-black">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400 print:text-black">
                                        {formatRupiah(item.unit_price)}
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                                        {formatRupiah(item.subtotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Installment Breakdown Table if exists */}
                    {invoice.installments && invoice.installments.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 print:text-black mb-3">
                                {t('installments.scheduleTitle')}
                            </h3>
                            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 print:border-zinc-300 rounded-md">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50 dark:bg-zinc-800/60 print:bg-zinc-50 border-b border-zinc-200 dark:border-zinc-800 print:border-zinc-300 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                                            <th className="py-2 px-3">Tenor</th>
                                            <th className="py-2 px-3 text-right">Nominal</th>
                                            <th className="py-2 px-3 text-center">Jatuh Tempo</th>
                                            <th className="py-2 px-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-zinc-200">
                                        {invoice.installments.map((inst) => (
                                            <tr key={inst.id}>
                                                <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100 print:text-black">
                                                    Cicilan {inst.installment_number} dari {inst.total_installments}
                                                    {inst.notes && (
                                                        <span className="block text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                                                            {inst.notes}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                                                    {inst.formatted_amount || formatRupiah(inst.amount)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-mono tabular-nums text-zinc-700 dark:text-zinc-300 print:text-black">
                                                    {inst.due_date}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                                                            inst.status === 'paid'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                                                : inst.status === 'overdue'
                                                                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                                                                : 'bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                                                        }`}
                                                    >
                                                        {inst.status === 'paid' ? 'Lunas' : inst.status === 'overdue' ? 'Lewat Tempo' : 'Belum Bayar'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Totals Calculation */}
                    <div className="mt-6 flex flex-col sm:flex-row items-start justify-between gap-6 border-t border-zinc-200 dark:border-zinc-800 print:border-zinc-300 pt-6">
                        <div className="w-full sm:w-1/2 space-y-4">
                            {/* Bank Details Box */}
                            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 print:border-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 print:bg-zinc-50 p-4 text-xs">
                                <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100 print:text-black mb-2">
                                    <CreditCard className="w-4 h-4 text-zinc-600 dark:text-zinc-400" strokeWidth={1.75} />
                                    <span>{t('publicInvoice.bankInstructions')}</span>
                                </div>
                                <div className="space-y-1 text-zinc-600 dark:text-zinc-300 print:text-black">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500 dark:text-zinc-400">{t('publicInvoice.bank')}</span>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100 print:text-black">{bankDetails.bank_name || 'BCA'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 dark:text-zinc-400">{t('publicInvoice.accountNumber')}</span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 print:text-black tabular-nums">
                                                {bankDetails.account_number || '8270912384'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleCopyAccount}
                                                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 print:hidden"
                                                title={t('publicInvoice.copyAccount')}
                                            >
                                                {copiedAccount ? (
                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                ) : (
                                                    <Copy className="w-3 h-3" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500 dark:text-zinc-400">{t('publicInvoice.accountHolder')}</span>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100 print:text-black">{bankDetails.account_holder || business.sender_name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {invoice.notes && (
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300 print:text-black block mb-1">{t('publicInvoice.notes')}</span>
                                    <p className="whitespace-pre-line leading-relaxed">{invoice.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="w-full sm:w-64 space-y-2 text-xs">
                            <div className="flex justify-between text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                                <span>{t('publicInvoice.subtotalLabel')}</span>
                                <span className="font-mono tabular-nums text-zinc-800 dark:text-zinc-200 print:text-black">
                                    {formatRupiah(invoice.total_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
                                <span>{t('publicInvoice.taxLabel')}</span>
                                <span className="font-mono tabular-nums text-zinc-800 dark:text-zinc-200 print:text-black">Rp 0</span>
                            </div>
                            <div className="border-t border-zinc-200 dark:border-zinc-800 print:border-zinc-300 pt-2 flex justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-black">
                                <span>{t('publicInvoice.totalDue')}</span>
                                <span className="font-mono tabular-nums text-base">
                                    {formatRupiah(invoice.total_amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 print:border-zinc-200 text-center text-xs text-zinc-400 dark:text-zinc-500 print:text-zinc-600">
                    <p>{t('publicInvoice.thankYou', { email: business.email })}</p>
                </div>
            </div>

            {/* Print CSS styling */}
            <style>{`
                @media print {
                    body {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                    }
                    @page {
                        margin: 1.5cm;
                        size: auto;
                    }
                }
            `}</style>
        </div>
    );
}
