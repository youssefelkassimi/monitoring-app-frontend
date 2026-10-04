import { useEffect, useState } from 'react';
import {
    Bot,
    PanelLeftClose,
    PanelLeftOpen,
    LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavItem, { NAV } from './NavItem';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'sidebar:collapsed';

const ROLE_STYLES = {
    ADMIN: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
    AGENT: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    USER: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

export default function Sidebar({ unreadAlerts = 0 }) {
    const { isAdmin, user, signOut } = useAuth();
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(STORAGE_KEY) === '1';
    });
    const [signingOut, setSigningOut] = useState(false);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    }, [collapsed]);

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await signOut();
            navigate('/login', { replace: true });
        } finally {
            setSigningOut(false);
        }
    };

    const initials = getInitials(user?.username);

    return (
        <aside
            className={[
                'hidden lg:flex fixed left-0 top-0 h-screen z-30 flex-col',
                'bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/60',
                'shadow-[1px_0_0_0_rgba(255,255,255,0.02)]',
                'transition-[width] duration-300 ease-in-out',
                collapsed ? 'w-[76px]' : 'w-64',
            ].join(' ')}
        >
            {/* ---------- Brand ---------- */}
            <div
                className={[
                    'flex items-center h-16 border-b border-slate-800/60 shrink-0',
                    collapsed ? 'justify-center px-0' : 'gap-3 px-5',
                ].join(' ')}
            >
                <div className="relative shrink-0">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/25 shadow-sm">
                        <Bot className="w-5 h-5 text-blue-400" strokeWidth={2.25} />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                </div>

                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-[13.5px] font-bold text-white leading-tight tracking-tight truncate">
                            Monitor
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.12em] font-medium truncate">
                            System telemetry
                        </p>
                    </div>
                )}
            </div>

            {/* ---------- Nav ---------- */}
            <nav className="flex-1 py-4 px-2.5 overflow-y-auto overflow-x-visible scrollbar-thin">
                {!collapsed && (
                    <p className="px-2.5 pb-2 text-[10px] uppercase tracking-[0.12em] text-slate-600 font-semibold">
                        Navigate
                    </p>
                )}

                <div className="space-y-0.5">
                    {NAV.filter((item) => isAdmin || item.to !== '/users').map((item) => (
                        <NavItem
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            badge={item.badge ? unreadAlerts : 0}
                            collapsed={collapsed}
                        />
                    ))}
                </div>
            </nav>

            {/* ---------- Footer: user card + controls ---------- */}
            <div className="border-t border-slate-800/60 p-2.5 shrink-0">
                {/* User card (expanded) */}
                {!collapsed && user && (
                    <div className="group flex items-center gap-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 transition-all duration-200">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/10">
                                {initials}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                        </div>

                        {/* Identity */}
                        <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] font-semibold text-white truncate leading-tight">
                                {user.username}
                            </p>
                            <span
                                className={`mt-1 inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-[3px] rounded-md border ${ROLE_STYLES[user.role] ?? ROLE_STYLES.USER
                                    }`}
                            >
                                {user.role}
                            </span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleSignOut}
                            disabled={signingOut}
                            title="Sign out"
                            aria-label="Sign out"
                            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                        >
                            <LogOut className="h-4 w-4" strokeWidth={2.25} />
                        </button>
                    </div>
                )}

                {/* User card (collapsed — avatar only, logs out on click) */}
                {collapsed && user && (
                    <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        title={`${user.username} — sign out`}
                        aria-label="Sign out"
                        className="group relative w-full flex justify-center py-2 focus:outline-none"
                    >
                        <div className="relative">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/10 ring-2 ring-transparent group-hover:ring-red-500/40 group-focus-visible:ring-red-500/60 transition-all">
                                {initials}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />

                            <span className="absolute inset-0 rounded-full bg-red-500/85 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150">
                                <LogOut className="h-3.5 w-3.5 text-white" strokeWidth={2.25} />
                            </span>
                        </div>

                        {/* Tooltip */}
                        <span
                            role="tooltip"
                            className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100 shadow-xl opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50"
                        >
                            {user.username}
                            <span className="ml-2 text-slate-600">·</span>
                            <span className="ml-1.5 text-red-400 font-medium">Sign out</span>
                        </span>
                    </button>
                )}

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed((v) => !v)}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className={[
                        'mt-1.5 w-full flex items-center rounded-lg text-slate-500',
                        'hover:bg-slate-900 hover:text-slate-200 active:scale-[0.98]',
                        'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-700',
                        collapsed ? 'justify-center py-2.5' : 'gap-2.5 px-3 py-2.5',
                    ].join(' ')}
                >
                    {collapsed ? (
                        <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={2} />
                    ) : (
                        <>
                            <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={2} />
                            <span className="text-xs font-medium">Collapse</span>
                        </>
                    )}
                </button>

                {/* Version + status (expanded only) */}
                {!collapsed && (
                    <div className="mt-2.5 flex items-center justify-between px-3">
                        <span className="text-[10px] text-slate-600 font-mono tracking-tight">v1.0</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            Online
                        </span>
                    </div>
                )}
            </div>
        </aside>
    );
}

/* ---------- helpers ---------- */
function getInitials(name) {
    if (!name) return '?';
    return name
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2) || name[0].toUpperCase();
}
