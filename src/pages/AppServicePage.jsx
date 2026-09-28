import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import ServicesDashboard from './ServicesDashboard';
import AgentNavigation from '../components/AgentNavigation';
import AgentLoadingPage from './AgentLoadingPage';
import AgentOfflinePage from './AgentOfflinePage';

import { useAgentServices } from '../hooks/useAgentServices';
import { useAgentVerification } from '../hooks/useAgentVerification';

export default function AppServicesPage({ agentId }) {
    const { agentId: routeAgentId } = useParams();
    const selectedAgentId = agentId ?? routeAgentId;

    const { status, agent, reason, refresh } = useAgentVerification(selectedAgentId);
    const { services, dns, http, icmp, discovery, logs, preload } =
        useAgentServices(selectedAgentId);

    useEffect(() => {
        if (!selectedAgentId) return;
        preload();
    }, [preload, selectedAgentId]);

    if (!selectedAgentId) return null;

    return (
        <>
            <AgentNavigation />

            {status === 'loading' && <AgentLoadingPage />}

            {(status === 'offline' || status === 'error') && (
                <AgentOfflinePage
                    agent={agent}
                    reason={reason}
                    onRetry={refresh}
                    onGoHome={() => window.location.reload()}
                />
            )}

            {status === 'online' && (
                <ServicesDashboard
                    services={services}
                    dns={dns}
                    http={http}
                    icmp={icmp}
                    discovery={discovery}
                    logs={logs}
                />
            )}
        </>
    );
}
