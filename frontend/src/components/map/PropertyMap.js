'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { useEffect } from 'react';

const MapUpdater = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
};

export default function PropertyMap({ lat, lng }) {
  if (!lat || !lng) return null;
  const center = [lat, lng];

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-gray-300">
      <MapContainer 
        center={center} 
        zoom={15} 
        minZoom={6}
        className="w-full h-full" 
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} />
        <MapUpdater lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
