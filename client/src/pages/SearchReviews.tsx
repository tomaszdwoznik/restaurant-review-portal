import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Star, Search, Quote, Store } from 'lucide-react';
import { api } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';

interface ReviewHit {
    id: string;
    comment: string | null;
    rating: number;
    restaurantId: string;
    restaurantName: string;
    highlightedComment: string | null;
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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Przeszukaj treść komentarzy</h1>
                <p className="text-stone-500 text-sm mt-0.5">Szukasz konkretnego dania lub wrażenia? Wpisz słowo kluczowe.</p>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="np. chrupiąca pizza, pyszny ramen, świeże składniki…"
                    className="w-full rounded-2xl bg-white border border-stone-200 py-3.5 pl-12 pr-4 text-stone-900 outline-none transition-all placeholder:text-stone-400 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    autoFocus
                />
            </div>

            {isError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-center text-sm text-rose-700">
                    Wystąpił nieoczekiwany błąd podczas wyszukiwania w bazie danych.
                </div>
            )}

            {query.length > 0 && data && (
                <p className="text-xs font-semibold text-stone-500 pl-1">
                    Znaleziono {data.length} {data.length === 1 ? 'dopasowanie' : data.length > 1 && data.length < 5 ? 'dopasowania' : 'dopasowań'} dla frazy „{query}”.
                </p>
            )}

            <ul className={`space-y-4 transition-opacity duration-200 ${isFetching ? 'opacity-60' : ''}`}>
                {data?.map((hit) => (
                    <li key={hit.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 mb-3">
                            <Link
                                to={`/restaurants/${hit.restaurantId}`}
                                className="inline-flex items-center gap-1.5 font-bold text-orange-600 hover:text-orange-700 hover:underline text-sm md:text-base"
                            >
                                <Store className="h-4 w-4 shrink-0" />
                                <span>{hit.restaurantName}</span>
                            </Link>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span>{hit.rating}</span>
                            </span>
                        </div>
                        {hit.highlightedComment && (
                            <div className="flex items-start gap-2 text-stone-700 text-sm bg-stone-50 p-3 rounded-xl border border-stone-100 italic leading-relaxed">
                                <Quote className="h-4 w-4 text-stone-400 shrink-0 mt-0.5 rotate-180" />
                                <p
                                    className="[&_mark]:rounded [&_mark]:bg-amber-200 [&_mark]:px-1 [&_mark]:font-semibold [&_mark]:text-amber-950"
                                    dangerouslySetInnerHTML={{ __html: hit.highlightedComment }}
                                />
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}