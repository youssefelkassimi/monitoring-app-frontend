import React from 'react';
import { UserCircle } from 'lucide-react';

// --- Sub-component for the small stat cards ---
const StatCard = ({ label, value, dotColor }) => {
    return (
        <div className="bg-[#1c2128] border border-gray-800 rounded-md px-4 py-2 flex items-center justify-between min-w-[120px] gap-4">
            <div className="flex items-center gap-2">
                {dotColor && (
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: dotColor }}
                    />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {label}
                </span>
            </div>
            <span className="text-xl font-semibold text-white leading-none">
                {value}
            </span>
        </div>
    );
};

// --- Main Component ---
const UserManagementBanner = ({ data }) => {
    // Default fallback data in case backend data isn't passed yet
    const stats = data || {
        version: 'v1.14',
        totalUsers: 7,
        admins: 3,
        viewers: 4,
        activeSessions: 5,
    };

    return (
        <div className="w-full bg-[#11141b] border border-gray-800 rounded-xl p-5 md:px-6 md:py-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 shadow-lg">

            {/* Left Side: Title and Description */}
            <div className="flex flex-col gap-1.5 max-w-2xl">
                <div className="flex items-center gap-3 flex-wrap">
                    <UserCircle className="text-indigo-400 w-6 h-6" strokeWidth={2} />
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        User Management & Access Control
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-900/50 bg-emerald-950/30 px-2 py-0.5 rounded">
                        RBAC Policy {stats.version}
                    </span>
                </div>
                <p className="text-sm text-gray-400 leading-snug">
                    Manage RBAC permissions for console users (Admin full access vs Viewer telemetry observer).
                </p>
            </div>

            {/* Right Side: Stats Grid */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <StatCard
                    label="Total Users"
                    value={stats.totalUsers}
                />
                <StatCard
                    label="Admins"
                    value={stats.admins}
                    dotColor="#818cf8" // Indigo
                />
                <StatCard
                    label="Viewers"
                    value={stats.viewers}
                    dotColor="#94a3b8" // Slate/Gray
                />
                <StatCard
                    label="Active Sessions"
                    value={stats.activeSessions}
                    dotColor="#34d399" // Emerald/Green
                />
            </div>

        </div>
    );
};

export default UserManagementBanner;
