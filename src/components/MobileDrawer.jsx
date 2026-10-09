import { useEffect, useState } from 'react';
import { X, Bot, LogOut } from 'lucide-react';
import NavItem, { NAV } from './NavItem';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_STYLES = {
    ADMIN: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
    USER: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

export default function MobileDrawer({ open, onClose, unreadAlerts = 0 }) {
    const { isAdmin, user, signOut } = useAuth();
    const navigate = useNavigate();
    const [signingOut, setSigningOut] = useState(false);

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await signOut();
            navigate('/login', { replace: true });
        } finally {
            setSigningOut(false);
        }
    };

    // Lock body scroll while open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    const initials = getInitials(user?.username);

    return (
        <div
            className={`lg:hidden fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
            aria-hidden={!open}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${
                    open ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Panel */}
            <aside
                className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl transform transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand + close */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
                            <Bot className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white leading-tight">Monitor</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                                System telemetry
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close menu"
                        className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-3 overflow-y-auto">
                    <p className="px-4 pb-2 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
                        Navigate
                    </p>
                    {NAV.filter((item) => isAdmin || item.to !== '/users').map((item) => (
                        <NavItem
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            badge={item.badge ? unreadAlerts : 0}
                            onClick={onClose}
                        />
                    ))}
                </nav>

                {/* Footer: User card & controls */}
                <div className="border-t border-slate-800/60 p-3 shrink-0">
                    {/* Expanded User Card (Visible when drawer is OPEN) */}
                    {open && user && (
                        <div className="flex items-center gap-3 rounded-xl bg-slate-900/80 border border-slate-800 p-3 shadow-inner">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/10">
                                    {initials}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                            </div>

                            {/* Identity */}
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white truncate leading-tight">
                                    {user.username}
                                </p>
                                <span
                                    className={`mt-1 inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded-md border ${
                                        ROLE_STYLES[user.role] ?? ROLE_STYLES.USER
                                    }`}
                                >
                                    {user.role}
                                </span>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleSignOut}
                                disabled={signingOut}
                                title="Sign out"
                                aria-label="Sign out"
                                className="p-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            >
                                <LogOut className="h-4 w-4" strokeWidth={2.25} />
                            </button>
                        </div>
                    )}

                    {/* Status / Version info */}
                    <div className="mt-3 flex items-center justify-between px-2">
                        <span className="text-[10px] text-slate-500 font-mono tracking-tight">v1.0</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            Online
                        </span>
                    </div>
                </div>
            </aside>
        </div>
    );
}

function getInitials(name) {
    if (!name) return '?';
    return (
        name
            .split(/[\s._-]+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase() ?? '')
            .join('')
            .slice(0, 2) || name[0].toUpperCase()
    );
}
