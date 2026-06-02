import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Lock, CheckSquare, AlertTriangle } from 'lucide-react';

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get('token') ?? '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (password.length < 8) { setError('Hasło musi mieć min. 8 znaków.'); return; }
        if (password !== confirm) { setError('Hasła nie są takie same.'); return; }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, password });
            toast.success('Hasło zmienione. Zaloguj się nowym hasłem.');
            navigate('/login');
        } catch (e: any) {
            const msg = e.response?.data?.error ?? 'Nie udało się zresetować hasła.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="mx-auto max-w-md text-center py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-3">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-stone-900">Brak ważnego tokenu</h2>
                <p className="text-stone-500 text-sm mt-1 mb-4">Link resetujący wygasł lub jest nieprawidłowy.</p>
                <Link to="/forgot-password" className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors inline-block">
                    Poproś o nowy link
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-md py-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Ustaw nowe hasło</h1>
                <p className="text-stone-500 text-sm mt-1">Wprowadź i potwierdź swoje nowe dane dostępowe.</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-900/5">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nowe hasło</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                            <input 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                type="password"
                                placeholder="Minimum 8 znaków" 
                                className="w-full rounded-xl bg-stone-50 border border-stone-200 py-2.5 pl-10 pr-4 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Powtórz hasło</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                            <input 
                                value={confirm} 
                                onChange={(e) => setConfirm(e.target.value)} 
                                type="password"
                                placeholder="Wpisz hasło ponownie" 
                                className="w-full rounded-xl bg-stone-50 border border-stone-200 py-2.5 pl-10 pr-4 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 font-semibold text-white shadow-sm shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50"
                    >
                        <CheckSquare className="h-4 w-4" />
                        <span>{loading ? 'Zapisywanie…' : 'Zmień hasło'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}