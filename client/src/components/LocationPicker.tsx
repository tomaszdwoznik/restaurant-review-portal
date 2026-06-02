import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { Search, MapPin } from 'lucide-react';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

interface Coords { lat: number; lng: number }

interface Props {
    address: string;
    onAddressChange: (v: string) => void;
    coords: Coords | null;
    onCoordsChange: (c: Coords) => void;
}

function ClickHandler({ onPick }: { onPick: (c: Coords) => void }) {
    useMapEvents({
        click(e) { onPick({ lat: e.latlng.lat, lng: e.latlng.lng }); },
    });
    return null;
}

function Recenter({ coords }: { coords: Coords }) {
    const map = useMap();
    useEffect(() => { map.setView([coords.lat, coords.lng]); }, [coords, map]);
    return null;
}

export default function LocationPicker({ address, onAddressChange, coords, onCoordsChange }: Props) {
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function geocode() {
        if (!address.trim()) return;
        setSearching(true);
        setError(null);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
            );
            const data: { lat: string; lon: string }[] = await res.json();
            if (data.length === 0) {
                setError('Nie znaleziono adresu. Spróbuj dokładniej lub zaznacz punkt na mapie.');
                return;
            }
            onCoordsChange({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        } catch {
            setError('Błąd geokodowania. Spróbuj ponownie.');
        } finally {
            setSearching(false);
        }
    }

    const center: Coords = coords ?? { lat: 50.0617, lng: 19.9373 };

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex gap-2 p-1.5">
                <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                        value={address}
                        onChange={(e) => onAddressChange(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); geocode(); } }}
                        placeholder="np. Rynek Główny 1, Kraków"
                        className="w-full rounded-lg bg-white border border-stone-200 py-2 pl-9 pr-3 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>
                <button type="button" onClick={geocode} disabled={searching}
                    className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50">
                    <Search className="h-4 w-4" /> <span>{searching ? 'Szukam…' : 'Znajdź'}</span>
                </button>
            </div>
            
            {error && <p className="mt-1 px-2 text-xs font-semibold text-rose-600">{error}</p>}

            <div className="mt-1 h-64 w-full relative z-0 border-t border-stone-200 bg-stone-100">
                <MapContainer center={[center.lat, center.lng]} zoom={13} className="h-full w-full">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <ClickHandler onPick={onCoordsChange} />
                    {coords && (
                        <>
                            <Recenter coords={coords} />
                            <Marker
                                position={[coords.lat, coords.lng]}
                                draggable
                                eventHandlers={{
                                    dragend: (e) => {
                                        const m = (e.target as L.Marker).getLatLng();
                                        onCoordsChange({ lat: m.lat, lng: m.lng });
                                    },
                                }}
                            />
                        </>
                    )}
                </MapContainer>
            </div>
            <div className="p-2.5 bg-stone-100/50 border-t border-stone-200">
                <p className="text-xs font-medium text-stone-500 text-center">
                    Wpisz adres i kliknij „Znajdź”, albo zaznacz punkt na mapie. Pinezkę możesz przesuwać.
                </p>
            </div>
        </div>
    );
}