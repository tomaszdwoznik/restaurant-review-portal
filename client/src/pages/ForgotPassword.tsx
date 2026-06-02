import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [devToken, setDevToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setDevToken(null);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            if (res.data.devToken) setDevToken(res.data.devToken);
        } catch {
            setMessage('Wystąpił błąd. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-sm">
            <h1 className="mb-4 text-2xl font-bold">Przypomnienie hasła</h1>
            <form onSubmit={submit} className="space-y-3">
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                    placeholder="Twój e-mail" className="w-full rounded border px-3 py-2" />
                <button type="submit" disabled={loading}
                    className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Wysyłanie…' : 'Wyślij link resetujący'}
                </button>
            </form>

            {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}

            {devToken && (
                <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
                    <p className="font-medium">Tryb deweloperski (brak wysyłki maila):</p>
                    <Link to={`/reset-password?token=${devToken}`}
                        className="break-all text-blue-600 hover:underline">
                        Kliknij, aby ustawić nowe hasło
                    </Link>
                </div>
            )}

            <p className="mt-3 text-center text-sm text-gray-500">
                <Link to="/login" className="text-blue-600 hover:underline">Wróć do logowania</Link>
            </p>
        </div>
    );
}