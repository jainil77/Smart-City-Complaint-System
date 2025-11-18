import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 
import { FaCamera, FaMapMarkerAlt } from 'react-icons/fa';

const CATEGORIES = ['Roads', 'Water', 'Electricity', 'Hygiene', 'Other'];

function LodgeComplaint() {
  const navigate = useNavigate();
  
  // --- Form State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // --- Data State ---
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingZones, setFetchingZones] = useState(true);

  // 1. Fetch Zones on Mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/zones');
        setZones(res.data || []);
      } catch (error) {
        console.error("Failed to load zones", error);
        toast.error("Could not load city zones.");
      } finally {
        setFetchingZones(false);
      }
    };
    fetchZones();
  }, []);

  // 2. Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 3. Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !category || !selectedZone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('zone', selectedZone);
      formData.append('address', address);

      if (image) {
        formData.append('image', image);
      }

      await axios.post('http://localhost:8080/api/complaints', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success("Complaint submitted successfully!");
      navigate('/my-complaints'); 
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to lodge complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- FIX IS HERE: Changed layout to allow scrolling ---
    <div className="h-screen bg-black overflow-y-auto p-6 flex justify-center items-start pt-10 pb-20">
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-2xl shadow-2xl mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Lodge a Complaint</h1>
        <p className="text-zinc-400 mb-8">Report an issue in your area to the city council.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Complaint Title</label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., Deep pothole on Main St."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Category & Zone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Category</label>
              <select 
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Zone / Ward</label>
              <select 
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                disabled={fetchingZones}
              >
                <option value="">{fetchingZones ? "Loading Zones..." : "Select Zone"}</option>
                {zones.map(zone => (
                  <option key={zone._id} value={zone._id}>{zone.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
            <textarea 
              rows="4"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Address (Manual) */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <FaMapMarkerAlt /> Address / Location
            </label>
            <textarea
              rows="2"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., Near Central Park Gate 2, 123 Green Avenue"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Upload Evidence (Optional)</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-2 px-4 rounded-lg transition-colors">
                <FaCamera />
                <span>Choose File</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-zinc-600" />
              )}
              {image && <span className="text-xs text-zinc-500">{image.name}</span>}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Lodge Complaint'}
          </button>

        </form>
      </div>
    </div>
  );
}

export default LodgeComplaint;