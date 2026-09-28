import React from 'react';
import { Globe, CheckCircle2, XCircle, Clock } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

export default function DnsChecksCard({ dns = [] }) {
    const total = dns.length;
    const passed = dns.filter((d) => d.status === 'ok' || d.status === 'success').length;
    const failed = total - passed;
    const avgTime =
        total > 0
            ? dns.reduce((acc, d) => acc + (d.response_time_ms || 0), 0) / total
            : 0;

    const chartData = dns.map((d) => ({
        name: d.domain,
        time: +(d.response_time_ms || 0).toFixed(2),
        ok: d.status === 'ok' || d.status === 'success',
    }));

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                        <Globe className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">DNS Checks</h2>
                        <p className="text-[11px] text-slate-500">
                            {passed}/{total} resolved · avg {avgTime.toFixed(1)}ms
                        </p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="h-40 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} unit="ms" />
                            <Tooltip content={<SmallTooltip unit="ms" />} />
                            <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                                {chartData.map((d, i) => (
                                    <Cell key={i} fill={d.ok ? '#10b981' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Rows */}
            <div className="space-y-2">
                {dns.map((d, i) => (
                    <Row key={i} dns={d} />
                ))}
                {dns.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-6">No DNS checks</p>
                )}
            </div>
        </div>
    );
}

function Row({ dns }) {
    const ok = dns.status === 'ok' || dns.status === 'success';
    const Icon = ok ? CheckCircle2 : XCircle;
    const color = ok ? 'text-emerald-400' : 'text-red-400';

    return (
        <div className="rounded-lg bg-slate-800/40 border border-slate-800 px-3 py-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                    <span className="text-sm text-slate-200 font-medium truncate">
                        {dns.domain}
                    </span>
                    <span className="text-[10px] uppercase text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                        {dns.record_type}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-400 font-mono">
                        {dns.response_time_ms?.toFixed(0)}ms
                    </span>
                </div>
            </div>
            {dns.error && (
                <p className="mt-2 text-[11px] text-red-300/80 leading-snug break-words">
                    {dns.error.split(';')[0]}
                </p>
            )}
        </div>
    );
}

function SmallTooltip({ active, payload, label, unit }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md bg-slate-900 border border-slate-700 p-2 text-[11px]">
            <p className="text-slate-400">{label}</p>
            <p className="font-semibold text-slate-200">
                {payload[0].value}
                {unit}
            </p>
        </div>
    );
}
