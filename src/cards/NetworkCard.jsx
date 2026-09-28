import React from 'react';
import { Network, ArrowDown, ArrowUp, Link2 } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { formatBytes } from '../pages/SystemDashboard';

const STATE_COLORS = {
    ESTABLISHED: '#10b981',
    LISTEN: '#3b82f6',
    TIME_WAIT: '#f59e0b',
    NONE: '#64748b',
};

export default function NetworkCard({ network, history = [] }) {
    if (!network) return <EmptyCard label="Network" />;

    const states = network.connection_states || {};
    const totalStates = Object.values(states).reduce((a, b) => a + b, 0) || 1;

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <Network className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Network</h2>
                        <p className="text-[11px] text-slate-500">
                            {network.active_connections} active connections
                        </p>
                    </div>
                </div>
            </div>

            {/* Live throughput tiles */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <ThroughputTile
                    icon={ArrowDown}
                    label="Download"
                    rate={network.bandwidth_recv_bps}
                    color="emerald"
                    total={network.total_bytes_recv}
                />
                <ThroughputTile
                    icon={ArrowUp}
                    label="Upload"
                    rate={network.bandwidth_sent_bps}
                    color="blue"
                    total={network.total_bytes_sent}
                />
            </div>

            {/* History chart */}
            {history.length > 0 && (
                <div className="h-36 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="recvGradCard" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="sentGradCard" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} unit="KB" />
                            <Tooltip content={<SmallTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: 11 }}
                                iconSize={8}
                                iconType="circle"
                            />
                            <Area
                                type="monotone"
                                dataKey="recv"
                                name="Recv KB/s"
                                stroke="#10b981"
                                fill="url(#recvGradCard)"
                            />
                            <Area
                                type="monotone"
                                dataKey="sent"
                                name="Sent KB/s"
                                stroke="#3b82f6"
                                fill="url(#sentGradCard)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Connection states */}
            <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                    <Link2 className="w-3.5 h-3.5 text-slate-500" />
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">
                        Connection States
                    </p>
                </div>
                <div className="space-y-2">
                    {Object.entries(states).map(([state, count]) => {
                        const pct = (count / totalStates) * 100;
                        return (
                            <div key={state}>
                                <div className="flex justify-between text-[11px] mb-1">
                                    <span className="text-slate-400">{state}</span>
                                    <span className="text-slate-200 font-semibold">{count}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${pct}%`,
                                            backgroundColor: STATE_COLORS[state] || '#64748b',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Totals */}
            <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-slate-800">
                <MiniStat label="Packets Sent" value={network.total_packets_sent?.toLocaleString()} />
                <MiniStat label="Packets Recv" value={network.total_packets_recv?.toLocaleString()} />
                <MiniStat
                    label="Errors"
                    value={(network.total_errin || 0) + (network.total_errout || 0)}
                    danger={network.total_errin > 0 || network.total_errout > 0}
                />
            </div>
        </div>
    );
}

function ThroughputTile({ icon: Icon, label, rate, color, total }) {
    const colorMap = {
        emerald: {
            bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
            text: 'text-emerald-400',
        },
        blue: {
            bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
            text: 'text-blue-400',
        },
    };
    const c = colorMap[color];

    return (
        <div className={`rounded-lg border p-3 ${c.bg}`}>
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" />
                <p className="text-[10px] uppercase tracking-wider">{label}</p>
            </div>
            <p className={`text-lg font-bold ${c.text}`}>{formatBytes(rate)}/s</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
                Total: {formatBytes(total)}
            </p>
        </div>
    );
}

function MiniStat({ label, value, danger }) {
    return (
        <div className="rounded-lg bg-slate-800/50 p-2 text-center">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
            <p
                className={`text-xs font-semibold ${danger ? 'text-red-400' : 'text-slate-200'
                    }`}
            >
                {value ?? '—'}
            </p>
        </div>
    );
}

function SmallTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md bg-slate-900 border border-slate-700 p-2 text-[11px]">
            <p className="text-slate-400 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {p.value?.toFixed(2)} KB/s
                </p>
            ))}
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
