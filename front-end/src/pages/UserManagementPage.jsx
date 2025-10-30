import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

/**
 * Renders the Super Admin's User Management page.
 * Fetches and displays a list of all non-superadmin users.
 * Allows for role changes and blocking/unblocking users.
 */
function UserManagementPage() {
  // --- State ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Data Fetching ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/superadmin/users', {
        withCredentials: true,
      });
      setUsers(response.data || []);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Event Handlers ---

  // Toggles the 'isBlocked' status of a user
  const handleToggleBlock = useCallback(async (userId, isCurrentlyBlocked) => {
    // Keep a copy of the original state to revert on error
    const originalUsers = [...users];
    
    // Optimistic UI update
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === userId ? { ...user, isBlocked: !isCurrentlyBlocked } : user
      )
    );

    try {
      await axios.patch(`http://localhost:8080/api/admin/users/${userId}/block`, {}, {
        withCredentials: true,
      });
    } catch (err) {
      alert(`Failed to ${isCurrentlyBlocked ? 'unblock' : 'block'} user.`);
      console.error('Error toggling block status:', err);
      setUsers(originalUsers); // Revert UI on error
    }
  }, [users]);

  // Changes the role of a user
  const handleRoleChange = useCallback(async (userId, newRole) => {
    const originalUsers = [...users];
    
    // Optimistic UI update
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === userId ? { ...user, role: newRole } : user
      )
    );

    try {
      await axios.patch(
        `http://localhost:8080/api/superadmin/users/${userId}/role`,
        { role: newRole },
        { withCredentials: true }
      );
    } catch (err) {
      alert('Failed to update role. Please try again.');
      console.error('Failed to update role:', err);
      setUsers(originalUsers); // Revert UI on error
    }
  }, [users]);

  // --- Render Logic ---

  if (loading) {
    return <p className="text-zinc-400">Loading users...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>
      <div className="overflow-x-auto rounded-lg border border-zinc-700 shadow-md">
        <table className="min-w-full bg-zinc-900">
          <thead className="bg-zinc-800">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">User</th>
              <th className="p-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="p-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</th>
              <th className="p-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-800">
                  {/* User Info & Link to their complaints */}
                  <td className="p-3 text-sm text-white">
                    <Link to={`/superadmin/users/${user._id}`} className="hover:underline">
                      <div>{user.anonymousName || user.name}</div>
                      <div className="text-xs text-zinc-400">{user.email}</div>
                    </Link>
                  </td>
                  
                  {/* Blocked Status */}
                  <td className="p-3 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isBlocked ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                    }`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  
                  {/* Role Selector */}
                  <td className="p-3 text-sm">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="w-full bg-zinc-700 text-white text-xs rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  
                  {/* Block/Unblock Button */}
                  <td className="p-3 text-sm">
                    <button
                      onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                      className={`font-bold py-1 px-3 rounded-md text-xs transition-colors ${
                        user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-zinc-400">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagementPage;