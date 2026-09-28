import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ roles }) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (roles?.length && !roles.includes(user?.role)) {
        return <Navigate to="/agents" replace />;
    }

    return <Outlet />;
}
