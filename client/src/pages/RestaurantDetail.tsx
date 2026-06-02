import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Star, MapPin, Calendar, User, Trash2, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';
import StarRating from '../components/StarRating';
import RestaurantMap from '../components/RestaurantMap';

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
    latitude: number;
    longitude: number;
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
        onError: (e: any) => {
            console.error('Błąd usuwania restauracji:', e);
            toast.error(e.response?.data?.error ?? 'Nie udało się usunąć restauracji');
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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
                <p className="text-stone-500 font-medium">Pobieranie karty lokalu...</p>
            </div>
        );
    }
    
    if (isError || !data) {
        return (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center text-rose-700 max-w-md mx-auto mt-6">
                Nie odnaleziono poszukiwanej restauracji lub lokal został usunięty.
            </div>
        );
    }

    const myReview = user ? data.reviews.find((r) => r.user.id === user.id) : undefined;

    return (
        <div className="space-y-6">
            <div>
                <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-orange-600 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Powrót do zestawienia</span>
                </Link>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-900/5">
                {data.photoUrl && (
                    <div className="relative h-72 w-full bg-stone-100">
                        <img src={data.photoUrl} alt={data.name} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />
                    </div>
                )}
                
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-stone-100 pb-5">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-stone-900">{data.name}</h1>
                            <p className="mt-1.5 flex items-center gap-1 text-stone-500 font-medium">
                                <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
                                <span>{data.address}</span>
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {data.menuTypes.map((m) => (
                                    <span key={m.id} className="rounded-full bg-orange-50 px-3 py-0.5 text-xs font-semibold text-orange-700 border border-orange-100">
                                        {m.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-0.5 bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl shrink-0">
                            <div className="flex items-center gap-1 text-2xl font-black text-stone-900">
                                {data.avgRating !== null ? (
                                    <>
                                        <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                                        <span>{data.avgRating.toFixed(1)}</span>
                                    </>
                                ) : (
                                    <span className="text-stone-400 font-normal text-lg italic">—</span>
                                )}
                            </div>
                            <p className="text-xs font-semibold text-stone-400">{data.reviewCount} opinii klientów</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-2">Położenie geograficzne</h3>
                            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-inner">
                                <RestaurantMap latitude={data.latitude} longitude={data.longitude} name={data.name} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            {data.owner.displayName && (
                                <p className="text-xs font-medium text-stone-400 flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>Wprowadzony przez: {data.owner.displayName}</span>
                                </p>
                            )}
                            
                            {user && data.owner.id === user.id && (
                                <button
                                    onClick={() => setConfirmDeleteRestaurant(true)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Usuń tę restaurację</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">Recenzje i opinie</h2>
                
                {!user ? (
                    <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 text-center text-sm text-stone-500">
                        Chcesz wystawić własną ocenę?{' '}
                        <Link to="/login" className="font-bold text-orange-600 hover:underline">
                            Zaloguj się na swoje konto
                        </Link>
                    </div>
                ) : myReview ? (
                    <div className="rounded-2xl bg-orange-50/60 border border-orange-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-orange-200/60 pb-3">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-orange-950">
                                <span>Twoja wystawiona recenzja:</span>
                                <div className="flex items-center gap-0.5 rounded-full bg-white px-2 py-0.5 text-xs font-black border border-orange-200 shadow-sm">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    <span>{myReview.rating}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setConfirmOpen(true)}
                                className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-rose-700 shadow-sm border border-stone-200 hover:bg-rose-50 transition-colors"
                            >
                                <Trash2 className="h-3 w-3" />
                                <span>Usuń</span>
                            </button>
                        </div>
                        {myReview.comment && <p className="mt-3 text-sm text-stone-700 italic leading-relaxed">„{myReview.comment}”</p>}
                    </div>
                ) : (
                    <form
                        onSubmit={(e) => { e.preventDefault(); addReview.mutate(); }}
                        className="space-y-4 rounded-2xl bg-white border border-stone-200 p-5 shadow-sm"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="text-sm font-bold text-stone-700">Wybierz stopień satysfakcji (ocena)</label>
                            <div className="bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100">
                                <StarRating value={rating} onChange={setRating} />
                            </div>
                        </div>
                        
                        <div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Napisz coś więcej o jedzeniu, obsłudze lub wystroju lokalu (opcjonalnie)..."
                                rows={3}
                                className="w-full rounded-xl bg-stone-50 border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {formError && (
                            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                                {formError}
                            </p>
                        )}
                        
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={addReview.isPending}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50"
                            >
                                <Send className="h-3.5 w-3.5" />
                                <span>{addReview.isPending ? 'Wysyłanie…' : 'Opublikuj opinię'}</span>
                            </button>
                        </div>
                    </form>
                )}

                {data.reviews.length === 0 ? (
                    <div className="rounded-2xl border border-stone-200 border-dashed p-8 text-center text-stone-400 bg-white">
                        Brak opinii — bądź pierwszą osobą, która oceni ten lokal!
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {data.reviews.map((rev) => (
                            <li key={rev.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-900/5">
                                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase">
                                            {(rev.user.displayName ?? 'A')[0]}
                                        </div>
                                        <span className="font-bold text-stone-800 text-sm">{rev.user.displayName ?? 'Anonimowy krytyk'}</span>
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                        <span>{rev.rating}</span>
                                    </span>
                                </div>
                                {rev.comment && <p className="mt-3 text-sm text-stone-600 leading-relaxed pl-1">„{rev.comment}”</p>}
                                <div className="mt-3 flex items-center gap-1 text-[11px] text-stone-400 font-medium pl-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(rev.createdAt).toLocaleDateString('pl-PL')}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

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