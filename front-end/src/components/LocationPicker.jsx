import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// This component will update the marker's position when the map is clicked
function ClickableMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      // On click, update the position in the parent component
      setPosition(e.latlng); 
      map.flyTo(e.latlng, map.getZoom()); // Center the map on the new marker
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

function LocationPicker({ onLocationChange }) {
  const [position, setPosition] = useState(null); // Default position (e.g., center of your city)

  const handlePositionChange = (latlng) => {
    setPosition(latlng);
    onLocationChange(latlng); // Pass the lat/lng object up to the parent form
  };

  return (
    <MapContainer 
      center={[23.0225, 72.5714]} // Default center (Ahmedabad, you can change this)
      zoom={13} 
      className="h-64 w-full rounded-lg border border-zinc-700"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <ClickableMarker position={position} setPosition={handlePositionChange} />
    </MapContainer>
  );
}

export default LocationPicker;