import React, { useState, useEffect, useRef } from 'react';
import {
    Activity,
    Cpu,
    HardDrive,
    MemoryStick,
    Network,
    Server,
    Clock,
    AlertTriangle,
    Wifi,
    RefreshCw,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from 'recharts';

import CpuCard from '../cards/CpuCard';
import MemoryCard from '../cards/MemoryCard';
import DiskCard from '../cards/DiskCard';
import NetworkCard from '../cards/NetworkCard';
import ProcessesCard from '../cards/ProcessesCard';
import AgentCard from '../cards/AgentCard';
import StatusBadge from '../components/StatusBadge';

const COLORS = {
    cpu: '#3b82f6',
    memory: '#8b5cf6',
    disk: '#f59e0b',
    network: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
};

const MAX_HISTORY = 30; // 30 * 10s = 5min

export default function SystemDashboard({ system }) {
    const [cpuHistory, setCpuHistory] = useState([]);
    const [memoryHistory, setMemoryHistory] = useState([]);
    const [networkHistory, setNetworkHistory] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const prevDataRef = useRef(null);

    useEffect(() => {
        if (!system) return;

        const now = new Date();
        const timeLabel = now.toLocaleTimeString('en-US', {
            hour12: false,
            minute: '2-digit',
            second: '2-digit',
        });

        // CPU history
        if (system.cpu) {
            setCpuHistory((prev) => {
                const next = [
                    ...prev,
                    {
                        time: timeLabel,
                        percent: system.cpu.cpu_percent,
                        user: system.cpu.times_user,
                        system: system.cpu.times_system,
                        idle: system.cpu.times_idle,
                    },
                ];
                return next.slice(-MAX_HISTORY);
            });
        }

        // Memory history
        if (system.memory) {
            setMemoryHistory((prev) => {
                const next = [
                    ...prev,
                    {
                        time: timeLabel,
                        percent: system.memory.percent,
                        used: +(system.memory.used_bytes / 1024 ** 3).toFixed(2),
                        available: +(system.memory.available_bytes / 1024 ** 3).toFixed(2),
                    },
                ];
                return next.slice(-MAX_HISTORY);
            });
        }

        // Network history
        if (system.network) {
            setNetworkHistory((prev) => {
                const next = [
                    ...prev,
                    {
                        time: timeLabel,
                        sent: +(system.network.bandwidth_sent_bps / 1024).toFixed(2),
                        recv: +(system.network.bandwidth_recv_bps / 1024).toFixed(2),
                    },
                ];
                return next.slice(-MAX_HISTORY);
            });
        }

        setLastUpdate(now);
        prevDataRef.current = system;
    }, [system]);

    if (!system) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    <p>Waiting for system data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
            {/* Header */}
            <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
                        <Server className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">System Monitor</h1>
                        <p className="text-xs text-slate-400">
                            PID {system.agent_self?.pid} · Uptime {formatUptime(system.agent_self?.uptime_seconds)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <StatusBadge
                        label={`Cycle ${system.agent_self?.cycle_count}`}
                        status={system.agent_self?.cycle_errors === 0 ? 'success' : 'danger'}
                    />
                    {lastUpdate && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-300">
                                {lastUpdate.toLocaleTimeString()}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {/* Top stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MiniStat
                    icon={Cpu}
                    label="CPU"
                    value={`${system.cpu?.cpu_percent?.toFixed(1) ?? '—'}%`}
                    sub={`${system.cpu?.cpu_count_physical} cores / ${system.cpu?.cpu_count} threads`}
                    color="blue"
                    percent={system.cpu?.cpu_percent}
                />
                <MiniStat
                    icon={MemoryStick}
                    label="Memory"
                    value={`${system.memory?.percent?.toFixed(1) ?? '—'}%`}
                    sub={`${formatBytes(system.memory?.used_bytes)} / ${formatBytes(system.memory?.total_bytes)}`}
                    color="purple"
                    percent={system.memory?.percent}
                />
                <MiniStat
                    icon={HardDrive}
                    label="Disk"
                    value={`${system.disk_usage?.[0]?.percent?.toFixed(1) ?? '—'}%`}
                    sub={`${formatBytes(system.disk_usage?.[0]?.used_bytes)} / ${formatBytes(system.disk_usage?.[0]?.total_bytes)}`}
                    color="amber"
                    percent={system.disk_usage?.[0]?.percent}
                />
                <MiniStat
                    icon={Activity}
                    label="Processes"
                    value={system.processes?.total_count ?? '—'}
                    sub={`${system.processes?.by_status?.running ?? 0} running`}
                    color="emerald"
                />
            </div>

            {/* CPU History Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <Panel title="CPU Usage Over Time" icon={Cpu}>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cpuHistory}>
                                <defs>
                                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.cpu} stopOpacity={0.6} />
                                        <stop offset="95%" stopColor={COLORS.cpu} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="percent"
                                    stroke={COLORS.cpu}
                                    strokeWidth={2}
                                    fill="url(#cpuGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Per-core bars */}
                    <div className="mt-4 grid grid-cols-4 gap-2">
                        {system.cpu?.per_core_percent?.map((v, i) => (
                            <div key={i} className="text-center">
                                <div className="h-20 w-full bg-slate-800 rounded-md relative overflow-hidden">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                                        style={{ height: `${v}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Core {i}</p>
                                <p className="text-xs font-semibold text-blue-400">{v.toFixed(1)}%</p>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel title="Memory Usage Over Time" icon={MemoryStick}>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={memoryHistory}>
                                <defs>
                                    <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.memory} stopOpacity={0.6} />
                                        <stop offset="95%" stopColor={COLORS.memory} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="percent"
                                    stroke={COLORS.memory}
                                    strokeWidth={2}
                                    fill="url(#memGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Swap info */}
                    <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                        <InfoTile label="Swap Used" value={formatBytes(system.memory?.swap_used)} />
                        <InfoTile label="Swap Free" value={formatBytes(system.memory?.swap_free)} />
                        <InfoTile label="Swap %" value={`${system.memory?.swap_percent}%`} />
                    </div>
                </Panel>
            </div>

            {/* Network + Processes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-2">
                    <Panel title="Network Activity" icon={Network}>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={networkHistory}>
                                    <defs>
                                        <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.6} />
                                            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="recvGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.network} stopOpacity={0.6} />
                                            <stop offset="95%" stopColor={COLORS.network} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                                    <YAxis stroke="#64748b" fontSize={11} unit=" KB/s" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="sent"
                                        stroke={COLORS.success}
                                        fill="url(#sentGrad)"
                                        name="Sent"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="recv"
                                        stroke={COLORS.network}
                                        fill="url(#recvGrad)"
                                        name="Received"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <InfoTile label="Total Sent" value={formatBytes(system.network?.total_bytes_sent)} />
                            <InfoTile label="Total Recv" value={formatBytes(system.network?.total_bytes_recv)} />
                            <InfoTile label="Connections" value={system.network?.active_connections} />
                            <InfoTile label="ESTABLISHED" value={system.network?.connection_states?.ESTABLISHED} />
                        </div>
                    </Panel>
                </div>

                <Panel title="Connection States" icon={Wifi}>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={Object.entries(system.network?.connection_states || {}).map(
                                        ([k, v]) => ({ name: k, value: v })
                                    )}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {Object.keys(system.network?.connection_states || {}).map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'][i % 4]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>
            </div>

            {/* Processes */}
            <ProcessesCard processes={system.processes} />
        </div>
    );
}

/* ---------- Helper components ---------- */

function MiniStat({ icon: Icon, label, value, sub, color, percent }) {
    const colorMap = {
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
        amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
        emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    };
    const barColor = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        amber: 'bg-amber-500',
        emerald: 'bg-emerald-500',
    };

    return (
        <div
            className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 ${colorMap[color]}`}
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                </div>
                <Icon className="w-6 h-6 opacity-80" />
            </div>
            <p className="text-xs text-slate-400 truncate">{sub}</p>
            {percent !== undefined && percent !== null && (
                <div className="mt-3 h-1.5 w-full bg-slate-800/60 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${barColor[color]} transition-all duration-500`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
}

function Panel({ title, icon: Icon, children }) {
    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
                {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                    {title}
                </h2>
            </div>
            {children}
        </div>
    );
}

function InfoTile({ label, value }) {
    return (
        <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-slate-100 truncate">{value ?? '—'}</p>
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 shadow-xl text-xs">
            {label && <p className="text-slate-400 mb-1">{label}</p>}
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
                </p>
            ))}
        </div>
    );
}

/* ---------- utils ---------- */
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
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

export { formatBytes, formatUptime };
