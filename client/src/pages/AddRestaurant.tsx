import { useState, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';
import LocationPicker from '../components/LocationPicker';
import { Upload, Plus, AlertCircle } from 'lucide-react';

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
        <div className="mx-auto max-w-xl">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Dodaj nową restaurację</h1>
                <p className="text-stone-500 text-sm mt-1">Wprowadź dane lokalu, aby inni mogli go oceniać.</p>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-900/5">
                <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nazwa restauracji</label>
                    <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="np. Pizzeria Bella Italia"
                        className="w-full rounded-xl bg-stone-50 border border-stone-200 px-4 py-2.5 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Lokalizacja i adres</label>
                    <div className="rounded-xl overflow-hidden border border-stone-200 p-1 bg-stone-50">
                        <LocationPicker
                            address={address}
                            onAddressChange={setAddress}
                            coords={coords}
                            onCoordsChange={setCoords}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Zdjęcie lokalu</label>
                    <div className="mt-1 rounded-xl border border-dashed border-stone-300 p-4 bg-stone-50/50 flex flex-col items-center justify-center text-center">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()} 
                            disabled={uploading}
                            className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-50 transition-colors"
                        >
                            <Upload className="h-4 w-4 text-stone-500" />
                            Wybierz plik graficzny
                        </button>
                        <span className="mt-2 text-xs text-stone-500 max-w-xs truncate">{fileName || 'Nie wybrano żadnego pliku'}</span>
                        
                        {uploading && <p className="mt-2 text-sm text-orange-600 font-medium animate-pulse">Wgrywanie zdjęcia...</p>}
                        {photoUrl && (
                            <div className="mt-4 relative rounded-xl overflow-hidden shadow-inner border border-stone-200 bg-white p-1">
                                <img src={photoUrl} alt="podgląd" className="h-32 w-full object-cover rounded-lg" />
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Rodzaje oferowanego menu</label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 rounded-xl border border-stone-200 p-4 bg-stone-50/50">
                        {menuTypes?.map((m) => {
                            const isChecked = menuIds.includes(m.id);
                            return (
                                <label 
                                    key={m.id} 
                                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm font-medium cursor-pointer transition-all select-none ${
                                        isChecked 
                                            ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-sm' 
                                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                                    }`}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={isChecked} 
                                        onChange={() => toggleMenu(m.id)} 
                                        className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
                                    />
                                    <span>{m.name}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={create.isPending || uploading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 font-semibold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 transition-all disabled:opacity-50"
                >
                    <Plus className="h-5 w-5" />
                    <span>{create.isPending ? 'Dodawanie lokalu…' : 'Dodaj restaurację'}</span>
                </button>
            </form>
        </div>
    );
}