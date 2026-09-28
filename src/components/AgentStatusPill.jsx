import React from 'react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { useAgentVerification } from '../hooks/useAgentVerification';
import { STATUS_STYLES } from '../service/constants/agent';

export default function AgentStatusPill({ agent }) {
    const { status, reason } = useAgentVerification(agent.agentId);

    const effective =
        status === 'online'
            ? 'ONLINE'
            : status === 'offline'
                ? 'OFFLINE'
                : agent.status ?? 'OFFLINE';

    const meta = STATUS_STYLES[effective] ?? STATUS_STYLES.OFFLINE;

    const icon =
        status === 'loading' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
        ) : effective === 'ONLINE' ? (
            <Wifi className="w-3 h-3" />
        ) : (
            <WifiOff className="w-3 h-3" />
        );

    return (
        <span
            title={reason || meta.label}
            className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}
        >
            {icon}
            {status === 'loading' ? 'Checking' : meta.label}
        </span>
    );
}
