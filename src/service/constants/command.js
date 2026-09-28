export const CommandStatus = {
    PENDING: 'PENDING',
    SENT: 'SENT',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    TIMEOUT: 'TIMEOUT',
    REJECTED: 'REJECTED',
};

export const COMMAND_STATUS_STYLES = {
    PENDING: { label: 'Pending', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', pulse: true },
    SENT: { label: 'Sent', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', pulse: true },
    SUCCESS: { label: 'Success', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', pulse: false },
    ERROR: { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', pulse: false },
    TIMEOUT: { label: 'Timeout', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', pulse: false },
    REJECTED: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', pulse: false },
};


export const ALLOWED_COMMANDS = [
    { name: 'uptime', args: [], label: 'Uptime', description: 'System uptime and load average' },
    { name: 'hostname', args: [], label: 'Hostname', description: 'Show the machine hostname' },
    { name: 'free', args: ['-h'], label: 'Memory', description: 'Memory usage in human units' },
    { name: 'df', args: ['-h'], label: 'Disk usage', description: 'Filesystem usage' },
    { name: 'ps', args: ['aux'], label: 'Processes', description: 'List processes' },
    { name: 'top', args: ['-b', '-n', '1'], label: 'Top snapshot', description: 'One-shot top' },
    { name: 'netstat', args: ['-an'], label: 'Connections', description: 'List network connections' },
    { name: 'whoami', args: [], label: 'Who am I', description: 'Current user' },
];

export const STATUS_ICONS = {
    PENDING: 'Clock',
    SENT: 'Send',
    SUCCESS: 'CheckCircle2',
    ERROR: 'XCircle',
    TIMEOUT: 'Timer',
    REJECTED: 'ShieldX',
};
