import { useApp } from '@/Contexts/AppContext';

export default function StatusBadge({ status, isOverdue = false, className = '' }) {
    const { t } = useApp();
    const effectiveStatus = (status !== 'paid' && isOverdue) ? 'overdue' : status;

    const styles = {
        draft: 'bg-zinc-100 text-zinc-700 border-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
        sent: 'bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/60',
        paid: 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/60',
        overdue: 'bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/60',
    };

    const dotColors = {
        draft: 'bg-zinc-400 dark:bg-zinc-500',
        sent: 'bg-blue-500 dark:bg-blue-400',
        paid: 'bg-emerald-500 dark:bg-emerald-400',
        overdue: 'bg-rose-500 dark:bg-rose-400',
    };

    const labels = {
        draft: t('dashboard.tabs.draft', 'Draft'),
        sent: t('dashboard.tabs.sent', 'Sent'),
        paid: t('dashboard.tabs.paid', 'Paid'),
        overdue: t('dashboard.tabs.overdue', 'Overdue'),
    };

    const currentStyle = styles[effectiveStatus] || styles.draft;
    const currentDot = dotColors[effectiveStatus] || dotColors.draft;
    const currentLabel = labels[effectiveStatus] || effectiveStatus;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${currentStyle} ${className}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${currentDot}`} />
            {currentLabel}
        </span>
    );
}
