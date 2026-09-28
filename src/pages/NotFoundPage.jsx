import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                <div className="text-7xl font-bold text-blue-400">404</div>
                <h1 className="mt-4 text-xl font-semibold text-white">Page not found</h1>
                <button type="button" onClick={() => navigate('/agents')} className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
                    Back to agents
                </button>
            </div>
        </div>
    );
}
