import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { UserPlus, User, Mail, Lock, AlertCircle } from 'lucide-react';

const schema = z
    .object({
        displayName: z.string().min(1, 'Nazwa użytkownika jest wymagana'),
        email: z.email('Nieprawidłowy adres e-mail'),
        password: z.string().min(8, 'Hasło musi zawierać minimum 8 znaków'),
        confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, {
        message: 'Hasła nie są identyczne',
        path: ['confirm'],
    });

type FormData = z.infer<typeof schema>;

export default function Register() {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) });

    async function onSubmit(data: FormData) {
        setServerError(null);
        try {
            await registerUser(data.email, data.password, data.displayName);
            toast.success('Konto zostało utworzone');
            navigate('/');
        } catch (e: any) {
            setServerError(e.response?.data?.error ?? 'Błąd rejestracji');
        }
    }

    return (
        <div className="mx-auto max-w-md py-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Utwórz konto</h1>
                <p className="text-stone-500 text-sm mt-1">Dołącz do społeczności smakoszy i oceniaj posiłki.</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-900/5">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nazwa wyświetlana</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                            <input 
                                {...register('displayName')} 
                                placeholder="np. JanKowalski"
                                className="w-full rounded-xl bg-stone-50 border border-stone-200 py-2.5 pl-10 pr-4 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                            />
                        </div>
                        {errors.displayName && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.displayName.message}</p>}
                    </div>

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
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Hasło (min. 8 znaków)</label>
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

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Powtórz hasło</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                            <input 
                                {...register('confirm')} 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full rounded-xl bg-stone-50 border border-stone-200 py-2.5 pl-10 pr-4 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                            />
                        </div>
                        {errors.confirm && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.confirm.message}</p>}
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
                        <UserPlus className="h-4 w-4" />
                        <span>{isSubmitting ? 'Rejestracja…' : 'Zarejestruj się'}</span>
                    </button>
                </form>
            </div>

            <p className="mt-6 text-center text-sm text-stone-500">
                Masz już konto w naszym serwisie?{' '}
                <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-4">
                    Zaloguj się
                </Link>
            </p>
        </div>
    );
}