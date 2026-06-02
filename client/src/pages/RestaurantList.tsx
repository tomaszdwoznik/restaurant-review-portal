import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Star, MapPin } from 'lucide-react';
import { api } from '../lib/api';

interface Restaurant {
    id: string;
    name: string;
    address: string;
    photoUrl: string | null;
    avgRating: number | null;
    reviewCount: number;
    distanceKm: number | null;
    menuTypes: { id: string; name: string }[];
}

interface MenuType { id: string; name: string }

export default function RestaurantList() {
    const [name, setName] = useState('');
    const [sort, setSort] = useState<'name_asc' | 'name_desc'>('name_asc');
    const [menuType, setMenuType] = useState('');
    const [nearby, setNearby] = useState(false);
    const [lat, setLat] = useState('50.0617');
    const [lng, setLng] = useState('19.9373');
    const [radiusKm, setRadiusKm] = useState('5');

    const { data: menuTypes } = useQuery({
        queryKey: ['menu-types'],
        queryFn: async () => (await api.get<{ menuTypes: MenuType[] }>('/menu-types')).data.menuTypes,
    });

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ['restaurants', { name, sort, menuType, nearby, lat, lng, radiusKm }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (name) params.set('name', name);
            if (sort) params.set('sort', sort);
            if (menuType) params.set('menuType', menuType);
            if (nearby) {
                params.set('lat', lat);
                params.set('lng', lng);
                params.set('radiusKm', radiusKm);
            }
            const res = await api.get<{ restaurants: Restaurant[] }>(`/restaurants?${params}`);
            return res.data.restaurants;
        },
        placeholderData: keepPreviousData,
    });

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Restauracje</h1>

            <div className="mb-6 space-y-3 rounded-lg border bg-white p-4">
                <div className="flex flex-wrap gap-3">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Szukaj po nazwie…"
                        className="flex-1 rounded border px-3 py-2"
                    />
                    <select value={sort} onChange={(e) => setSort(e.target.value as 'name_asc' | 'name_desc')}
                        className="rounded border px-3 py-2">
                        <option value="name_asc">Nazwa A→Z</option>
                        <option value="name_desc">Nazwa Z→A</option>
                    </select>
                    <select value={menuType} onChange={(e) => setMenuType(e.target.value)}
                        className="rounded border px-3 py-2">
                        <option value="">Wszystkie menu</option>
                        {menuTypes?.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="flex items-center gap-1">
                        <input type="checkbox" checked={nearby} onChange={(e) => setNearby(e.target.checked)} />
                        W pobliżu
                    </label>
                    {nearby && (
                        <>
                            <input value={lat} onChange={(e) => setLat(e.target.value)} type="number" step="any"
                                className="w-28 rounded border px-2 py-1" placeholder="lat" />
                            <input value={lng} onChange={(e) => setLng(e.target.value)} type="number" step="any"
                                className="w-28 rounded border px-2 py-1" placeholder="lng" />
                            <label className="flex items-center gap-1">
                                promień
                                <input value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} type="number"
                                    className="w-20 rounded border px-2 py-1" /> km
                            </label>
                        </>
                    )}
                </div>
            </div>

            {isLoading ? (
                <p>Ładowanie…</p>
            ) : isError ? (
                <p className="text-red-600">Nie udało się pobrać restauracji.</p>
            ) : data!.length === 0 ? (
                <p className="text-gray-500">Brak restauracji spełniających kryteria.</p>
            ) : (
                <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
                    {data!.map((r) => (
                        <li key={r.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
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
                                    {r.distanceKm !== null && (
                                        <span className="ml-2 flex items-center gap-0.5 text-gray-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {r.distanceKm.toFixed(1)} km
                                        </span>
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