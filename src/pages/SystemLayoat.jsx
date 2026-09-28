import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SystemDashboard from './SystemDashboard';
import AgentOfflinePage from './AgentOfflinePage';
import AgentLoadingPage from './AgentLoadingPage';
import AgentNavigation from '../components/AgentNavigation';
import CommandPanel from '../components/CommandPanel';
import { useAgentVerification } from '../hooks/useAgentVerification';
import { topicSocketManager } from '../service/topicSocketManger';
import { SYSTEM } from '../service/constants/Topics'
import { getLastData, getAgentById } from '../service/agentService';


export default function SystemLayoat({ agentId }) {
    const { agentId: routeAgentId } = useParams();
    const selectedAgentId = agentId || routeAgentId;

    const { status, agent, reason, refresh } = useAgentVerification(selectedAgentId);
    const [system, setSystem] = useState(null);

    useEffect(() => {
        if (!selectedAgentId || status !== 'online') return undefined;
        const sub = topicSocketManager.subscribe(`${SYSTEM}/${selectedAgentId}`, {
            message: (p) => {
                setSystem(typeof p === 'string' ? JSON.parse(p) : p)
            },
        });


        return () => {

            sub();
        }
    }, [status, selectedAgentId]);

    useEffect(() => {
        if (!selectedAgentId || status !== 'loading') return;
        getSystem();
    }, [selectedAgentId, status]);

    const getSystem = async () => {
        if (status === 'loading') {
            const agentdata = await getAgentById(selectedAgentId);
            if (agentdata.status === 'ONLINE') {
                const system = await getLastData(selectedAgentId, "system")
                let sys = JSON.parse(system)
                if (sys) {
                    setSystem(sys)
                }
            }
        }
    }

    if (!selectedAgentId) {
        return null;
    }

    const content = status === 'loading' ? (
        <AgentLoadingPage />
    ) : status === 'offline' || status === 'error' ? (
        <AgentOfflinePage
            agent={agent}
            reason={reason}
            onRetry={refresh}
            onGoHome={() => window.location.reload()}
        />
    ) : (
        <>
            <SystemDashboard system={system} />
            <div className="mx-auto max-w-[1600px] px-4 pb-6 sm:px-6">
                <CommandPanel agentId={selectedAgentId} />
            </div>
        </>
    );

    return (
        <>
            <AgentNavigation />
            {content}
        </>
    );
}
