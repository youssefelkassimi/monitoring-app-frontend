import React from 'react';
import { Server, CheckCircle2, XCircle, ShieldQuestion } from 'lucide-react';

const STATUS_STYLES = {
    running: { icon: CheckCircle2, text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    open: { icon: CheckCircle2, text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    ok: { icon: CheckCircle2, text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    error: { icon: XCircle, text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    closed: { icon: XCircle, text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
    stopped: { icon: XCircle, text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    unknown: { icon: ShieldQuestion, text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};


export default function ServicesCard({ services, history = [] }) {
    // console.log(services)
    const monitored = services?.monitored_services ?? [];
    const runningProcesses = services?.running_processes ?? {};
    const total = monitored.length;
    const healthy = monitored.filter((s) => ['running', 'open', 'ok'].includes(s.status)).length;
    const failing = total - healthy;

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div
                        className={`p-2 rounded-lg ${failing > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
                            } border`}
                    >
                        <Server
                            className={`w-4 h-4 ${failing > 0 ? 'text-red-400' : 'text-emerald-400'}`}
                        />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Monitored Services</h2>
                        <p className="text-[11px] text-slate-500">
                            {healthy}/{total} healthy · {failing} failing
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Pill label={`${healthy} OK`} tone="success" />
                    {failing > 0 && <Pill label={`${failing} DOWN`} tone="danger" />}
                </div>
            </div>

            {/* Service list */}
            <div className="space-y-2 mb-4">
                {monitored.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-6">No services monitored</p>
                )}
                {monitored.map((s, i) => {
                    const name = typeof s.name === 'string' ? s.name : s.name?.name ?? 'unknown';
                    const platform = typeof s.name === 'object' ? s.name?.platform : null;
                    const style = STATUS_STYLES[s.status] ?? STATUS_STYLES.unknown;
                    const Icon = style.icon;
                    return (
                        <div
                            key={`${name}-${platform}-${i}`}
                            className={`flex items-center justify-between rounded-lg border ${style.border} ${style.bg} px-3 py-2`}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <Icon className={`w-4 h-4 ${style.text} flex-shrink-0`} />
                                <span className="text-sm text-slate-200 font-medium truncate">{name}</span>
                                {platform && (
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                                        {platform}
                                    </span>
                                )}
                            </div>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>
                                {s.status}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Running process counts */}
            {Object.keys(runningProcesses).length > 0 && (
                <div className="pt-3 border-t border-slate-800">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                        Running Processes ({Object.keys(runningProcesses).length})
                    </p>
                    <div className="max-h-40 overflow-y-auto pr-1 space-y-1">
                        {Object.entries(runningProcesses)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 20)
                            .map(([name, count]) => (
                                <div
                                    key={name}
                                    className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-800/40"
                                >
                                    <span className="text-slate-300 truncate" title={name}>
                                        {name}
                                    </span>
                                    <span className="text-slate-500 font-mono">{count}×</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function Pill({ label, tone }) {
    const map = {
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        danger: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return (
        <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${map[tone]}`}
        >
            {label}
        </span>
    );
}
