import React from 'react';

const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

export default function StatusBadge({ label, status = 'info' }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${styles[status]}`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${status === 'success'
                    ? 'bg-emerald-400'
                    : status === 'danger'
                        ? 'bg-red-400'
                        : status === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-blue-400'
                    }`}
            />
            {label}
        </span>
    );
}
