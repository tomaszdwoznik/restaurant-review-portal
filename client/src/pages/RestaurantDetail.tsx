import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: { id: string; displayName: string | null };
}

interface RestaurantDetail {
    id: string;
    name: string;
    address: string;
    photoUrl: string | null;
    menuTypes: { id: string; name: string }[];
    owner: { id: string; displayName: string | null };
    avgRating: number | null;
    reviewCount: number;
    reviews: Review[];
}

export default function RestaurantDetail() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['restaurant', id],
        queryFn: async () => {
            const res = await api.get<{ restaurant: RestaurantDetail }>(`/restaurants/${id}`);
            return res.data.restaurant;
        },
    });

    if (isLoading) return <p>Ładowanie…</p>;
    if (isError || !data) return <p className="text-red-600">Nie znaleziono restauracji.</p>;

    return (
        <div>
            <Link to="/" className="text-sm text-blue-600 hover:underline">← Wróć do listy</Link>

            <div className="mt-3 overflow-hidden rounded-lg border bg-white shadow-sm">
                {data.photoUrl && (
                    <img src={data.photoUrl} alt={data.name} className="h-64 w-full object-cover" />
                )}
                <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">{data.name}</h1>
                            <p className="text-gray-500">{data.address}</p>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-2xl font-bold">
                                {data.avgRating !== null ? `⭐ ${data.avgRating.toFixed(1)}` : '—'}
                            </p>
                            <p className="text-xs text-gray-500">{data.reviewCount} opinii</p>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                        {data.menuTypes.map((m) => (
                            <span key={m.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{m.name}</span>
                        ))}
                    </div>

                    {data.owner.displayName && (
                        <p className="mt-3 text-xs text-gray-400">Dodał: {data.owner.displayName}</p>
                    )}
                </div>
            </div>

            <h2 className="mt-6 mb-3 text-lg font-semibold">Opinie</h2>
            {data.reviews.length === 0 ? (
                <p className="text-gray-500">Brak opinii — bądź pierwszy!</p>
            ) : (
                <ul className="space-y-3">
                    {data.reviews.map((rev) => (
                        <li key={rev.id} className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{rev.user.displayName ?? 'Anonim'}</span>
                                <span className="text-sm">⭐ {rev.rating}</span>
                            </div>
                            {rev.comment && <p className="mt-1 text-sm text-gray-700">{rev.comment}</p>}
                            <p className="mt-1 text-xs text-gray-400">
                                {new Date(rev.createdAt).toLocaleDateString('pl-PL')}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}