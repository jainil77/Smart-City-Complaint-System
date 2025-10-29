import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all regular users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/admin/users', {
        withCredentials: true,
      });
      setUsers(response.data || []);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle toggling the block status
  const handleToggleBlock = useCallback(async (userId, isCurrentlyBlocked) => {
    // Optimistic UI update
    const originalUsers = [...users];
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === userId ? { ...user, isBlocked: !isCurrentlyBlocked } : user
      )
    );

    try {
      await axios.patch(`http://localhost:8080/api/admin/users/${userId}/block`, {}, {
        withCredentials: true,
      });
      // Success - no need to do anything as UI is already updated
    } catch (err) {
      alert(`Failed to ${isCurrentlyBlocked ? 'unblock' : 'block'} user.`);
      console.error('Error toggling block status:', err);
      setUsers(originalUsers); // Revert UI on error
    }
  }, [users]);

  // Render the list of users
  const renderUserTable = () => {
    if (users.length === 0) {
      return <p className="text-zinc-400 text-center mt-4">No regular users found.</p>;
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-700 shadow-md mt-6">
        <table className="min-w-full bg-zinc-900">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Name</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-zinc-800">
                <td className="p-3 text-sm text-white whitespace-nowrap">{user.anonymousName || user.name}</td>
                <td className="p-3 text-sm text-zinc-300 whitespace-nowrap">{user.email}</td>
                <td className="p-3 text-sm whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isBlocked ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                  }`}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="p-3 text-sm text-white whitespace-nowrap">
                  <button
                    onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                    className={`font-bold py-1 px-3 rounded-md text-xs ${
                      user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {user.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>
      {loading && <p className="text-center text-zinc-400 mt-4">Loading users...</p>}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      {!loading && !error && renderUserTable()}
    </div>
  );
}

export default UserManagementPage;