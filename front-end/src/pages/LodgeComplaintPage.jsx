import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Make sure to import Leaflet's CSS
// You may also need to fix the default Leaflet icon issue
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * A component to render a clickable marker on the map.
 * It updates its position based on user clicks.
 */
function ClickableMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      // On a map click, update the position in the parent form's state
      setPosition(e.latlng);
      // Fly the map to the new position
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  // Render the marker only if a position has been set
  return position === null ? null : <Marker position={position}></Marker>;
}

/**
 * A page component for lodging a new complaint.
 * Includes fields for title, description, image, and a map-based location picker.
 */
function LodgeComplaintPage() {
  // --- State Management ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null); // Will store { lat, lng }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Event Handlers ---

  // Handles the final form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // FormData is required to send files (images) and text together
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }
    if (location) {
      formData.append('lat', location.lat);
      formData.append('lng', location.lng);
    }

    try {
      await axios.post('http://localhost:8080/api/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      
      // On success, redirect to the homepage
      navigate('/');
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
      console.error('Complaint submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Updates the image state when a file is selected
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // --- JSX Rendering ---
  return (
    // Use smaller padding on mobile (p-4) and larger on desktop (md:p-8)
    <div className="max-w-2xl mx-auto p-4 md:p-8 h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <h1 className="text-3xl font-bold text-white mb-6">Lodge a New Complaint</h1>
      {/* Use smaller padding on the form for mobile (p-4) */}
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-4 md:p-8 rounded-lg shadow-lg border border-zinc-700">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        {/* Title */}
        <div className="mb-4">
          <label className="block text-zinc-400 mb-2" htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <label className="block text-zinc-400 mb-2" htmlFor="description">Description</label>
          <textarea
            id="description"
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        
        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-zinc-400 mb-2" htmlFor="image">Image (Optional)</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
          />
        </div>
        
        {/* Location Picker */}
        <div className="mb-6">
          <label className="block text-zinc-400 mb-2" htmlFor="location">Location (Optional: Click on the map)</label>
          <MapContainer 
            center={[23.0225, 72.5714]} // Default center (Ahmedabad)
            zoom={13} 
            className="h-64 w-full rounded-lg border border-zinc-700"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ClickableMarker position={location} setPosition={setLocation} />
          </MapContainer>
        </div>
        
        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}

export default LodgeComplaintPage;