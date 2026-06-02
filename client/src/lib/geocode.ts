export interface Coords { lat: number; lng: number }

export async function geocodeAddress(address: string): Promise<Coords | null> {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
    );
    const data: { lat: string; lon: string }[] = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}