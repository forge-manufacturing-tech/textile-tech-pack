import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
    const [searchParams] = useSearchParams();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedViewMode, setSelectedViewMode] = useState<'designer' | 'manufacturer'>('manufacturer');
    const { login, register, token, setViewMode } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (searchParams.get('mode') === 'register') {
            setIsRegister(true);
        }
    }, [searchParams]);

    // Navigate when token changes (successful login/register)
    useEffect(() => {
        if (token) {
            navigate('/dashboard');
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            setViewMode(selectedViewMode);
            if (isRegister) {
                await register(email, password, name);
            } else {
                await login(email, password);
            }
            // Don't navigate here - the auth state change will trigger ProtectedRoute redirect
        } catch (err: any) {
            console.error('Auth error:', err);
            let errorMessage = 'Authentication failed';

            if (err.body) {
                errorMessage = err.body.error || err.body.message || JSON.stringify(err.body);
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-industrial-steel-950 flex items-center justify-center p-4 metal-texture">
            <div className="w-full max-w-md">
                <div className="industrial-panel p-8 rounded-sm shadow-2xl scanlines">
                    <div className="mb-8 text-center">
                        <h1 className="industrial-headline text-3xl mb-2">INTERLOCK</h1>
                        <p className="text-industrial-steel-400 text-sm tracking-wide font-mono">
                            {isRegister ? 'CREATE NEW ACCOUNT' : 'SYSTEM ACCESS'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-industrial-alert/10 border border-industrial-alert rounded-sm text-industrial-alert text-sm font-mono">
                            {error}
                        </div>
                    )}

                    <div className="mb-6 grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setSelectedViewMode('designer')}
                            className={`p-4 border rounded-sm flex flex-col items-center gap-2 transition-all ${
                                selectedViewMode === 'designer'
                                ? 'bg-industrial-copper-500/10 border-industrial-copper-500 text-industrial-copper-500'
                                : 'bg-industrial-steel-900/50 border-industrial-concrete text-industrial-steel-500 hover:border-industrial-steel-400'
                            }`}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Designer</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedViewMode('manufacturer')}
                            className={`p-4 border rounded-sm flex flex-col items-center gap-2 transition-all ${
                                selectedViewMode === 'manufacturer'
                                ? 'bg-industrial-copper-500/10 border-industrial-copper-500 text-industrial-copper-500'
                                : 'bg-industrial-steel-900/50 border-industrial-concrete text-industrial-steel-500 hover:border-industrial-steel-400'
                            }`}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Manufacturer</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="block text-xs font-bold text-industrial-steel-300 mb-2 uppercase tracking-wider">
                                    Operator Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 industrial-input rounded-sm"
                                    required={isRegister}
                                    placeholder="Enter name"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-industrial-steel-300 mb-2 uppercase tracking-wider">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 industrial-input rounded-sm"
                                required
                                placeholder="operator@factory.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-industrial-steel-300 mb-2 uppercase tracking-wider">
                                Access Code
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 industrial-input rounded-sm"
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 industrial-btn rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'PROCESSING...' : isRegister ? 'REGISTER' : 'LOGIN'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="text-industrial-copper-500 hover:text-industrial-copper-400 text-xs transition-colors uppercase tracking-wide font-mono"
                        >
                            {isRegister ? 'Access Existing Account' : 'Create New Account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
