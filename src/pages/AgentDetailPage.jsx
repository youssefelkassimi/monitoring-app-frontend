import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Server,
    Monitor,
    Cpu,
    MemoryStick,
    HardDrive,
    Network,
    Activity,
    Clock,
    KeyRound,
    Copy,
    Check,
    RefreshCw,
    Pencil,
    Ban,
    Trash2,
    Play,
    FileText,
    Radar,
    ShieldCheck,
    Terminal,
    BellRing,
    Wifi,
    WifiOff,
} from 'lucide-react';

import { useAgentVerification } from '../hooks/useAgentVerification';
import { useAgentServices } from '../hooks/useAgentServices';

import { STATUS_STYLES, PROVISIONING_STYLES } from '../service/constants/agent';

import AgentCard from '../cards/AgentCard';
import ServicesCard from '../cards/ServicesCard';
import DnsChecksCard from '../cards/DnsChecksCard';
import HttpChecksCard from '../cards/HttpChecksCard';
import IcmpChecksCard from '../cards/IcmpChecksCard';
import DiscoveryCard from '../cards/DiscoveryCard';
import LogsCard from '../cards/LogsCard';
import CommandPanel from '../components/CommandPanel';
import AgentStatusPill from '../components/AgentStatusPill';
import ConfirmDialog from '../components/Confirmdialog';
import RenameAgentModal from '../components/RenameAgentModal';

import { revokeAgent, deleteAgent } from '../service/agentService';

/* ------------------------------------------------------------------ */
/*  Small helpers for tabs                                             */
/* ------------------------------------------------------------------ */
const TABS = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'services', label: 'Services', icon: ShieldCheck },
    { key: 'logs', label: 'Logs', icon: FileText },
    { key: 'discovery', label: 'Discovery', icon: Radar },
    { key: 'commands', label: 'Commands', icon: Terminal },
    { key: 'alerts', label: 'Alerts', icon: BellRing },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AgentDetailPage() {
    const { agentId } = useParams();
    const navigate = useNavigate();

    const { status, agent, reason, refresh } = useAgentVerification(agentId);
    const {
        services,
        dns,
        http,
        icmp,
        discovery,
        logs,
        preload,
    } = useAgentServices(agentId);

    const [tab, setTab] = useState('overview');
    const [renaming, setRenaming] = useState(false);
    const [revoking, setRevoking] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // preload services history on mount
    React.useEffect(() => {
        preload();
    }, [preload]);

    const handleRevoked = async () => {
        await revokeAgent(agentId);
        setRevoking(false);
        refresh();
    };

    const handleDeleted = async () => {
        await deleteAgent(agentId);
        setDeleting(false);
        navigate('/agents');
    };

    /* ---------- loading / offline states ---------- */
    if (status === 'loading' && !agent) {
        return <PageShell><AgentSkeleton /></PageShell>;
    }
    if (status === 'offline' || status === 'error') {
        return (
            <PageShell>
                <OfflineHeader
                    reason={reason}
                    agent={agent}
                    onRetry={refresh}
                    onBack={() => navigate('/agents')}
                />
            </PageShell>
        );
    }

    const statusMeta = STATUS_STYLES[agent?.status] ?? STATUS_STYLES.OFFLINE;
    const provMeta =
        PROVISIONING_STYLES[agent?.provisioningStatus] ??
        PROVISIONING_STYLES.PENDING;

    return (
        <PageShell>
            {/* Back link */}
            <Link
                to="/agents"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-4"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to agents
            </Link>

            {/* ---------------- Header ---------------- */}
            <header className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 md:p-6 mb-6 backdrop-blur">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* identity */}
                    <div className="flex items-start gap-4 min-w-0">
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex-shrink-0">
                            <Server className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold text-white truncate">
                                {agent?.label || 'Unnamed agent'}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <CopyId id={agent?.agentId} />
                                <AgentStatusPill agent={agent} />
                                <span
                                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${provMeta.bg} ${provMeta.color} ${provMeta.border}`}
                                >
                                    {provMeta.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 flex-wrap">
                                {agent?.hostname && (
                                    <span className="flex items-center gap-1">
                                        <Monitor className="w-3 h-3" />
                                        {agent.hostname}
                                    </span>
                                )}
                                {agent?.os && (
                                    <span className="flex items-center gap-1">
                                        <Cpu className="w-3 h-3" />
                                        {agent.os} {agent.osVersion}
                                    </span>
                                )}
                                {agent?.pythonVersion && (
                                    <span className="flex items-center gap-1">
                                        <KeyRound className="w-3 h-3" />
                                        Python {agent.pythonVersion}
                                    </span>
                                )}
                                {agent?.lastSeenAt && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        seen {relTime(agent.lastSeenAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={refresh}
                            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Refresh
                        </button>
                        <button
                            onClick={() => setRenaming(true)}
                            disabled={agent?.provisioningStatus === 'REVOKED'}
                            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Rename
                        </button>
                        <button
                            onClick={() => setRevoking(true)}
                            disabled={agent?.provisioningStatus === 'REVOKED'}
                            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Ban className="w-3.5 h-3.5" />
                            Revoke
                        </button>
                        <button
                            onClick={() => setDeleting(true)}
                            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                        </button>
                    </div>
                </div>
            </header>

            {/* ---------------- Tabs ---------------- */}
            <nav className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${tab === key
                            ? 'bg-slate-800 text-white border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200 border border-transparent'
                            }`}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                    </button>
                ))}
            </nav>

            {/* ---------------- Tab content ---------------- */}
            <div className="space-y-4">
                {tab === 'overview' && (
                    <OverviewTab
                        agent={agent}
                        services={services}
                        dns={dns}
                        http={http}
                        icmp={icmp}
                    />
                )}
                {tab === 'services' && (
                    <ServicesTab
                        services={services}
                        dns={dns}
                        http={http}
                        icmp={icmp}
                    />
                )}
                {tab === 'logs' && <LogsCard logs={logs} />}
                {tab === 'discovery' && <DiscoveryCard discovery={discovery} />}
                {tab === 'commands' && <CommandPanel agentId={agentId} />}
                {tab === 'alerts' && <AgentAlertsTab agentId={agentId} />}
            </div>

            {/* ---------------- Modals ---------------- */}
            {renaming && agent && (
                <RenameAgentModal
                    agent={agent}
                    onClose={() => setRenaming(false)}
                    onRenamed={() => {
                        setRenaming(false);
                        refresh();
                    }}
                />
            )}

            {revoking && (
                <ConfirmDialog
                    title="Revoke agent?"
                    message={`This will revoke the token for ${agent?.label || agentId}. The agent will no longer be able to send telemetry.`}
                    confirmLabel="Revoke"
                    tone="warning"
                    onCancel={() => setRevoking(false)}
                    onConfirm={handleRevoked}
                />
            )}

            {deleting && (
                <ConfirmDialog
                    title="Delete agent?"
                    message={`This will permanently remove ${agent?.label || agentId}. This action cannot be undone.`}
                    confirmLabel="Delete"
                    tone="danger"
                    onCancel={() => setDeleting(false)}
                    onConfirm={handleDeleted}
                />
            )}
        </PageShell>
    );
}

/* ------------------------------------------------------------------ */
/*  Layout wrapper                                                     */
/* ------------------------------------------------------------------ */
function PageShell({ children }) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 max-w-[1600px] mx-auto">
            {children}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Tabs content                                                       */
/* ------------------------------------------------------------------ */

function OverviewTab({ agent, services, dns, http, icmp }) {
    return (
        <>
            {/* Live stat strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                <MiniStat
                    icon={Cpu}
                    label="CPU"
                    value={agent?.cpu_percent != null ? `${agent.cpu_percent.toFixed(1)}%` : '—'}
                    tone="blue"
                />
                <MiniStat
                    icon={MemoryStick}
                    label="Memory"
                    value={agent?.memory_percent != null ? `${agent.memory_percent.toFixed(1)}%` : '—'}
                    tone="purple"
                />
                <MiniStat
                    icon={HardDrive}
                    label="Disk"
                    value={agent?.disk_percent != null ? `${agent.disk_percent.toFixed(1)}%` : '—'}
                    tone="amber"
                />
                <MiniStat
                    icon={Activity}
                    label="Processes"
                    value={agent?.processes ?? '—'}
                    tone="emerald"
                />
                <MiniStat
                    icon={Clock}
                    label="Uptime"
                    value={agent?.uptime ? formatUptime(agent.uptime) : '—'}
                    tone="slate"
                />
            </div>

            {/* Agent + services summary */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                <div className="xl:col-span-1">
                    <AgentCard agent={agent} />
                </div>
                <div className="xl:col-span-2">
                    <ServicesCard services={services} />
                </div>
            </div>

            {/* Checks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <DnsChecksCard dns={dns} />
                <HttpChecksCard http={http} />
                <IcmpChecksCard icmp={icmp} />
            </div>
        </>
    );
}

function ServicesTab({ services, dns, http, icmp }) {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <ServicesCard services={services} />
                <DnsChecksCard dns={dns} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <HttpChecksCard http={http} />
                <IcmpChecksCard icmp={icmp} />
            </div>
        </>
    );
}

/**
 * Filtered alerts view for this specific agent. If you already have a
 * useAlerts() hook, pass a filter through it — here we just do an inline
 * minimal subscription for the demo.
 */
function AgentAlertsTab({ agentId }) {
    const [alerts, setAlerts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { getAlertsPage } = await import('../service/agentService');
                const res = await getAlertsPage({
                    page: 0,
                    size: 50,
                    sort: 'timestamp,desc',
                    agentId, // if backend supports this filter, great
                });
                const content = Array.isArray(res) ? res : res?.content ?? [];
                if (!cancelled) {
                    setAlerts(content.filter((a) => a.agent?.agentId === agentId));
                }
            } catch {
                /* ignore */
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [agentId]);

    if (loading) {
        return (
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6 text-slate-500 text-sm">
                Loading alerts…
            </div>
        );
    }
    if (alerts.length === 0) {
        return (
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center py-16 text-slate-500">
                <BellRing className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">No alerts for this agent</p>
            </div>
        );
    }

    return (
        <ul className="rounded-xl bg-slate-900/60 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            {alerts.map((a) => (
                <li key={a.id} className="px-4 py-3 flex items-start gap-3">
                    <span
                        className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${a.status === 'RECOVERY' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-200">{a.message}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono">{a.triggerName}</span> ·{' '}
                            {relTime(a.timestamp || a.receivedAt)}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */

function MiniStat({ icon: Icon, label, value, tone }) {
    const tones = {
        blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
        amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        slate: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
    };
    return (
        <div className={`rounded-lg border px-3 py-2.5 ${tones[tone]}`}>
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" />
                <p className="text-[10px] uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-lg font-bold text-white">{value ?? '—'}</p>
        </div>
    );
}

function CopyId({ id }) {
    const [copied, setCopied] = React.useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(id);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch { }
    };
    return (
        <button
            onClick={copy}
            title="Copy agent ID"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-slate-200 bg-slate-800/60 border border-slate-700 rounded px-2 py-0.5 transition-colors"
        >
            {id?.slice(0, 12)}…
            {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
            ) : (
                <Copy className="w-3 h-3" />
            )}
        </button>
    );
}

function OfflineHeader({ reason, agent, onRetry, onBack }) {
    return (
        <div className="max-w-xl mx-auto mt-16">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500" />
                <div className="p-8 text-center">
                    <div className="relative inline-block mb-5">
                        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                        <div className="relative p-4 rounded-full bg-red-500/10 border border-red-500/30">
                            <WifiOff className="w-8 h-8 text-red-400" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">Agent unavailable</h2>
                    <p className="text-sm text-slate-400 mb-5">
                        {agent?.label || agent?.agentId || 'This agent'}{' '}
                        {reason === 'AGENT_OFFLINE'
                            ? 'is currently offline.'
                            : `cannot be verified (${reason}).`}
                    </p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={onBack}
                            className="text-xs px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                        >
                            Back to agents
                        </button>
                        <button
                            onClick={onRetry}
                            className="text-xs px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AgentSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-4 w-24 bg-slate-800 rounded mb-4" />
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-800" />
                    <div className="flex-1">
                        <div className="h-5 w-1/3 bg-slate-800 rounded mb-3" />
                        <div className="h-3 w-1/2 bg-slate-800/60 rounded" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-lg bg-slate-900/60 border border-slate-800" />
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  utils                                                              */
/* ------------------------------------------------------------------ */
function relTime(iso) {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function formatUptime(seconds) {
    if (!seconds) return '—';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}
