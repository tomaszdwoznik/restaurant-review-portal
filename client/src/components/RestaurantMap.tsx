import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
    latitude: number;
    longitude: number;
    name: string;
}

export default function RestaurantMap({ latitude, longitude, name }: Props) {
    return (
        <div className="h-64 w-full relative z-0 bg-stone-100">
            <MapContainer
                center={[latitude, longitude]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[latitude, longitude]}>
                    <Popup>
                        <span className="font-bold text-stone-900">{name}</span>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}