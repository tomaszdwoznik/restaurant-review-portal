import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

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
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const navigate = useNavigate();
    const [confirmDeleteRestaurant, setConfirmDeleteRestaurant] = useState(false);

    const deleteRestaurant = useMutation({
        mutationFn: () => api.delete(`/restaurants/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
            toast.success('Usunięto restaurację');
            navigate('/');
        },
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ['restaurant', id],
        queryFn: async () => {
            const res = await api.get<{ restaurant: RestaurantDetail }>(`/restaurants/${id}`);
            return res.data.restaurant;
        },
    });

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    function refresh() {
        queryClient.invalidateQueries({ queryKey: ['restaurant', id] });
        queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    }

    const addReview = useMutation({
        mutationFn: () =>
            api.post(`/restaurants/${id}/reviews`, { rating, comment: comment.trim() || undefined }),
        onSuccess: () => { setComment(''); setRating(5); setFormError(null); refresh(); toast.success('Dodano opinię'); },
        onError: (e: any) => {
            const msg = e.response?.data?.error ?? 'Nie udało się dodać opinii';
            setFormError(msg);
            toast.error(msg);
        },
    });

    const deleteReview = useMutation({
        mutationFn: () => api.delete(`/restaurants/${id}/reviews`),
        onSuccess: () => { setConfirmOpen(false); refresh(); toast.success('Usunięto opinię'); },
    });

    if (isLoading) return <p>Ładowanie…</p>;
    if (isError || !data) return <p className="text-red-600">Nie znaleziono restauracji.</p>;

    const myReview = user ? data.reviews.find((r) => r.user.id === user.id) : undefined;

    return (
        <div>
            <Link to="/" className="text-sm text-blue-600 hover:underline">← Wróć do listy</Link>

            <div className="mt-3 overflow-hidden rounded-lg border bg-white shadow-sm">
                {data.photoUrl && <img src={data.photoUrl} alt={data.name} className="h-64 w-full object-cover" />}
                <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">{data.name}</h1>
                            <p className="text-gray-500">{data.address}</p>
                        </div>
                        <div className="shrink-0 text-right">
                            <div className="flex items-center justify-end gap-1 text-2xl font-bold">
                                {data.avgRating !== null ? (
                                    <>
                                        <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                                        <span>{data.avgRating.toFixed(1)}</span>
                                    </>
                                ) : (
                                    <span>—</span>
                                )}
                            </div>
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
                    {user && data.owner.id === user.id && (
                        <button
                            onClick={() => setConfirmDeleteRestaurant(true)}
                            className="mt-3 rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                        >
                            Usuń restaurację
                        </button>
                    )}
                </div>
            </div>

            <h2 className="mt-6 mb-3 text-lg font-semibold">Opinie</h2>
            {!user ? (
                <p className="mb-4 text-sm text-gray-500">
                    <Link to="/login" className="text-blue-600 hover:underline">Zaloguj się</Link>, aby wystawić opinię.
                </p>
            ) : myReview ? (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-1 text-sm font-medium">
                        <span>Twoja opinia:</span>
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span>{myReview.rating}</span>
                    </div>
                    {myReview.comment && <p className="mt-1 text-sm text-gray-700">{myReview.comment}</p>}
                    <button
                        onClick={() => setConfirmOpen(true)}
                        className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    >
                        Usuń opinię
                    </button>
                </div>
            ) : (
                <form
                    onSubmit={(e) => { e.preventDefault(); addReview.mutate(); }}
                    className="mb-4 space-y-2 rounded-lg border bg-white p-4"
                >
                    <label className="block text-sm font-medium">
                        Ocena
                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="ml-2 rounded border px-2 py-1"
                        >
                            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Komentarz (opcjonalnie)"
                        rows={3}
                        className="w-full rounded border px-3 py-2 text-sm"
                    />
                    {formError && <p className="text-sm text-red-600">{formError}</p>}
                    <button
                        type="submit"
                        disabled={addReview.isPending}
                        className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {addReview.isPending ? 'Wysyłanie…' : 'Wystaw opinię'}
                    </button>
                </form>
            )}
            {data.reviews.length === 0 ? (
                <p className="text-gray-500">Brak opinii — bądź pierwszy!</p>
            ) : (
                <ul className="space-y-3">
                    {data.reviews.map((rev) => (
                        <li key={rev.id} className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{rev.user.displayName ?? 'Anonim'}</span>
                                <span className="flex items-center gap-1 text-sm">
                                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                    {rev.rating}
                                </span>
                            </div>
                            {rev.comment && <p className="mt-1 text-sm text-gray-700">{rev.comment}</p>}
                            <p className="mt-1 text-xs text-gray-400">
                                {new Date(rev.createdAt).toLocaleDateString('pl-PL')}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Usunąć opinię?"
                message="Tej operacji nie można cofnąć. Po usunięciu możesz wystawić nową ocenę."
                onConfirm={() => deleteReview.mutate()}
                onCancel={() => setConfirmOpen(false)}
            />

            <ConfirmDialog
                open={confirmDeleteRestaurant}
                title="Usunąć restaurację?"
                message="Tej operacji nie można cofnąć. Usunięte zostaną także wszystkie opinie o tej restauracji."
                onConfirm={() => deleteRestaurant.mutate()}
                onCancel={() => setConfirmDeleteRestaurant(false)}
            />
        </div>
    );
}