import React, { useState } from 'react';
import axios from 'axios';

function CreateAdminPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.post(
        'http://localhost:8080/api/superadmin/create-admin',
        { name, email, password },
        { withCredentials: true }
      );
      setMessage({ type: 'success', text: `Admin ${response.data.name} created!` });
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create admin.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Create New Admin</h1>
      <form onSubmit={handleSubmit} className="max-w-lg bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700">
        {message.text && (
          <p className={`text-sm mb-4 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{message.text}</p>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-400 mb-2" htmlFor="adminName">Admin Name</label>
            <input type="text" id="adminName" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white" required />
          </div>
          <div>
            <label className="block text-zinc-400 mb-2" htmlFor="adminEmail">Admin Email</label>
            <input type="email" id="adminEmail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white" required />
          </div>
          <div>
            <label className="block text-zinc-400 mb-2" htmlFor="adminPassword">Password</label>
            <input type="password" id="adminPassword" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white" required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAdminPage;