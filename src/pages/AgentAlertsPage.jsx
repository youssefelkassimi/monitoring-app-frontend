import AlertsPage from './AlertsPage';
import AgentNavigation from '../components/AgentNavigation';
import { useParams } from 'react-router-dom';

export default function AgentAlertsPage() {
    const { agentId } = useParams();
    return (
        <>
            <AgentNavigation />
            <AlertsPage agentId={agentId} />
        </>
    );
}
