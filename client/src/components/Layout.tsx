import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="border-b bg-white">
                <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <Link to="/" className="text-lg font-bold">Restaurant Reviews</Link>
                    <div className="flex items-center gap-4 text-sm">
                        {user ? (
                            <>
                                <span className="text-gray-600">{user.displayName ?? user.email}</span>
                                <button onClick={() => logout()} className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300">
                                    Wyloguj
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
                                Zaloguj
                            </Link>
                        )}
                    </div>
                </nav>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}