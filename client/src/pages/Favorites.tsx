import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Heart } from 'lucide-react';
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

    // usunięcie z ulubionych odświeża tę listę (pozycja znika) oraz listę główną (serduszko gaśnie)
    const removeFavorite = useMutation({
        mutationFn: (id: string) => api.delete(`/restaurants/${id}/favorite`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
        },
    });

    if (isLoading) return <p>Ładowanie…</p>;
    if (isError) return <p className="text-red-600">Nie udało się pobrać ulubionych.</p>;

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Moje ulubione</h1>

            {data!.length === 0 ? (
                <div className="rounded-lg border bg-white p-6 text-center text-gray-500">
                    <p>Nie masz jeszcze ulubionych restauracji.</p>
                    <Link to="/" className="mt-2 inline-block text-blue-600 hover:underline">
                        Przeglądaj restauracje →
                    </Link>
                </div>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data!.map((r) => (
                        <li
                            key={r.id}
                            onClick={() => navigate(`/restaurants/${r.id}`)}
                            className="relative cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFavorite.mutate(r.id); }}
                                aria-label="Usuń z ulubionych"
                                className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow transition hover:bg-white hover:scale-110"
                            >
                                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                            </button>
                            {r.photoUrl && <img src={r.photoUrl} alt={r.name} className="h-40 w-full object-cover" />}
                            <div className="p-4">
                                <Link to={`/restaurants/${r.id}`} className="text-lg font-semibold hover:underline">
                                    {r.name}
                                </Link>
                                <p className="text-sm text-gray-500">{r.address}</p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {r.menuTypes.map((m) => (
                                        <span key={m.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{m.name}</span>
                                    ))}
                                </div>
                                <div className="mt-2 flex items-center gap-1 text-sm">
                                    {r.avgRating !== null ? (
                                        <>
                                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                            <span>{r.avgRating.toFixed(1)} ({r.reviewCount})</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-500">Brak ocen</span>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}