import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import AgentsPage from './pages/AgentsPage';
import SystemLayout from './pages/SystemLayoat';
import AppServicePage from './pages/AppServicePage';
import AgentAlertsPage from './pages/AgentAlertsPage';
import UsersPage from './pages/UsersPage';
import AlertsPage from './pages/AlertsPage';
import TriggersPage from './pages/TriggersPage';
import NotFoundPage from './pages/NotFoundPage';
import ServicesPlayground from './pages/ServicesPlayground';

const IS_DEV = import.meta.env?.DEV === true;

export default function AppRouter() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated, shared shell */}
            <Route element={<Layout />}>
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Navigate to="/agents" replace />} />
                    <Route path="/agents" element={<AgentsPage />} />
                    <Route path="/agents/:agentId" element={<SystemLayout />} />
                    <Route path="/agents/:agentId/services" element={<AppServicePage />} />
                    <Route path="/agents/:agentId/alerts" element={<AgentAlertsPage />} />
                    <Route path="/alerts" element={<AlertsPage />} />
                    <Route path="/triggers" element={<TriggersPage />} />
                    {IS_DEV && (
                        <Route path="/playground/services" element={<ServicesPlayground />} />
                    )}
                </Route>

                {/* Admin only */}
                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                    <Route path="/users" element={<UsersPage />} />
                </Route>

                {/* 404 inside the shell so nav stays visible */}
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
