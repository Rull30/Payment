import { useApp } from '@/Contexts/AppContext';
import { router } from '@inertiajs/react';
import { Check, Copy, ExternalLink, MessageCircle, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function WhatsAppModal({ isOpen, onClose, invoice, business, activeInstallment = null }) {
    const { locale, t } = useApp();
    const [templateType, setTemplateType] = useState(() => (activeInstallment ? 'installment_h3' : 'polite'));
    const [customMessage, setCustomMessage] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (activeInstallment) {
            setTemplateType('installment_h3');
        } else {
            setTemplateType('polite');
        }
    }, [activeInstallment, isOpen]);

    // Sanitize phone number: strip non-digits, ensure country code
    const sanitizedPhone = useMemo(() => {
        if (!invoice?.client?.phone) return '';
        let phone = invoice.client.phone.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        }
        return phone;
    }, [invoice]);

    // Public invoice URL
    const publicUrl = useMemo(() => {
        if (!invoice?.uuid) return '';
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/i/${invoice.uuid}`;
        }
        return `/i/${invoice.uuid}`;
    }, [invoice]);

    // Generate message content based on chosen template & active locale
    useEffect(() => {
        if (!invoice || !isOpen) return;

        const clientName = invoice.client?.name || (locale === 'id' ? 'Klien' : 'Client');
        const invNumber = invoice.invoice_number || '';
        const dueDate = activeInstallment?.due_date || invoice.due_date || '';
        const total = invoice.formatted_total || `Rp ${Number(invoice.total_amount || 0).toLocaleString('id-ID')}`;
        const sender = business?.sender_name || 'Finance Team';
        const company = business?.business_name ? ` (${business.business_name})` : '';

        const bankName = business?.bank_details?.bank_name || '[Nama Bank]';
        const accNumber = business?.bank_details?.account_number || '[Nomor Rekening]';
        const accHolder = business?.bank_details?.account_holder || '[Nama Pemilik]';

        const instNum = activeInstallment?.installment_number || 1;
        const totalInst = activeInstallment?.total_installments || (invoice.installments?.length || 1);
        const instAmount = activeInstallment?.formatted_amount || total;
        const daysLeft = activeInstallment ? activeInstallment.days_until_due : 3;
        const daysTextId = daysLeft <= 0 ? 'hari ini' : `${daysLeft} hari lagi`;
        const daysTextEn = daysLeft <= 0 ? 'today' : `${daysLeft} day(s)`;

        let message = '';

        if (locale === 'id') {
            if (templateType === 'installment_h3') {
                message = `Halo ${clientName},\n\nSemoga kabarnya baik. Kami ingin menginformasikan bahwa pembayaran Cicilan ${instNum} dari ${totalInst} untuk invoice ${invNumber} sebesar ${instAmount} akan jatuh tempo dalam ${daysTextId} (${dueDate}).\n\nRincian invoice & jadwal cicilan dapat dilihat melalui link:\n${publicUrl}\n\nPembayaran dapat ditransfer ke:\nBank: ${bankName}\nNo. Rekening: ${accNumber}\na.n. ${accHolder}\n\nTerima kasih banyak atas kerja samanya.\n\nSalam,\n${sender}${company}`;
            } else if (templateType === 'polite') {
                message = `Halo ${clientName},\n\nSemoga kabarnya baik. Ini adalah pengingat ramah untuk invoice ${invNumber} sebesar ${total} yang jatuh tempo pada ${dueDate}.\n\nRincian invoice dapat dilihat melalui link berikut:\n${publicUrl}\n\nPembayaran dapat ditransfer ke:\nBank: ${bankName}\nNo. Rekening: ${accNumber}\na.n. ${accHolder}\n\nTerima kasih atas kerja samanya.\n\nSalam,\n${sender}${company}`;
            } else if (templateType === 'due_today') {
                message = `Halo ${clientName},\n\nKami menginformasikan bahwa invoice ${invNumber} sebesar ${total} jatuh tempo pada hari ini (${dueDate}).\n\nRincian invoice lengkap:\n${publicUrl}\n\nRekening pembayaran:\nBank: ${bankName}\nNo. Rekening: ${accNumber}\na.n. ${accHolder}\n\nMohon konfirmasi jika pembayaran telah dilakukan. Terima kasih banyak.\n\nSalam,\n${sender}${company}`;
            } else if (templateType === 'overdue') {
                message = `Halo ${clientName},\n\nKami mencatat bahwa invoice ${invNumber} sebesar ${total} telah melewati tanggal jatuh tempo (${dueDate}).\n\nMohon bantuannya untuk menyelesaikan pembayaran via transfer ke:\nBank: ${bankName}\nNo. Rekening: ${accNumber}\na.n. ${accHolder}\n\nLink invoice:\n${publicUrl}\n\nJika pembayaran sudah dikirimkan, silakan balas dengan bukti transfer. Terima kasih.\n\nSalam,\n${sender}${company}`;
            }
        } else {
            // English templates
            if (templateType === 'installment_h3') {
                message = `Hello ${clientName},\n\nHope you are doing well. This is a reminder that your payment for Installment ${instNum} of ${totalInst} on invoice ${invNumber} for ${instAmount} is due in ${daysTextEn} (${dueDate}).\n\nYou can review your invoice and installment breakdown here:\n${publicUrl}\n\nPayment can be transferred to:\nBank: ${bankName}\nAccount No: ${accNumber}\nAccount Holder: ${accHolder}\n\nThank you for your business.\n\nBest regards,\n${sender}${company}`;
            } else if (templateType === 'polite') {
                message = `Hello ${clientName},\n\nHope you are doing well. This is a friendly reminder regarding invoice ${invNumber} for ${total}, due on ${dueDate}.\n\nYou can review your invoice details here:\n${publicUrl}\n\nPayment can be transferred to:\nBank: ${bankName}\nAccount No: ${accNumber}\nAccount Holder: ${accHolder}\n\nThank you for your business.\n\nBest regards,\n${sender}${company}`;
            } else if (templateType === 'due_today') {
                message = `Hello ${clientName},\n\nThis is a quick notice that invoice ${invNumber} for ${total} is due today (${dueDate}).\n\nInvoice details:\n${publicUrl}\n\nPayment account:\nBank: ${bankName}\nAccount No: ${accNumber}\nAccount Holder: ${accHolder}\n\nPlease let us know once payment has been completed. Thank you.\n\nBest regards,\n${sender}${company}`;
            } else if (templateType === 'overdue') {
                message = `Hello ${clientName},\n\nOur records indicate that invoice ${invNumber} for ${total} is currently overdue as of ${dueDate}.\n\nPlease arrange payment at your earliest convenience to:\nBank: ${bankName}\nAccount No: ${accNumber}\nAccount Holder: ${accHolder}\n\nInvoice link:\n${publicUrl}\n\nIf you have already settled this payment, please share the transfer receipt with us. Thank you.\n\nBest regards,\n${sender}${company}`;
            }
        }

        setCustomMessage(message);
        setCopied(false);
    }, [templateType, invoice, business, publicUrl, isOpen, locale, activeInstallment]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !invoice) return null;

    const waLink = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(customMessage)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(customMessage);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleOpenWhatsApp = () => {
        if (activeInstallment?.id) {
            router.post(
                route('installments.reminder-sent', activeInstallment.id),
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 dark:bg-black/70 flex items-center justify-center p-4">
            <div
                className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center">
                            <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {t('whatsapp.modalTitle')}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
                                {invoice.invoice_number} to {invoice.client?.name}
                                {activeInstallment && ` (Cicilan ${activeInstallment.installment_number}/${activeInstallment.total_installments})`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Destination Phone Card */}
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">{t('whatsapp.recipientPhone')}</span>
                        <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                            {invoice.client?.phone || t('whatsapp.noPhone')} ({sanitizedPhone ? `+${sanitizedPhone}` : 'Invalid'})
                        </span>
                    </div>

                    {/* Template Selector Tabs */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                            {t('whatsapp.templateLabel')}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700">
                            {(activeInstallment || invoice.installments?.length > 0) && (
                                <button
                                    type="button"
                                    onClick={() => setTemplateType('installment_h3')}
                                    className={`py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                                        templateType === 'installment_h3'
                                            ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-semibold'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    {t('whatsapp.installmentH3')}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setTemplateType('polite')}
                                className={`py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                                    templateType === 'polite'
                                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-semibold'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                {t('whatsapp.polite')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTemplateType('due_today')}
                                className={`py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                                    templateType === 'due_today'
                                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-semibold'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                {t('whatsapp.dueToday')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTemplateType('overdue')}
                                className={`py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                                    templateType === 'overdue'
                                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-semibold'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                }`}
                            >
                                {t('whatsapp.overdue')}
                            </button>
                        </div>
                    </div>

                    {/* Message Preview Box (Editable) */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                {t('whatsapp.previewLabel')}
                            </label>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
                                        <span className="text-emerald-600 dark:text-emerald-400">{t('whatsapp.copiedBtn')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                                        <span>{t('whatsapp.copyBtn')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <textarea
                            rows={8}
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            className="w-full rounded-md border-zinc-300 dark:border-zinc-700 text-xs font-mono leading-relaxed text-zinc-800 dark:text-zinc-200 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 bg-zinc-50/50 dark:bg-zinc-800/80"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    >
                        {t('whatsapp.cancel')}
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 inline-flex items-center gap-1.5"
                        >
                            <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                            {copied ? t('whatsapp.copiedBtn') : t('whatsapp.copyBtn')}
                        </button>
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleOpenWhatsApp}
                            className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 inline-flex items-center gap-1.5 transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
                            {t('whatsapp.openWhatsApp')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
