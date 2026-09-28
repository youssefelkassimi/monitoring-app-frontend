import React, { useState, useEffect } from 'react';
import {
    WifiOff,
    RefreshCw,
    Clock,
    AlertTriangle,
    Plug,
    ServerCrash,
    BookOpen,
    Home,
    Signal,
    Ban,
    KeyRound,
    Loader2,
    ShieldAlert,
} from 'lucide-react';

const REASON_META = {
    AGENT_OFFLINE: {
        title: 'Agent is offline',
        message:
            "The backend reports this agent as OFFLINE. It hasn't sent a heartbeat recently.",
        icon: WifiOff,
        accent: 'red',
        hint: 'The agent process may be stopped or the host may be powered off.',
    },
    HEARTBEAT_STALE: {
        title: 'No recent heartbeat',
        message:
            "The agent is registered as ONLINE but we haven't received a heartbeat within the expected window.",
        icon: Signal,
        accent: 'amber',
        hint: 'Check network connectivity between the agent and the backend.',
    },
    TOKEN_EXPIRED: {
        title: 'Agent token expired',
        message:
            'The agent authentication token has expired. The agent cannot send telemetry until re-provisioned.',
        icon: KeyRound,
        accent: 'amber',
        hint: 'Re-issue a new token from the agents management page.',
    },
    PROVISIONING_PENDING: {
        title: 'Agent not yet provisioned',
        message:
            'This agent is still in PENDING state and has never completed provisioning.',
        icon: Loader2,
        accent: 'blue',
        hint: 'Complete the agent installation on the host to activate it.',
    },
    PROVISIONING_EXPIRED: {
        title: 'Provisioning expired',
        message:
            'The provisioning window for this agent has expired before it could connect.',
        icon: ShieldAlert,
        accent: 'amber',
        hint: 'Start a new provisioning session to generate a fresh token.',
    },
    PROVISIONING_REVOKED: {
        title: 'Agent revoked',
        message:
            'This agent has been revoked and is no longer authorized to send telemetry.',
        icon: Ban,
        accent: 'red',
        hint: 'Contact an administrator if this was unintended.',
    },
    FETCH_ERROR: {
        title: "Can't reach backend",
        message:
            'We were unable to verify the agent status from the backend.',
        icon: ServerCrash,
        accent: 'red',
        hint: 'The backend may be down or unreachable from your network.',
    },
};

const ACCENTS = {
    red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        strip: 'from-red-600 via-red-500 to-amber-500',
        glow: 'bg-red-500/5',
        dot: 'bg-red-500',
        dotPing: 'bg-red-400',
        btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20',
    },
    amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        strip: 'from-amber-500 via-amber-400 to-yellow-400',
        glow: 'bg-amber-500/5',
        dot: 'bg-amber-500',
        dotPing: 'bg-amber-400',
        btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20',
    },
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        strip: 'from-blue-600 via-blue-500 to-indigo-500',
        glow: 'bg-blue-500/5',
        dot: 'bg-blue-500',
        dotPing: 'bg-blue-400',
        btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20',
    },
};

export default function AgentOfflinePage({
    agent,
    reason = 'AGENT_OFFLINE',
    onRetry,
    onGoHome,
}) {
    const [now, setNow] = useState(Date.now());
    const [reconnecting, setReconnecting] = useState(false);

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const meta = REASON_META[reason] || REASON_META.AGENT_OFFLINE;
    const accent = ACCENTS[meta.accent];
    const Icon = meta.icon;

    const lastSeen = agent?.lastSeenAt ? new Date(agent.lastSeenAt) : null;
    const registeredAt = agent?.registeredAt ? new Date(agent.registeredAt) : null;
    const secondsAgo = lastSeen
        ? Math.floor((now - lastSeen.getTime()) / 1000)
        : null;

    const handleRetry = async () => {
        setReconnecting(true);
        try {
            await onRetry?.();
        } finally {
            setTimeout(() => setReconnecting(false), 1000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div
                    className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${accent.glow}`}
                />
            </div>

            <main className="relative z-10 flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-lg">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div
                                className={`absolute inset-0 rounded-full animate-ping ${accent.bg}`}
                            />
                            <div
                                className={`relative p-5 rounded-full bg-slate-900 border ${accent.border}`}
                            >
                                <Icon className={`w-10 h-10 ${accent.text}`} />
                            </div>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">{meta.title}</h1>
                        <p className="text-sm text-slate-400 max-w-md mx-auto">
                            {meta.message}
                        </p>
                    </div>

                    {/* Agent info grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <InfoTile
                            icon={Plug}
                            label="Agent"
                            value={
                                <span
                                    className="truncate block text-slate-200"
                                    title={agent?.label || agent?.agentId}
                                >
                                    {agent?.label || 'Unnamed agent'}
                                </span>
                            }
                        />
                        <InfoTile
                            icon={Signal}
                            label="Agent ID"
                            value={
                                <span className="font-mono text-[10px] text-slate-300 truncate block">
                                    {agent?.agentId
                                        ? `${agent.agentId.slice(0, 12)}…`
                                        : '—'}
                                </span>
                            }
                        />
                        <InfoTile
                            icon={ServerCrash}
                            label="Hostname"
                            value={agent?.hostname || '—'}
                        />
                        <InfoTile
                            icon={Clock}
                            label="Last seen"
                            value={
                                lastSeen ? (
                                    <>
                                        {lastSeen.toLocaleTimeString()}
                                        {secondsAgo !== null && (
                                            <span className="text-[10px] text-slate-500 ml-1">
                                                ({formatAgo(secondsAgo)} ago)
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    'Never'
                                )
                            }
                        />
                        <InfoTile
                            icon={Signal}
                            label="OS"
                            value={
                                agent?.os
                                    ? `${agent.os} ${agent.osVersion || ''}`.trim()
                                    : '—'
                            }
                        />
                        <InfoTile
                            icon={AlertTriangle}
                            label="Status"
                            value={
                                <span className={`font-semibold ${accent.text}`}>
                                    {agent?.status || 'UNKNOWN'}
                                </span>
                            }
                        />
                    </div>

                    {/* Troubleshooting */}
                    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-slate-500" />
                            <h3 className="text-xs uppercase tracking-wider text-slate-400">
                                What you can do
                            </h3>
                        </div>
                        <ul className="space-y-2.5 text-sm text-slate-400">
                            <TroubleshootItem>{meta.hint}</TroubleshootItem>
                            <TroubleshootItem>
                                Confirm the agent service is running on{' '}
                                <span className="text-slate-200 font-medium">
                                    {agent?.hostname || 'the host'}
                                </span>
                                .
                            </TroubleshootItem>
                            <TroubleshootItem>
                                Verify network connectivity between the agent and the backend.
                            </TroubleshootItem>
                        </ul>
                    </div>


                    <div className="mt-6 flex items-center justify-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span
                                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${accent.dotPing}`}
                            />
                            <span
                                className={`relative inline-flex rounded-full h-2 w-2 ${accent.dot}`}
                            />
                        </span>
                        <span className="text-[11px] text-slate-500 uppercase tracking-wider">
                            Re-verifying agent status…
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* helpers */
function InfoTile({ icon: Icon, label, value }) {
    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3 text-slate-500" />
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    {label}
                </p>
            </div>
            <div className="text-sm font-semibold text-slate-200 truncate">
                {value}
            </div>
        </div>
    );
}

function TroubleshootItem({ children }) {
    return (
        <li className="flex items-start gap-2.5">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-600 flex-shrink-0" />
            <span className="leading-relaxed">{children}</span>
        </li>
    );
}

function formatAgo(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m < 60) return `${m}m ${s}s`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
}
