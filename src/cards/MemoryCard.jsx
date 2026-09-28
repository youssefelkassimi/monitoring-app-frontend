import React from 'react';
import { MemoryStick, Layers, HardDriveDownload } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { formatBytes } from '../pages/SystemDashboard';

export default function MemoryCard({ memory, history = [] }) {
    if (!memory) return <EmptyCard label="Memory" />;

    const usedPct = memory.percent;
    const isHigh = usedPct > 85;

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div
                        className={`p-2 rounded-lg ${isHigh ? 'bg-red-500/10' : 'bg-purple-500/10'
                            } border ${isHigh ? 'border-red-500/30' : 'border-purple-500/30'}`}
                    >
                        <MemoryStick
                            className={`w-4 h-4 ${isHigh ? 'text-red-400' : 'text-purple-400'}`}
                        />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Memory</h2>
                        <p className="text-[11px] text-slate-500">
                            {formatBytes(memory.total_bytes)} total
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p
                        className={`text-2xl font-bold ${isHigh ? 'text-red-400' : 'text-purple-400'
                            }`}
                    >
                        {usedPct?.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Used</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${isHigh
                            ? 'bg-gradient-to-r from-red-600 to-red-400'
                            : 'bg-gradient-to-r from-purple-600 to-purple-400'
                            }`}
                        style={{ width: `${usedPct}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1.5 text-[11px]">
                    <span className="text-slate-400">
                        Used: <span className="text-slate-200 font-semibold">{formatBytes(memory.used_bytes)}</span>
                    </span>
                    <span className="text-slate-400">
                        Available:{' '}
                        <span className="text-slate-200 font-semibold">
                            {formatBytes(memory.available_bytes)}
                        </span>
                    </span>
                </div>
            </div>

            {/* History chart */}
            {history.length > 0 && (
                <div className="h-32 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="memCardGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} unit="%" />
                            <Tooltip content={<SmallTooltip color="#8b5cf6" />} />
                            <Area
                                type="monotone"
                                dataKey="percent"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fill="url(#memCardGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Swap section */}
            <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">
                        Swap
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <Stat label="Total" value={formatBytes(memory.swap_total)} />
                    <Stat label="Used" value={formatBytes(memory.swap_used)} />
                    <Stat label="Free" value={formatBytes(memory.swap_free)} />
                </div>
                <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                        style={{ width: `${memory.swap_percent}%` }}
                    />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 text-right">
                    {memory.swap_percent?.toFixed(1)}% used
                </p>
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="rounded-lg bg-slate-800/50 p-2">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-xs font-semibold text-slate-200 truncate">{value ?? '—'}</p>
        </div>
    );
}

function SmallTooltip({ active, payload, label, color = '#3b82f6' }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md bg-slate-900 border border-slate-700 p-2 text-[11px]">
            <p className="text-slate-400">{label}</p>
            <p style={{ color }} className="font-semibold">
                {payload[0].value?.toFixed(2)}%
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
