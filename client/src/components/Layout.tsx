import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Search, Heart, PlusCircle, LogOut } from 'lucide-react';

export default function Layout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-orange-200">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/50 shadow-sm">
                <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-orange-600 hover:text-orange-700 transition">
                        <Utensils className="h-6 w-6" />
                    </Link>
                    
                    <div className="flex items-center gap-5 text-sm font-medium">
                        {user ? (
                            <>
                                <Link to="/search" className="flex items-center gap-1.5 text-stone-500 hover:text-orange-600 transition">
                                    <Search className="h-4 w-4" /> Szukaj w komentarzach
                                </Link>
                                <Link to="/favorites" className="flex items-center gap-1.5 text-stone-500 hover:text-rose-500 transition">
                                    <Heart className="h-4 w-4" /> Ulubione
                                </Link>
                                <Link to="/restaurants/new" className="flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5">
                                    <PlusCircle className="h-4 w-4" /> Dodaj lokal
                                </Link>
                                
                                <div className="h-6 w-px bg-stone-200 mx-1"></div>
                                
                                <span className="text-stone-800 font-semibold">{user.displayName ?? user.email}</span>
                                <button onClick={() => logout()} className="flex items-center gap-1.5 rounded-full bg-stone-100 px-4 py-2 text-stone-600 transition hover:bg-stone-200">
                                    <LogOut className="h-4 w-4" /> Wyloguj
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="rounded-full bg-orange-500 px-6 py-2 text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 hover:-translate-y-0.5">
                                Zaloguj się
                            </Link>
                        )}
                    </div>
                </nav>
            </header>
            <main className="mx-auto max-w-6xl px-6 py-10 animate-in fade-in duration-500">
                <Outlet />
            </main>
        </div>
    );
}