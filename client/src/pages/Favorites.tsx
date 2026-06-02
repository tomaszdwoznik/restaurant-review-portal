import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Heart, MapPin, ArrowRight, Utensils } from 'lucide-react';
import { api } from '../lib/api';

interface Restaurant {
    id: string;
    name: string;
    address: string;
    photoUrl: string | null;
    avgRating: number | null;
    reviewCount: number;
    menuTypes: { id: string; name: string }[];
}

export default function Favorites() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['favorites'],
        queryFn: async () => (await api.get<{ restaurants: Restaurant[] }>('/restaurants/favorites')).data.restaurants,
    });

    const removeFavorite = useMutation({
        mutationFn: (id: string) => api.delete(`/restaurants/${id}/favorite`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
                <p className="text-stone-500 font-medium">Ładowanie Twoich ulubionych...</p>
            </div>
        );
    }
    
    if (isError) {
        return (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center text-rose-700 max-w-md mx-auto mt-6">
                Nie udało się pobrać listy ulubionych lokali. Spróbuj ponownie.
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Moje ulubione</h1>
                <p className="text-stone-500 text-sm mt-1">Lokale gastronomiczne, które najbardziej Ci odpowiadają.</p>
            </div>

            {data!.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm max-w-md mx-auto">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-3">
                        <Heart className="h-6 w-6 stroke-[2]" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900">Pusta lista</h3>
                    <p className="text-stone-500 text-sm mt-1">Nie masz jeszcze przypisanych ulubionych restauracji.</p>
                    <Link to="/" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
                        <span>Przeglądaj restauracje</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {data!.map((r) => (
                        <li
                            key={r.id}
                            onClick={() => navigate(`/restaurants/${r.id}`)}
                            className="group relative flex flex-col cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFavorite.mutate(r.id); }}
                                aria-label="Usuń z ulubionych"
                                className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 backdrop-blur-sm shadow-sm ring-1 ring-stone-900/10 transition-all hover:bg-white hover:scale-110 active:scale-95"
                            >
                                <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                            </button>
                            
                            <div className="h-44 w-full overflow-hidden bg-stone-100">
                                {r.photoUrl ? (
                                    <img src={r.photoUrl} alt={r.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-stone-300">
                                        <Utensils className="h-8 w-8" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col p-4">
                                <h3 className="text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                                    {r.name}
                                </h3>
                                <p className="mt-1 flex items-center gap-1 text-sm text-stone-500 line-clamp-1">
                                    <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                                    <span>{r.address}</span>
                                </p>
                                
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {r.menuTypes.map((m) => (
                                        <span key={m.id} className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-orange-700 border border-orange-100">
                                            {m.name}
                                        </span>
                                    ))}
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-sm">
                                    {r.avgRating !== null ? (
                                        <div className="flex items-center gap-1 font-bold text-stone-800">
                                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            <span>{r.avgRating.toFixed(1)}</span>
                                            <span className="text-xs font-normal text-stone-400">({r.reviewCount})</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-stone-400 italic">Brak ocen</span>
                                    )}
                                    <span className="text-xs font-semibold text-orange-600 group-hover:underline flex items-center gap-0.5">
                                        Zobacz szczegóły →
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}