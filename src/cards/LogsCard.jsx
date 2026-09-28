import React, { useState, useMemo } from 'react';
import {
    FileText,
    AlertTriangle,
    CheckCircle2,
    MinusCircle,
    ChevronDown,
    ChevronRight,
    Search,
    Filter,
    Eye,
    EyeOff,
} from 'lucide-react';

// ---------- status metadata ----------
const STATUS_META = {
    ok: {
        label: 'Changes detected',
        icon: AlertTriangle,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
    },
    no_change: {
        label: 'No change',
        icon: MinusCircle,
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
    },
    error: {
        label: 'Read error',
        icon: AlertTriangle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
    },
    rotated: {
        label: 'Log rotated',
        icon: CheckCircle2,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
    },
};

export default function LogsCard({ logs = [] }) {
    const entries = useMemo(() => normalizeLogs(logs), [logs]);

    // Global filters
    const [showOnlyChanges, setShowOnlyChanges] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        let list = entries;
        if (showOnlyChanges) list = list.filter((e) => e.status === 'ok');
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.map((e) => ({
                ...e,
                matched_lines: e.matched_lines.filter((l) =>
                    l.line.toLowerCase().includes(q)
                ),
            }));
        }
        return list;
    }, [entries, showOnlyChanges, search]);

    // Aggregates
    const totals = useMemo(() => {
        return entries.reduce(
            (acc, e) => {
                acc.files += 1;
                acc.newLines += e.new_lines || 0;
                acc.matches += e.total_matched || e.matched_lines?.length || 0;
                if (e.status === 'ok') acc.changed += 1;
                if (e.status === 'no_change') acc.noChange += 1;
                if (e.status === 'error') acc.errors += 1;
                return acc;
            },
            { files: 0, newLines: 0, matches: 0, changed: 0, noChange: 0, errors: 0 }
        );
    }, [entries]);

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-500/10 border border-slate-500/30">
                        <FileText className="w-4 h-4 text-slate-300" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Log Watcher</h2>
                        <p className="text-[11px] text-slate-500">
                            {totals.files} file{totals.files !== 1 ? 's' : ''} ·{' '}
                            {totals.newLines.toLocaleString()} new lines ·{' '}
                            {totals.matches.toLocaleString()} matches
                        </p>
                    </div>
                </div>

                {/* Summary pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {totals.changed > 0 && (
                        <SummaryPill tone="warning" label={`${totals.changed} changed`} />
                    )}
                    {totals.noChange > 0 && (
                        <SummaryPill tone="muted" label={`${totals.noChange} unchanged`} />
                    )}
                    {totals.errors > 0 && (
                        <SummaryPill tone="danger" label={`${totals.errors} errors`} />
                    )}
                </div>
            </div>

            {/* Filters */}
            {entries.length > 0 && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter matched lines…"
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/60 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                    <button
                        onClick={() => setShowOnlyChanges((v) => !v)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${showOnlyChanges
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        {showOnlyChanges ? 'Changes only' : 'All files'}
                    </button>
                </div>
            )}

            {/* Empty state */}
            {entries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                    <EyeOff className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">No log files reported</p>
                </div>
            )}

            {/* File list */}
            <div className="space-y-2">
                {filtered.map((entry, i) => (
                    <LogFileRow
                        key={`${entry.path}-${i}`}
                        entry={entry}
                        search={search}
                    />
                ))}
            </div>

            {/* No results after filter */}
            {entries.length > 0 && filtered.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">
                    No files match the current filter
                </p>
            )}
        </div>
    );
}

/* ---------- one file ---------- */
function LogFileRow({ entry, search }) {
    const [open, setOpen] = useState(entry.status === 'ok' && entry.matched_lines?.length > 0);
    const [showAll, setShowAll] = useState(false);

    const meta = STATUS_META[entry.status] ?? STATUS_META.no_change;
    const Icon = meta.icon;
    const lines = entry.matched_lines ?? [];
    const previewCount = 5;
    const visibleLines = showAll ? lines : lines.slice(0, previewCount);
    const hasMore = lines.length > previewCount;

    return (
        <div className={`rounded-lg border ${meta.border} ${meta.bg} overflow-hidden`}>
            {/* Header row */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {open ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    )}
                    <Icon className={`w-3.5 h-3.5 ${meta.color} flex-shrink-0`} />
                    <span
                        className="text-xs font-mono text-slate-200 truncate"
                        title={entry.path}
                    >
                        {entry.path}
                    </span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* new lines */}
                    {entry.new_lines > 0 && (
                        <span className="text-[10px] font-semibold text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded">
                            +{entry.new_lines.toLocaleString()} lines
                        </span>
                    )}

                    {/* matches */}
                    {entry.total_matched > 0 && (
                        <span className={`text-[10px] font-semibold ${meta.color}`}>
                            {entry.total_matched.toLocaleString()} match
                            {entry.total_matched !== 1 ? 'es' : ''}
                        </span>
                    )}

                    {/* status label */}
                    <span
                        className={`text-[10px] uppercase tracking-wider font-semibold ${meta.color} hidden sm:inline`}
                    >
                        {meta.label}
                    </span>
                </div>
            </button>

            {/* Expandable body */}
            {open && (
                <div className="border-t border-white/5 px-3 py-2.5 bg-slate-950/40">
                    {lines.length === 0 ? (
                        <p className="text-[11px] text-slate-500 text-center py-2">
                            {entry.status === 'no_change'
                                ? 'No changes since last check'
                                : 'No matched lines'}
                        </p>
                    ) : (
                        <>
                            <div className="space-y-1.5">
                                {visibleLines.map((line, i) => (
                                    <LogLine key={i} line={line} search={search} />
                                ))}
                            </div>
                            {hasMore && (
                                <button
                                    onClick={() => setShowAll((v) => !v)}
                                    className="mt-2 text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                    <Eye className="w-3 h-3" />
                                    {showAll
                                        ? 'Show less'
                                        : `Show ${lines.length - previewCount} more`}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

/* ---------- one matched line ---------- */
function LogLine({ line, search }) {
    const text = line.line ?? '';
    const pattern = line.matched_pattern;

    // highlight search term if present
    const renderText = () => {
        if (!search.trim()) return text;
        const idx = text.toLowerCase().indexOf(search.toLowerCase());
        if (idx === -1) return text;
        return (
            <>
                {text.slice(0, idx)}
                <mark className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">
                    {text.slice(idx, idx + search.length)}
                </mark>
                {text.slice(idx + search.length)}
            </>
        );
    };

    return (
        <div className="flex items-start gap-2 text-[11px] font-mono leading-relaxed">
            <span className="text-slate-700 select-none flex-shrink-0">›</span>
            <div className="min-w-0 flex-1">
                <p className="text-slate-300 break-all whitespace-pre-wrap">
                    {renderText()}
                </p>
            </div>
            {pattern && (
                <span className="flex-shrink-0 text-[9px] uppercase tracking-wider font-bold text-red-300 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded">
                    {pattern}
                </span>
            )}
        </div>
    );
}

function SummaryPill({ tone, label }) {
    const map = {
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        muted: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        danger: 'bg-red-500/10 text-red-400 border-red-500/30',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    };
    return (
        <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${map[tone]}`}
        >
            {label}
        </span>
    );
}

/* ---------- normalizer ---------- */
/**
 * Accepts any of:
 *   - null / undefined         → []
 *   - single object            → [obj]
 *   - array (any length)       → array
 *   - JSON string              → parsed
 * Guarantees every entry has { path, status, new_lines, matched_lines, total_matched }.
 */
export function normalizeLogs(input) {
    if (!input) return [];

    let list = input;

    if (typeof list === 'string') {
        try {
            list = JSON.parse(list);
        } catch {
            return [];
        }
    }

    if (!Array.isArray(list)) {
        list = [list];
    }

    return list
        .filter(Boolean)
        .map((entry) => ({
            path: entry.path ?? entry.file ?? 'unknown',
            status: entry.status ?? 'no_change',
            new_lines: Number(entry.new_lines ?? 0),
            matched_lines: Array.isArray(entry.matched_lines) ? entry.matched_lines : [],
            total_matched: Number(
                entry.total_matched ?? entry.matched_lines?.length ?? 0
            ),
        }));
}
