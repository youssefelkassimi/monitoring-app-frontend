import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import MobileTopBar from './MobileTopBar';
import MobileDrawer from './MobileDrawer';

const STORAGE_KEY = 'sidebar:collapsed';

export default function Layout() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(STORAGE_KEY) === '1';
    });

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === STORAGE_KEY) setCollapsed(e.newValue === '1');
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    useEffect(() => {
        const id = setInterval(() => {
            const next = window.localStorage.getItem(STORAGE_KEY) === '1';
            setCollapsed((c) => (c === next ? c : next));
        }, 200);
        return () => clearInterval(id);
    }, []);

    const unreadAlerts = 0;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Sidebar unreadAlerts={unreadAlerts} />

            <MobileTopBar
                onMenuClick={() => setDrawerOpen(true)}
                unreadAlerts={unreadAlerts}
            />

            <MobileDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                unreadAlerts={unreadAlerts}
            />

            <main
                className={[
                    'min-h-screen transition-[padding] duration-300 ease-in-out',
                    'pt-14 lg:pt-0', // mobile top bar height
                    collapsed ? 'lg:pl-[72px]' : 'lg:pl-60',
                ].join(' ')}
            >
                <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
