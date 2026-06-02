import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const schema = z.object({
    email: z.email('Nieprawidłowy adres e-mail'),
    password: z.string().min(1, 'Podaj hasło'),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    async function onSubmit(data: FormData) {
        setServerError(null);
        try {
            await login(data.email, data.password);
            toast.success('Zalogowano pomyślnie');
            navigate('/');
        } catch (e: any) {
            setServerError(e.response?.data?.error ?? 'Błąd logowania');
        }
    }

    return (
        <div className="mx-auto max-w-md py-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Witaj ponownie!</h1>
                <p className="text-stone-500 text-sm mt-1">Zaloguj się, aby dzielić się opiniami o restauracjach.</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-900/5">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Adres e-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                            <input 
                                {...register('email')} 
                                type="email" 
                                placeholder="name@example.com"
                                className="w-full rounded-xl bg-stone-50 border border-stone-200 py-2.5 pl-10 pr-4 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                            />
                        </div>
                        {errors.email && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-semibold text-stone-700">Hasło</label>
                            <Link to="/forgot-password" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                                Zapomniałeś hasła?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                            <input 
                                {...register('password')} 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full rounded-xl bg-stone-50 border border-stone-200 py-2.5 pl-10 pr-4 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                            />
                        </div>
                        {errors.password && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password.message}</p>}
                    </div>

                    {serverError && (
                        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{serverError}</span>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 font-semibold text-white shadow-sm shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50"
                    >
                        <LogIn className="h-4 w-4" />
                        <span>{isSubmitting ? 'Logowanie…' : 'Zaloguj się'}</span>
                    </button>
                </form>
            </div>

            <p className="mt-6 text-center text-sm text-stone-500">
                Nie posiadasz jeszcze konta?{' '}
                <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-4">
                    Zarejestruj się teraz
                </Link>
            </p>
        </div>
    );
}