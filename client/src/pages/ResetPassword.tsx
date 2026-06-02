import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

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
            alert('Hasło zmienione. Zaloguj się nowym hasłem.');
            navigate('/login');
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'Nie udało się zresetować hasła.');
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="mx-auto max-w-sm">
                <p className="text-red-600">Brak tokenu resetu.</p>
                <Link to="/forgot-password" className="text-blue-600 hover:underline">Poproś o nowy link</Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-sm">
            <h1 className="mb-4 text-2xl font-bold">Ustaw nowe hasło</h1>
            <form onSubmit={submit} className="space-y-3">
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
                    placeholder="Nowe hasło (min. 8 znaków)" className="w-full rounded border px-3 py-2" />
                <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password"
                    placeholder="Powtórz hasło" className="w-full rounded border px-3 py-2" />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading}
                    className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Zapisywanie…' : 'Zmień hasło'}
                </button>
            </form>
        </div>
    );
}