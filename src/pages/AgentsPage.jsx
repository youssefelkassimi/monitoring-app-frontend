import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bot,
    Plus,
    RefreshCw,
    Search,
    Server,
    Monitor,
    Cpu,
    KeyRound,
    Pencil,
    Ban,
    Trash2,
    Copy,
    Check,
    Wifi,
    WifiOff,
    ShieldAlert,
    RotateCcw, // Added for unrevoke icon
} from 'lucide-react';
import {
    getAllAgents,
    renameAgent,
    revokeAgent,
    deleteAgent,
} from '../service/agentService';
import {
    STATUS_STYLES,
    PROVISIONING_STYLES,
} from '../service/constants/agent';
import AgentStatusPill from '../components/AgentStatusPill';
import ProvisionAgentModal from '../components/ProvisionAgnetModal';
import RenameAgentModal from '../components/RenameAgentModal';
import ConfirmDialog from '../components/Confirmdialog';
import { topicSocketManager } from '../service/topicSocketManger'
import { useAuth } from '../components/AuthContext';

export default function AgentsPage() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    // modal state
    const [provisionOpen, setProvisionOpen] = useState(false);
    const [renamingAgent, setRenamingAgent] = useState(null);
    const [revokingAgent, setRevokingAgent] = useState(null); // Used for both revoke & unrevoke confirmation or direct action
    const [deletingAgent, setDeletingAgent] = useState(null);

    // ---------- load ----------
    const loadAgents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllAgents();
            setAgents(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Failed to load agents');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAgents();
    }, [loadAgents]);

    useEffect(() => {
        const teardown = topicSocketManager.subscribe('/topic/agents', {
            message: (updated) => {
                if (!updated?.agentId) return;

                if (updated.deleted) {
                    setAgents((prev) => prev.filter((a) => a.agentId !== updated.agentId));
                    return;
                }

                setAgents((prev) => {
                    const exists = prev.some((a) => a.agentId === updated.agentId);
                    if (!exists) return [updated, ...prev];
                    return prev.map((a) =>
                        a.agentId === updated.agentId ? { ...a, ...updated } : a
                    );
                });
            },
        });

        return () => teardown();
    }, []);

    // ---------- derived ----------
    const filtered = useMemo(() => {
        if (!search.trim()) return agents;
        const q = search.toLowerCase();
        return agents.filter(
            (a) =>
                a.label?.toLowerCase().includes(q) ||
                a.hostname?.toLowerCase().includes(q) ||
                a.agentId?.toLowerCase().includes(q) ||
                a.os?.toLowerCase().includes(q)
        );
    }, [agents, search]);

    const stats = useMemo(() => {
        return agents.reduce(
            (acc, a) => {
                acc.total += 1;
                if (a.status === 'ONLINE') acc.online += 1;
                else acc.offline += 1;
                if (a.provisioningStatus === 'ACTIVE') acc.active += 1;
                if (a.provisioningStatus === 'REVOKED') acc.revoked += 1;
                return acc;
            },
            { total: 0, online: 0, offline: 0, active: 0, revoked: 0 }
        );
    }, [agents]);

    // ---------- actions ----------
    const handleProvisioned = (created) => {
        setAgents((prev) => [created, ...prev]);
        setProvisionOpen(false);
    };

    const handleRenamed = (updated) => {
        setAgents((prev) =>
            prev.map((a) => (a.agentId === updated.agentId ? { ...a, ...updated } : a))
        );
        setRenamingAgent(null);
    };

    const handleToggleRevoke = async (agent) => {
        const isCurrentlyRevoked = agent.provisioningStatus === 'REVOKED';
        const newStatus = isCurrentlyRevoked ? 'ACTIVE' : 'REVOKED';

        await revokeAgent(agent.agentId);

        setAgents((prev) =>
            prev.map((a) =>
                a.agentId === agent.agentId ? { ...a, provisioningStatus: newStatus } : a
            )
        );
        setRevokingAgent(null);
    };

    const handleDeleted = async (agentId) => {
        await deleteAgent(agentId);
        setDeletingAgent(null);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
                        <Bot className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Agents</h1>
                        <p className="text-xs text-slate-400">
                            Provision, monitor, and manage monitoring agents
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadAgents}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setProvisionOpen(true)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Provision agent
                        </button>
                    )}
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatTile icon={Bot} label="Total" value={stats.total} color="blue" />
                <StatTile
                    icon={Wifi}
                    label="Online"
                    value={stats.online}
                    color="emerald"
                />
                <StatTile
                    icon={WifiOff}
                    label="Offline"
                    value={stats.offline}
                    color="slate"
                />
                <StatTile
                    icon={ShieldAlert}
                    label="Revoked"
                    value={stats.revoked}
                    color="red"
                />
            </div>

            {/* Search */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 mb-4 flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by label, hostname, OS, or ID…"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800/60 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <span className="text-[11px] text-slate-500">
                    {filtered.length} of {agents.length}
                </span>
            </div>

            {/* List */}
            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/20 text-sm text-red-300">
                    {error}
                </div>
            )}

            {loading && agents.length === 0 ? (
                <LoadingSkeleton />
            ) : filtered.length === 0 ? (
                <EmptyState
                    hasAgents={agents.length > 0}
                    onProvision={() => setProvisionOpen(true)}
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {filtered.map((agent) => (
                        <AgentCard
                            key={agent.agentId}
                            agent={agent}
                            onOpen={() => navigate(`/agents/${agent.agentId}`)}
                            onRename={isAdmin ? () => setRenamingAgent(agent) : undefined}
                            onRevokeToggle={isAdmin ? () => setRevokingAgent(agent) : undefined}
                            onDelete={isAdmin ? () => setDeletingAgent(agent) : undefined}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {provisionOpen && (
                <ProvisionAgentModal
                    onClose={() => setProvisionOpen(false)}
                    onProvisioned={handleProvisioned}
                />
            )}

            {renamingAgent && (
                <RenameAgentModal
                    agent={renamingAgent}
                    onClose={() => setRenamingAgent(null)}
                    onRenamed={handleRenamed}
                />
            )}

            {revokingAgent && (
                <ConfirmDialog
                    title={revokingAgent.provisioningStatus === 'REVOKED' ? "Unrevoke agent?" : "Revoke agent?"}
                    message={
                        revokingAgent.provisioningStatus === 'REVOKED'
                            ? `This will restore token access for ${revokingAgent.label || revokingAgent.agentId}.`
                            : `This will revoke the token for ${revokingAgent.label || revokingAgent.agentId}. The agent will no longer be able to send telemetry.`
                    }
                    confirmLabel={revokingAgent.provisioningStatus === 'REVOKED' ? "Unrevoke" : "Revoke"}
                    tone={revokingAgent.provisioningStatus === 'REVOKED' ? "blue" : "warning"}
                    onCancel={() => setRevokingAgent(null)}
                    onConfirm={() => handleToggleRevoke(revokingAgent)}
                />
            )}

            {deletingAgent && (
                <ConfirmDialog
                    title="Delete agent?"
                    message={`This will permanently remove ${deletingAgent.label || deletingAgent.agentId}. This action cannot be undone.`}
                    confirmLabel="Delete"
                    tone="danger"
                    onCancel={() => setDeletingAgent(null)}
                    onConfirm={() => handleDeleted(deletingAgent.agentId)}
                />
            )}
        </div>
    );
}

/* ---------- card ---------- */
function AgentCard({ agent, onOpen, onRename, onRevokeToggle, onDelete }) {
    const provMeta =
        PROVISIONING_STYLES[agent.provisioningStatus] ?? PROVISIONING_STYLES.PENDING;

    const isRevoked = agent.provisioningStatus === 'REVOKED';
    const expired =
        agent.tokenExpiresAt && new Date(agent.tokenExpiresAt).getTime() < Date.now();

    return (
        <div
            className="cursor-pointer rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur hover:border-slate-700 transition-colors"
            onClick={onOpen}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onOpen();
            }}
            role="link"
            tabIndex={0}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0">
                        <Server className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">
                            {agent.label || 'Unnamed agent'}
                        </h3>
                        <p
                            className="text-[11px] text-slate-500 font-mono truncate"
                            title={agent.agentId}
                        >
                            {agent.agentId}
                        </p>
                    </div>
                </div>
                <AgentStatusPill agent={agent} />
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <InfoRow
                    icon={Monitor}
                    label="Hostname"
                    value={agent.hostname || '—'}
                />
                <InfoRow
                    icon={Cpu}
                    label="OS"
                    value={
                        agent.os
                            ? `${agent.os}${agent.osVersion ? ' ' + agent.osVersion : ''}`
                            : '—'
                    }
                />
                <InfoRow
                    icon={Cpu}
                    label="Arch"
                    value={agent.architecture || '—'}
                />
                <InfoRow
                    icon={KeyRound}
                    label="Python"
                    value={agent.pythonVersion || '—'}
                />
            </div>

            {/* Provisioning + token */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${provMeta.bg} ${provMeta.color} ${provMeta.border}`}
                    >
                        {provMeta.label}
                    </span>
                    {expired && !isRevoked && (
                        <span className="text-[10px] text-red-400 font-semibold">
                            Token expired
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <IconBtn
                        icon={Pencil}
                        label="Rename"
                        tone="blue"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRename();
                        }}
                        disabled={isRevoked}
                    />
                    <IconBtn
                        icon={isRevoked ? RotateCcw : Ban}
                        label={isRevoked ? "Unrevoke" : "Revoke"}
                        tone={isRevoked ? "blue" : "amber"}
                        onClick={(e) => {
                            e.stopPropagation();
                            onRevokeToggle();
                        }}
                    />
                    <IconBtn
                        icon={Trash2}
                        label="Delete"
                        tone="red"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    />
                </div>
            </div>

            {/* Registered / last seen */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                <span>
                    Registered:{' '}
                    <span className="text-slate-400">
                        {agent.registeredAt
                            ? new Date(agent.registeredAt).toLocaleDateString()
                            : '—'}
                    </span>
                </span>
                <span className="text-right">
                    Last seen:{' '}
                    <span className="text-slate-400">
                        {agent.lastSeenAt
                            ? new Date(agent.lastSeenAt).toLocaleTimeString()
                            : '—'}
                    </span>
                </span>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    {label}
                </p>
                <p className="text-xs text-slate-200 truncate" title={value}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function IconBtn({ icon: Icon, label, tone, onClick, disabled }) {
    const tones = {
        blue: 'text-blue-400 hover:bg-blue-500/10',
        red: 'text-red-400 hover:bg-red-500/10',
        amber: 'text-amber-400 hover:bg-amber-500/10',
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            className={`p-2 rounded-md transition-colors ${disabled
                ? 'text-slate-700 cursor-not-allowed'
                : tones[tone]
                }`}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    );
}

/* ---------- stat tile ---------- */
function StatTile({ icon: Icon, label, value, color }) {
    const tones = {
        blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        slate: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
        red: 'bg-red-500/10 border-red-500/30 text-red-400',
    };
    return (
        <div className={`rounded-xl border p-4 ${tones[color]}`}>
            <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase tracking-wider">{label}</p>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        </div>
    );
}

/* ---------- states ---------- */
function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 animate-pulse"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800" />
                        <div className="flex-1">
                            <div className="h-3 w-2/3 bg-slate-800 rounded mb-1.5" />
                            <div className="h-2.5 w-1/2 bg-slate-800/60 rounded" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-8 bg-slate-800/50 rounded" />
                        <div className="h-8 bg-slate-800/50 rounded" />
                        <div className="h-8 bg-slate-800/50 rounded" />
                        <div className="h-8 bg-slate-800/50 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ hasAgents, onProvision }) {
    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center py-16 text-slate-500">
            <Bot className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium text-slate-400">
                {hasAgents ? 'No agents match your search' : 'No agents provisioned yet'}
            </p>
            <p className="text-xs mt-1">
                {hasAgents
                    ? 'Try a different search term.'
                    : 'Provision your first agent to start collecting telemetry.'}
            </p>
            {!hasAgents && (
                <button
                    onClick={onProvision}
                    className="mt-4 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Provision agent
                </button>
            )}
        </div>
    );
}
