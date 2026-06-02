import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const schema = z
    .object({
        displayName: z.string().min(1, 'Podaj nazwę'),
        email: z.email('Nieprawidłowy e-mail'),
        password: z.string().min(8, 'Hasło musi mieć min. 8 znaków'),
        confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, {
        message: 'Hasła nie są takie same',
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
            toast.success('Konto utworzone');
            navigate('/');
        } catch (e: any) {
            setServerError(e.response?.data?.error ?? 'Błąd rejestracji');
        }
    }

    return (
        <div className="mx-auto max-w-sm">
            <h1 className="mb-4 text-2xl font-bold">Rejestracja</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                    <input {...register('displayName')} placeholder="Nazwa wyświetlana"
                        className="w-full rounded border px-3 py-2" />
                    {errors.displayName && <p className="text-sm text-red-600">{errors.displayName.message}</p>}
                </div>
                <div>
                    <input {...register('email')} type="email" placeholder="E-mail"
                        className="w-full rounded border px-3 py-2" />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                    <input {...register('password')} type="password" placeholder="Hasło (min. 8 znaków)"
                        className="w-full rounded border px-3 py-2" />
                    {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                </div>
                <div>
                    <input {...register('confirm')} type="password" placeholder="Powtórz hasło"
                        className="w-full rounded border px-3 py-2" />
                    {errors.confirm && <p className="text-sm text-red-600">{errors.confirm.message}</p>}
                </div>
                {serverError && <p className="text-sm text-red-600">{serverError}</p>}
                <button type="submit" disabled={isSubmitting}
                    className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                    {isSubmitting ? 'Rejestracja…' : 'Zarejestruj się'}
                </button>
            </form>
            <p className="mt-3 text-center text-sm text-gray-500">
                Masz już konto? <Link to="/login" className="text-blue-600 hover:underline">Zaloguj się</Link>
            </p>
        </div>
    );
}