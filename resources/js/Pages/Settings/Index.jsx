import { useApp } from '@/Contexts/AppContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Building2, CheckCircle2, CreditCard, Save } from 'lucide-react';

export default function SettingsIndex({ settings }) {
    const { t } = useApp();
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        business_name: settings.business_name || '',
        sender_name: settings.sender_name || '',
        bank_details: {
            bank_name: settings.bank_details?.bank_name || '',
            account_number: settings.bank_details?.account_number || '',
            account_holder: settings.bank_details?.account_holder || '',
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('settings.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {t('settings.title')}
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {t('settings.subtitle')}
                    </p>
                </div>
            }
        >
            <Head title={`${t('settings.title')} - ${t('brand.name')}`} />

            <div className="max-w-3xl mx-auto space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Business Identity Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 space-y-4 transition-colors">
                        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                            <Building2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                                {t('settings.businessCard')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {/* Business Name */}
                            <div>
                                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('settings.businessName')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.business_name}
                                    onChange={(e) => setData('business_name', e.target.value)}
                                    placeholder="e.g. Acme Creative Studio"
                                    className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    required
                                />
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                                    {t('settings.businessNameHint')}
                                </p>
                                {errors.business_name && (
                                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.business_name}</p>
                                )}
                            </div>

                            {/* Sender Name */}
                            <div>
                                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('settings.senderName')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.sender_name}
                                    onChange={(e) => setData('sender_name', e.target.value)}
                                    placeholder="e.g. Alex Wirawan"
                                    className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    required
                                />
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                                    {t('settings.senderNameHint')}
                                </p>
                                {errors.sender_name && (
                                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.sender_name}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bank Transfer Details Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 space-y-4 transition-colors">
                        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                            <CreditCard className="w-4 h-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                                {t('settings.bankCard')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            {/* Bank Name */}
                            <div>
                                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('settings.bankName')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.bank_details.bank_name}
                                    onChange={(e) =>
                                        setData('bank_details', {
                                            ...data.bank_details,
                                            bank_name: e.target.value,
                                        })
                                    }
                                    placeholder={t('settings.bankNamePlaceholder')}
                                    className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    required
                                />
                                {errors['bank_details.bank_name'] && (
                                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                                        {errors['bank_details.bank_name']}
                                    </p>
                                )}
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('settings.accountNumber')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.bank_details.account_number}
                                    onChange={(e) =>
                                        setData('bank_details', {
                                            ...data.bank_details,
                                            account_number: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. 8270912384"
                                    className="w-full font-mono rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    required
                                />
                                {errors['bank_details.account_number'] && (
                                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                                        {errors['bank_details.account_number']}
                                    </p>
                                )}
                            </div>

                            {/* Account Holder */}
                            <div>
                                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('settings.accountHolder')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.bank_details.account_holder}
                                    onChange={(e) =>
                                        setData('bank_details', {
                                            ...data.bank_details,
                                            account_holder: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Alex Wirawan"
                                    className="w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    required
                                />
                                {errors['bank_details.account_holder'] && (
                                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                                        {errors['bank_details.account_holder']}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Reminder Preview Box */}
                        <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3 text-xs text-zinc-600 dark:text-zinc-400">
                            <p className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                {t('settings.previewNotice')}
                            </p>
                            <p className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-700">
                                Bank: {data.bank_details.bank_name || '[Nama Bank]'}<br />
                                No. Rekening: {data.bank_details.account_number || '[Nomor Rekening]'}<br />
                                a.n. {data.bank_details.account_holder || '[Nama Pemilik]'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        {recentlySuccessful ? (
                            <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                {t('settings.savedSuccess')}
                            </span>
                        ) : (
                            <span />
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" strokeWidth={1.75} />
                            {processing ? '...' : t('settings.saveBtn')}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
