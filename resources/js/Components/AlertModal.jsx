import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { AlertTriangle, CheckCircle2, Info, Trash2, X } from 'lucide-react';
import { Fragment } from 'react';

export default function AlertModal({
    isOpen = false,
    title = 'Konfirmasi',
    message = '',
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    variant = 'primary',
    onConfirm = () => {},
    onClose = () => {},
}) {
    const renderIcon = () => {
        if (variant === 'danger') {
            return (
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400">
                    <Trash2 className="w-5 h-5" strokeWidth={1.75} />
                </div>
            );
        }

        if (variant === 'warning') {
            return (
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />
                </div>
            );
        }

        return (
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                <Info className="w-5 h-5" strokeWidth={1.75} />
            </div>
        );
    };

    const confirmButtonClass = () => {
        if (variant === 'danger') {
            return 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus:ring-rose-500/20';
        }
        if (variant === 'warning') {
            return 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white focus:ring-amber-500/20';
        }
        return 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 focus:ring-zinc-500/20';
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[99999]" onClose={onClose}>
                {/* Backdrop */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-[2px] transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 translate-y-2 sm:translate-y-0"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-2 sm:translate-y-0"
                        >
                            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md p-5 sm:p-6">
                                {/* Close button */}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                    aria-label="Tutup"
                                >
                                    <X className="w-4 h-4" strokeWidth={1.75} />
                                </button>

                                <div className="flex items-start gap-4">
                                    {renderIcon()}

                                    <div className="flex-1 min-w-0 pr-6">
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                            {title}
                                        </h3>
                                        <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            {message}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        type="button"
                                        autoFocus
                                        onClick={() => {
                                            onConfirm();
                                            onClose();
                                        }}
                                        className={`px-3.5 py-1.5 rounded-md text-xs font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 ${confirmButtonClass()}`}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
