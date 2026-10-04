import { useState, useEffect, useCallback, useRef } from 'react';
import { getAlertsPage, getAgentAlertsPage } from '../service/agentService';
import { topicSocketManager } from '../service/topicSocketManger';
import { ALERTS } from '../service/constants/Topics'

const MAX_BUFFERED = 500;

export function useAlerts({ pageSize = 50 } = {}, agentId = '') {
    const [alerts, setAlerts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newIds, setNewIds] = useState(new Set());
    const seenIdsRef = useRef(new Set());

    const loadPage = useCallback(
        async (pageNumber = 0) => {
            setLoading(true);
            setError(null);
            try {
                const res = agentId ? await getAgentAlertsPage(agentId, {
                    page: pageNumber,
                    size: pageSize,
                    sort: 'timestamp,desc',
                }) : await getAlertsPage({
                    page: pageNumber,
                    size: pageSize,
                    sort: 'timestamp,desc',
                })

                const content = res?.content ?? [];
                setAlerts(content);
                setPage(res?.number ?? pageNumber);
                setTotalPages(res?.totalPages ?? 1);
                setTotalElements(res?.totalElements ?? content.length);
                content.forEach((a) => seenIdsRef.current.add(a.id));
            } catch (e) {
                setError(e.message || 'Failed to load alerts');
            } finally {
                setLoading(false);
            }
        },
        [pageSize]
    );

    useEffect(() => {
        loadPage(0);
    }, [loadPage]);

    // Live WebSocket stream
    useEffect(() => {
        let topic = agentId ? `${ALERTS}/${agentId}` : ALERTS
        const teardown = topicSocketManager.subscribe(topic, {
            message: (incoming) => {
                if (!incoming?.id) return;
                // de-dupe
                if (seenIdsRef.current.has(incoming.id)) return;
                seenIdsRef.current.add(incoming.id);

                setAlerts((prev) => {
                    const next = [incoming, ...prev];
                    return next.slice(0, MAX_BUFFERED);
                });
                setNewIds((prev) => {
                    const next = new Set(prev);
                    next.add(incoming.id);
                    return next;
                });
                // clear the "new" flag after a few seconds
                setTimeout(() => {
                    setNewIds((prev) => {
                        if (!prev.has(incoming.id)) return prev;
                        const next = new Set(prev);
                        next.delete(incoming.id);
                        return next;
                    });
                }, 6000);
            },
        });
        return () => teardown();
    }, []);

    return {
        alerts,
        page,
        totalPages,
        totalElements,
        loading,
        error,
        newIds,
        goToPage: loadPage,
        reload: () => loadPage(0),
    };
}
