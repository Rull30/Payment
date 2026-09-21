import StatusBadge from '@/Components/StatusBadge';
import WhatsAppModal from '@/Components/WhatsAppModal';
import { useApp } from '@/Contexts/AppContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    MessageCircle,
    Pencil,
    Plus,
    Receipt,
    Search,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

export default function Dashboard({ invoices, upcoming_reminders = [], filters, metrics, business }) {
    const { t, confirm, toast } = useApp();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [activeInvoiceForWa, setActiveInvoiceForWa] = useState(null);
    const [activeInstallmentForWa, setActiveInstallmentForWa] = useState(null);
    const [isWaModalOpen, setIsWaModalOpen] = useState(false);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(
            route('dashboard'),
            { search: searchTerm, status: selectedStatus },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusTab = (status) => {
        setSelectedStatus(status);
        router.get(
            route('dashboard'),
            { search: searchTerm, status: status },
            { preserveState: true, replace: true }
        );
    };

    const handleMarkAsPaid = async (invoice) => {
        const ok = await confirm({
            title: t('dashboard.actions.markPaid'),
            message: t('dashboard.actions.markPaidConfirm', { number: invoice.invoice_number }),
            confirmText: t('dashboard.actions.markPaid'),
            variant: 'primary',
        });
        if (ok) {
            router.patch(route('invoices.status', invoice.id), { status: 'paid' }, {
                onSuccess: () => toast.success(`Invoice ${invoice.invoice_number} berhasil ditandai lunas`),
            });
        }
    };

    const handleMarkInstallmentPaid = (installment) => {
        router.patch(route('installments.status', installment.id), { status: 'paid' }, {
            onSuccess: () => toast.success(`Cicilan #${installment.installment_number} berhasil ditandai lunas`),
        });
    };

    const handleDelete = async (invoice) => {
        const ok = await confirm({
            title: t('dashboard.actions.delete'),
            message: t('dashboard.actions.deleteConfirm', { number: invoice.invoice_number }),
            confirmText: t('dashboard.actions.delete'),
            variant: 'danger',
        });
        if (ok) {
            router.delete(route('invoices.destroy', invoice.id), {
                onSuccess: () => toast.success(`Invoice ${invoice.invoice_number} berhasil dihapus`),
            });
        }
    };

    const openWhatsAppModal = (invoice, installment = null) => {
        setActiveInvoiceForWa(invoice);
        setActiveInstallmentForWa(installment);
        setIsWaModalOpen(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                            {t('dashboard.title')}
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('invoices.create')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                        >
                            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                            {t('dashboard.createInvoice')}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Dashboard - ${t('brand.name')}`} />

            {/* Upcoming H-3 Installment Reminders Widget */}
            {upcoming_reminders && upcoming_reminders.length > 0 && (
                <div className="mb-6 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-lg p-4 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-amber-500 text-white flex items-center justify-center">
                                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                            </div>
                            <div>
                                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                                    {t('installments.upcomingCardTitle')}
                                </h2>
                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                    {t('installments.upcomingCardSubtitle')}
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 w-fit">
                            {upcoming_reminders.length} Jatuh Tempo H-3
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {upcoming_reminders.map((inst) => (
                            <div
                                key={inst.id}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3.5 shadow-xs flex flex-col justify-between transition-colors"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                            {inst.invoice?.client?.name || 'Klien'}
                                        </span>
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                                            {inst.days_until_due <= 0 ? 'Hari ini' : `${inst.days_until_due} hari lagi`}
                                        </span>
                                    </div>

                                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono space-y-0.5">
                                        <div>{inst.invoice?.invoice_number} - Cicilan {inst.installment_number}/{inst.total_installments}</div>
                                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                                            {inst.formatted_amount}
                                        </div>
                                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                            Jatuh tempo: {inst.due_date}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openWhatsAppModal(inst.invoice, inst)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium shadow-xs transition-colors"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                                        {t('installments.sendWhatsApp')}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleMarkInstallmentPaid(inst)}
                                        className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                                    >
                                        {t('installments.markPaid')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
                {/* Total Receivables */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between transition-colors">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wider">{t('dashboard.metrics.unpaid')}</span>
                        <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
                    </div>
                    <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
                        {metrics.total_receivables_formatted}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{t('dashboard.metrics.unpaidDesc')}</p>
                </div>

                {/* Paid This Month */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between transition-colors">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wider">{t('dashboard.metrics.paidMonth')}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
                    </div>
                    <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
                        {metrics.paid_this_month_formatted}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{t('dashboard.metrics.paidMonthDesc')}</p>
                </div>

                {/* Overdue Count */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between transition-colors">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wider">{t('dashboard.metrics.overdue')}</span>
                        <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" strokeWidth={1.75} />
                    </div>
                    <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
                        {metrics.overdue_count}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{t('dashboard.metrics.overdueDesc')}</p>
                </div>

                {/* Total Invoices */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between transition-colors">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wider">{t('dashboard.metrics.total')}</span>
                        <Receipt className="w-4 h-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
                    </div>
                    <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
                        {metrics.total_invoices}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{t('dashboard.metrics.draftCount', { count: metrics.draft_count })}</p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6 transition-colors">
                <div className="p-3 sm:px-4 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/40">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                        {[
                            { key: 'all', label: t('dashboard.tabs.all') },
                            { key: 'draft', label: t('dashboard.tabs.draft') },
                            { key: 'sent', label: t('dashboard.tabs.sent') },
                            { key: 'paid', label: t('dashboard.tabs.paid') },
                            { key: 'overdue', label: t('dashboard.tabs.overdue') },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleStatusTab(tab.key)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                                    selectedStatus === tab.key
                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Field */}
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('dashboard.searchPlaceholder')}
                                className="w-full pl-8 pr-3 py-1 text-xs rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                        >
                            {t('dashboard.filterBtn')}
                        </button>
                    </form>
                </div>

                {/* High Density Invoices Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                <th className="py-2.5 px-3 sm:px-4">{t('dashboard.table.invoiceNumber')}</th>
                                <th className="py-2.5 px-3 sm:px-4">{t('dashboard.table.client')}</th>
                                <th className="py-2.5 px-3 sm:px-4 hidden md:table-cell">{t('dashboard.table.issueDate')}</th>
                                <th className="py-2.5 px-3 sm:px-4">{t('dashboard.table.dueDate')}</th>
                                <th className="py-2.5 px-3 sm:px-4 text-right">{t('dashboard.table.amount')}</th>
                                <th className="py-2.5 px-3 sm:px-4">{t('dashboard.table.status')}</th>
                                <th className="py-2.5 px-3 sm:px-4 text-right">{t('dashboard.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                            {invoices.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                                                <FileText className="w-5 h-5 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
                                            </div>
                                            <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                                                {t('dashboard.table.emptyTitle')}
                                            </p>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-4">
                                                {searchTerm || selectedStatus !== 'all'
                                                    ? t('dashboard.table.emptySearch')
                                                    : t('dashboard.table.emptyNew')}
                                            </p>
                                            <Link
                                                href={route('invoices.create')}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                {t('dashboard.table.createFirst')}
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                invoices.data.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                                        {/* Invoice Number */}
                                        <td className="py-2.5 px-3 sm:px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                                            <Link
                                                href={route('invoices.edit', invoice.id)}
                                                className="hover:underline flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-100"
                                            >
                                                {invoice.invoice_number}
                                            </Link>
                                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block font-sans">
                                                {t('dashboard.table.itemsCount', { count: invoice.items?.length || 0 })}
                                                {invoice.installments?.length > 0 && ` • ${invoice.installments.length}x Cicilan`}
                                            </span>
                                        </td>

                                        {/* Client */}
                                        <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                                            <div className="font-medium text-zinc-800 dark:text-zinc-200">
                                                {invoice.client?.name || 'Unknown client'}
                                            </div>
                                            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                                {invoice.client?.phone || '-'}
                                            </div>
                                        </td>

                                        {/* Issue Date */}
                                        <td className="py-2.5 px-3 sm:px-4 text-zinc-600 dark:text-zinc-400 font-mono tabular-nums whitespace-nowrap hidden md:table-cell">
                                            {invoice.issue_date}
                                        </td>

                                        {/* Due Date */}
                                        <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                                            <span className={`font-mono tabular-nums ${invoice.is_overdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                {invoice.due_date}
                                            </span>
                                            {invoice.is_overdue && (
                                                <span className="block text-[10px] text-rose-500 dark:text-rose-400 font-sans">
                                                    {t('dashboard.table.overdueLabel')}
                                                </span>
                                            )}
                                        </td>

                                        {/* Amount */}
                                        <td className="py-2.5 px-3 sm:px-4 text-right font-mono font-medium tabular-nums text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                                            {invoice.formatted_total}
                                        </td>

                                        {/* Status */}
                                        <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                                            <StatusBadge status={invoice.status} isOverdue={invoice.is_overdue} />
                                        </td>

                                        {/* Actions */}
                                        <td className="py-2.5 px-3 sm:px-4 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1.5 justify-end">
                                                {/* WhatsApp Reminder Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => openWhatsAppModal(invoice)}
                                                    title={t('dashboard.actions.reminder')}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[11px] font-medium transition-colors"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                                                    <span className="hidden lg:inline">{t('dashboard.actions.reminder')}</span>
                                                </button>

                                                {/* Public link */}
                                                <a
                                                    href={`/i/${invoice.uuid}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={t('dashboard.actions.publicView')}
                                                    className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
                                                </a>

                                                {/* Edit link */}
                                                <Link
                                                    href={route('invoices.edit', invoice.id)}
                                                    title={t('dashboard.actions.edit')}
                                                    className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                                                </Link>

                                                {/* Quick Mark Paid if not yet paid */}
                                                {invoice.status !== 'paid' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMarkAsPaid(invoice)}
                                                        title={t('dashboard.actions.markPaid')}
                                                        className="p-1 rounded text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                                                    >
                                                        <Check className="w-3.5 h-3.5" strokeWidth={2} />
                                                    </button>
                                                )}

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(invoice)}
                                                    title={t('dashboard.actions.delete')}
                                                    className="p-1 rounded text-zinc-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {invoices.links && invoices.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 text-xs">
                        <div className="text-zinc-500 dark:text-zinc-400">
                            {t('dashboard.table.paginationShowing', {
                                from: invoices.from || 0,
                                to: invoices.to || 0,
                                total: invoices.total,
                            })}
                        </div>
                        <div className="flex items-center gap-1">
                            {invoices.links.map((link, idx) => {
                                if (!link.url) {
                                    return (
                                        <span
                                            key={idx}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="px-2.5 py-1 text-zinc-300 dark:text-zinc-600 text-xs rounded border border-transparent"
                                        />
                                    );
                                }
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        preserveScroll
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                                            link.active
                                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium'
                                                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* WhatsApp Reminder Modal */}
            <WhatsAppModal
                isOpen={isWaModalOpen}
                onClose={() => {
                    setIsWaModalOpen(false);
                    setActiveInstallmentForWa(null);
                }}
                invoice={activeInvoiceForWa}
                business={business}
                activeInstallment={activeInstallmentForWa}
            />
        </AuthenticatedLayout>
    );
}
