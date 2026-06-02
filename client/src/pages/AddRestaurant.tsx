import { useState, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';
import LocationPicker from '../components/LocationPicker';

interface MenuType { id: string; name: string }

export default function AddRestaurant() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [photoUrl, setPhotoUrl] = useState('');
    const [menuIds, setMenuIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: menuTypes } = useQuery({
        queryKey: ['menu-types'],
        queryFn: async () => (await api.get<{ menuTypes: MenuType[] }>('/menu-types')).data.menuTypes,
    });

    const create = useMutation({
        mutationFn: () =>
            api.post('/restaurants', {
                name: name.trim(),
                address: address.trim(),
                latitude: coords!.lat,
                longitude: coords!.lng,
                photoUrl: photoUrl.trim() || undefined,
                menuTypeIds: menuIds,
            }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
            toast.success('Dodano restaurację');
            navigate(`/restaurants/${res.data.restaurant.id}`);
        },
        onError: (e: any) => {
            const msg = e.response?.data?.error ?? 'Nie udało się dodać restauracji';
            setError(msg);
            toast.error(msg);
        },
    });

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setUploading(true);
        setError(null);
        try {
            const form = new FormData();
            form.append('photo', file);
            const res = await api.post<{ url: string }>('/upload', form);
            setPhotoUrl(res.data.url);
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'Nie udało się wgrać zdjęcia');
        } finally {
            setUploading(false);
        }
    }

    function toggleMenu(id: string) {
        setMenuIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
    }

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        if (!name.trim()) { setError('Podaj nazwę.'); return; }
        if (!address.trim() || !coords) { setError('Podaj adres i zaznacz lokalizację na mapie.'); return; }
        if (menuIds.length === 0) { setError('Wybierz co najmniej jeden rodzaj menu.'); return; }
        create.mutate();
    }

    return (
        <div className="mx-auto max-w-lg">
            <h1 className="mb-4 text-2xl font-bold">Dodaj restaurację</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nazwa"
                    className="w-full rounded border px-3 py-2" />

                <LocationPicker
                    address={address}
                    onAddressChange={setAddress}
                    coords={coords}
                    onCoordsChange={setCoords}
                />

                <div>
                    <label className="block text-sm font-medium">Zdjęcie (opcjonalnie)</label>
                    <div className="mt-1 flex items-center gap-3">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile}
                            disabled={uploading} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                            className="rounded border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50">
                            Wybierz zdjęcie
                        </button>
                        <span className="text-sm text-gray-500">{fileName || 'Nie wybrano pliku'}</span>
                    </div>
                    {uploading && <p className="mt-1 text-sm text-gray-500">Wgrywanie…</p>}
                    {photoUrl && <img src={photoUrl} alt="podgląd" className="mt-2 h-32 rounded object-cover" />}
                </div>

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
                <button type="submit" disabled={create.isPending || uploading}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                    {create.isPending ? 'Dodawanie…' : 'Dodaj restaurację'}
                </button>
            </form>
        </div>
    );
}