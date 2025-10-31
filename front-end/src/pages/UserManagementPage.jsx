import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 👈 1. Import useAuth

/**
 * Renders the User Management page for both Admins and Super Admins.
 * It dynamically fetches and manages users based on the logged-in user's role.
 */
function UserManagementPage() {
  // --- State ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // 👈 2. Get the logged-in user

  // --- Data Fetching ---
  const fetchUsers = useCallback(async () => {
    if (!user) return; // Wait until the user object is available

    setLoading(true);
    setError('');

    // 👈 3. Determine the correct API endpoint based on user's role
    const endpoint = user.role === 'superadmin' 
      ? 'http://localhost:8080/api/superadmin/users' 
      : 'http://localhost:8080/api/admin/users';

    try {
      const response = await axios.get(endpoint, { withCredentials: true });
      setUsers(response.data || []);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [user]); // 👈 4. Add 'user' as a dependency

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Event Handlers ---

  const handleToggleBlock = useCallback(async (userId, isCurrentlyBlocked) => {
    if (!user) return;

    // This API route is shared by both Admin and Super Admin (based on our middleware fix)
    const endpoint = `http://localhost:8080/api/admin/users/${userId}/block`;
    
    const originalUsers = [...users];
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u._id === userId ? { ...u, isBlocked: !isCurrentlyBlocked } : u
      )
    );

    try {
      await axios.patch(endpoint, {}, { withCredentials: true });
    } catch (err) {
      alert(`Failed to ${isCurrentlyBlocked ? 'unblock' : 'block'} user.`);
      console.error('Error toggling block status:', err);
      setUsers(originalUsers);
    }
  }, [user, users]);

  const handleRoleChange = useCallback(async (userId, newRole) => {
    if (!user || user.role !== 'superadmin') return; // Only Super Admins can change roles

    const endpoint = `http://localhost:8080/api/superadmin/users/${userId}/role`;
    
    const originalUsers = [...users];
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u._id === userId ? { ...u, role: newRole } : u
      )
    );

    try {
      await axios.patch(endpoint, { role: newRole }, { withCredentials: true });
    } catch (err) {
      alert('Failed to update role. Please try again.');
      console.error('Failed to update role:', err);
      setUsers(originalUsers);
    }
  }, [user, users]);

  // --- Render Logic ---

  if (loading) return <p className="text-zinc-400">Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>
      <div className="overflow-x-auto rounded-lg border border-zinc-700 shadow-md">
        <table className="min-w-full bg-zinc-900">
          <thead className="bg-zinc-800">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">User</th>
              <th className="p-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              {/* Only show Role column if Super Admin */}
              {user.role === 'superadmin' && (
                <th className="p-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</th>
              )}
              <th className="p-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-zinc-800">
                  {/* User Info & Link to their complaints (for Super Admin) */}
                  <td className="p-3 text-sm text-white">
                    {user.role === 'superadmin' ? (
                      <Link to={`/superadmin/users/${u._id}`} className="hover:underline">
                        <div>{u.anonymousName || u.name}</div>
                        <div className="text-xs text-zinc-400">{u.email}</div>
                      </Link>
                    ) : (
                      <div>
                        <div>{u.anonymousName || u.name}</div>
                        <div className="text-xs text-zinc-400">{u.email}</div>
                      </div>
                    )}
                  </td>
                  
                  {/* Blocked Status */}
                  <td className="p-3 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.isBlocked ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                    }`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  
                  {/* Role Selector (Super Admin only) */}
                  {user.role === 'superadmin' && (
                    <td className="p-3 text-sm">
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="w-full bg-zinc-700 text-white text-xs rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  )}
                  
                  {/* Block/Unblock Button */}
                  <td className="p-3 text-sm">
                    <button
                      onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                      className={`font-bold py-1 px-3 rounded-md text-xs transition-colors ${
                        u.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={user.role === 'superadmin' ? 4 : 3} className="p-4 text-center text-zinc-400">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagementPage;