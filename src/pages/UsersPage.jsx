import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    RefreshCw,
    Wifi,
    WifiOff,
    LogOut,
    Pencil,
    Trash2,
    Mail,
    ShieldCheck,
    UserCheck,
    UserX,
    X,
    Check,
} from 'lucide-react';

import {
    getAllUsers,
    getUsersByRole,
    getOnlineUsers,
    getOfflineUsers,
    getUserCounts,
    createUser,
    updateUser,
    setUserOnlineStatus,
    deleteUser,
    logoutUser,
} from '../service/userService';
import { getCurrentUser } from '../service/authService'
import { ROLE_STYLES } from '../service/constants/user';
import { USERS } from '../service/constants/Topics';
import { topicSocketManager } from '../service/topicSocketManger';
import UserFormModal from '../components/UserFormModal';
import ConfirmDialog from '../components/Confirmdialog';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [counts, setCounts] = useState({ total: 0, online: 0, offline: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filter, setFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('');
    const [search, setSearch] = useState('');

    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);

    // ---------- data loaders ----------
    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (roleFilter) data = await getUsersByRole(roleFilter);
            else if (filter === 'online') data = await getOnlineUsers();
            else if (filter === 'offline') data = await getOfflineUsers();
            else data = await getAllUsers();
            const currentUser = getCurrentUser();
            let usersData = data.filter(u => u?.email !== currentUser?.username);
            setUsers(usersData);
        } catch (e) {
            setError(e.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [filter, roleFilter]);

    const loadCounts = useCallback(async () => {
        try {
            const c = await getUserCounts();
            setCounts(c ?? { total: 0, online: 0, offline: 0 });
        } catch {
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        loadCounts();
    }, [loadCounts]);

    // ---------- WebSocket live sync ----------
    useEffect(() => {

        const currentUser = getCurrentUser();
        const teardown = topicSocketManager.subscribe(USERS, {
            message: (updatedUser) => {
                if (!updatedUser?.id) return;
                if (updatedUser?.email === currentUser?.username) return;

                if (updatedUser.deleted) {
                    setUsers((prev) => prev.filter((u) => u.id === updatedUser.id));
                    loadCounts();
                    return;
                }

                setUsers((prev) => {
                    const exists = prev.some((u) => u.id === updatedUser.id);
                    if (!exists) return [updatedUser, ...prev];
                    return prev.map((u) =>
                        u.id === updatedUser.id ? { ...u, ...updatedUser } : u
                    );
                });
                loadCounts();
            },
        });
        return () => teardown();
    }, [loadCounts]);

    // ---------- derived ----------
    const filtered = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter(
            (u) =>
                u.fullName?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.id?.toLowerCase().includes(q)
        );
    }, [users, search]);

    // ---------- actions ----------
    const handleSave = async (payload) => {
        if (payload.id) {
            const updated = await updateUser(payload);
            // WS will patch, but optimistic update in case topic is slow
            setUsers((prev) =>
                prev.map((u) => (u.id === updated?.id ? { ...u, ...updated } : u))
            );
        } else {
            const created = await createUser(payload);
            if (created?.id) {
                setUsers((prev) =>
                    prev.some((u) => u.id === created.id)
                        ? prev
                        : [created, ...prev]
                );
            }
        }
        loadCounts();
        setEditingUser(null);
    };

    const handleDelete = async (id) => {
        await deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
        loadCounts();
        setDeletingUser(null);
    };

    const handleToggleOnline = async (user) => {
        const next = !user.isOnline;
        // optimistic
        setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, isOnline: next } : u))
        );
        try {
            await setUserOnlineStatus(user.id, next);
            loadCounts();
        } catch {
            // rollback
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === user.id ? { ...u, isOnline: user.isOnline } : u
                )
            );
        }
    };

    const handleLogout = async (user) => {
        await logoutUser(user.id);
        setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, isOnline: false } : u))
        );
        loadCounts();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30">
                        <Users className="w-6 h-6 text-fuchsia-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Users</h1>
                        <p className="text-xs text-slate-400">
                            Manage accounts, roles, and online status
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadUsers}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setEditingUser({})}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-colors"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        New user
                    </button>
                </div>
            </header>

            {/* Stat tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatTile
                    icon={Users}
                    label="Total users"
                    value={counts.total}
                    color="fuchsia"
                />
                <StatTile
                    icon={Wifi}
                    label="Online"
                    value={counts.online}
                    color="emerald"
                />
                <StatTile
                    icon={WifiOff}
                    label="Offline"
                    value={counts.offline}
                    color="slate"
                />
            </div>

            {/* Filters */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 mb-4 flex flex-wrap items-center gap-3">
                {/* search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or ID…"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800/60 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                </div>

                {/* status segmented */}
                <div className="flex items-center gap-1 p-1 rounded-md bg-slate-800/60 border border-slate-700">
                    {[
                        { key: 'all', label: 'All', icon: Filter },
                        { key: 'online', label: 'Online', icon: Wifi },
                        { key: 'offline', label: 'Offline', icon: WifiOff },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-colors ${filter === key
                                ? 'bg-slate-700 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <Icon className="w-3 h-3" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* role select */}
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="text-xs bg-slate-800/60 border border-slate-700 rounded-md text-slate-200 px-2.5 py-2 focus:outline-none focus:border-blue-500/50"
                >
                    <option value="">All roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User</option>
                </select>

                {/* count */}
                <span className="ml-auto text-[11px] text-slate-500">
                    {filtered.length} of {users.length} shown
                </span>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                {error && (
                    <div className="p-4 text-sm text-red-300 bg-red-500/5 border-b border-red-500/20">
                        {error}
                    </div>
                )}

                {loading && users.length === 0 ? (
                    <LoadingSkeleton />
                ) : filtered.length === 0 ? (
                    <EmptyState onCreate={() => setEditingUser({})} hasUsers={users.length > 0} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-800/50 sticky top-0">
                                <tr className="text-slate-400 uppercase text-[10px] tracking-wider">
                                    <th className="text-left px-4 py-3">User</th>
                                    <th className="text-left px-4 py-3">Role</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-right px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user) => (
                                    < UserRow
                                        key={user.id}
                                        user={user}
                                        onEdit={() => setEditingUser(user)}
                                        onDelete={() => setDeletingUser(user)}
                                        onToggleOnline={() => handleToggleOnline(user)}
                                        onLogout={() => handleLogout(user)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            {editingUser !== null && (
                <UserFormModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleSave}
                />
            )}

            {deletingUser && (
                <ConfirmDialog
                    title="Delete user?"
                    message={`This will permanently remove ${deletingUser.fullName || deletingUser.email}. This action cannot be undone.`}
                    confirmLabel="Delete"
                    tone="danger"
                    onCancel={() => setDeletingUser(null)}
                    onConfirm={() => handleDelete(deletingUser.id)}
                />
            )}
        </div>
    );
}

/* ---------- row ---------- */
function UserRow({ user, onEdit, onDelete, onToggleOnline, onLogout }) {
    const initials = (user.fullName || user.email || '?')
        .split(' ')
        .map((s) => s[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const roleStyle =
        ROLE_STYLES[user.role] ?? 'bg-slate-500/10 text-slate-300 border-slate-500/30';

    return (
        <tr className="border-t border-slate-800/60 hover:bg-slate-800/30 transition-colors">
            {/* user */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 flex-shrink-0">
                        {initials || '?'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm text-slate-100 font-medium truncate">
                            {user.fullName || '—'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email || '—'}
                        </p>
                    </div>
                </div>
            </td>

            {/* role */}
            <td className="px-4 py-3">
                <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${roleStyle}`}
                >
                    <ShieldCheck className="w-3 h-3" />
                    {user.role || '—'}
                </span>
            </td>

            {/* online */}
            <td className="px-4 py-3">
                <button
                    onClick={onToggleOnline}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors ${user.isOnline
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/30 hover:bg-slate-500/20'
                        }`}
                    title="Click to toggle online status"
                >
                    {user.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {user.isOnline ? 'Online' : 'Offline'}
                </button>
            </td>

            {/* actions */}
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                    {(user.isOnline && user.role !== 'ADMIN') && (
                        <IconBtn
                            icon={LogOut}
                            label="Force logout"
                            tone="amber"
                            onClick={onLogout}
                        />
                    )}
                    {user.role !== 'ADMIN' && (
                        <>
                            <IconBtn icon={Pencil} label="Edit" tone="blue" onClick={onEdit} />
                            <IconBtn icon={Trash2} label="Delete" tone="red" onClick={onDelete} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}

function IconBtn({ icon: Icon, label, tone, onClick }) {
    const tones = {
        blue: 'text-blue-400 hover:bg-blue-500/10',
        red: 'text-red-400 hover:bg-red-500/10',
        amber: 'text-amber-400 hover:bg-amber-500/10',
    };
    return (
        <button
            onClick={onClick}
            title={label}
            aria-label={label}
            className={`p-2 rounded-md transition-colors ${tones[tone]}`}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    );
}

/* ---------- stat tile ---------- */
function StatTile({ icon: Icon, label, value, color }) {
    const tones = {
        fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        slate: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
    };
    return (
        <div className={`rounded-xl border p-4 ${tones[color]}`}>
            <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase tracking-wider">{label}</p>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        </div>
    );
}

/* ---------- states ---------- */
function LoadingSkeleton() {
    return (
        <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-slate-800" />
                    <div className="flex-1">
                        <div className="h-3 w-1/3 bg-slate-800 rounded mb-1.5" />
                        <div className="h-2.5 w-1/2 bg-slate-800/60 rounded" />
                    </div>
                    <div className="h-6 w-20 bg-slate-800 rounded-full" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ onCreate, hasUsers }) {
    return (
        <div className="flex flex-col items-center justify-center py-14 text-slate-500">
            <Users className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium text-slate-400">
                {hasUsers ? 'No users match your filters' : 'No users yet'}
            </p>
            <p className="text-xs mt-1">
                {hasUsers ? 'Try clearing the search or filters.' : 'Create your first user to get started.'}
            </p>
            {!hasUsers && (
                <button
                    onClick={onCreate}
                    className="mt-4 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                    <UserPlus className="w-3.5 h-3.5" />
                    Create user
                </button>
            )}
        </div>
    );
}
