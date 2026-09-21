export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-md border border-transparent bg-rose-600 dark:bg-rose-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-rose-700 dark:hover:bg-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:opacity-50 ${
                    disabled ? 'cursor-not-allowed opacity-50' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
