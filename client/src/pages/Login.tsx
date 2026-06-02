import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const schema = z.object({
    email: z.email('Nieprawidłowy e-mail'),
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
            toast.success('Zalogowano');
            navigate('/');
        } catch (e: any) {
            setServerError(e.response?.data?.error ?? 'Błąd logowania');
        }
    }

    return (
        <div className="mx-auto max-w-sm">
            <h1 className="mb-4 text-2xl font-bold">Logowanie</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                    <input {...register('email')} type="email" placeholder="E-mail"
                        className="w-full rounded border px-3 py-2" />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                    <input {...register('password')} type="password" placeholder="Hasło"
                        className="w-full rounded border px-3 py-2" />
                    {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                </div>
                {serverError && <p className="text-sm text-red-600">{serverError}</p>}
                <button type="submit" disabled={isSubmitting}
                    className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                    {isSubmitting ? 'Logowanie…' : 'Zaloguj się'}
                </button>
            </form>
            <p className="mt-3 text-center text-sm text-gray-500">
                Nie masz konta? <Link to="/register" className="text-blue-600 hover:underline">Zarejestruj się</Link>
            </p>
            <p className="mt-1 text-center text-sm">
                <Link to="/forgot-password" className="text-blue-600 hover:underline">Nie pamiętasz hasła?</Link>
            </p>
        </div>
    );
}