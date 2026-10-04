import { useState, useEffect, useCallback } from 'react';
import { topicSocketManager } from '../service/topicSocketManger';
import { getData, getLastData } from '../service/agentService';
import { SERVICE, LOGS, INVENTORY, DISCOVERY, METRICS } from '../service/constants/Topics'

const TOPICS = {
    services: SERVICE,
    logs: LOGS,
    inventory: INVENTORY,
    discovery: DISCOVERY,
    metrics: METRICS,
};

function parsePayload(frame) {
    if (!frame) return null;
    if (typeof frame.payloadJson === 'string') {
        try {
            return JSON.parse(frame.payloadJson);
        } catch {
            return null;
        }
    }
    return frame;
}

export function useAgentServices(agentId) {
    const [state, setState] = useState({
        services: null,
        dns: [],
        http: [],
        icmp: [],
        discovery: null,
        inventory: null,
        logs: [],
        lastUpdated: null,
    });

    const applyFrame = useCallback((topic, frame) => {
        const data = parsePayload(frame);
        if (!data) return;

        setState((prev) => {
            const next = { ...prev, lastUpdated: new Date() };
            switch (topic) {
                case 'services':
                    next.services = data.services;
                    break;
                case 'metrics':
                    if (typeof data.checks === 'string') {
                        try {
                            const checks = JSON.parse(data.checks);

                            next.services = checks.services
                            next.dns = checks.dns ?? prev.dns;
                            next.http = checks.http ?? prev.http;
                            next.icmp = checks.icmp ?? prev.icmp;
                        } catch { }
                    }
                    break;
                case 'discovery':
                    next.discovery = data;
                    break;
                case 'inventory':
                    next.inventory = data;
                    break;
                case 'logs':
                    next.logs = data;
                    break;
                default:
                    break;
            }
            return next;
        });
    }, []);

    useEffect(() => {
        if (!agentId) return;
        const subs = Object.entries(TOPICS).map(([key, topic]) =>
            topicSocketManager.subscribe(`${topic}/${agentId}`, {
                message: (frame) => applyFrame(key, frame),
            })
        );
        return () => subs.forEach((s) => s());
    }, [agentId, applyFrame]);

    //  preload the last record for each endpoint
    const preload = useCallback(async () => {
        if (!agentId) return;
        try {
            const [svc, disc, inv] = await Promise.all([
                getLastData(agentId, 'service').catch(() => null),
                getLastData(agentId, 'discovery').catch(() => null),
                getLastData(agentId, 'inventory').catch(() => null),
            ]);

            setState((prev) => ({
                ...prev,
                services: JSON.parse(svc)?.services ?? prev.services,
                discovery: parsePayload(disc) ?? prev.discovery,
                inventory: parsePayload(inv) ?? prev.inventory,
            }));
        } catch (err) {
            console.warn('Preload failed', err);
        }
    }, [agentId]);

    return { ...state, preload };
}
