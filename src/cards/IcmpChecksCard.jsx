import React from 'react';
import { Radio, CheckCircle2, XCircle, Activity } from 'lucide-react';
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

export default function IcmpChecksCard({ icmp = [] }) {
    const total = icmp.length;
    const passed = icmp.filter((c) => c.status === 'ok' || c.status === 'success').length;
    const avgLoss =
        total > 0
            ? icmp.reduce((a, c) => a + (c.packet_loss_percent || 0), 0) / total
            : 0;

    const chartData = icmp.map((c) => ({
        name: c.host,
        rtt: c.avg_rtt_ms || 0,
        loss: c.packet_loss_percent || 0,
        ok: (c.status === 'ok' || c.status === 'success') && (c.packet_loss_percent || 0) < 100,
    }));

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
                        <Radio className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">ICMP Probes</h2>
                        <p className="text-[11px] text-slate-500">
                            {passed}/{total} reachable · avg loss {avgLoss.toFixed(0)}%
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
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip
                                contentStyle={{
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: 8,
                                    fontSize: 11,
                                }}
                            />
                            <Bar dataKey="rtt" name="Avg RTT (ms)" radius={[4, 4, 0, 0]}>
                                {chartData.map((c, i) => (
                                    <Cell key={i} fill={c.ok ? '#f97316' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Rows */}
            <div className="space-y-2">
                {icmp.map((c, i) => {
                    const ok = c.status === 'ok' || c.status === 'success';
                    const Icon = ok ? CheckCircle2 : XCircle;
                    const color = ok ? 'text-emerald-400' : 'text-red-400';
                    return (
                        <div
                            key={i}
                            className="rounded-lg bg-slate-800/40 border border-slate-800 px-3 py-2.5"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                                    <span className="text-sm font-mono text-slate-200 truncate">
                                        {c.host}
                                    </span>
                                    <span className="text-[10px] uppercase text-slate-500">
                                        ×{c.count}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                                    <span className="text-slate-400 font-mono">
                                        min {c.min_rtt_ms}ms
                                    </span>
                                    <span className="text-slate-400 font-mono">
                                        avg {c.avg_rtt_ms}ms
                                    </span>
                                    <span className="text-slate-400 font-mono">
                                        max {c.max_rtt_ms}ms
                                    </span>
                                </div>
                            </div>

                            {/* Packet loss bar */}
                            <div className="mt-2 flex items-center gap-2">
                                <Activity className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${c.packet_loss_percent > 50
                                            ? 'bg-red-500'
                                            : c.packet_loss_percent > 0
                                                ? 'bg-amber-500'
                                                : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${c.packet_loss_percent || 0}%` }}
                                    />
                                </div>
                                <span
                                    className={`text-[11px] font-semibold w-12 text-right ${c.packet_loss_percent > 50
                                        ? 'text-red-400'
                                        : c.packet_loss_percent > 0
                                            ? 'text-amber-400'
                                            : 'text-emerald-400'
                                        }`}
                                >
                                    {c.packet_loss_percent?.toFixed(0)}% loss
                                </span>
                            </div>
                        </div>
                    );
                })}
                {icmp.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-6">No ICMP probes</p>
                )}
            </div>
        </div>
    );
}
