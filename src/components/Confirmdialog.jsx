import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../pages/Modal';

export default function ConfirmDialog({
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    errorMessage = 'The action could not be completed. Try again.',
    onClose,
    onConfirm,
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        setBusy(true);
        setError(null);
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err?.message || errorMessage);
            setBusy(false);
        }
    };

    return (
        <Modal title={title} onClose={onClose}>
            <div className="flex gap-4 px-5 py-5">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded border border-red-900/60 bg-red-950/40 text-red-400">
                    <AlertTriangle size={18} />
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-slate-300">{message}</p>
                    {error && <p className="text-xs text-red-400">{error}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 px-5 py-4">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={busy}
                    className="rounded px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
                >
                    {cancelLabel}
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={busy}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                >
                    {busy ? 'Working…' : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
