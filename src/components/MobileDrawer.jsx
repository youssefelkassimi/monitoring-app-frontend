import { useEffect } from 'react';
import { X, Bot } from 'lucide-react';
import NavItem, { NAV } from './NavItem';
import { useAuth } from './AuthContext';

export default function MobileDrawer({ open, onClose, unreadAlerts = 0 }) {
    const { isAdmin } = useAuth();
    // Lock body scroll while open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    return (
        <div
            className={`lg:hidden fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}
            aria-hidden={!open}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            {/* Panel */}
            <aside
                className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'
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
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
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

                {/* Footer */}
                <div className="border-t border-slate-800 p-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 font-mono">v1.0</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        Online
                    </span>
                </div>
            </aside>
        </div>
    );
}
