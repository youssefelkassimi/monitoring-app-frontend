import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AlertsBadgeContext = createContext(null);
const STORAGE_KEY = 'alerts:unread';

export function AlertsBadgeProvider({ children }) {
    const [unread, setUnreadState] = useState(() => {
        if (typeof window === 'undefined') return 0;
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        const n = raw ? Number(raw) : 0;
        return Number.isFinite(n) ? n : 0;
    });

    useEffect(() => {
        try {
            window.sessionStorage.setItem(STORAGE_KEY, String(unread));
        } catch {
            /* ignore */
        }
    }, [unread]);

    const setUnread = useCallback((value) => {
        setUnreadState((prev) =>
            typeof value === 'function' ? value(prev) : value
        );
    }, []);

    const increment = useCallback(() => setUnreadState((c) => c + 1), []);
    const reset = useCallback(() => setUnreadState(0), []);

    const value = useMemo(
        () => ({ unread, increment, reset, setUnread }),
        [unread, increment, reset, setUnread]
    );

    return (
        <AlertsBadgeContext.Provider value={value}>
            {children}
        </AlertsBadgeContext.Provider>
    );
}

/** Reads the shared unread alert badge state. */
export function useAlertsBadge() {
    const ctx = useContext(AlertsBadgeContext);
    if (!ctx) throw new Error('useAlertsBadge must be used within AlertsBadgeProvider');
    return ctx;
}
