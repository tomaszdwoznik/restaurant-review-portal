import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { KeyRound, ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';

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
        <div className="mx-auto max-w-md py-6">
            <div className="text-center mb-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600 mb-3">
                    <KeyRound className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Przypomnienie hasła</h1>
                <p className="text-stone-500 text-sm mt-1">Podaj swój adres e-mail, aby zresetować hasło dostępowe.</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-900/5">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Adres e-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                            <input 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                type="email"
                                placeholder="name@example.com" 
                                className="w-full rounded-xl bg-stone-50 border border-stone-200 py-2.5 pl-10 pr-4 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                                required
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full rounded-xl bg-orange-600 py-2.5 font-semibold text-white shadow-sm shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Wysyłanie linku…' : 'Wyślij link resetujący'}
                    </button>
                </form>

                {message && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl bg-stone-50 border border-stone-200 p-3.5 text-sm text-stone-700">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{message}</span>
                    </div>
                )}

                {devToken && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-900 mb-1">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span>Tryb deweloperski (brak wysyłki):</span>
                        </div>
                        <Link to={`/reset-password?token=${devToken}`} className="break-all font-medium text-orange-700 hover:underline">
                            Kliknij tutaj, aby bezpośrednio ustawić nowe hasło
                        </Link>
                    </div>
                )}
            </div>

            <p className="mt-6 text-center text-sm">
                <Link to="/login" className="inline-flex items-center gap-1 font-medium text-orange-600 hover:text-orange-700 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Wróć do ekranu logowania</span>
                </Link>
            </p>
        </div>
    );
}