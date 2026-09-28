import React from 'react';
import {
    Server,
    Clock,
    RefreshCw,
    AlertCircle,
    Activity,
    Layers,
    Hash,
    FileWarning,
} from 'lucide-react';

export default function AgentCard({ agent }) {
    if (!agent) return <EmptyCard label="Agent" />;

    const hasErrors = agent.cycle_errors > 0;

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                        <Server className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Agent</h2>
                        <p className="text-[11px] text-slate-500 font-mono">
                            PID {agent.pid}
                        </p>
                    </div>
                </div>
                <div
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${hasErrors
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                >
                    {hasErrors ? 'Degraded' : 'Healthy'}
                </div>
            </div>

            {/* Primary metrics grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <MetricTile
                    icon={Clock}
                    label="Uptime"
                    value={formatUptime(agent.uptime_seconds)}
                    color="indigo"
                />
                <MetricTile
                    icon={Activity}
                    label="CPU"
                    value={`${agent.cpu_percent?.toFixed(1)}%`}
                    color="blue"
                    percent={agent.cpu_percent}
                />
                <MetricTile
                    icon={Layers}
                    label="Threads"
                    value={agent.num_threads}
                    sub={`${agent.active_threads} active`}
                    color="purple"
                />
                <MetricTile
                    icon={Hash}
                    label="RSS Memory"
                    value={formatBytes(agent.rss_bytes)}
                    sub={`VMS ${formatBytes(agent.vms_bytes)}`}
                    color="emerald"
                />
            </div>

            {/* Cycle info */}
            <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">
                        Cycle Info
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <Stat label="Cycles" value={agent.cycle_count} />
                    <Stat
                        label="Errors"
                        value={agent.cycle_errors}
                        danger={hasErrors}
                    />
                    <Stat
                        label="Duration"
                        value={`${(agent.last_cycle_duration_ms / 1000).toFixed(2)}s`}
                    />
                </div>
            </div>

            {/* Resource warnings */}
            {agent.num_fds === null && (
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-2.5">
                    <FileWarning className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-300">
                        File descriptor count not available on this platform.
                    </p>
                </div>
            )}

            {/* Error banner */}
            {hasErrors && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-500/5 border border-red-500/20 p-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-300">
                        {agent.cycle_errors} cycle error{agent.cycle_errors !== 1 ? 's' : ''}{' '}
                        detected.
                    </p>
                </div>
            )}
        </div>
    );
}

function MetricTile({ icon: Icon, label, value, sub, color, percent }) {
    const colorMap = {
        indigo: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
        blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    };
    const barColor = {
        indigo: 'bg-indigo-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        emerald: 'bg-emerald-500',
    };

    return (
        <div className={`rounded-lg border p-3 ${colorMap[color]}`}>
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" />
                <p className="text-[10px] uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-base font-bold text-white">{value ?? '—'}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
            {percent !== undefined && percent !== null && (
                <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${barColor[color]} transition-all duration-500`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, danger }) {
    return (
        <div className="rounded-lg bg-slate-800/50 p-2">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
            <p
                className={`text-sm font-semibold ${danger ? 'text-red-400' : 'text-slate-200'
                    }`}
            >
                {value ?? '—'}
            </p>
        </div>
    );
}

function EmptyCard({ label }) {
    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 text-slate-500 text-sm">
            {label} data unavailable
        </div>
    );
}

/* local utils */
function formatBytes(bytes) {
    if (bytes === null || bytes === undefined) return '—';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let v = bytes;
    while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
    }
    return `${v.toFixed(2)} ${units[i]}`;
}

function formatUptime(seconds) {
    if (!seconds) return '—';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}
