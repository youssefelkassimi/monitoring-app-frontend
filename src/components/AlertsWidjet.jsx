import React, { useEffect, useState } from 'react';
import { BellRing, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { topicSocketManager } from '../service/topicSocketManger';
import { SEVERITY_STYLES, STATUS_STYLES } from '../service/constants/alert';
import { ALERTS } from '../service/constants/Topics';

export default function AlertsWidget() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const teardown = topicSocketManager.subscribe(ALERTS, {
            message: (a) => {
                if (!a?.id) return;
                setAlerts((prev) => [a, ...prev].slice(0, 5));
            },
        });
        return () => teardown();
    }, []);

    const problemCount = alerts.filter((a) => a.status === 'PROBLEM').length;

    return (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-red-400" />
                    <h3 className="text-sm font-semibold text-white">Recent alerts</h3>
                </div>
                {problemCount > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
                        {problemCount} active
                    </span>
                )}
            </div>

            {alerts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                    Listening for alerts…
                </p>
            ) : (
                <ul className="space-y-2">
                    {alerts.map((a) => {
                        const sev = SEVERITY_STYLES[a.severity] ?? SEVERITY_STYLES.info;
                        const stat = STATUS_STYLES[a.status] ?? STATUS_STYLES.PROBLEM;
                        return (
                            <li
                                key={a.id}
                                className="flex items-start gap-2 py-1.5 border-b border-slate-800/60 last:border-b-0"
                            >
                                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-slate-200 truncate">
                                        {a.message}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                                        <span className={stat.text}>{stat.label}</span>
                                        <span>·</span>
                                        <span className="truncate">{a.triggerName}</span>
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <Link
                to="/alerts"
                className="mt-3 flex items-center justify-center gap-1 text-[11px] text-blue-400 hover:text-blue-300"
            >
                View all alerts
                <ChevronRight className="w-3 h-3" />
            </Link>
        </div>
    );
}
