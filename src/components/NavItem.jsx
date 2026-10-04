import { NavLink } from 'react-router-dom';
import { Activity, BellRing, Bot, Users, AlertOctagon } from 'lucide-react';

export const NAV = [
    { to: '/agents', icon: Bot, label: 'Agents' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/alerts', icon: BellRing, label: 'Alerts', badge: true },
    { to: '/anomalies', icon: AlertOctagon, label: 'Anomalies' },
];

export default function NavItem({
    to,
    icon: Icon,
    label,
    badge = 0,
    collapsed = false,
    onClick,
}) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            title={collapsed ? label : undefined}
            aria-label={label}
            className={({ isActive }) =>
                [
                    // base
                    'group relative flex items-center rounded-lg mx-2 my-0.5',
                    'text-sm font-medium transition-all duration-200',
                    // spacing adapts to collapsed mode
                    collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                    // active / inactive
                    isActive
                        ? 'bg-blue-500/10 text-white'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white',
                ].join(' ')
            }
        >
            {({ isActive }) => (
                <>
                    {/* Left accent bar — visible when active */}
                    <span
                        className={[
                            'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200',
                            isActive
                                ? 'h-5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]'
                                : 'h-0 bg-transparent',
                        ].join(' ')}
                    />

                    {/* Icon */}
                    <Icon
                        className={[
                            'h-[18px] w-[18px] shrink-0 transition-colors',
                            isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300',
                        ].join(' ')}
                    />

                    {/* Label + badge — hidden when collapsed */}
                    {!collapsed && (
                        <>
                            <span className="flex-1 truncate">{label}</span>
                            {badge > 0 && (
                                <span className="rounded-full bg-red-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none min-w-[18px] text-center shadow-sm shadow-red-500/40">
                                    {badge > 99 ? '99+' : badge}
                                </span>
                            )}
                        </>
                    )}

                    {/* Mini badge dot when collapsed */}
                    {collapsed && badge > 0 && (
                        <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900" />
                    )}

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                        <span
                            role="tooltip"
                            className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-md bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-100 opacity-0 shadow-lg translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150"
                        >
                            {label}
                            {badge > 0 && (
                                <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold">
                                    {badge}
                                </span>
                            )}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );
}
