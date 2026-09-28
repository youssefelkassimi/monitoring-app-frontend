import React, { useState } from 'react';
import { ListTree, Cpu, MemoryStick } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProcessesCard({ processes }) {
    const [tab, setTab] = useState('cpu');

    if (!processes) return null;

    const topCpu = processes.top_cpu || [];
    const topMemory = processes.top_memory || [];

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ListTree className="w-4 h-4 text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                        Top Processes
                    </h2>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/60">
                    <TabBtn active={tab === 'cpu'} onClick={() => setTab('cpu')} icon={Cpu}>
                        CPU
                    </TabBtn>
                    <TabBtn active={tab === 'memory'} onClick={() => setTab('memory')} icon={MemoryStick}>
                        Memory
                    </TabBtn>
                </div>
            </div>

            {tab === 'cpu' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCpu} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" stroke="#64748b" fontSize={11} unit="%" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#64748b"
                                    fontSize={10}
                                    width={110}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: 8,
                                        fontSize: 12,
                                    }}
                                />
                                <Bar dataKey="cpu_percent" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <ProcessTable data={topCpu} metricKey="cpu_percent" metricLabel="CPU %" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topMemory} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" stroke="#64748b" fontSize={11} unit="%" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#64748b"
                                    fontSize={10}
                                    width={110}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: 8,
                                        fontSize: 12,
                                    }}
                                />
                                <Bar dataKey="memory_percent" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <ProcessTable data={topMemory} metricKey="memory_percent" metricLabel="MEM %" />
                </div>
            )}
        </div>
    );
}

function TabBtn({ active, onClick, icon: Icon, children }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${active
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
                }`}
        >
            <Icon className="w-3.5 h-3.5" />
            {children}
        </button>
    );
}

function ProcessTable({ data, metricKey, metricLabel }) {
    return (
        <div className="overflow-auto max-h-72 rounded-lg border border-slate-800">
            <table className="w-full text-xs">
                <thead className="bg-slate-800/70 sticky top-0">
                    <tr className="text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="text-left px-3 py-2">PID</th>
                        <th className="text-left px-3 py-2">Name</th>
                        <th className="text-right px-3 py-2">{metricLabel}</th>
                        <th className="text-right px-3 py-2">Threads</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((p, i) => (
                        <tr
                            key={p.pid}
                            className={`border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors ${i % 2 ? 'bg-slate-900/30' : ''
                                }`}
                        >
                            <td className="px-3 py-2 text-slate-500 font-mono">{p.pid}</td>
                            <td className="px-3 py-2 text-slate-200 truncate max-w-[140px]" title={p.name}>
                                {p.name}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-blue-400">
                                {p[metricKey]?.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-400">{p.num_threads}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
