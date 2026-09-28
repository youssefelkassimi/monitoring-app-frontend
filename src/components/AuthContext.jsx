import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    getCurrentUser,
    getToken,
    isTokenExpired,
    login,
    logout,
} from '../service/authService';

const AuthContext = createContext(null);

const EXPIRY_CHECK_INTERVAL_MS = 30_000;

/**
 * Provides login state and role permissions to the application.
 * @param {{ children: import('react').ReactNode }} props
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = getToken();
        return token && !isTokenExpired(token) ? getCurrentUser() : null;
    });

    const signIn = useCallback(async (credentials) => {
        const nextUser = await login(credentials);
        setUser(nextUser);
        return nextUser;
    }, []);

    const signOut = useCallback(async () => {
        try {
            await logout();
        } finally {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        const id = setInterval(() => {
            const token = getToken();
            if (!token || isTokenExpired(token)) {
                if (user) signOut();
            }
        }, EXPIRY_CHECK_INTERVAL_MS);
        return () => clearInterval(id);
    }, [user, signOut]);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key !== 'monitor.jwt' && e.key !== 'monitor.user') return;
            const token = getToken();
            if (token && !isTokenExpired(token)) {
                setUser(getCurrentUser());
            } else {
                setUser(null);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            isAdmin: user?.role === 'ADMIN',
            signIn,
            signOut,
        }),
        [user, signIn, signOut]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
