import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts = [], onDismiss = () => {} }) {
    if (!toasts.length) return null;

    const renderIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.75} />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" strokeWidth={1.75} />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={1.75} />;
            case 'info':
            default:
                return <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" strokeWidth={1.75} />;
        }
    };

    return (
        <div
            aria-live="assertive"
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-top-2"
                >
                    {renderIcon(toast.type)}

                    <div className="flex-1 min-w-0 pr-1">
                        {toast.title && (
                            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                {toast.title}
                            </p>
                        )}
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-snug">
                            {toast.message}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => onDismiss(toast.id)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-zinc-400"
                        aria-label="Tutup notifikasi"
                    >
                        <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                </div>
            ))}
        </div>
    );
}
