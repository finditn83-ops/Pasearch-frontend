import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function LiveMap() {
  const [gps, setGps] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGPS = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/gps/latest`
      );

      const data = await res.json();

      if (data && data.success) {
        setGps(data.data);
      }
    } catch (err) {
      console.error("GPS fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGPS();                   // first load
    const interval = setInterval(fetchGPS, 5000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading live location…
      </div>
    );
  }

  if (!gps) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        No GPS data found.
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <MapContainer
        center={[gps.latitude, gps.longitude]}
        zoom={16}
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Marker */}
        <Marker
          position={[gps.latitude, gps.longitude]}
          icon={markerIcon}
        >
          <Popup>
            <b>Live Device Location</b>
            <br />
            Lat: {gps.latitude}
            <br />
            Lng: {gps.longitude}
            <br />
            Accuracy: {gps.accuracy}m
            <br />
            Updated: {new Date(gps.timestamp).toLocaleString()}
          </Popup>
        </Marker>

        {/* Accuracy Circle */}
        <Circle
          center={[gps.latitude, gps.longitude]}
          radius={gps.accuracy}
          pathOptions={{ color: "blue", fillOpacity: 0.1 }}
        />
      </MapContainer>
    </div>
  );
}
