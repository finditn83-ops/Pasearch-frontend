// ==============================
// 🗺️ MapView.jsx — Single Device Tracker
// ==============================
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Create custom marker icon
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapView({ latitude, longitude, imei, address }) {
  const position = [parseFloat(latitude) || 0, parseFloat(longitude) || 0];

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow mt-4">
      <MapContainer
        center={position}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {latitude && longitude && (
          <Marker position={position} icon={markerIcon}>
            <Popup>
              <div className="text-sm">
                <p><strong>IMEI:</strong> {imei}</p>
                <p>{address || "No address available"}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
