import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, subtitle, onClose, children }) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
                    <div>
                        <h2 className="text-sm font-bold tracking-wide text-slate-200">{title}</h2>
                        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
