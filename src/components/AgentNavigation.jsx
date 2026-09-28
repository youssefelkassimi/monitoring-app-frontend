import { Activity, ArrowLeft, BellRing, Bot, ChevronRight, Monitor } from 'lucide-react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

export default function AgentNavigation() {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const tabs = [
        { to: `/agents/${agentId}`, label: 'System', icon: Monitor, end: true },
        { to: `/agents/${agentId}/services`, label: 'Services', icon: Activity },
        { to: `/agents/${agentId}/alerts`, label: 'Alerts', icon: BellRing },
    ];

    return (
        <nav className="sticky top-0 z-20 border-b border-slate-800/90 bg-slate-950/90 px-4 pt-3 shadow-xl shadow-slate-950/20 backdrop-blur-xl sm:px-6">
            <div className="mx-auto max-w-[1600px]">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/agents')}
                            aria-label="Back to agents"
                            className="group rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        </button>
                        <div className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
                            <span>Agents</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-700" />
                        </div>
                        <div className="flex min-w-0 items-center gap-2.5">
                            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2 text-blue-400 shadow-lg shadow-blue-950/20">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Agent workspace
                                </p>
                                <p className="truncate font-mono text-xs text-slate-300 sm:max-w-[280px]">
                                    {agentId || 'Unknown agent'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[11px] font-medium text-emerald-400 sm:flex">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        Live telemetry
                    </div>
                </div>
                <div className="mt-3 flex gap-1 overflow-x-auto border-t border-slate-800/70">
                    {tabs.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => [
                                'group relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                                isActive
                                    ? 'text-white'
                                    : 'text-slate-500 hover:text-slate-200',
                            ].join(' ')}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-300'}`} />
                                    {label}
                                    {isActive && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/60" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
}
