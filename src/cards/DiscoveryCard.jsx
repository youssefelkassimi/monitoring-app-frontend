import React, { useState } from 'react';
import {
    Radar,
    DoorOpen,
    DoorClosed,
    ChevronDown,
    ChevronRight,
    Server,
} from 'lucide-react';

export default function DiscoveryCard({ discovery }) {
    const scans = Array.isArray(discovery)
        ? discovery
        : discovery
            ? [discovery]
            : [];

    if (scans.length === 0) {
        return (
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 text-slate-500 text-sm">
                No discovery scans yet
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {scans.map((scan, i) => (
                <ScanPanel key={scan.host || i} scan={scan} />
            ))}
        </div>
    );
}

function ScanPanel({ scan }) {
    const [showClosed, setShowClosed] = useState(false);

    const services = scan.services ?? [];
    const open = services.filter((s) => s.status === 'open');
    const closed = services.filter((s) => s.status !== 'open');

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30">
                        <Radar className="w-4 h-4 text-fuchsia-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Server className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-mono text-slate-200">{scan.host}</span>
                        </h2>
                        <p className="text-[11px] text-slate-500">
                            {open.length} open · {closed.length} closed
                        </p>
                    </div>
                </div>
                <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${open.length > 0
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}
                >
                    {open.length > 0 ? 'Exposed' : 'Stealth'}
                </span>
            </div>

            {/* Open ports */}
            {open.length > 0 ? (
                <div className="space-y-1.5 mb-3">
                    {open.map((s) => (
                        <PortRow key={s.port} port={s} open />
                    ))}
                </div>
            ) : (
                <p className="text-xs text-slate-500 py-3 text-center">
                    No open ports detected
                </p>
            )}

            {/* Closed ports (collapsible) */}
            {closed.length > 0 && (
                <>
                    <button
                        onClick={() => setShowClosed((v) => !v)}
                        className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors mt-2"
                    >
                        {showClosed ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                        )}
                        {showClosed ? 'Hide' : 'Show'} {closed.length} closed ports
                    </button>
                    {showClosed && (
                        <div className="space-y-1.5 mt-2">
                            {closed.map((s) => (
                                <PortRow key={s.port} port={s} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function PortRow({ port, open }) {
    const Icon = open ? DoorOpen : DoorClosed;
    const color = open ? 'text-emerald-400' : 'text-slate-500';
    const bg = open
        ? 'bg-emerald-500/10 border-emerald-500/30'
        : 'bg-slate-800/30 border-slate-800';

    return (
        <div
            className={`flex items-center justify-between rounded-lg border ${bg} px-3 py-2`}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                <span
                    className={`font-mono text-sm font-semibold ${open ? 'text-slate-100' : 'text-slate-400'
                        }`}
                >
                    {port.port}
                </span>
                <span
                    className={`text-xs uppercase tracking-wider ${open ? 'text-slate-200' : 'text-slate-500'
                        }`}
                >
                    {port.service}
                </span>
            </div>
            <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${color}`}
            >
                {port.status}
            </span>
        </div>
    );
}
