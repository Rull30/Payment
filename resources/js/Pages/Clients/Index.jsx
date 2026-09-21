import { useApp } from '@/Contexts/AppContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function ClientsIndex({ clients, filters }) {
    const { t, confirm, toast } = useApp();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
    });

    const openCreateModal = () => {
        setEditingClient(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (client) => {
        setEditingClient(client);
        setData({
            name: client.name || '',
            phone: client.phone || '',
            email: client.email || '',
            address: client.address || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingClient) {
            put(route('clients.update', editingClient.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('clients.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = async (client) => {
        const ok = await confirm({
            title: t('clients.modal.deleteConfirmTitle', 'Hapus Klien'),
            message: t('clients.modal.deleteConfirm', { name: client.name }),
            confirmText: t('common.delete', 'Hapus'),
            variant: 'danger',
        });
        if (ok) {
            router.delete(route('clients.destroy', client.id), {
                onSuccess: () => toast.success(`Klien "${client.name}" berhasil dihapus`),
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('clients.index'),
            { search: searchTerm },
            { preserveState: true, replace: true }
        );
    };

    const formatCurrency = (val) => {
        return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                            {t('clients.title')}
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {t('clients.subtitle')}
                        </p>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                        >
                            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                            {t('clients.addClient')}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`${t('clients.title')} - ${t('brand.name')}`} />

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6 transition-colors">
                <div className="p-3 sm:px-4 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/40">
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                        {t('clients.totalClients')} <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">{clients.total || clients.data.length}</span>
                    </div>

                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('clients.searchPlaceholder')}
                                className="w-full pl-8 pr-3 py-1 text-xs rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                <th className="py-2.5 px-3 sm:px-4">{t('clients.table.name')}</th>
                                <th className="py-2.5 px-3 sm:px-4">{t('clients.table.phone')}</th>
                                <th className="py-2.5 px-3 sm:px-4">{t('clients.table.email')}</th>
                                <th className="py-2.5 px-3 sm:px-4 hidden md:table-cell">{t('clients.table.address')}</th>
                                <th className="py-2.5 px-3 sm:px-4 text-center">{t('clients.table.invoices')}</th>
                                <th className="py-2.5 px-3 sm:px-4 text-right">{t('clients.table.totalBilled')}</th>
                                <th className="py-2.5 px-3 sm:px-4 text-right">{t('clients.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                            {clients.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                                                <Users className="w-5 h-5 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
                                            </div>
                                            <p className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                                                {t('clients.table.emptyTitle')}
                                            </p>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-4">
                                                {t('clients.table.emptyDesc')}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={openCreateModal}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                {t('clients.table.addFirst')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                clients.data.map((client) => (
                                    <tr key={client.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                                        {/* Name */}
                                        <td className="py-2.5 px-3 sm:px-4 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                                            {client.name}
                                        </td>

                                        {/* Phone */}
                                        <td className="py-2.5 px-3 sm:px-4 font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                                            {client.phone}
                                        </td>

                                        {/* Email */}
                                        <td className="py-2.5 px-3 sm:px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                            {client.email || '-'}
                                        </td>

                                        {/* Address */}
                                        <td className="py-2.5 px-3 sm:px-4 text-zinc-500 dark:text-zinc-400 truncate max-w-[200px] hidden md:table-cell">
                                            {client.address || '-'}
                                        </td>

                                        {/* Invoices Count */}
                                        <td className="py-2.5 px-3 sm:px-4 text-center font-mono tabular-nums text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                                            {client.invoices_count || 0}
                                        </td>

                                        {/* Total Billed */}
                                        <td className="py-2.5 px-3 sm:px-4 text-right font-mono tabular-nums font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                                            {formatCurrency(client.total_billed)}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-2.5 px-3 sm:px-4 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(client)}
                                                    className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                    title={t('clients.editClient')}
                                                >
                                                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(client)}
                                                    className="p-1 rounded text-zinc-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                    title={t('clients.modal.deleteConfirm', { name: client.name })}
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
                {clients.links && clients.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 text-xs">
                        <div className="text-zinc-500 dark:text-zinc-400">
                            {t('clients.table.paginationShowing', {
                                from: clients.from || 0,
                                to: clients.to || 0,
                                total: clients.total,
                            })}
                        </div>
                        <div className="flex items-center gap-1">
                            {clients.links.map((link, idx) => {
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

            {/* Create / Edit Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 dark:bg-black/70 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {editingClient ? t('clients.editClient') : t('clients.addClient')}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-4 h-4" strokeWidth={1.75} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                            {/* Name */}
                            <div>
                                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('clients.modal.nameLabel')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={t('clients.modal.namePlaceholder')}
                                    className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    required
                                />
                                {errors.name && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.name}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('clients.modal.phoneLabel')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder={t('clients.modal.phonePlaceholder')}
                                    className="w-full font-mono rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    required
                                />
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                                    {t('clients.modal.phoneHint')}
                                </p>
                                {errors.phone && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.phone}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('clients.modal.emailLabel')}
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="client@company.com"
                                    className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                />
                                {errors.email && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.email}</p>}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('clients.modal.addressLabel')}
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder={t('clients.modal.addressPlaceholder')}
                                    className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                />
                                {errors.address && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.address}</p>}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    {t('clients.modal.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-1.5 text-xs font-medium text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md shadow-sm transition-colors disabled:opacity-50"
                                >
                                    {processing ? '...' : editingClient ? t('clients.modal.update') : t('clients.modal.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
