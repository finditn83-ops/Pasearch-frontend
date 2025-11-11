import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FitBounds({ devices }) {
  const map = useMap();
  useEffect(() => {
    if (devices.length === 0) return;
    const bounds = L.latLngBounds(
      devices.map((d) => [
        parseFloat(d.latitude) || 0,
        parseFloat(d.longitude) || 0,
      ])
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [devices, map]);
  return null;
}

export default function MultiMapView({ devices }) {
  if (!devices || devices.length === 0)
    return <div className="text-center text-gray-500">No tracking data available</div>;

  return (
    <div className="w-full h-[500px] rounded-lg shadow overflow-hidden mt-6">
      <MapContainer
        center={[devices[0]?.latitude || 0, devices[0]?.longitude || 0]}
        zoom={5}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds devices={devices} />
        {devices.map((d, i) => {
          const pos = [
            parseFloat(d.latitude) || 0,
            parseFloat(d.longitude) || 0,
          ];
          const path = (d.pathHistory || []).map((p) => [
            parseFloat(p.latitude),
            parseFloat(p.longitude),
          ]);
          const color =
            d.status === "Recovered"
              ? "green"
              : d.status === "Lost"
              ? "red"
              : "#2563eb";
          return (
            <React.Fragment key={i}>
              {path.length > 1 && (
                <Polyline
                  positions={path}
                  color={color}
                  weight={3}
                  opacity={0.7}
                  dashArray="4"
                />
              )}
              <Marker position={pos} icon={markerIcon}>
                <Popup>
                  <div className="text-sm">
                    <p><strong>IMEI:</strong> {d.imei}</p>
                    <p><strong>Status:</strong> {d.status || "Unknown"}</p>
                    <p><strong>Tracker:</strong> {d.trackerName || "N/A"}</p>
                    <p><strong>Address:</strong> {d.address || "Unknown"}</p>
                    <p><strong>Last Seen:</strong> {d.trackedAt ? new Date(d.trackedAt).toLocaleString() : "N/A"}</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
