export const AlertStatus = {
    PROBLEM: 'PROBLEM',
    RECOVERY: 'RECOVERY',
};

export const SEVERITY_STYLES = {
    critical: {
        label: 'Critical',
        dot: 'bg-red-500',
        text: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        pulse: 'bg-red-400',
    },
    high: {
        label: 'High',
        dot: 'bg-orange-500',
        text: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        pulse: 'bg-orange-400',
    },
    warning: {
        label: 'Warning',
        dot: 'bg-amber-500',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        pulse: 'bg-amber-400',
    },
    info: {
        label: 'Info',
        dot: 'bg-blue-500',
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        pulse: 'bg-blue-400',
    },
};

export const STATUS_STYLES = {
    PROBLEM: {
        label: 'Problem',
        text: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
    },
    RECOVERY: {
        label: 'Recovery',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
    },
};

export const SEVERITY_ORDER = ['critical', 'high', 'warning', 'info'];
