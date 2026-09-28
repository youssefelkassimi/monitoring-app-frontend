import React from 'react';
import {
    Link2,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
} from 'lucide-react';

const STATUS_META = {
    ok: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    connection_error: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    timeout: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

export default function HttpChecksCard({ http = [] }) {
    const total = http.length;
    const passed = http.filter((h) => h.status === 'ok' || h.status === 'success').length;
    const failed = total - passed;
    const avgTime =
        total > 0
            ? http.reduce((a, h) => a + (h.response_time_ms || 0), 0) / total
            : 0;

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                        <Link2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">HTTP Checks</h2>
                        <p className="text-[11px] text-slate-500">
                            {passed}/{total} passed · avg {avgTime.toFixed(0)}ms
                        </p>
                    </div>
                </div>
                {failed > 0 && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border bg-red-500/10 text-red-400 border-red-500/30">
                        {failed} failing
                    </span>
                )}
            </div>

            {/* Rows */}
            <div className="space-y-2">
                {http.map((h, i) => {
                    const meta = STATUS_META[h.status] ?? STATUS_META.error;
                    const Icon = meta.icon;
                    const expectedOk = h.status_code === h.expected_status;
                    return (
                        <div
                            key={i}
                            className={`rounded-lg border ${meta.border} ${meta.bg} px-3 py-2.5`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Icon className={`w-4 h-4 ${meta.color} flex-shrink-0`} />
                                    <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                                        {h.method}
                                    </span>
                                    <span
                                        className="text-sm text-slate-200 font-medium truncate"
                                        title={h.url}
                                    >
                                        {h.url}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span
                                        className={`text-xs font-mono ${expectedOk ? 'text-emerald-400' : 'text-red-400'
                                            }`}
                                    >
                                        {h.status_code ?? '—'} / {h.expected_status}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">
                                        {h.response_time_ms?.toFixed(0)}ms
                                    </span>
                                </div>
                            </div>
                            {h.error && (
                                <p className="mt-2 text-[11px] text-red-300/80 leading-snug break-words">
                                    {h.error.split('(')[0].trim()}
                                </p>
                            )}
                        </div>
                    );
                })}
                {http.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-6">No HTTP checks</p>
                )}
            </div>
        </div>
    );
}
