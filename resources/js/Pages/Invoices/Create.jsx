import CurrencyInput from '@/Components/CurrencyInput';
import { useApp } from '@/Contexts/AppContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function CreateInvoice({ clients, suggested_invoice_number, today, default_due_date }) {
    const { t } = useApp();
    const [tenorChoice, setTenorChoice] = useState(3);

    const { data, setData, post, processing, errors } = useForm({
        client_id: clients.length > 0 ? clients[0].id : '',
        invoice_number: suggested_invoice_number,
        issue_date: today,
        due_date: default_due_date,
        status: 'draft',
        notes: 'Terima kasih atas kerja samanya. Mohon konfirmasi via WhatsApp setelah transfer pembayaran selesai.',
        payment_type: 'full', // 'full' or 'installment'
        items: [
            { description: '', quantity: 1, unit_price: 0 },
        ],
        installments: [],
    });

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...data.items];
        updatedItems[index][field] = value;
        setData('items', updatedItems);
    };

    const addItemRow = () => {
        setData('items', [
            ...data.items,
            { description: '', quantity: 1, unit_price: 0 },
        ]);
    };

    const removeItemRow = (index) => {
        if (data.items.length <= 1) return;
        const updatedItems = data.items.filter((_, i) => i !== index);
        setData('items', updatedItems);
    };

    const grandTotal = useMemo(() => {
        return data.items.reduce((acc, item) => {
            const qty = parseInt(item.quantity, 10) || 0;
            const price = parseFloat(item.unit_price) || 0;
            return acc + (qty * price);
        }, 0);
    }, [data.items]);

    const formatCurrency = (amount) => {
        return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
    };

    // Helper to calculate installment date +N months from issue date
    const calculateDueDate = (baseDateStr, monthOffset) => {
        const d = new Date(baseDateStr || today);
        d.setMonth(d.getMonth() + monthOffset);
        return d.toISOString().split('T')[0];
    };

    // Auto-generate installments whenever tenor or grandTotal changes
    const autoGenerateInstallments = (count, total) => {
        const numCount = parseInt(count, 10) || 1;
        const totalNum = parseFloat(total) || 0;

        if (numCount <= 1 || totalNum <= 0) {
            return [];
        }

        const baseAmount = Math.floor(totalNum / numCount);
        const remainder = totalNum - (baseAmount * numCount);

        const list = [];
        for (let i = 0; i < numCount; i++) {
            const isLast = i === numCount - 1;
            const amount = isLast ? (baseAmount + remainder) : baseAmount;
            const dueDate = calculateDueDate(data.issue_date, i);

            list.push({
                installment_number: i + 1,
                total_installments: numCount,
                amount: amount,
                due_date: dueDate,
                notes: `Cicilan ke-${i + 1}`,
                status: 'pending',
            });
        }
        return list;
    };

    const handlePaymentTypeChange = (type) => {
        setData('payment_type', type);
        if (type === 'installment' && data.installments.length === 0) {
            const generated = autoGenerateInstallments(tenorChoice, grandTotal);
            setData((prev) => ({
                ...prev,
                payment_type: 'installment',
                installments: generated,
            }));
        }
    };

    const handleTenorChange = (num) => {
        setTenorChoice(num);
        const generated = autoGenerateInstallments(num, grandTotal);
        setData('installments', generated);
    };

    const handleInstallmentChange = (index, field, value) => {
        const updated = [...data.installments];
        updated[index][field] = value;
        setData('installments', updated);
    };

    const totalInstallmentsAmount = useMemo(() => {
        return data.installments.reduce((acc, inst) => acc + (parseFloat(inst.amount) || 0), 0);
    }, [data.installments]);

    const installmentSumMatches = Math.abs(totalInstallmentsAmount - grandTotal) < 0.01;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('invoices.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('dashboard')}
                        className="p-1 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title={t('invoiceForm.cancel')}
                    >
                        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                            {t('invoiceForm.createTitle')}
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {t('invoiceForm.createSubtitle')}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`${t('invoiceForm.createTitle')} - ${t('brand.name')}`} />

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                {/* General Invoice Info Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 space-y-4 transition-colors">
                    <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        {t('invoiceForm.headerCard')}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Invoice Number */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                {t('invoiceForm.invoiceNumber')} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.invoice_number}
                                onChange={(e) => setData('invoice_number', e.target.value)}
                                className="w-full text-xs font-mono font-medium rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                required
                            />
                            {errors.invoice_number && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.invoice_number}</p>
                            )}
                        </div>

                        {/* Client Selector */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    {t('invoiceForm.client')} <span className="text-rose-500">*</span>
                                </label>
                                <Link
                                    href={route('clients.index')}
                                    className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline"
                                >
                                    {t('invoiceForm.addNewClient')}
                                </Link>
                            </div>
                            <select
                                value={data.client_id}
                                onChange={(e) => setData('client_id', e.target.value)}
                                className="w-full text-xs rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                required
                            >
                                {clients.length === 0 ? (
                                    <option value="">Belum ada klien</option>
                                ) : (
                                    clients.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.phone})
                                        </option>
                                    ))
                                )}
                            </select>
                            {errors.client_id && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.client_id}</p>
                            )}
                        </div>

                        {/* Issue Date */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                {t('invoiceForm.issueDate')} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.issue_date}
                                onChange={(e) => setData('issue_date', e.target.value)}
                                className="w-full text-xs font-mono rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                required
                            />
                            {errors.issue_date && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.issue_date}</p>
                            )}
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                {t('invoiceForm.dueDate')} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.due_date}
                                onChange={(e) => setData('due_date', e.target.value)}
                                className="w-full text-xs font-mono rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                required
                            />
                            {errors.due_date && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.due_date}</p>
                            )}
                        </div>
                    </div>

                    {/* Status selection */}
                    <div className="pt-2">
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            {t('invoiceForm.initialStatus')}
                        </label>
                        <div className="flex items-center gap-4">
                            {[
                                { key: 'draft', label: t('dashboard.tabs.draft') },
                                { key: 'sent', label: t('dashboard.tabs.sent') },
                                { key: 'paid', label: t('dashboard.tabs.paid') },
                            ].map((st) => (
                                <label key={st.key} className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={st.key}
                                        checked={data.status === st.key}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                    />
                                    <span>{st.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Line Items Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 space-y-4 transition-colors">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            {t('invoiceForm.itemsCard')}
                        </h2>
                        <button
                            type="button"
                            onClick={addItemRow}
                            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-2.5 py-1 rounded transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                            {t('invoiceForm.addItem')}
                        </button>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    <th className="py-2 px-2 w-[48%]">{t('invoiceForm.table.description')}</th>
                                    <th className="py-2 px-2 w-[16%]">{t('invoiceForm.table.qty')}</th>
                                    <th className="py-2 px-2 w-[20%] text-right">{t('invoiceForm.table.unitPrice')}</th>
                                    <th className="py-2 px-2 w-[16%] text-right">{t('invoiceForm.table.subtotal')}</th>
                                    <th className="py-2 px-1 w-[4%]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {data.items.map((item, index) => {
                                    const lineSubtotal = (parseInt(item.quantity, 10) || 0) * (parseFloat(item.unit_price) || 0);

                                    return (
                                        <tr key={index} className="align-middle">
                                            {/* Description */}
                                            <td className="py-2 px-2">
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    placeholder="contoh: Pembuatan Website E-Commerce Tahap 1"
                                                    className="w-full text-xs rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                                    required
                                                />
                                            </td>

                                            {/* Qty */}
                                            <td className="py-2 px-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    className="w-full text-xs font-mono text-center rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                                    required
                                                />
                                            </td>

                                            {/* Unit Price */}
                                            <td className="py-2 px-2">
                                                <CurrencyInput
                                                    value={item.unit_price}
                                                    onChange={(val) => handleItemChange(index, 'unit_price', val)}
                                                    className="w-full text-xs font-mono text-right rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                                    placeholder="0"
                                                    required
                                                />
                                            </td>

                                            {/* Subtotal */}
                                            <td className="py-2 px-2 text-right font-mono font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                                                {formatCurrency(lineSubtotal)}
                                            </td>

                                            {/* Remove Button */}
                                            <td className="py-2 px-1 text-center">
                                                <button
                                                    type="button"
                                                    disabled={data.items.length <= 1}
                                                    onClick={() => removeItemRow(index)}
                                                    className="p-1 rounded text-zinc-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Hapus baris"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {errors.items && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.items}</p>
                    )}

                    {/* Summary Row */}
                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex flex-col sm:flex-row items-end justify-between gap-4">
                        <div className="w-full sm:w-1/2">
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                {t('invoiceForm.notes')}
                            </label>
                            <textarea
                                rows={3}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder={t('invoiceForm.notesPlaceholder')}
                                className="w-full text-xs rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                            />
                        </div>

                        <div className="w-full sm:w-72 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-md border border-zinc-200 dark:border-zinc-700 space-y-2">
                            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                <span>{t('invoiceForm.summarySubtotal')}</span>
                                <span className="font-mono tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                                    {formatCurrency(grandTotal)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                <span>{t('invoiceForm.summaryTax')}</span>
                                <span className="font-mono tabular-nums font-medium text-zinc-800 dark:text-zinc-200">Rp 0</span>
                            </div>
                            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex items-center justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                <span>{t('invoiceForm.summaryTotal')}</span>
                                <span className="font-mono tabular-nums text-base">
                                    {formatCurrency(grandTotal)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Installment / Payment Scheme Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 space-y-4 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <div>
                            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                                {t('installments.sectionTitle')}
                            </h2>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {t('installments.autoSplitHint')}
                            </p>
                        </div>

                        {/* Payment Type Toggle */}
                        <div className="inline-flex rounded-md border border-zinc-200 dark:border-zinc-700 p-0.5 bg-zinc-100 dark:bg-zinc-800">
                            <button
                                type="button"
                                onClick={() => handlePaymentTypeChange('full')}
                                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                                    data.payment_type === 'full'
                                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                {t('installments.full')}
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePaymentTypeChange('installment')}
                                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                                    data.payment_type === 'installment'
                                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                {t('installments.installment')}
                            </button>
                        </div>
                    </div>

                    {data.payment_type === 'installment' && (
                        <div className="space-y-4 pt-1">
                            {/* Tenor Preset Selector */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    {t('installments.tenorLabel')}:
                                </span>
                                {[2, 3, 4, 6, 12].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => handleTenorChange(num)}
                                        className={`px-2.5 py-1 text-xs rounded border font-medium transition-colors ${
                                            tenorChoice === num
                                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                                                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        {num}x ({num} Bulan)
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => handleTenorChange(tenorChoice)}
                                    className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 ml-auto"
                                    title="Hitung ulang pembagian rata"
                                >
                                    <RefreshCw className="w-3 h-3" strokeWidth={1.75} />
                                    Hitung Ulang Rata
                                </button>
                            </div>

                            {/* Installments Table */}
                            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-md">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                            <th className="py-2 px-3 w-[15%]">Tenor</th>
                                            <th className="py-2 px-3 w-[30%]">Nominal (Rp)</th>
                                            <th className="py-2 px-3 w-[25%]">Jatuh Tempo</th>
                                            <th className="py-2 px-3 w-[30%]">Catatan Tenor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {data.installments.map((inst, idx) => (
                                            <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                                                <td className="py-2 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                                                    Cicilan {inst.installment_number}/{inst.total_installments}
                                                </td>
                                                <td className="py-2 px-3">
                                                    <CurrencyInput
                                                        value={inst.amount}
                                                        onChange={(val) => handleInstallmentChange(idx, 'amount', val)}
                                                        className="w-full text-xs font-mono font-medium rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                                        placeholder="0"
                                                        required
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="date"
                                                        value={inst.due_date}
                                                        onChange={(e) => handleInstallmentChange(idx, 'due_date', e.target.value)}
                                                        className="w-full text-xs font-mono rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                                        required
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="text"
                                                        value={inst.notes || ''}
                                                        onChange={(e) => handleInstallmentChange(idx, 'notes', e.target.value)}
                                                        placeholder="contoh: Uang muka 50% atau Pelunasan"
                                                        className="w-full text-xs rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total Installment vs Grand Total validation */}
                            <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-zinc-500 dark:text-zinc-400">
                                    Total Akumulasi Cicilan: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{formatCurrency(totalInstallmentsAmount)}</strong>
                                </span>
                                {installmentSumMatches ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        Cocok dengan total invoice ({formatCurrency(grandTotal)})
                                    </span>
                                ) : (
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                        Selisih: {formatCurrency(Math.abs(totalInstallmentsAmount - grandTotal))} dari total invoice
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-between py-2">
                    <Link
                        href={route('dashboard')}
                        className="px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                        {t('invoiceForm.cancel')}
                    </Link>
                    <button
                        type="submit"
                        disabled={processing || clients.length === 0}
                        className="px-5 py-2 text-xs font-medium text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md shadow-sm transition-colors disabled:opacity-50"
                    >
                        {processing ? t('invoiceForm.saving') : t('invoiceForm.saveCreate')}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
