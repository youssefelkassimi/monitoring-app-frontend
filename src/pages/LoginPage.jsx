import { useState } from 'react';
import {
    Bot,
    Loader2,
    LockKeyhole,
    User,
    Eye,
    EyeOff,
} from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export default function LoginPage() {
    const { isAuthenticated, signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (isAuthenticated) {
        return <Navigate to={location.state?.from || '/agents'} replace />;
    }

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await signIn(credentials);
            navigate(location.state?.from || '/agents', { replace: true });
        } catch (err) {
            setError(err.message || 'Unable to sign in');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
            <form
                onSubmit={submit}
                className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
            >
                {/* Brand */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-blue-400">
                        <Bot className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-white">Monitor</h1>
                        <p className="text-sm text-slate-400">Sign in to continue</p>
                    </div>
                </div>

                {/* Username */}
                <label className="mb-4 block text-sm text-slate-300">
                    Username
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-blue-500/60">
                        <User className="h-4 w-4 text-slate-500" />
                        <input
                            required
                            value={credentials.username}
                            onChange={(e) =>
                                setCredentials({ ...credentials, username: e.target.value })
                            }
                            className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder-slate-600"
                            autoComplete="username"
                            placeholder="your-username"
                        />
                    </div>
                </label>

                {/* Password */}
                <label className="mb-4 block text-sm text-slate-300">
                    Password
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 focus-within:border-blue-500/60">
                        <LockKeyhole className="h-4 w-4 text-slate-500" />
                        <input
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={credentials.password}
                            onChange={(e) =>
                                setCredentials({ ...credentials, password: e.target.value })
                            }
                            className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder-slate-600"
                            autoComplete="current-password"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="p-1 text-slate-500 hover:text-slate-300"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </label>

                {/* Error */}
                {error && (
                    <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                        {error}
                    </p>
                )}

                {/* Submit */}
                <button
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
                >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </main>
    );
}
