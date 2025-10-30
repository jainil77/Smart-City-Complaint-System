import React, { useState } from 'react';
import axios from 'axios';

function AddLocationPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.post(
        'http://localhost:8080/api/superadmin/locations',
        { name },
        { withCredentials: true }
      );
      setMessage({ type: 'success', text: `Location "${response.data.name}" added!` });
      setName('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add location.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Add New Location</h1>
      <form onSubmit={handleSubmit} className="max-w-lg bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700">
        {message.text && (
          <p className={`text-sm mb-4 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{message.text}</p>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 mb-2" htmlFor="locationName">Location Name (e.g., "Ward 10")</label>
            <input type="text" id="locationName" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Location'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddLocationPage;