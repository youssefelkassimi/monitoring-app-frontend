export const AgentStatus = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
};

export const ProvisioningStatus = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    REVOKED: 'REVOKED',
};

// If lastSeenAt is older than this, treat agent as offline
// even if the backend still says ONLINE.
export const HEARTBEAT_TIMEOUT_MS = 60_000;


export const STATUS_STYLES = {
    ONLINE: {
        label: 'Online',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
    },
    OFFLINE: {
        label: 'Offline',
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
    },
};

export const PROVISIONING_STYLES = {
    ACTIVE: {
        label: 'Active',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
    },
    PENDING: {
        label: 'Pending',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
    },
    EXPIRED: {
        label: 'Expired',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
    },
    REVOKED: {
        label: 'Revoked',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
    },
};
