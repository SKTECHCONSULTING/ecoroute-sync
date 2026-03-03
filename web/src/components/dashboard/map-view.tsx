"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Task {
  id: string;
  type: "pickup" | "drop-off";
  lat: number;
  lng: number;
  description: string;
}

interface Trip {
  id: string;
  path: [number, number][];
  driver: string;
}

export default function MapView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    // Mock data for initial implementation
    setTasks([
      { id: "1", type: "pickup", lat: 36.8065, lng: 10.1815, description: "Small package pickup" },
      { id: "2", type: "drop-off", lat: 36.8665, lng: 10.2915, description: "Grocery delivery" },
    ]);
    setTrips([
      { id: "1", driver: "Ahmed", path: [[36.8065, 10.1815], [36.8365, 10.2315], [36.8665, 10.2915]] }
    ]);
  }, []);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer 
        center={[36.8065, 10.1815]} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tasks.map(task => (
          <Marker key={task.id} position={[task.lat, task.lng]}>
            <Popup>
              <div className="font-sans">
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 uppercase ${task.type === 'pickup' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {task.type}
                </span>
                <p className="text-sm">{task.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        {trips.map(trip => (
          <Polyline key={trip.id} positions={trip.path} color="blue" />
        ))}
      </MapContainer>
    </div>
  );
}
