import React from 'react';
import { HardDrive, ArrowDownToLine, ArrowUpFromLine, Activity } from 'lucide-react';
import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
    PolarAngleAxis,
} from 'recharts';
import { formatBytes } from '../pages/SystemDashboard';

export default function DiskCard({ diskUsage = [], diskIo = {} }) {
    const disk = diskUsage[0];
    const io = Object.values(diskIo).filter((v) => typeof v === 'object')[0];

    if (!disk) return <EmptyCard label="Disk" />;

    const isHigh = disk.percent > 90;
    const radialData = [{ name: 'usage', value: disk.percent, fill: isHigh ? '#ef4444' : '#f59e0b' }];

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div
                        className={`p-2 rounded-lg ${isHigh ? 'bg-red-500/10' : 'bg-amber-500/10'
                            } border ${isHigh ? 'border-red-500/30' : 'border-amber-500/30'}`}
                    >
                        <HardDrive
                            className={`w-4 h-4 ${isHigh ? 'text-red-400' : 'text-amber-400'}`}
                        />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">Disk</h2>
                        <p className="text-[11px] text-slate-500">
                            {disk.device} · {disk.fstype}
                        </p>
                    </div>
                </div>
            </div>

            {/* Radial + info */}
            <div className="grid grid-cols-5 gap-3 items-center mb-4">
                <div className="col-span-2 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            innerRadius="70%"
                            outerRadius="100%"
                            data={radialData}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#1e293b' }} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p
                            className={`text-xl font-bold ${isHigh ? 'text-red-400' : 'text-amber-400'
                                }`}
                        >
                            {disk.percent?.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase">Used</p>
                    </div>
                </div>
                <div className="col-span-3 space-y-2">
                    <InfoRow label="Total" value={formatBytes(disk.total_bytes)} />
                    <InfoRow label="Used" value={formatBytes(disk.used_bytes)} highlight />
                    <InfoRow label="Free" value={formatBytes(disk.free_bytes)} />
                </div>
            </div>

            {/* I/O Stats */}
            {io && (
                <div className="pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-3.5 h-3.5 text-slate-500" />
                        <p className="text-[11px] uppercase tracking-wider text-slate-500">
                            I/O Activity
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <IoStat
                            icon={ArrowDownToLine}
                            color="emerald"
                            label="Read"
                            rate={io.read_bytes_per_sec}
                            total={io.read_bytes}
                        />
                        <IoStat
                            icon={ArrowUpFromLine}
                            color="blue"
                            label="Write"
                            rate={io.write_bytes_per_sec}
                            total={io.write_bytes}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value, highlight }) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{label}</span>
            <span
                className={`font-semibold ${highlight ? 'text-amber-400' : 'text-slate-200'
                    }`}
            >
                {value ?? '—'}
            </span>
        </div>
    );
}

function IoStat({ icon: Icon, color, label, rate, total }) {
    const colorMap = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    };
    const rateColor = {
        emerald: 'text-emerald-400',
        blue: 'text-blue-400',
    };

    return (
        <div className={`rounded-lg border p-2.5 ${colorMap[color]}`}>
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3" />
                <p className="text-[10px] uppercase tracking-wider">{label}</p>
            </div>
            <p className={`text-sm font-bold ${rateColor[color]}`}>
                {formatBytes(rate)}/s
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
                Total: {formatBytes(total)}
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
