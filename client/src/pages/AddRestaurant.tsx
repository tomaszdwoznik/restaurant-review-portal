import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface MenuType {
    id: string;
    name: string;
}

export default function AddRestaurant() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('50.0617');
    const [longitude, setLongitude] = useState('19.9373');
    const [photoUrl, setPhotoUrl] = useState('');
    const [menuIds, setMenuIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { data: menuTypes } = useQuery({
        queryKey: ['menu-types'],
        queryFn: async () => {
            const res = await api.get<{ menuTypes: MenuType[] }>('/menu-types');
            return res.data.menuTypes;
        },
    });

    const create = useMutation({
        mutationFn: () =>
            api.post('/restaurants', {
                name: name.trim(),
                address: address.trim(),
                latitude: Number(latitude),
                longitude: Number(longitude),
                photoUrl: photoUrl.trim() || undefined,
                menuTypeIds: menuIds,
            }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
            navigate(`/restaurants/${res.data.restaurant.id}`);
        },
        onError: (e: any) => setError(e.response?.data?.error ?? 'Nie udało się dodać restauracji'),
    });

    function toggleMenu(id: string) {
        setMenuIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
    }

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        if (!name.trim() || !address.trim()) { setError('Podaj nazwę i adres.'); return; }
        if (menuIds.length === 0) { setError('Wybierz co najmniej jeden rodzaj menu.'); return; }
        create.mutate();
    }

    return (
        <div className="mx-auto max-w-lg">
            <h1 className="mb-4 text-2xl font-bold">Dodaj restaurację</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nazwa"
                    className="w-full rounded border px-3 py-2" />
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adres"
                    className="w-full rounded border px-3 py-2" />

                <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm">
                        Szerokość (lat)
                        <input value={latitude} onChange={(e) => setLatitude(e.target.value)} type="number" step="any"
                            className="mt-1 w-full rounded border px-3 py-2" />
                    </label>
                    <label className="text-sm">
                        Długość (lng)
                        <input value={longitude} onChange={(e) => setLongitude(e.target.value)} type="number" step="any"
                            className="mt-1 w-full rounded border px-3 py-2" />
                    </label>
                </div>

                <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="URL zdjęcia (opcjonalnie)"
                    className="w-full rounded border px-3 py-2" />

                <fieldset className="rounded border p-3">
                    <legend className="px-1 text-sm font-medium">Rodzaje menu</legend>
                    <div className="flex flex-wrap gap-3">
                        {menuTypes?.map((m) => (
                            <label key={m.id} className="flex items-center gap-1 text-sm">
                                <input type="checkbox" checked={menuIds.includes(m.id)} onChange={() => toggleMenu(m.id)} />
                                {m.name}
                            </label>
                        ))}
                    </div>
                </fieldset>

                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={create.isPending}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                    {create.isPending ? 'Dodawanie…' : 'Dodaj restaurację'}
                </button>
            </form>
        </div>
    );
}