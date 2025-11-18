import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Hygiene', 'Roads', 'Electricity', 'Water', 'Other'];

function CreateStaffPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [category, setCategory] = useState(CATEGORIES[0]);
  
  // New State for Zone Selection
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  // Fetch Zones on component mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/zones');
        setZones(res.data || []);
        // Set default zone if available
        if (res.data.length > 0) setSelectedZone(res.data[0]._id);
      } catch (error) {
        console.error("Failed to load zones");
      }
    };
    fetchZones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedZone) {
      setMessage({ type: 'error', text: 'Please select a zone for this staff member.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const staffData = {
      name,
      email,
      password,
      role,
      zone: selectedZone, // <--- Include Zone ID
      category: role === 'partner' ? category : null,
    };

    try {
      const response = await axios.post(
        'http://localhost:8080/api/superadmin/create-staff',
        staffData,
        { withCredentials: true }
      );
      setMessage({ type: 'success', text: `${role.toUpperCase()} "${response.data.name}" created successfully!` });
      // Reset Fields
      setName('');
      setEmail('');
      setPassword('');
      setRole('admin');
      // Keep the zone selection as is, convenient for bulk creation
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create staff account.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Create New Staff</h1>
      <form onSubmit={handleSubmit} className="max-w-lg bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700">
        {message.text && (
          <p className={`text-sm mb-4 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{message.text}</p>
        )}
        
        <div className="space-y-4">
          {/* Zone Selection */}
          <div>
            <label className="block text-zinc-400 mb-2">Assign Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 outline-none"
              required
            >
              <option value="">-- Select Zone --</option>
              {zones.map(z => (
                <option key={z._id} value={z._id}>{z.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 outline-none"
              >
                <option value="admin">Admin</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            
            {/* Conditional Category for Partners */}
            {role === 'partner' && (
              <div>
                <label className="block text-zinc-400 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-zinc-400 mb-2">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 outline-none" required />
          </div>
          
          <div>
            <label className="block text-zinc-400 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 outline-none" required />
          </div>
          
          <div>
            <label className="block text-zinc-400 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:border-purple-500 outline-none" required minLength={6} />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors">
            {loading ? 'Creating...' : 'Create Staff Account'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateStaffPage;