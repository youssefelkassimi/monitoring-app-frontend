import React, { useState } from 'react';
import { X, Loader2, Pencil } from 'lucide-react';
import { renameAgent } from '../service/agentService';

export default function RenameAgentModal({ agent, onClose, onRenamed }) {
    const [label, setLabel] = useState(agent.label ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!label.trim()) return setError('Label cannot be empty');

        setSaving(true);
        try {
            const updated = await renameAgent(agent.agentId, label.trim());
            onRenamed?.(updated ?? { ...agent, label: label.trim() });
        } catch (err) {
            setError(err.message || 'Rename failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />

                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                <Pencil className="w-4 h-4 text-blue-400" />
                            </div>
                            <h2 className="text-base font-bold text-white">Rename agent</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block">
                            <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                                New label
                            </span>
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                autoFocus
                                className="w-full bg-slate-800/60 border border-slate-700 text-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </label>

                        <p className="text-[11px] text-slate-500">
                            Only the label can be changed. Agent ID and configuration are fixed.
                        </p>

                        <div className="flex gap-2 pt-1">
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
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
