import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Define potential complaint categories (Update these based on your actual categories)
const CATEGORIES = ['All', 'Hygiene', 'Roads', 'Electricity', 'Water', 'Other'];
// Define the allowed complaint statuses from your backend model
const STATUSES = ['All', 'Pending', 'Admin Accepted', 'In Progress', 'Resolved', 'Rejected'];

/**
 * Renders the Admin Dashboard for managing complaints.
 * Displays complaints filtered by category and status, and allows status updates.
 */
function AdminDashboard() {
  // --- State ---
  const [allComplaints, setAllComplaints] = useState([]); // Stores all fetched complaints
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); // Current category filter
  const [selectedStatus, setSelectedStatus] = useState('All');     // Current status filter

  // --- Data Fetching ---
  const fetchAllComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/admin/complaints/all', {
        withCredentials: true, // Necessary for protected admin route
      });
      setAllComplaints(response.data || []); // Ensure it's always an array
    } catch (err) {
      setError('Failed to fetch complaints. Ensure you are logged in as an admin.');
      console.error('Error fetching admin complaints:', err);
      setAllComplaints([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array, fetch only once

  // Fetch complaints when the component mounts
  useEffect(() => {
    fetchAllComplaints();
  }, [fetchAllComplaints]);

  // --- Filtering Logic ---
  // useMemo recalculates filteredComplaints only when dependencies change
  const filteredComplaints = useMemo(() => {
    return allComplaints.filter(complaint => {
      // Assuming complaint object has a 'category' field populated by AI/Backend
      const categoryMatch = selectedCategory === 'All' || (complaint.category || 'Other') === selectedCategory; 
      const statusMatch = selectedStatus === 'All' || complaint.status === selectedStatus;
      return categoryMatch && statusMatch;
    });
  }, [allComplaints, selectedCategory, selectedStatus]);

  // --- Event Handlers ---
  const handleStatusChange = useCallback(async (id, newStatus) => {
    // Optimistic UI Update: Update local state first for responsiveness
    const originalComplaints = [...allComplaints]; // Keep a copy to revert on error
    setAllComplaints(prevComplaints =>
      prevComplaints.map(complaint =>
        complaint._id === id ? { ...complaint, status: newStatus } : complaint
      )
    );

    try {
      // Send the update request to the backend
      await axios.patch(`http://localhost:8080/api/admin/complaints/${id}/status`, 
        { status: newStatus },
        { withCredentials: true }
      );
      // No need to refetch, optimistic update is usually sufficient
    } catch (err) {
      alert('Failed to update status. Please try again.');
      console.error('Error updating status:', err);
      // Revert the local state if the API call fails
      setAllComplaints(originalComplaints); 
    }
  }, [allComplaints]); // Dependency includes allComplaints for the revert logic

  // --- Rendering ---

  // Renders the table of complaints
  const renderComplaintTable = () => {
    if (filteredComplaints.length === 0) {
      return <p className="text-zinc-400 text-center mt-4">No complaints match the current filters.</p>;
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-700 shadow-md mt-6">
        <table className="min-w-full bg-zinc-900">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Title</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Category</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Author</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {filteredComplaints.map((complaint) => (
              <tr key={complaint._id} className="hover:bg-zinc-800">
                <td className="p-3 text-sm text-white whitespace-nowrap">
                  <Link to={`/complaint/${complaint._id}`} className="hover:underline" title={complaint.title}>
                    {/* Truncate long titles */}
                    {complaint.title.length > 30 ? `${complaint.title.substring(0, 30)}...` : complaint.title}
                  </Link>
                </td>
                <td className="p-3 text-sm text-zinc-300 whitespace-nowrap">{complaint.category || 'N/A'}</td>
                <td className="p-3 text-sm text-zinc-300 whitespace-nowrap">{complaint.author?.anonymousName || 'N/A'}</td>
                <td className="p-3 text-sm text-zinc-400 whitespace-nowrap">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-sm text-white whitespace-nowrap">{complaint.status}</td>
                <td className="p-3 text-sm text-white whitespace-nowrap">
                  <select
                    value={complaint.status}
                    // Pass complaint ID and the selected value to the handler
                    onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                    className="bg-zinc-800 border border-zinc-600 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {STATUSES.slice(1).map(status => ( // Use slice(1) if you don't want 'All' in the dropdown
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    // Main container for the dashboard page content
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Complaints Dashboard</h1>

      {/* Category Filter Buttons */}
      <div className="mb-4">
        <span className="text-sm font-semibold text-zinc-400 mr-3">Filter by Category:</span>
        <div className="inline-flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                selectedCategory === category ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Status Filter Buttons */}
      <div className="mb-6">
       <span className="text-sm font-semibold text-zinc-400 mr-3">Filter by Status:</span>
        <div className="inline-flex flex-wrap gap-2">
           {STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === status ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Render Table or Loading/Error State */}
      {loading && <p className="text-center text-zinc-400 mt-4">Loading complaints...</p>}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      {!loading && !error && renderComplaintTable()}
    </div>
  );
}

export default AdminDashboard;