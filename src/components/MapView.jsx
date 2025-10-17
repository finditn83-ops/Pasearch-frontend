import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const MapView = ({ latitude, longitude, imei, address }) => {
  const position = [parseFloat(latitude) || 0, parseFloat(longitude) || 0];
  const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow">
      <MapContainer
        center={position}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {latitude && longitude && (
          <Marker position={position} icon={markerIcon}>
            <Popup>
              <strong>IMEI:</strong> {imei}
              <br />
              {address || "No address available"}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
