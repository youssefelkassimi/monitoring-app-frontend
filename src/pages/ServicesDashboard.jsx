import React from 'react';
import {
    ShieldCheck,
    Server,
    Globe,
    Link2,
    Radio,
    FileText,
    Radar,
} from 'lucide-react';
import ServicesCard from '../cards/ServicesCard';
import DnsChecksCard from '../cards/DnsChecksCard';
import HttpChecksCard from '../cards/HttpChecksCard';
import IcmpChecksCard from '../cards/IcmpChecksCard';
import DiscoveryCard from '../cards/DiscoveryCard';
import LogsCard from '../cards/LogsCard';

export default function ServicesDashboard({
    services,
    dns = [],
    http = [],
    icmp = [],
    discovery,
    logs = [],
}) {

    console.log(dns);
    console.log(http);
    console.log(icmp);
    console.log(discovery);
    console.log(logs);

    const summary = React.useMemo(() => {
        const monitored = services?.monitored_services ?? [];
        const servicesDown = monitored.filter(
            (s) => !['running', 'open', 'ok'].includes(s.status)
        ).length;

        const dnsFailed = dns.filter(
            (d) => d.status !== 'ok' && d.status !== 'success'
        ).length;

        const httpFailed = http.filter(
            (h) => h.status !== 'ok' && h.status !== 'success'
        ).length;

        const icmpFailed = icmp.filter(
            (c) => c.status !== 'ok' && c.status !== 'success'
        ).length;

        const logEntries = Array.isArray(logs)
            ? logs
            : logs
                ? [logs]
                : [];
        const logsChanged = logEntries.filter((l) => l.status === 'ok').length;

        const discoveryHosts = Array.isArray(discovery)
            ? discovery.length
            : discovery
                ? 1
                : 0;

        return {
            servicesDown,
            dnsFailed,
            httpFailed,
            icmpFailed,
            logsChanged,
            discoveryHosts,
        };
    }, [services, dns, http, icmp, logs, discovery]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30">
                        <ShieldCheck className="w-6 h-6 text-fuchsia-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Service Monitoring</h1>
                        <p className="text-xs text-slate-400">
                            Services, DNS, HTTP, ICMP, logs, and port discovery
                        </p>
                    </div>
                </div>
            </header>

            {/* Quick summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <SummaryTile
                    icon={Server}
                    label="Services"
                    value={summary.servicesDown > 0 ? `${summary.servicesDown} down` : 'All up'}
                    tone={summary.servicesDown > 0 ? 'danger' : 'success'}
                />
                <SummaryTile
                    icon={Globe}
                    label="DNS"
                    value={summary.dnsFailed > 0 ? `${summary.dnsFailed} failing` : 'Healthy'}
                    tone={summary.dnsFailed > 0 ? 'danger' : 'success'}
                />
                <SummaryTile
                    icon={Link2}
                    label="HTTP"
                    value={summary.httpFailed > 0 ? `${summary.httpFailed} failing` : 'Healthy'}
                    tone={summary.httpFailed > 0 ? 'danger' : 'success'}
                />
                <SummaryTile
                    icon={Radio}
                    label="ICMP"
                    value={summary.icmpFailed > 0 ? `${summary.icmpFailed} unreachable` : 'Reachable'}
                    tone={summary.icmpFailed > 0 ? 'danger' : 'success'}
                />
                <SummaryTile
                    icon={FileText}
                    label="Logs"
                    value={summary.logsChanged > 0 ? `${summary.logsChanged} changed` : 'No changes'}
                    tone={summary.logsChanged > 0 ? 'warning' : 'muted'}
                />
                <SummaryTile
                    icon={Radar}
                    label="Discovery"
                    value={summary.discoveryHosts > 0 ? `${summary.discoveryHosts} host${summary.discoveryHosts !== 1 ? 's' : ''}` : 'None'}
                    tone={summary.discoveryHosts > 0 ? 'info' : 'muted'}
                />
            </div>

            {/* Top row: services + DNS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <ServicesCard services={services} />
                <DnsChecksCard dns={dns} />
            </div>

            {/* Middle row: HTTP + ICMP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <HttpChecksCard http={http} />
                <IcmpChecksCard icmp={icmp} />
            </div>

            {/* Bottom row: logs + discovery */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <LogsCard logs={logs} />
                <DiscoveryCard discovery={discovery} />
            </div>
        </div>
    );
}

/* ---------- Summary tile ---------- */
function SummaryTile({ icon: Icon, label, value, tone = 'muted' }) {
    const tones = {
        success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        danger: 'bg-red-500/10 border-red-500/30 text-red-400',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        muted: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
    };
    const t = tones[tone];

    return (
        <div className={`rounded-lg border px-3 py-2.5 ${t}`}>
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" />
                <p className="text-[10px] uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-sm font-semibold text-white truncate">{value}</p>
        </div>
    );
}
