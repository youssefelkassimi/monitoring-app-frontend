import React, { useMemo, useState } from 'react';
import {
    BellRing,
    RefreshCw,
    Search,
    AlertTriangle,
    CheckCircle2,
    Activity,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    Clock,
    TrendingUp,
    Server,
} from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';
import {
    SEVERITY_STYLES,
    STATUS_STYLES,
    SEVERITY_ORDER,
} from '../service/constants/alert';

export default function AlertsPage() {
    const {
        alerts,
        page,
        totalPages,
        totalElements,
        loading,
        error,
        newIds,
        goToPage,
        reload,
    } = useAlerts({ pageSize: 50 });

    // ---------- filters ----------
    const [search, setSearch] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all'); // all | PROBLEM | RECOVERY

    const filtered = useMemo(() => {
        let list = alerts;
        if (severityFilter !== 'all') {
            list = list.filter((a) => a.severity === severityFilter);
        }
        if (statusFilter !== 'all') {
            list = list.filter((a) => a.status === statusFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (a) =>
                    a.message?.toLowerCase().includes(q) ||
                    a.triggerName?.toLowerCase().includes(q) ||
                    a.key?.toLowerCase().includes(q) ||
                    a.agent?.label?.toLowerCase().includes(q) ||
                    a.agent?.hostname?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [alerts, search, severityFilter, statusFilter]);

    // ---------- aggregates (over the *loaded* page) ----------
    const stats = useMemo(() => {
        const acc = {
            total: alerts.length,
            problem: 0,
            recovery: 0,
            critical: 0,
            high: 0,
            warning: 0,
            info: 0,
            byTrigger: {},
        };
        for (const a of alerts) {
            if (a.status === 'PROBLEM') acc.problem += 1;
            else if (a.status === 'RECOVERY') acc.recovery += 1;
            if (acc[a.severity] !== undefined) acc[a.severity] += 1;
            if (a.triggerName) {
                acc.byTrigger[a.triggerName] = (acc.byTrigger[a.triggerName] || 0) + 1;
            }
        }
        return acc;
    }, [alerts]);

    const activeFilters =
        severityFilter !== 'all' || statusFilter !== 'all' || search.trim() !== '';

    const clearFilters = () => {
        setSearch('');
        setSeverityFilter('all');
        setStatusFilter('all');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30">
                            <BellRing className="w-6 h-6 text-red-400" />
                        </div>
                        {newIds.size > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                                {newIds.size}
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Alerts</h1>
                        <p className="text-xs text-slate-400">
                            Live stream from <span className="font-mono">/topic/alerts</span> ·{' '}
                            {totalElements.toLocaleString()} total
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={reload}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </header>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <StatTile
                    icon={Activity}
                    label="Loaded"
                    value={stats.total}
                    tone="slate"
                />
                <StatTile
                    icon={AlertTriangle}
                    label="Problems"
                    value={stats.problem}
                    tone="danger"
                />
                <StatTile
                    icon={CheckCircle2}
                    label="Recoveries"
                    value={stats.recovery}
                    tone="success"
                />
                <StatTile icon={AlertTriangle} label="Critical" value={stats.critical} tone="critical" />
                <StatTile icon={AlertTriangle} label="High" value={stats.high} tone="high" />
                <StatTile icon={AlertTriangle} label="Warning" value={stats.warning} tone="warning" />
            </div>

            {/* Filters */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 mb-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search message, trigger, key, or agent…"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800/60 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                </div>

                {/* status segmented */}
                <div className="flex items-center gap-1 p-1 rounded-md bg-slate-800/60 border border-slate-700">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'PROBLEM', label: 'Problems' },
                        { key: 'RECOVERY', label: 'Recoveries' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`text-xs px-2.5 py-1.5 rounded transition-colors ${statusFilter === key
                                ? 'bg-slate-700 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* severity */}
                <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="text-xs bg-slate-800/60 border border-slate-700 rounded-md text-slate-200 px-2.5 py-2 focus:outline-none focus:border-blue-500/50"
                >
                    <option value="all">All severities</option>
                    {SEVERITY_ORDER.map((s) => (
                        <option key={s} value={s}>
                            {SEVERITY_STYLES[s]?.label ?? s}
                        </option>
                    ))}
                </select>

                {activeFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1.5"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}

                <span className="ml-auto text-[11px] text-slate-500">
                    {filtered.length} of {alerts.length} shown
                </span>
            </div>

            {/* List */}
            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/20 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                {loading && alerts.length === 0 ? (
                    <LoadingSkeleton />
                ) : filtered.length === 0 ? (
                    <EmptyState hasAlerts={alerts.length > 0} onClear={clearFilters} />
                ) : (
                    <ul className="divide-y divide-slate-800/60">
                        {filtered.map((alert) => (
                            <AlertRow
                                key={alert.id}
                                alert={alert}
                                isNew={newIds.has(alert.id)}
                            />
                        ))}
                    </ul>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-[11px] text-slate-500">
                        Page <span className="text-slate-300 font-semibold">{page + 1}</span>{' '}
                        of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(page - 1)}
                            disabled={page === 0 || loading}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Prev
                        </button>
                        <button
                            onClick={() => goToPage(page + 1)}
                            disabled={page >= totalPages - 1 || loading}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ---------- row ---------- */
function AlertRow({ alert, isNew }) {
    const sev =
        SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info;
    const stat =
        STATUS_STYLES[alert.status] ?? STATUS_STYLES.PROBLEM;
    const isRecovery = alert.status === 'RECOVERY';

    return (
        <li
            className={`px-4 py-3.5 transition-all duration-500 ${isNew
                ? 'bg-blue-500/5 ring-1 ring-inset ring-blue-500/30'
                : 'hover:bg-slate-800/30'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* severity dot */}
                <div className="relative mt-1 flex-shrink-0">
                    <span className={`block w-2.5 h-2.5 rounded-full ${sev.dot}`} />
                    {isNew && (
                        <span
                            className={`absolute inset-0 rounded-full animate-ping ${sev.pulse}`}
                        />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    {/* top line: status + severity + trigger */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${stat.bg} ${stat.text} border ${stat.border}`}
                        >
                            {isRecovery ? (
                                <CheckCircle2 className="w-3 h-3" />
                            ) : (
                                <AlertTriangle className="w-3 h-3" />
                            )}
                            {stat.label}
                        </span>
                        <span
                            className={`text-[10px] font-semibold uppercase tracking-wider ${sev.text}`}
                        >
                            {sev.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                            {alert.triggerName}
                        </span>
                        {alert.key && (
                            <span className="text-[10px] text-slate-600 font-mono truncate">
                                {alert.key}
                            </span>
                        )}
                    </div>

                    {/* message */}
                    <p className="text-sm text-slate-200 leading-snug mb-1.5">
                        {alert.message}
                    </p>

                    {/* meta line */}
                    <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                            <Server className="w-3 h-3" />
                            {alert.agent?.label || alert.agent?.hostname || 'unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelative(alert.timestamp || alert.receivedAt)}
                        </span>
                        {alert.heldForSeconds !== undefined && !isRecovery && (
                            <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                held {formatDuration(alert.heldForSeconds)}
                            </span>
                        )}
                        {alert.value !== undefined && alert.threshold !== undefined && (
                            <span className="font-mono">
                                value{' '}
                                <span className={sev.text}>
                                    {formatNumber(alert.value)}
                                </span>{' '}
                                {alert.operator} {formatNumber(alert.threshold)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </li>
    );
}

/* ---------- helpers ---------- */
function formatRelative(iso) {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 0) return 'just now';
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds.toFixed(0)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    if (m < 60) return `${m}m ${s}s`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
}

function formatNumber(n) {
    if (n === null || n === undefined) return '—';
    if (typeof n !== 'number') return n;
    return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

/* ---------- stat tile ---------- */
function StatTile({ icon: Icon, label, value, tone = 'slate' }) {
    const tones = {
        slate: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
        danger: 'bg-red-500/10 border-red-500/30 text-red-400',
        success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        critical: 'bg-red-500/10 border-red-500/30 text-red-400',
        high: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
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

/* ---------- states ---------- */
function LoadingSkeleton() {
    return (
        <div className="p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mt-1" />
                    <div className="flex-1">
                        <div className="h-3 w-1/3 bg-slate-800 rounded mb-2" />
                        <div className="h-3 w-3/4 bg-slate-800/60 rounded mb-2" />
                        <div className="h-2.5 w-1/2 bg-slate-800/40 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ hasAlerts, onClear }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <BellRing className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium text-slate-400">
                {hasAlerts ? 'No alerts match your filters' : 'No alerts yet'}
            </p>
            <p className="text-xs mt-1">
                {hasAlerts
                    ? 'Try clearing the search or filter.'
                    : 'Alerts will appear here as soon as triggers fire.'}
            </p>
            {hasAlerts && (
                <button
                    onClick={onClear}
                    className="mt-4 text-xs text-blue-400 hover:text-blue-300"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}
