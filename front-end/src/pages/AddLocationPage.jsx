import React, { useState } from 'react';
import axios from 'axios';

function AddLocationPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState(''); // Added description field
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      // Changed endpoint to /api/superadmin/zones
      const response = await axios.post(
        'http://localhost:8080/api/superadmin/zones',
        { name, description },
        { withCredentials: true }
      );
      setMessage({ type: 'success', text: `Zone "${response.data.name}" created successfully!` });
      setName('');
      setDescription('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create zone.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Add New Zone</h1>
      <form onSubmit={handleSubmit} className="max-w-lg bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700">
        {message.text && (
          <p className={`text-sm mb-4 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{message.text}</p>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 mb-2" htmlFor="zoneName">Zone Name</label>
            <input 
              type="text" 
              id="zoneName" 
              placeholder='e.g., "North Zone", "Ward 10"'
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 outline-none" 
              required 
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-2" htmlFor="zoneDesc">Description (Optional)</label>
            <textarea 
              id="zoneDesc" 
              rows="2"
              placeholder="Details about this zone..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 outline-none" 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors">
            {loading ? 'Creating...' : 'Create Zone'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddLocationPage;