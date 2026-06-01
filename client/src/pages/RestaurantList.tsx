import { useQuery } from '@tanstack/react-query';
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

export default function RestaurantList() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['restaurants'],
        queryFn: async () => {
            const res = await api.get<{ restaurants: Restaurant[] }>('/restaurants');
            return res.data.restaurants;
        },
    });

    if (isLoading) return <p>Ładowanie…</p>;
    if (isError) return <p className="text-red-600">Nie udało się pobrać restauracji.</p>;

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Restauracje</h1>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data!.map((r) => (
                    <li key={r.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                        {r.photoUrl && <img src={r.photoUrl} alt={r.name} className="h-40 w-full object-cover" />}
                        <div className="p-4">
                            <h2 className="text-lg font-semibold">{r.name}</h2>
                            <p className="text-sm text-gray-500">{r.address}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {r.menuTypes.map((m) => (
                                    <span key={m.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{m.name}</span>
                                ))}
                            </div>
                            <p className="mt-2 text-sm">
                                {r.avgRating !== null ? `⭐ ${r.avgRating.toFixed(1)} (${r.reviewCount})` : 'Brak ocen'}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}