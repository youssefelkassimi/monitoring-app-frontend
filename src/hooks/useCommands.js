import { useState, useEffect, useCallback, useRef } from 'react';
import { executeCommand, getAgentCommands } from '../service/agentService';
import { topicSocketManager } from '../service/topicSocketManger';
import { COMMAND_RESULT } from '../service/constants/Topics'
const MAX_HISTORY = 100;

export function useAgentCommands(agentId) {
    const [commands, setCommands] = useState([]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const seenIdsRef = useRef(new Set());

    const send = useCallback(
        async ({ command, args = [], timeout = 30 }) => {
            if (!agentId) throw new Error('Missing agentId');
            setError(null);
            setSending(true);
            try {
                const created = await executeCommand(agentId, {
                    command,
                    userId: "a1b2c3d4-1111-4aaa-8bbb-000000000001",
                    args: args,
                    timeout,
                });
                if (created?.id) {
                    seenIdsRef.current.add(created.id);
                    setCommands((prev) => [created, ...prev].slice(0, MAX_HISTORY));
                }
                return created;
            } catch (e) {
                setError(e.message || 'Failed to send command');
                throw e;
            } finally {
                setSending(false);
            }
        },
        [agentId]
    );

    // ---- load history (optional) ----
    const loadHistory = useCallback(async () => {
        if (!agentId) return;
        try {
            const res = await getAgentCommands(agentId, { page: 0, size: 50, sort: 'createdAt,desc' });
            const content = Array.isArray(res) ? res : res?.content ?? [];
            content.forEach((c) => seenIdsRef.current.add(c.id));
            setCommands(content);
        } catch (e) {
            /* endpoint optional */
        }
    }, [agentId]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // ---- live results ----
    useEffect(() => {
        const teardown = topicSocketManager.subscribe(`${COMMAND_RESULT}/${agentId}`, {
            message: (update) => {
                if (!update?.id) return;

                setCommands((prev) => {
                    const idx = prev.findIndex((c) => c.id === update.id);
                    if (idx === -1) {
                        if (update.agent?.agentId && update.agent.agentId !== agentId) {
                            return prev;
                        }
                        seenIdsRef.current.add(update.id);
                        return [update, ...prev].slice(0, MAX_HISTORY);
                    }
                    // merge only defined fields
                    const merged = { ...prev[idx], ...stripUndefined(update) };
                    const next = [...prev];
                    next[idx] = merged;
                    return next;
                });
            },
        });
        return () => teardown();
    }, [agentId]);

    return { commands, send, sending, error, reload: loadHistory };
}

function stripUndefined(obj) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) out[k] = v;
    }
    return out;
}
