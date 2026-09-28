import React, { useState } from 'react';
import { X, Save, Loader2, Eye, EyeOff } from 'lucide-react';

const ROLES = ['VIEWER', 'ADMIN'];

export default function UserFormModal({ user, onClose, onSave }) {
    const isEdit = Boolean(user?.id);

    const [form, setForm] = useState({
        id: user?.id ?? undefined,
        fullName: user?.fullName ?? '',
        email: user?.email ?? '',
        password: '',
        role: user?.role ?? 'VIEWER',
        isOnline: user?.isOnline ?? false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.email?.trim()) return setError('Email is required');
        if (!isEdit && !form.password?.trim()) return setError('Password is required for new users');

        setSaving(true);
        try {
            const payload = { ...form };
            if (!payload.password) delete payload.password; // don't send empty password on edit
            await onSave(payload);
        } catch (err) {
            setError(err.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-fuchsia-600 via-blue-500 to-emerald-500" />

                <div className="p-6">
                    {/* header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-white">
                            {isEdit ? 'Edit user' : 'New user'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* error */}
                    {error && (
                        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                            {error}
                        </div>
                    )}

                    {/* form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label="Full name">
                            <input
                                type="text"
                                value={form.fullName}
                                onChange={(e) => update('fullName', e.target.value)}
                                placeholder="Jane Doe"
                                className="input"
                                autoFocus
                            />
                        </Field>

                        <Field label="Email">
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => update('email', e.target.value)}
                                placeholder="jane@example.com"
                                className="input"
                                required
                            />
                        </Field>

                        <Field label={isEdit ? 'Password (leave blank to keep current)' : 'Password'}>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => update('password', e.target.value)}
                                    placeholder={isEdit ? '••••••••' : 'Set a password'}
                                    className="input pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Role">
                                <select
                                    value={form.role}
                                    onChange={(e) => update('role', e.target.value)}
                                    className="input"
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Status">
                                <button
                                    type="button"
                                    onClick={() => update('isOnline', !form.isOnline)}
                                    className={`w-full input text-left flex items-center justify-between ${form.isOnline ? 'text-emerald-400' : 'text-slate-400'
                                        }`}
                                >
                                    {form.isOnline ? 'Online' : 'Offline'}
                                    <span
                                        className={`relative inline-flex h-4 w-7 rounded-full transition-colors ${form.isOnline ? 'bg-emerald-500' : 'bg-slate-700'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition-transform ${form.isOnline ? 'translate-x-3' : ''
                                                }`}
                                        />
                                    </span>
                                </button>
                            </Field>
                        </div>

                        {/* footer */}
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${saving
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    }`}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* tiny CSS injection for the .input class */}
                <style>{`
          .input {
            width: 100%;
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgb(51, 65, 85);
            color: rgb(226, 232, 240);
            border-radius: 0.5rem;
            padding: 0.6rem 0.75rem;
            font-size: 0.8rem;
            outline: none;
            transition: border-color 0.15s;
          }
          .input:focus { border-color: rgba(59, 130, 246, 0.5); }
          .input::placeholder { color: rgb(100, 116, 139); }
        `}</style>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                {label}
            </span>
            {children}
        </label>
    );
}
