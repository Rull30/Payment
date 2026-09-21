import { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { router } from '@inertiajs/react';
import AlertModal from '@/Components/AlertModal';
import ToastContainer from '@/Components/ToastContainer';

const translations = {
    id: {
        brand: {
            name: 'RemindPay',
            tagline: 'Invoice & Pengingat Pembayaran WhatsApp',
        },
        common: {
            cancel: 'Batal',
            confirm: 'Konfirmasi',
            delete: 'Hapus',
            markPaid: 'Tandai Lunas',
            success: 'Berhasil',
            error: 'Terjadi Kesalahan',
            notice: 'Pemberitahuan',
            warning: 'Peringatan',
        },
        nav: {
            invoices: 'Invoice',
            clients: 'Klien',
            settings: 'Pengaturan',
            profile: 'Profil Bisnis & Rekening',
            account: 'Keamanan Akun',
            logout: 'Keluar',
            setupBankNotice: 'Rekening bank belum diatur. Tambahkan rekening agar tercantum otomatis pada pesan WhatsApp.',
            configureNow: 'Atur sekarang',
            currency: 'Mata Uang: IDR (Rp)',
        },
        dashboard: {
            title: 'Manajemen Invoice',
            subtitle: 'Pantau piutang klien, terbitkan invoice berseri, dan kirimkan pengingat WhatsApp langsung.',
            createInvoice: 'Buat Invoice',
            metrics: {
                unpaid: 'Total Piutang Berjalan',
                unpaidDesc: 'Tertunda dari sent & overdue',
                paidMonth: 'Lunas Bulan Ini',
                paidMonthDesc: 'Pembayaran diterima bulan ini',
                overdue: 'Invoice Jatuh Tempo',
                overdueDesc: 'Perlu pengingat WhatsApp segera',
                total: 'Total Semua Invoice',
                draftCount: 'Draft: {count} invoice',
            },
            tabs: {
                all: 'Semua Invoice',
                draft: 'Draft',
                sent: 'Terkirim',
                paid: 'Lunas',
                overdue: 'Jatuh Tempo',
            },
            searchPlaceholder: 'Cari nomor invoice, klien...',
            filterBtn: 'Filter',
            table: {
                invoiceNumber: 'Nomor Invoice',
                client: 'Klien',
                issueDate: 'Tgl Terbit',
                dueDate: 'Jatuh Tempo',
                amount: 'Jumlah',
                status: 'Status',
                actions: 'Aksi',
                overdueLabel: 'Lewat Jatuh Tempo',
                itemsCount: '{count} item',
                emptyTitle: 'Tidak ada invoice ditemukan',
                emptySearch: 'Tidak ada invoice yang cocok dengan filter pencarian.',
                emptyNew: 'Buat invoice pertama Anda untuk mulai memantau pembayaran.',
                createFirst: 'Buat Invoice Pertama',
                paginationShowing: 'Menampilkan {from} hingga {to} dari total {total} invoice',
            },
            actions: {
                reminder: 'Ingatkan',
                publicView: 'Lihat Halaman Publik & Cetak',
                edit: 'Ubah Invoice',
                markPaid: 'Tandai Lunas',
                delete: 'Hapus Invoice',
                markPaidConfirm: 'Tandai invoice {number} sebagai Lunas?',
                deleteConfirm: 'Yakin ingin menghapus invoice {number}?',
            },
        },
        invoiceForm: {
            createTitle: 'Buat Invoice Baru',
            createSubtitle: 'Terbitkan invoice berseri dan tentukan tanggal jatuh tempo untuk klien Anda.',
            editTitle: 'Ubah Invoice',
            editSubtitle: 'Perbarui rincian invoice, item pekerjaan, dan status pembayaran.',
            headerCard: 'Data Invoice & Klien',
            invoiceNumber: 'Nomor Invoice',
            client: 'Klien',
            addNewClient: '+ Tambah Baru',
            issueDate: 'Tanggal Terbit',
            dueDate: 'Tanggal Jatuh Tempo',
            initialStatus: 'Status Awal',
            currentStatus: 'Status Invoice',
            itemsCard: 'Rincian Item Invoice',
            addItem: 'Tambah Item',
            table: {
                description: 'Deskripsi Item',
                qty: 'Jumlah',
                unitPrice: 'Harga Satuan (Rp)',
                subtotal: 'Subtotal',
            },
            notes: 'Catatan & Petunjuk Pembayaran:',
            notesPlaceholder: 'Instruksi transfer rekening atau syarat pembayaran tambahan...',
            summarySubtotal: 'Subtotal:',
            summaryTax: 'Pajak (0%):',
            summaryTotal: 'Total Pembayaran:',
            cancel: 'Batal',
            saveCreate: 'Simpan & Terbitkan Invoice',
            saveEdit: 'Perbarui Invoice',
            saving: 'Menyimpan...',
            viewPublic: 'Lihat Invoice Publik',
        },
        clients: {
            title: 'Daftar Klien',
            subtitle: 'Kelola data klien dan nomor telepon untuk pengiriman pengingat WhatsApp.',
            addClient: 'Tambah Klien',
            editClient: 'Ubah Klien',
            totalClients: 'Total Klien:',
            searchPlaceholder: 'Cari nama klien, nomor HP...',
            table: {
                name: 'Nama Klien',
                phone: 'Nomor WhatsApp',
                email: 'Email',
                address: 'Alamat',
                invoices: 'Invoice',
                totalBilled: 'Total Ditagih',
                actions: 'Aksi',
                emptyTitle: 'Belum ada klien terdaftar',
                emptyDesc: 'Tambahkan data klien untuk mempermudah pembuatan invoice dan pengingat WhatsApp.',
                addFirst: 'Tambah Klien Pertama',
                paginationShowing: 'Menampilkan {from} hingga {to} dari total {total} klien',
            },
            modal: {
                nameLabel: 'Nama Klien / Perusahaan',
                namePlaceholder: 'contoh: PT Maju Bersama atau Budi Santoso',
                phoneLabel: 'Nomor WhatsApp',
                phonePlaceholder: 'contoh: +6281234567890 atau 081234567890',
                phoneHint: 'Gunakan kode negara (misal +62) untuk pengiriman WhatsApp yang akurat.',
                emailLabel: 'Alamat Email (Opsional)',
                addressLabel: 'Alamat Penagihan (Opsional)',
                addressPlaceholder: 'Jalan, Kota, Kode Pos',
                cancel: 'Batal',
                save: 'Simpan Klien',
                update: 'Perbarui Klien',
                deleteConfirmTitle: 'Hapus Klien',
                deleteConfirm: 'Hapus klien "{name}"? Seluruh invoice terkait klien ini akan ikut terhapus.',
            },
        },
        settings: {
            title: 'Profil Bisnis & Rekening Bank',
            subtitle: 'Atur identitas usaha Anda dan nomor rekening tujuan transfer untuk pengingat WhatsApp dan invoice publik.',
            businessCard: 'Identitas Usaha / Freelance',
            businessName: 'Nama Bisnis / Usaha / Studio',
            businessNameHint: 'Tampil pada halaman invoice publik dan banner atas.',
            senderName: 'Nama Pengirim / Kontak',
            senderNameHint: 'Dicantumkan pada tanda tangan pesan pengingat WhatsApp.',
            bankCard: 'Rekening Bank Tujuan Transfer',
            bankName: 'Nama Bank',
            bankNamePlaceholder: 'contoh: BCA, Mandiri, BRI, BNI',
            accountNumber: 'Nomor Rekening',
            accountHolder: 'Nama Pemilik Rekening (a.n.)',
            previewNotice: 'Tampilan rekening pada draf pesan WhatsApp:',
            saveBtn: 'Simpan Pengaturan',
            savedSuccess: 'Pengaturan berhasil disimpan.',
        },
        whatsapp: {
            modalTitle: 'Pengingat Pembayaran WhatsApp',
            recipientPhone: 'Nomor WhatsApp Penerima:',
            noPhone: 'Nomor belum tercatat',
            templateLabel: 'Pilihan Templat Pengingat:',
            polite: 'Pengingat Ramah',
            dueToday: 'Jatuh Tempo Hari Ini',
            overdue: 'Telah Lewat Jatuh Tempo',
            installmentH3: 'Pengingat Cicilan H-3',
            previewLabel: 'Draf Pesan (Bisa diedit sebelum dikirim):',
            copyBtn: 'Salin Teks',
            copiedBtn: 'Tersalin',
            openWhatsApp: 'Buka di WhatsApp',
            cancel: 'Tutup',
        },
        installments: {
            sectionTitle: 'Skema Pembayaran & Cicilan',
            paymentType: 'Metode Pembayaran',
            full: 'Bayar Penuh (1x)',
            installment: 'Cicilan / Tenor Bertahap',
            tenorLabel: 'Pilihan Tenor',
            tenorMonths: '{count} Bulan ({count}x Cicilan)',
            installmentNumber: 'Cicilan #{number}',
            installmentOf: 'Cicilan {number} dari {total}',
            dueDate: 'Jatuh Tempo',
            amount: 'Nominal Cicilan',
            status: 'Status',
            pending: 'Belum Bayar',
            paid: 'Lunas',
            overdue: 'Lewat Jatuh Tempo',
            markPaid: 'Tandai Lunas',
            markPending: 'Tandai Belum',
            dueInDays: '{days} hari lagi',
            dueToday: 'Hari ini',
            overdueBy: 'Lewat {days} hari',
            h3Badge: 'H-3 Jatuh Tempo',
            upcomingCardTitle: 'Pengingat Cicilan Mendatang (H-3)',
            upcomingCardSubtitle: 'Daftar klien yang memiliki tenor jatuh tempo dalam 3 hari ke depan. Kirim pengingat WhatsApp dengan satu klik.',
            noUpcoming: 'Tidak ada cicilan jatuh tempo dalam 3 hari ke depan.',
            sendWhatsApp: 'Kirim WhatsApp H-3',
            reminderSentAt: 'Pengingat terkirim: {date}',
            autoSplitHint: 'Nominal total dibagi rata per bulan. Anda dapat menyesuaikan tanggal jatuh tempo setiap tenor sesuai kesepakatan.',
            scheduleTitle: 'Jadwal Rincian Cicilan',
        },
        publicInvoice: {
            badge: 'INVOICE',
            billedTo: 'Ditujukan Kepada:',
            issueDate: 'Tanggal Terbit:',
            dueDate: 'Jatuh Tempo:',
            itemDescription: 'Deskripsi Pekerjaan',
            qty: 'Qty',
            unitPrice: 'Harga Satuan',
            subtotal: 'Subtotal',
            bankInstructions: 'Instruksi Transfer Bank:',
            bank: 'Bank:',
            accountNumber: 'Nomor Rekening:',
            accountHolder: 'Pemilik Rekening:',
            copyAccount: 'Salin no. rekening',
            notes: 'Catatan:',
            subtotalLabel: 'Subtotal:',
            taxLabel: 'Pajak (0%):',
            totalDue: 'Total Tagihan:',
            printBtn: 'Cetak / Simpan PDF',
            thankYou: 'Terima kasih atas kerja samanya. Bila ada pertanyaan silakan hubungi {email}.',
        },
    },
    en: {
        brand: {
            name: 'RemindPay',
            tagline: 'Invoice & WhatsApp Payment Reminder',
        },
        common: {
            cancel: 'Cancel',
            confirm: 'Confirm',
            delete: 'Delete',
            markPaid: 'Mark Paid',
            success: 'Success',
            error: 'Error',
            notice: 'Notice',
            warning: 'Warning',
        },
        nav: {
            invoices: 'Invoices',
            clients: 'Clients',
            settings: 'Settings',
            profile: 'Business Profile & Bank',
            account: 'Account Security',
            logout: 'Log Out',
            setupBankNotice: 'Bank transfer details are not configured yet. Add them in settings to automatically include them in WhatsApp reminders.',
            configureNow: 'Configure now',
            currency: 'Local Currency: IDR (Rp)',
        },
        dashboard: {
            title: 'Invoice Management',
            subtitle: 'Track client receivables, issue serial invoices, and send direct WhatsApp reminders.',
            createInvoice: 'Create Invoice',
            metrics: {
                unpaid: 'Unpaid Receivables',
                unpaidDesc: 'Pending from sent & overdue',
                paidMonth: 'Paid This Month',
                paidMonthDesc: 'Settled payments in current month',
                overdue: 'Overdue Invoices',
                overdueDesc: 'Requires WhatsApp payment follow-up',
                total: 'Total Invoices',
                draftCount: 'Draft: {count} invoice(s)',
            },
            tabs: {
                all: 'All Invoices',
                draft: 'Draft',
                sent: 'Sent',
                paid: 'Paid',
                overdue: 'Overdue',
            },
            searchPlaceholder: 'Search by number or client...',
            filterBtn: 'Filter',
            table: {
                invoiceNumber: 'Invoice #',
                client: 'Client',
                issueDate: 'Issue Date',
                dueDate: 'Due Date',
                amount: 'Amount',
                status: 'Status',
                actions: 'Actions',
                overdueLabel: 'Overdue',
                itemsCount: '{count} item(s)',
                emptyTitle: 'No invoices found',
                emptySearch: 'No invoices match your search filters.',
                emptyNew: 'Create your first invoice to start tracking payments and sending WhatsApp reminders.',
                createFirst: 'Create First Invoice',
                paginationShowing: 'Showing {from} to {to} of {total} invoices',
            },
            actions: {
                reminder: 'Reminder',
                publicView: 'Public View & Print',
                edit: 'Edit Invoice',
                markPaid: 'Mark as Paid',
                delete: 'Delete Invoice',
                markPaidConfirm: 'Mark invoice {number} as Paid?',
                deleteConfirm: 'Are you sure you want to delete invoice {number}?',
            },
        },
        invoiceForm: {
            createTitle: 'Create New Invoice',
            createSubtitle: 'Issue a new serial invoice and set payment terms for your client.',
            editTitle: 'Edit Invoice',
            editSubtitle: 'Update invoice details, line items, and payment status.',
            headerCard: 'Invoice Header & Client',
            invoiceNumber: 'Invoice #',
            client: 'Client',
            addNewClient: '+ Add New',
            issueDate: 'Issue Date',
            dueDate: 'Due Date',
            initialStatus: 'Initial Status',
            currentStatus: 'Invoice Status',
            itemsCard: 'Invoice Line Items',
            addItem: 'Add Item',
            table: {
                description: 'Description',
                qty: 'Qty',
                unitPrice: 'Unit Price (Rp)',
                subtotal: 'Subtotal',
            },
            notes: 'Notes & Payment Instructions:',
            notesPlaceholder: 'Bank transfer instructions or additional terms...',
            summarySubtotal: 'Subtotal:',
            summaryTax: 'Tax (0%):',
            summaryTotal: 'Total Amount:',
            cancel: 'Cancel',
            saveCreate: 'Save & Issue Invoice',
            saveEdit: 'Update Invoice',
            saving: 'Saving...',
            viewPublic: 'View Public Invoice',
        },
        clients: {
            title: 'Client Directory',
            subtitle: 'Manage your client database and phone numbers for WhatsApp reminder dispatch.',
            addClient: 'Add Client',
            editClient: 'Edit Client',
            totalClients: 'Total Clients:',
            searchPlaceholder: 'Search client name, phone...',
            table: {
                name: 'Client Name',
                phone: 'WhatsApp Phone',
                email: 'Email',
                address: 'Address',
                invoices: 'Invoices',
                totalBilled: 'Total Billed',
                actions: 'Actions',
                emptyTitle: 'No clients registered',
                emptyDesc: 'Add your clients to easily generate invoices and trigger WhatsApp reminders.',
                addFirst: 'Add First Client',
                paginationShowing: 'Showing {from} to {to} of {total} clients',
            },
            modal: {
                nameLabel: 'Client Name / Company',
                namePlaceholder: 'e.g. Acme Corp or John Doe',
                phoneLabel: 'WhatsApp Phone Number',
                phonePlaceholder: 'e.g. +6281234567890 or 081234567890',
                phoneHint: 'Use country code (e.g. +62) for reliable WhatsApp link generation.',
                emailLabel: 'Email Address (Optional)',
                addressLabel: 'Billing Address (Optional)',
                addressPlaceholder: 'Street, City, Postal Code',
                cancel: 'Cancel',
                save: 'Save Client',
                update: 'Update Client',
                deleteConfirmTitle: 'Delete Client',
                deleteConfirm: 'Delete client "{name}"? Existing invoices for this client will also be removed.',
            },
        },
        settings: {
            title: 'Business Profile & Payment Settings',
            subtitle: 'Configure your company identity and destination bank accounts for WhatsApp reminders and invoices.',
            businessCard: 'Business Identity',
            businessName: 'Business / Studio Name',
            businessNameHint: 'Displayed on public invoices and top banner.',
            senderName: 'Sender / Contact Name',
            senderNameHint: 'Appears in the greeting signature of WhatsApp reminders.',
            bankCard: 'Bank Transfer Destination',
            bankName: 'Bank Name',
            bankNamePlaceholder: 'e.g. BCA, Mandiri, BRI, BNI',
            accountNumber: 'Account Number',
            accountHolder: 'Account Holder (a.n.)',
            previewNotice: 'How this will appear in your WhatsApp reminders:',
            saveBtn: 'Save Settings',
            savedSuccess: 'Settings saved successfully.',
        },
        whatsapp: {
            modalTitle: 'WhatsApp Payment Reminder',
            recipientPhone: 'Recipient WhatsApp:',
            noPhone: 'No phone recorded',
            templateLabel: 'Reminder Template:',
            polite: 'Polite Reminder',
            dueToday: 'Due Today',
            overdue: 'Overdue Follow-up',
            installmentH3: 'Installment Reminder (H-3)',
            previewLabel: 'Message Preview (Editable before sending):',
            copyBtn: 'Copy text',
            copiedBtn: 'Copied',
            openWhatsApp: 'Open in WhatsApp',
            cancel: 'Close',
        },
        installments: {
            sectionTitle: 'Payment Terms & Installments',
            paymentType: 'Payment Method',
            full: 'Full Payment (1x)',
            installment: 'Installment / Split Tenor',
            tenorLabel: 'Select Tenor',
            tenorMonths: '{count} Months ({count}x Installments)',
            installmentNumber: 'Installment #{number}',
            installmentOf: 'Installment {number} of {total}',
            dueDate: 'Due Date',
            amount: 'Installment Amount',
            status: 'Status',
            pending: 'Unpaid',
            paid: 'Paid',
            overdue: 'Overdue',
            markPaid: 'Mark Paid',
            markPending: 'Mark Pending',
            dueInDays: 'In {days} days',
            dueToday: 'Today',
            overdueBy: '{days} days overdue',
            h3Badge: 'Due in 3 Days',
            upcomingCardTitle: 'Upcoming Installment Reminders (H-3)',
            upcomingCardSubtitle: 'Clients with an installment tenor due in the next 3 days. Send WhatsApp reminder with one click.',
            noUpcoming: 'No installments due within the next 3 days.',
            sendWhatsApp: 'Send WhatsApp (H-3)',
            reminderSentAt: 'Reminder sent: {date}',
            autoSplitHint: 'The total invoice amount is split evenly per month. You can adjust due dates for each installment.',
            scheduleTitle: 'Installment Schedule Breakdown',
        },
        publicInvoice: {
            badge: 'INVOICE',
            billedTo: 'Billed To:',
            issueDate: 'Issue Date:',
            dueDate: 'Due Date:',
            itemDescription: 'Item Description',
            qty: 'Qty',
            unitPrice: 'Unit Price',
            subtotal: 'Subtotal',
            bankInstructions: 'Bank Transfer Instructions:',
            bank: 'Bank:',
            accountNumber: 'Account Number:',
            accountHolder: 'Account Holder:',
            copyAccount: 'Copy account number',
            notes: 'Notes:',
            subtotalLabel: 'Subtotal:',
            taxLabel: 'Tax (0%):',
            totalDue: 'Total Due:',
            printBtn: 'Print / Save as PDF',
            thankYou: 'Thank you for your business. For any inquiries, please contact {email}.',
        },
    },
};

const AppContext = createContext();

export function AppProvider({ children }) {
    // Theme State
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || savedTheme === 'light') {
                return savedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    // Locale State
    const [locale, setLocale] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('locale');
            if (savedLocale === 'en' || savedLocale === 'id') {
                return savedLocale;
            }
        }
        return 'id';
    });

    // Apply theme changes to documentElement
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Save locale changes
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('locale', locale);
    }, [locale]);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';

        // Fallback for browsers without View Transitions API or if user prefers reduced motion
        if (
            typeof document === 'undefined' ||
            !document.startViewTransition ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            setTheme(nextTheme);
            return;
        }

        const transition = document.startViewTransition(() => {
            flushSync(() => {
                setTheme(nextTheme);
                if (nextTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                localStorage.setItem('theme', nextTheme);
            });
        });

        transition.ready
            .then(() => {
                // Wave originating from top-left (0, 0) to bottom-right corner
                const endRadius = Math.ceil(
                    Math.hypot(window.innerWidth, window.innerHeight)
                ) + 20;

                document.documentElement.animate(
                    {
                        clipPath: [
                            'circle(0px at 0 0)',
                            `circle(${endRadius}px at 0 0)`,
                        ],
                    },
                    {
                        duration: 550,
                        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
            })
            .catch(() => {});
    };

    const toggleLocale = () => {
        setLocale((prev) => (prev === 'id' ? 'en' : 'id'));
    };

    // Helper translation function with fallback and parameter replacement
    const t = (path, params = {}) => {
        const dict = translations[locale] || translations.id;
        const keys = path.split('.');
        let val = dict;

        for (const k of keys) {
            if (val && typeof val === 'object' && k in val) {
                val = val[k];
            } else {
                val = null;
                break;
            }
        }

        if (typeof val !== 'string') {
            // Try English fallback
            let fallbackVal = translations.en;
            for (const k of keys) {
                if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
                    fallbackVal = fallbackVal[k];
                } else {
                    fallbackVal = null;
                    break;
                }
            }
            val = typeof fallbackVal === 'string' ? fallbackVal : path;
        }

        // Replace parameters e.g. {count}, {name}
        Object.entries(params).forEach(([key, paramVal]) => {
            val = val.replace(new RegExp(`\\{${key}\\}`, 'g'), String(paramVal));
        });

        return val;
    };

    // Confirmation Modal state
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: 'Konfirmasi',
        message: '',
        confirmText: 'Konfirmasi',
        cancelText: 'Batal',
        variant: 'primary',
        resolve: null,
    });

    const confirm = ({
        title = locale === 'en' ? 'Confirmation' : 'Konfirmasi',
        message = '',
        confirmText,
        cancelText,
        variant = 'primary',
    }) => {
        return new Promise((resolve) => {
            setModalConfig({
                isOpen: true,
                title,
                message,
                confirmText: confirmText || (locale === 'en' ? 'Confirm' : 'Konfirmasi'),
                cancelText: cancelText || (locale === 'en' ? 'Cancel' : 'Batal'),
                variant,
                resolve,
            });
        });
    };

    const handleModalClose = () => {
        if (modalConfig.resolve) {
            modalConfig.resolve(false);
        }
        setModalConfig((prev) => ({ ...prev, isOpen: false, resolve: null }));
    };

    const handleModalConfirm = () => {
        if (modalConfig.resolve) {
            modalConfig.resolve(true);
        }
        setModalConfig((prev) => ({ ...prev, isOpen: false, resolve: null }));
    };

    // Toasts state
    const [toasts, setToasts] = useState([]);

    const addToast = ({ type = 'info', message, title, duration = 4000 }) => {
        if (!message) return;
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { id, type, message, title };
        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
        return id;
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const toast = {
        success: (message, title) => addToast({ type: 'success', message, title }),
        error: (message, title) => addToast({ type: 'error', message, title }),
        warning: (message, title) => addToast({ type: 'warning', message, title }),
        info: (message, title) => addToast({ type: 'info', message, title }),
        dismiss: removeToast,
    };

    // Global Inertia flash listener
    useEffect(() => {
        const removeSuccessListener = router.on('success', (event) => {
            const flash = event.detail.page.props?.flash;
            if (flash?.message) {
                toast.success(flash.message);
            }
            if (flash?.error) {
                toast.error(flash.error);
            }
        });

        const removeErrorListener = router.on('error', (errors) => {
            const errorMessages = Object.values(errors);
            if (errorMessages.length > 0) {
                toast.error(errorMessages[0]);
            }
        });

        return () => {
            removeSuccessListener();
            removeErrorListener();
        };
    }, []);

    return (
        <AppContext.Provider
            value={{
                theme,
                toggleTheme,
                locale,
                setLocale,
                toggleLocale,
                t,
                confirm,
                toast,
            }}
        >
            {children}
            <AlertModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                variant={modalConfig.variant}
                onConfirm={handleModalConfirm}
                onClose={handleModalClose}
            />
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

export function useAlert() {
    const { confirm, toast } = useApp();
    return { confirm, toast };
}
