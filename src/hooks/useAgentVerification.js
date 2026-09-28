import { useState, useEffect, useCallback, useRef } from 'react';
import { getAgentById } from '../service/agentService';
import {
    AgentStatus,
    ProvisioningStatus,
    HEARTBEAT_TIMEOUT_MS,
} from '../service/constants/agent';
import { AGENTS_UPDATE } from '../service/constants/Topics'
import { topicSocketManager } from '../service/topicSocketManger';

function toMillis(v) {
    if (v == null) return null;
    if (typeof v === 'number') return v;
    if (Array.isArray(v)) {
        const [y, mo, d, h, mi, s, n = 0] = v;
        return new Date(y, mo - 1, d, h, mi, s, Math.floor(n / 1e6)).getTime();
    }
    const t = new Date(v).getTime();
    return Number.isNaN(t) ? null : t;
}

function unwrap(res) {
    return res?.data ?? res?.content ?? res;
}

export function useAgentVerification(agentId) {
    const [state, setState] = useState({
        status: 'loading', // 'loading' | 'online' | 'offline' | 'error'
        agent: null,
        reason: null,
        error: null,
    });
    const fetchTokenRef = useRef(0);

    const verify = useCallback(async () => {
        if (!agentId) return;
        const token = ++fetchTokenRef.current;
        setState((s) => ({ ...s, status: 'loading', error: null }));

        try {
            const raw = await getAgentById(agentId);
            if (token !== fetchTokenRef.current) return;
            const data = unwrap(raw);

            if (data?.status === AgentStatus.OFFLINE) {
                return setState({ status: 'offline', agent: data, reason: 'AGENT_OFFLINE', error: null });
            }
            if (
                data?.provisioningStatus &&
                data.provisioningStatus !== ProvisioningStatus.ACTIVE
            ) {
                return setState({
                    status: 'offline',
                    agent: data,
                    reason: `PROVISIONING_${data.provisioningStatus}`,
                    error: null,
                });
            }
            const tokenMs = toMillis(data?.tokenExpiresAt);
            if (tokenMs !== null && tokenMs < Date.now()) {
                return setState({ status: 'offline', agent: data, reason: 'TOKEN_EXPIRED', error: null });
            }
            const seenMs = toMillis(data?.lastSeenAt);
            if (seenMs !== null && Date.now() - seenMs > HEARTBEAT_TIMEOUT_MS) {
                return setState({ status: 'offline', agent: data, reason: 'HEARTBEAT_STALE', error: null });
            }
            setState({ status: 'online', agent: data, reason: null, error: null });
        } catch (err) {
            if (token !== fetchTokenRef.current) return;
            setState({ status: 'error', agent: null, reason: 'FETCH_ERROR', error: err });
        }
    }, [agentId]);

    useEffect(() => {
        verify();
        const agentUpdate = topicSocketManager.subscribe(AGENTS_UPDATE, {
            message: (agent) => {
                if (agent.agentId === agentId) {
                    verify();
                }
            }
        });
        return () => agentUpdate();
    }, [verify]);

    return { ...state, refresh: verify };
}
