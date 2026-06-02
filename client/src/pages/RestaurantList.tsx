import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Star, MapPin, Search, Heart, Utensils, SlidersHorizontal, Compass } from 'lucide-react';
import { api } from '../lib/api';
import { geocodeAddress } from '../lib/geocode';
import { useAuth } from '../context/AuthContext';

interface Restaurant {
    id: string;
    name: string;
    address: string;
    photoUrl: string | null;
    avgRating: number | null;
    reviewCount: number;
    distanceKm: number | null;
    isFavorite: boolean;
    menuTypes: { id: string; name: string }[];
}

interface MenuType { id: string; name: string }

export default function RestaurantList() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [sort, setSort] = useState<'name_asc' | 'name_desc'>('name_asc');
    const [menuType, setMenuType] = useState('');
    const [nearby, setNearby] = useState(false);
    const [nearAddress, setNearAddress] = useState('');
    const [nearCoords, setNearCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [radiusKm, setRadiusKm] = useState('5');
    const [geoSearching, setGeoSearching] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);

    const { data: menuTypes } = useQuery({
        queryKey: ['menu-types'],
        queryFn: async () => (await api.get<{ menuTypes: MenuType[] }>('/menu-types')).data.menuTypes,
    });

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ['restaurants', { name, sort, menuType, nearby, nearCoords, radiusKm }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (name) params.set('name', name);
            if (sort) params.set('sort', sort);
            if (menuType) params.set('menuType', menuType);
            if (nearby && nearCoords) {
                params.set('lat', String(nearCoords.lat));
                params.set('lng', String(nearCoords.lng));
                params.set('radiusKm', radiusKm);
            }
            const res = await api.get<{ restaurants: Restaurant[] }>(`/restaurants?${params}`);
            return res.data.restaurants;
        },
        placeholderData: keepPreviousData,
    });

    const toggleFavorite = useMutation({
        mutationFn: ({ id, isFav }: { id: string; isFav: boolean }) =>
            isFav ? api.delete(`/restaurants/${id}/favorite`) : api.post(`/restaurants/${id}/favorite`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
    });

    async function findNear() {
        if (!nearAddress.trim()) return;
        setGeoSearching(true);
        setGeoError(null);
        try {
            const c = await geocodeAddress(nearAddress);
            if (!c) { setGeoError('Nie znaleziono adresu.'); return; }
            setNearCoords(c);
        } catch {
            setGeoError('Błąd wyszukiwania adresu.');
        } finally {
            setGeoSearching(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-black text-stone-900 tracking-tight">Odkryj smaki</h1>
                    <p className="text-stone-500 text-sm mt-0.5">Przeglądaj, filtruj i oceniaj najlepsze restauracje w okolicy.</p>
                </div>
            </div>

            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-900/5">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Wpisz nazwę lokalu lub kuchni..."
                            className="w-full rounded-xl bg-stone-50 border border-stone-200 py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                            <SlidersHorizontal className="h-3.5 w-3.5 text-stone-500" />
                            <select 
                                value={sort} 
                                onChange={(e) => setSort(e.target.value as 'name_asc' | 'name_desc')}
                                className="bg-transparent text-xs font-semibold text-stone-700 outline-none cursor-pointer"
                            >
                                <option value="name_asc">Nazwa A→Z</option>
                                <option value="name_desc">Nazwa Z→A</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                            <Utensils className="h-3.5 w-3.5 text-stone-500" />
                            <select 
                                value={menuType} 
                                onChange={(e) => setMenuType(e.target.value)}
                                className="bg-transparent text-xs font-semibold text-stone-700 outline-none cursor-pointer"
                            >
                                <option value="">Wszystkie typy menu</option>
                                {menuTypes?.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border-t border-stone-100 pt-3">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-700">
                        <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg p-1 hover:bg-stone-50">
                            <input 
                                type="checkbox" 
                                checked={nearby} 
                                onChange={(e) => setNearby(e.target.checked)} 
                                className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
                            />
                            <span className="flex items-center gap-1 text-sm font-bold text-stone-800">
                                <Compass className="h-4 w-4 text-orange-600" />
                                Szukaj w pobliżu lokalizacji
                            </span>
                        </label>
                        
                        {nearby && (
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 animate-in fade-in duration-200">
                                <input
                                    value={nearAddress}
                                    onChange={(e) => setNearAddress(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); findNear(); } }}
                                    placeholder="Wpisz miasto lub adres..."
                                    className="rounded-lg bg-stone-50 border border-stone-200 px-3 py-1.5 text-xs text-stone-900 outline-none w-48 focus:bg-white focus:ring-2 focus:ring-orange-500"
                                />
                                <button 
                                    type="button" 
                                    onClick={findNear} 
                                    disabled={geoSearching}
                                    className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                                >
                                    {geoSearching ? 'Geokodowanie…' : 'Określ'}
                                </button>
                                <label className="flex items-center gap-1 text-stone-500 ml-1">
                                    <span>promień</span>
                                    <input 
                                        value={radiusKm} 
                                        onChange={(e) => setRadiusKm(e.target.value)} 
                                        type="number"
                                        className="w-12 rounded-lg bg-stone-50 border border-stone-200 px-1.5 py-1 text-center font-bold text-stone-800 focus:bg-white" 
                                    /> 
                                    <span>km</span>
                                </label>
                            </div>
                        )}
                    </div>

                    {nearby && geoError && <p className="text-xs font-medium text-rose-600 mt-2 pl-1">{geoError}</p>}
                    {nearby && nearCoords && !geoError && (
                        <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 mt-2 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 max-w-max">
                            <MapPin className="h-3 w-3 shrink-0" /> Centrum wyszukiwania: {nearAddress}
                        </p>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <div className="h-7 w-7 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
                    <p className="text-stone-500 text-sm font-medium">Ładowanie bazy gastronomicznej...</p>
                </div>
            ) : isError ? (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-center text-sm text-rose-700">
                    Wystąpił błąd podczas pobierania zestawu restauracji.
                </div>
            ) : data!.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-400 font-medium">
                    Brak restauracji spełniających podane kryteria wyszukiwania.
                </div>
            ) : (
                <ul className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${isFetching ? 'opacity-60' : ''}`}>
                    {data!.map((r) => (
                        <li
                            key={r.id}
                            onClick={() => navigate(`/restaurants/${r.id}`)}
                            className="group relative flex flex-col cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                        >
                            {user && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite.mutate({ id: r.id, isFav: r.isFavorite }); }}
                                    aria-label={r.isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                                    className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 backdrop-blur-sm shadow-sm ring-1 ring-stone-900/10 transition-all hover:bg-white hover:scale-110 active:scale-95"
                                >
                                    <Heart className={`h-4 w-4 ${r.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                                </button>
                            )}
                            
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
                                
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {r.menuTypes.map((m) => (
                                        <span key={m.id} className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700 border border-orange-100">
                                            {m.name}
                                        </span>
                                    ))}
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        {r.avgRating !== null ? (
                                            <div className="flex items-center gap-0.5 font-bold text-stone-800">
                                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                <span>{r.avgRating.toFixed(1)}</span>
                                                <span className="text-xs font-normal text-stone-400 ml-0.5">({r.reviewCount})</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-stone-400 italic">Brak ocen</span>
                                        )}
                                        
                                        {r.distanceKm !== null && (
                                            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                                                <Compass className="h-3 w-3" />
                                                {r.distanceKm.toFixed(1)} km
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}