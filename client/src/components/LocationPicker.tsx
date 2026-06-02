import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { Search } from 'lucide-react';

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
        <div>
            <label className="block text-sm font-medium">Adres</label>
            <div className="mt-1 flex gap-2">
                <input
                    value={address}
                    onChange={(e) => onAddressChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); geocode(); } }}
                    placeholder="np. Rynek Główny 1, Kraków"
                    className="flex-1 rounded border px-3 py-2"
                />
                <button type="button" onClick={geocode} disabled={searching}
                    className="flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                    <Search className="h-4 w-4" /> {searching ? 'Szukam…' : 'Znajdź'}
                </button>
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

            <div className="mt-2 h-64 overflow-hidden rounded border">
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
            <p className="mt-1 text-xs text-gray-500">
                Wpisz adres i kliknij „Znajdź", albo zaznacz punkt na mapie. Pinezkę możesz przeciągnąć.
            </p>
        </div>
    );
}