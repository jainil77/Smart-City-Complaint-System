import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// --- Fix for default Leaflet icon ---
// This ensures the marker icons appear correctly in React.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Define a custom red marker icon ---
const redIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/icons/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41], // Point of the icon's shadow
  popupAnchor: [1, -34],  // Point from which the popup should open
  shadowSize: [41, 41]
});

// --- Define the bounding box for Surat ---
// (SouthWest_corner, NorthEast_corner)
const suratBounds = [
  [21.05, 72.7], // SW corner
  [21.3, 72.95], // NE corner
];

/**
 * Renders a full-page map displaying all complaints with coordinates
 * as red markers.
 */
function MapPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all complaints from the public endpoint
        const response = await axios.get('http://localhost:8080/api/complaints');
        
        // Filter out complaints that don't have location data
        const locatedComplaints = response.data.filter(
          c => c.coordinates && c.coordinates.lat && c.coordinates.lng
        );
        setComplaints(locatedComplaints);
      } catch (err) {
        setError('Failed to fetch complaint locations.');
        console.error("Failed to fetch complaint locations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []); // Empty array ensures this runs once on mount

  if (loading) {
    return <p className="p-8 text-center text-zinc-400">Loading complaint locations...</p>;
  }

  if (error) {
    return <p className="p-8 text-center text-red-500">{error}</p>;
  }

  return (
    // Use responsive padding for mobile and desktop
    <div className="max-w-screen-xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Complaints Map</h1>
      
      {/* Map Container */}
      <div className="h-[75vh] w-full rounded-lg border border-zinc-700 overflow-hidden shadow-lg">
        <MapContainer 
          center={[21.1702, 72.8311]} // Center on Surat
          zoom={13} 
          maxBounds={suratBounds}     // Restrict map to Surat
          minZoom={12}                // Don't allow zooming out too far
          className="h-full w-full"
        >
          {/* Base map tiles */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Loop over complaints and drop a red marker for each one */}
          {complaints.map(complaint => (
            <Marker 
              key={complaint._id} 
              position={[complaint.coordinates.lat, complaint.coordinates.lng]}
              icon={redIcon} // Use the custom red icon
            >
              {/* Popup that appears on click */}
              <Popup>
                <div className="text-zinc-800">
                  <strong className="text-base">{complaint.title}</strong>
                  <p className="text-sm my-1">
                    {complaint.description.substring(0, 50)}...
                  </p>
                  <Link 
                    to={`/complaint/${complaint._id}`} 
                    className="text-blue-600 font-bold hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;