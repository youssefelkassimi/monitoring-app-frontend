import { Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAlertsBadge } from './AlertsBadgeContext';

const TITLES = {
    '/agents': 'Agents',
    '/users': 'Users',
    '/alerts': 'Alerts',
};

/**
 * Renders the mobile top bar and opens the navigation drawer.
 * @param {{ onMenuClick: () => void }} props
 */
export default function MobileTopBar({ onMenuClick }) {
    const { pathname } = useLocation();
    const { unread } = useAlertsBadge();
    const title = pathname.startsWith('/agents/') ? 'Agent details' : TITLES[pathname] || 'Monitor';

    return (
        <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 lg:hidden">
            <button type="button" onClick={onMenuClick} aria-label="Open navigation" className="text-slate-300 hover:text-white">
                <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-white">{title}</span>
            <div className="relative">
                <Bell className="h-5 w-5 text-slate-300" />
                {unread > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unread > 99 ? '99+' : unread}</span>}
            </div>
        </header>
    );
}
