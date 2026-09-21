export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-medium text-zinc-700 dark:text-zinc-300 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
