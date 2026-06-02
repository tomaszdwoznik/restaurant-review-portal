import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Star, Search } from 'lucide-react';
import { api } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';

interface ReviewHit {
    id: string;
    comment: string | null;
    rating: number;
    restaurantId: string;
    restaurantName: string;
    rank: number;
}

export default function SearchReviews() {
    const [input, setInput] = useState('');
    const query = useDebounce(input.trim(), 200);

    const { data, isFetching, isError } = useQuery({
        queryKey: ['review-search', query],
        queryFn: async () => {
            const res = await api.get<{ reviews: ReviewHit[] }>(
                `/reviews/search?q=${encodeURIComponent(query)}`,
            );
            return res.data.reviews;
        },
        enabled: query.length > 0,
        placeholderData: keepPreviousData,
    });

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Wyszukaj w komentarzach</h1>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="np. pizza, ramen, pierogi…"
                    className="w-full rounded border px-3 py-2 pl-9"
                    autoFocus
                />
            </div>

            {isError && <p className="text-red-600">Błąd wyszukiwania.</p>}

            {query.length > 0 && data && (
                <p className="mb-3 text-sm text-gray-500">
                    Znaleziono {data.length} {data.length === 1 ? 'wynik' : 'wyników'} dla „{query}".
                </p>
            )}

            <ul className={`space-y-3 ${isFetching ? 'opacity-60' : ''}`}>
                {data?.map((hit) => (
                    <li key={hit.id} className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <Link
                                to={`/restaurants/${hit.restaurantId}`}
                                className="font-semibold text-blue-600 hover:underline"
                            >
                                {hit.restaurantName}
                            </Link>
                            <span className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                {hit.rating}
                            </span>
                        </div>
                        {hit.comment && <p className="mt-1 text-sm text-gray-700">{hit.comment}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}