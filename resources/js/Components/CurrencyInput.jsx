import { useEffect, useState } from 'react';

export default function CurrencyInput({
    value = 0,
    onChange,
    className = '',
    placeholder = '0',
    ...props
}) {
    const format = (num) => {
        if (num === null || num === undefined || num === 0 || num === '0' || num === '') {
            return '';
        }
        const parsed = typeof num === 'number' ? Math.round(num) : parseInt(String(num).replace(/\D/g, ''), 10);
        return isNaN(parsed) ? '' : Number(parsed).toLocaleString('id-ID');
    };

    const [displayVal, setDisplayVal] = useState(() => format(value));

    useEffect(() => {
        setDisplayVal(format(value));
    }, [value]);

    const handleChange = (e) => {
        const raw = e.target.value;
        const clean = raw.replace(/\D/g, '');
        if (clean === '') {
            setDisplayVal('');
            if (onChange) onChange(0);
            return;
        }
        const numeric = parseInt(clean, 10);
        setDisplayVal(Number(numeric).toLocaleString('id-ID'));
        if (onChange) onChange(numeric);
    };

    return (
        <input
            {...props}
            type="text"
            inputMode="numeric"
            value={displayVal}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
        />
    );
}
