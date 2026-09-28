import React from 'react';
import { Cpu, Activity, Zap, Gauge } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function CpuCard({ cpu, history = [] }) {
    if (!cpu) return <EmptyCard label="CPU" />;

    const isHigh = cpu.cpu_percent > 85;

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div
                        className={`p-2 rounded-lg ${isHigh ? 'bg-red-500/10' : 'bg-blue-500/10'
                            } border ${isHigh ? 'border-red-500/30' : 'border-blue-500/30'}`}
                    >
                        <Cpu className={`w-4 h-4 ${isHigh ? 'text-red-400' : 'text-blue-400'}`} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">CPU</h2>
                        <p className="text-[11px] text-slate-500">
                            {cpu.cpu_count_physical} cores · {cpu.cpu_count} threads
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p
                        className={`text-2xl font-bold ${isHigh ? 'text-red-400' : 'text-blue-400'
                            }`}
                    >
                        {cpu.cpu_percent?.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Usage</p>
                </div>
            </div>

            {/* Per-core bars */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {cpu.per_core_percent?.map((v, i) => {
                    const hot = v > 85;
                    return (
                        <div key={i} className="text-center">
                            <div className="h-16 w-full bg-slate-800/70 rounded-md relative overflow-hidden border border-slate-700/50">
                                <div
                                    className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${hot
                                        ? 'bg-gradient-to-t from-red-600 to-red-400'
                                        : 'bg-gradient-to-t from-blue-600 to-blue-400'
                                        }`}
                                    style={{ height: `${v}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">C{i}</p>
                            <p
                                className={`text-[11px] font-semibold ${hot ? 'text-red-400' : 'text-blue-400'
                                    }`}
                            >
                                {v.toFixed(0)}%
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* History chart */}
            {history.length > 0 && (
                <div className="h-32 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="cpuCardGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} unit="%" />
                            <Tooltip content={<SmallTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="percent"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#cpuCardGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Footer stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800">
                <Stat icon={Activity} label="User" value={`${cpu.times_user?.toFixed(1)}%`} />
                <Stat icon={Activity} label="System" value={`${cpu.times_system?.toFixed(1)}%`} />
                <Stat icon={Zap} label="Idle" value={`${cpu.times_idle?.toFixed(1)}%`} />
                <Stat
                    icon={Gauge}
                    label="Freq"
                    value={`${cpu.frequency_current} MHz`}
                />
            </div>

            {/* Load average */}
            <div className="mt-3 grid grid-cols-3 gap-2">
                {['1m', '5m', '15m'].map((label, i) => (
                    <div key={label} className="rounded-lg bg-slate-800/50 p-2">
                        <p className="text-[10px] text-slate-500 uppercase">Load {label}</p>
                        <p className="text-sm font-semibold text-slate-200">
                            {cpu.load_avg?.[i]?.toFixed(2) ?? '—'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Stat({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-1.5">
            <Icon className="w-3 h-3 text-slate-500" />
            <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-xs font-semibold text-slate-200">{value}</p>
            </div>
        </div>
    );
}

function SmallTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md bg-slate-900 border border-slate-700 p-2 text-[11px]">
            <p className="text-slate-400">{label}</p>
            <p className="text-blue-400 font-semibold">{payload[0].value?.toFixed(2)}%</p>
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
