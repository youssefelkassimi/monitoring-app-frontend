import React, { useState } from 'react';
import {
    X,
    Loader2,
    Bot,
    KeyRound,
    Copy,
    Check,
    AlertTriangle,
} from 'lucide-react';
import { provisionAgent } from '../service/agentService';

const VALIDITY_PRESETS = [
    { label: '1 hour', value: 60 },
    { label: '24 hours', value: 1440 },
    { label: '7 days', value: 10080 },
    { label: '30 days', value: 43200 },
];

export default function ProvisionAgentModal({ onClose, onProvisioned }) {
    const [label, setLabel] = useState('');
    const [validityMinutes, setValidityMinutes] = useState(1440);
    const [customValidity, setCustomValidity] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [created, setCreated] = useState(null); // response after success
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!label.trim()) return setError('Label is required');
        if (!validityMinutes || validityMinutes <= 0) {
            return setError('Validity must be a positive number of minutes');
        }

        setSaving(true);
        try {
            const res = await provisionAgent({
                label: label.trim(),
                validityMinutes: Number(validityMinutes),
            });
            setCreated(res);
            // onProvisioned?.(res); // bubble up so parent can add to list
        } catch (err) {
            setError(err.message || 'Provisioning failed');
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(created.token);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />

                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                <Bot className="w-4 h-4 text-blue-400" />
                            </div>
                            <h2 className="text-lg font-bold text-white">
                                {created ? 'Agent provisioned' : 'Provision new agent'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* ---------- SUCCESS VIEW ---------- */}
                    {created ? (
                        <>
                            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 mb-4">
                                <p className="text-xs text-emerald-300">
                                    Store this token securely. It will not be shown again.
                                </p>
                            </div>

                            <div className="space-y-3 mb-5">
                                <Field label="Agent ID">
                                    <div className="flex items-center gap-2">
                                        <input
                                            readOnly
                                            value={created.id ?? created.agentId ?? ''}
                                            className="input font-mono text-[11px]"
                                        />
                                    </div>
                                </Field>

                                <Field label="Label">
                                    <input readOnly value={created.label ?? ''} className="input" />
                                </Field>

                                <Field label="Token">
                                    <div className="relative">
                                        <textarea
                                            readOnly
                                            value={created.token ?? ''}
                                            rows={3}
                                            className="input font-mono text-[11px] resize-none pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCopy}
                                            className="absolute top-2 right-2 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                            title="Copy token"
                                        >
                                            {copied ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </Field>

                                <Field label="Expires at">
                                    <input
                                        readOnly
                                        value={
                                            created.tokenExpiresAt
                                                ? new Date(created.tokenExpiresAt).toLocaleString()
                                                : '—'
                                        }
                                        className="input"
                                    />
                                </Field>
                            </div>

                            <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-2.5 mb-4">
                                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-amber-300 leading-relaxed">
                                    Copy the token now and paste it into the agent's configuration.
                                    You won't be able to see it again after closing this dialog.
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-colors"
                            >
                                Done
                            </button>
                        </>
                    ) : (
                        /* ---------- FORM VIEW ---------- */
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                                    {error}
                                </div>
                            )}

                            <Field label="Agent label">
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="e.g. web-prod-01"
                                    className="input"
                                    autoFocus
                                />
                            </Field>

                            <Field label="Token validity">
                                {!customValidity ? (
                                    <div className="grid grid-cols-4 gap-2">
                                        {VALIDITY_PRESETS.map((p) => (
                                            <button
                                                type="button"
                                                key={p.value}
                                                onClick={() => setValidityMinutes(p.value)}
                                                className={`text-[11px] py-2 rounded-md border transition-colors ${validityMinutes === p.value
                                                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                                                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                                                    }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setCustomValidity(true)}
                                            className="col-span-4 text-[11px] py-1.5 text-slate-500 hover:text-slate-300"
                                        >
                                            Custom…
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min={1}
                                            value={validityMinutes}
                                            onChange={(e) => setValidityMinutes(e.target.value)}
                                            className="input flex-1"
                                        />
                                        <span className="text-xs text-slate-500">minutes</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCustomValidity(false);
                                                setValidityMinutes(1440);
                                            }}
                                            className="text-[11px] text-slate-500 hover:text-slate-300"
                                        >
                                            Presets
                                        </button>
                                    </div>
                                )}
                            </Field>

                            <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 border border-slate-700/50 p-2.5">
                                <KeyRound className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    A token will be generated. Use it to authenticate the agent
                                    on first run.
                                </p>
                            </div>

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
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Provisioning…' : 'Provision'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

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
