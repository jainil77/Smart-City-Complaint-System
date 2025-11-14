import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define the categories, matching your schema
const CATEGORIES = ['Hygiene', 'Roads', 'Electricity', 'Water', 'Other'];

function CreateStaffPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin'); // Default role
  const [category, setCategory] = useState(CATEGORIES[0]); // Default category
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const staffData = {
      name,
      email,
      password,
      role,
      // Only send the category if the role is 'partner'
      category: role === 'partner' ? category : null,
    };

    try {
      const response = await axios.post(
        'http://localhost:8080/api/superadmin/create-staff',
        staffData,
        { withCredentials: true }
      );
      setMessage({ type: 'success', text: `Staff account "${response.data.name}" created successfully!` });
      // Clear the form
      setName('');
      setEmail('');
      setPassword('');
      setRole('admin');
      setCategory(CATEGORIES[0]);
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
          <div>
            <label className="block text-zinc-400 mb-2" htmlFor="staffName">Name</label>
            <input type="text" id="staffName" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white" required />
          </div>
          
          <div>
            <label className="block text-zinc-400 mb-2" htmlFor="staffEmail">Email</label>
            <input type="email" id="staffEmail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white" required />
          </div>
          
          <div>
            <label className="block text-zinc-400 mb-2" htmlFor="staffPassword">Password</label>
            <input type="password" id="staffPassword" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white" required minLength={6} />
          </div>
          
          <div>
            <label className="block text-zinc-400 mb-2" htmlFor="staffRole">Role</label>
            <select
              id="staffRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white"
            >
              <option value="admin">Admin</option>
              <option value="partner">Partner</option>
            </select>
          </div>
          
          {/* Conditional Category Dropdown */}
          {role === 'partner' && (
            <div>
              <label className="block text-zinc-400 mb-2" htmlFor="staffCategory">Partner Category</label>
              <select
                id="staffCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Staff Account'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateStaffPage;