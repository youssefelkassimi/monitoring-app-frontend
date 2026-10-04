import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Activity,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertTriangle,
    Inbox,
    RefreshCw,
    Server,
} from 'lucide-react';
import { getAnomliesPage } from '../service/agentService';
import { topicSocketManager } from '../service/topicSocketManger';
import { ANOMALY } from '../service/constants/Topics';

const PAGE_SIZE = 20;
const MAX_CHIPS = 3;

const FILTERS = [
    { value: '', label: 'All' },
    { value: 'FIRING', label: 'Firing' },
    { value: 'RESOLVED', label: 'Resolved' },
];

/* ---------- helpers ---------- */

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : '');

const formatAgo = (iso, now) => {
    if (!iso) return '';
    const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return `${Math.floor(s / 86400)} d ago`;
};

const formatDuration = (from, to, now) => {
    if (!from) return '-';
    const end = to ? new Date(to).getTime() : now;
    const s = Math.max(0, Math.floor((end - new Date(from).getTime()) / 1000));
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    const h = Math.floor(s / 3600);
    if (h < 24) return `${h}h ${Math.floor((s % 3600) / 60)}m`;
    return `${Math.floor(h / 24)}d ${h % 24}h`;
};

// "system.memory.percent" -> { group: "memory", name: "percent" }
const splitFeature = (key) => {
    const parts = key.split('.');
    if (parts.length >= 3) return { group: parts[1], name: parts.slice(2).join('.') };
    return { group: '', name: key };
};

/* ---------- small pieces ---------- */

function StatusBadge({ status }) {
    if (status === 'FIRING') {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-300">
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Firing
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resolved
        </span>
    );
}

function ScoreMeter({ score, peak, firing }) {
    const s = Number(score) || 0;
    const p = Number(peak) || s;
    const pct = p > 0 ? Math.min(100, (s / p) * 100) : 0;
    return (
        <div className="w-40">
            <div className="flex items-baseline justify-between">
                <span className="font-mono text-base font-semibold tabular-nums text-white">
                    {s.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500">
                    peak <span className="font-mono tabular-nums text-slate-300">{p.toFixed(2)}</span>
                </span>
            </div>
            <div
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={p}
                aria-valuenow={s}
                aria-label="Current score relative to peak"
            >
                <div
                    className={`h-full rounded-full ${firing ? 'bg-red-400' : 'bg-slate-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function FeatureChips({ features }) {
    const entries = Object.entries(features || {});
    if (entries.length === 0) return <span className="text-xs text-slate-600">No indicators</span>;

    const shown = entries.slice(0, MAX_CHIPS);
    const hidden = entries.slice(MAX_CHIPS);

    return (
        <div className="flex max-w-md flex-wrap gap-1.5">
            {shown.map(([key, val]) => {
                const { group, name } = splitFeature(key);
                const isPercent = key.includes('percent');
                const hot = isPercent && Number(val) > 80;
                return (
                    <span
                        key={key}
                        title={key}
                        className="inline-flex items-center overflow-hidden rounded-md border border-slate-800 bg-slate-950/70 text-xs"
                    >
                        <span className="px-2 py-1 text-slate-400">
                            {group && <span className="text-slate-500">{group} </span>}
                            <span className="text-slate-200">{name}</span>
                        </span>
                        <span
                            className={`border-l border-slate-800 px-2 py-1 font-mono font-semibold tabular-nums ${hot ? 'bg-red-500/15 text-red-300' : 'text-sky-300'
                                }`}
                        >
                            {Number(val).toFixed(2)}
                            {isPercent ? '%' : ''}
                        </span>
                    </span>
                );
            })}
            {hidden.length > 0 && (
                <span
                    title={hidden.map(([k]) => k).join('\n')}
                    className="inline-flex items-center rounded-md border border-dashed border-slate-700 px-2 py-1 text-xs text-slate-500"
                >
                    +{hidden.length} more
                </span>
            )}
        </div>
    );
}

function SkeletonRows() {
    return Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-800/60">
            {[24, 40, 36, 56, 28, 20].map((w, j) => (
                <td key={j} className="px-4 py-5">
                    <div
                        className="h-4 rounded bg-slate-800/70 motion-safe:animate-pulse"
                        style={{ width: `${w * 3}px`, maxWidth: '100%' }}
                    />
                </td>
            ))}
        </tr>
    ));
}

/* ---------- page ---------- */

export default function AnomaliesPage() {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [fresh, setFresh] = useState(() => new Set());
    const [now, setNow] = useState(() => Date.now());

    const idsRef = useRef(new Set());
    useEffect(() => {
        idsRef.current = new Set(anomalies.map((a) => a.id));
    }, [anomalies]);

    // keep relative times and ongoing durations ticking
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(t);
    }, []);

    const fetchAnomalies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const pageable = { page, size: PAGE_SIZE, sort: 'startedAt,desc' };
            const response = await getAnomliesPage(pageable, statusFilter);
            const data = response.data || response;
            setAnomalies(data.content || data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error('Failed to load anomalies:', err);
            setError('Could not load anomalies. Check the connection to the backend and try again.');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => {
        fetchAnomalies();
    }, [fetchAnomalies]);

    // live updates: insert new anomalies, update existing ones in place (FIRING -> RESOLVED)
    useEffect(() => {
        const unsubscribe = topicSocketManager.subscribe(ANOMALY, {
            message: (anomaly) => {
                const known = idsRef.current.has(anomaly.id);
                const matches = !statusFilter || anomaly.status === statusFilter;

                if (known) {
                    setAnomalies((prev) => prev.map((a) => (a.id === anomaly.id ? anomaly : a)));
                    return;
                }
                if (!matches) return;

                setTotalElements((n) => n + 1);
                if (page !== 0) return;

                setAnomalies((prev) => [anomaly, ...prev].slice(0, PAGE_SIZE));
                setFresh((prev) => new Set(prev).add(anomaly.id));
                setTimeout(() => {
                    setFresh((prev) => {
                        const next = new Set(prev);
                        next.delete(anomaly.id);
                        return next;
                    });
                }, 4000);
            },
        });
        return () => unsubscribe();
    }, [page, statusFilter]);

    const firingOnPage = anomalies.filter((a) => a.status === 'FIRING').length;
    const from = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
    const to = Math.min((page + 1) * PAGE_SIZE, totalElements);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-white">
                        <Activity className="h-6 w-6 text-red-400" />
                        Anomalies
                    </h1>
                    <p className="mt-1.5 max-w-xl text-sm text-slate-400">
                        Unusual behaviour detected on your agents, with the metrics that contributed most.
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-sm text-slate-400" aria-live="polite">
                        {firingOnPage > 0 ? (
                            <>
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                                <span>
                                    <span className="font-semibold text-red-300">{firingOnPage}</span> firing on
                                    this page
                                </span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span>Nothing firing on this page</span>
                            </>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div
                        role="tablist"
                        aria-label="Filter by status"
                        className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1"
                    >
                        {FILTERS.map((f) => (
                            <button
                                key={f.value}
                                role="tab"
                                aria-selected={statusFilter === f.value}
                                onClick={() => {
                                    setStatusFilter(f.value);
                                    setPage(0);
                                }}
                                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${statusFilter === f.value
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchAnomalies}
                        aria-label="Refresh"
                        title="Refresh"
                        className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'motion-safe:animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-medium text-slate-400">
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Agent</th>
                                <th className="px-4 py-3">Score</th>
                                <th className="px-4 py-3">Top indicators</th>
                                <th className="px-4 py-3">Started</th>
                                <th className="px-4 py-3">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <SkeletonRows />
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-14 text-center">
                                        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-400" />
                                        <p className="text-slate-300">{error}</p>
                                        <button
                                            onClick={fetchAnomalies}
                                            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
                                        >
                                            Try again
                                        </button>
                                    </td>
                                </tr>
                            ) : anomalies.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-14 text-center">
                                        <Inbox className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                                        <p className="text-slate-300">
                                            {statusFilter
                                                ? `No ${statusFilter.toLowerCase()} anomalies.`
                                                : 'No anomalies detected yet.'}
                                        </p>
                                        {statusFilter && (
                                            <button
                                                onClick={() => setStatusFilter('')}
                                                className="mt-3 text-sm font-medium text-sky-300 hover:underline"
                                            >
                                                Show all anomalies
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                anomalies.map((item) => {
                                    const firing = item.status === 'FIRING';
                                    return (
                                        <tr
                                            key={item.id}
                                            className={`border-b border-slate-800/60 transition-colors duration-1000 last:border-b-0 hover:bg-slate-800/40 ${fresh.has(item.id) ? 'bg-red-500/10' : ''
                                                }`}
                                        >
                                            {/* Status, with a rail on the left edge for active rows */}
                                            <td
                                                className={`whitespace-nowrap border-l-2 px-4 py-4 ${firing ? 'border-red-500' : 'border-transparent'
                                                    }`}
                                            >
                                                <StatusBadge status={item.status} />
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg border border-slate-700/60 bg-slate-800/70 p-2">
                                                        <Server className="h-4 w-4 text-slate-300" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-white">
                                                            {item.agent?.label ||
                                                                item.agent?.agentId ||
                                                                'Unknown agent'}
                                                        </p>
                                                        <p className="truncate font-mono text-xs text-slate-500">
                                                            {item.agent?.hostname || item.agent?.agentId}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <ScoreMeter
                                                    score={item.score}
                                                    peak={item.peakScore}
                                                    firing={firing}
                                                />
                                            </td>

                                            <td className="px-4 py-4">
                                                <FeatureChips features={item.topFeatures} />
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4">
                                                <p className="text-slate-200" title={formatDate(item.startedAt)}>
                                                    {formatAgo(item.startedAt, now)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {formatDate(item.startedAt)}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4">
                                                <p className="font-mono tabular-nums text-slate-200">
                                                    {formatDuration(item.startedAt, item.resolvedAt, now)}
                                                </p>
                                                <p
                                                    className="text-xs text-slate-500"
                                                    title={formatDate(item.resolvedAt)}
                                                >
                                                    {item.resolvedAt ? 'Resolved' : 'Still firing'}
                                                </p>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-400">
                    <p>
                        <span className="font-medium text-white tabular-nums">
                            {from}-{to}
                        </span>{' '}
                        of <span className="font-medium text-white tabular-nums">{totalElements}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="mr-1 hidden text-xs sm:inline">
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 0))}
                            disabled={page === 0}
                            aria-label="Previous page"
                            className="rounded-lg bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                            disabled={page >= totalPages - 1}
                            aria-label="Next page"
                            className="rounded-lg bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
