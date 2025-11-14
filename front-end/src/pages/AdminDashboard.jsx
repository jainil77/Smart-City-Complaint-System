import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Import your new modal component
import AssignComplaintModal from '../components/AssignComplaintModal'; // Make sure this path is correct

// --- Constants ---
const CATEGORIES = ['All', 'Hygiene', 'Roads', 'Electricity', 'Water', 'Other', 'Pending Classification'];
const STATUSES = ['All', 'Pending', 'Admin Accepted', 'Assigned', 'In Process', 'Resolved', 'Rejected'];

/**
 * Renders the Admin Dashboard for managing complaints.
 */
function AdminDashboard() {
  // --- State ---
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // --- Data Fetching ---
  const fetchAllComplaints = useCallback(async () => {
    setLoading(prev => prev ? true : false); 
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/admin/complaints/all', {
        withCredentials: true,
      });
      setAllComplaints(response.data || []);
    } catch (err) {
      setError('Failed to fetch complaints. Ensure you are logged in as an admin.');
      console.error('Error fetching admin complaints:', err);
      setAllComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch complaints on component mount
  useEffect(() => {
    fetchAllComplaints();
  }, [fetchAllComplaints]);

  // --- Filtering Logic ---
  const filteredComplaints = useMemo(() => {
    return allComplaints.filter(complaint => {
      const categoryMatch = selectedCategory === 'All' || (complaint.category || 'Pending Classification') === selectedCategory;
      const statusMatch = selectedStatus === 'All' || complaint.status === selectedStatus;
      return categoryMatch && statusMatch;
    });
  }, [allComplaints, selectedCategory, selectedStatus]);


  // --- Modal Handlers ---
  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
  };

  /**
   * !! --- THIS IS THE FIX --- !!
   * This function is passed to your modal as `onAssignSuccess`.
   * When your modal calls it, this function runs.
   */
  const handleAssignSuccess = () => {
    handleCloseModal();     // 1. Close the modal
    fetchAllComplaints(); // 2. Re-fetch all complaints to get fresh data
  };

  // --- Event Handlers ---
  const handleStatusChange = useCallback(async (id, newStatus) => {
    if (newStatus === 'Assigned') {
      const complaintToAssign = allComplaints.find(c => c._id === id);
      if (complaintToAssign) {
        handleOpenModal(complaintToAssign);
      }
      fetchAllComplaints(); 
      return;
    }
    
    // ... (rest of your status change logic) ...
    const originalComplaints = [...allComplaints];
    setAllComplaints(prevComplaints =>
      prevComplaints.map(complaint =>
        complaint._id === id ? { ...complaint, status: newStatus } : complaint
      )
    );
    try {
      await axios.patch(`http://localhost:8080/api/admin/complaints/${id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
    } catch (err) {
      console.error('Error updating status:', err);
      setAllComplaints(originalComplaints); // Revert on error
    }
  }, [allComplaints, fetchAllComplaints]);

  // --- Rendering ---

  const renderComplaintTable = () => {
    if (filteredComplaints.length === 0) {
      return <p className="text-zinc-400 text-center mt-4">No complaints match the current filters.</p>;
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-700 shadow-md mt-6">
        <table className="min-w-full bg-zinc-900">
          {/* ... (Your <thead>) ... */}
           <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Title</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Category</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Author</th>
              {/* <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Assigned To</th> */}
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Location</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {filteredComplaints.map((complaint) => (
              <tr key={complaint._id} className="hover:bg-zinc-800">
                <td className="p-3 text-sm text-white whitespace-nowrap">
                  <Link to={`/complaint/${complaint._id}`} className="hover:underline" title={complaint.title}>
                    {complaint.title.length > 30 ? `${complaint.title.substring(0, 30)}...` : complaint.title}
                  </Link>
                </td>
                <td className="p-3 text-sm text-zinc-300 whitespace-nowrap">{complaint.category || 'N/A'}</td>
                <td className="p-3 text-sm text-zinc-300 whitespace-nowrap">{complaint.author?.anonymousName || 'N/A'}</td>
                {/* <td className="p-3 text-sm text-zinc-300 whitespace-nowrap">
                  {complaint.assignedTo?.name || <span className="text-zinc-500">Unassigned</span>}
                </td> */}
                <td className="p-3 text-sm text-zinc-400 whitespace-nowrap">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-sm text-zinc-300 whitespace-nowrap">
                  {complaint.coordinates && complaint.coordinates.lat ? (
                    <a
                      href={`https://www.google.com/maps?q=${complaint.coordinates.lat},${complaint.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      <FaMapMarkerAlt />
                      View on Map
                    </a>
                  ) : (
                    <span className="text-zinc-500">No Location</span>
                  )}
                </td>
                <td className="p-3 text-sm text-white whitespace-nowrap">{complaint.status}</td>
                <td className="p-3 text-sm text-white whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                      className="bg-zinc-800 border border-zinc-600 rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {STATUSES.slice(1).filter(s => s !== 'Assigned').map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    {(complaint.status === 'Pending' || complaint.status === 'Admin Accepted') && (
                      <button
                        onClick={() => handleOpenModal(complaint)}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors"
                        title="Assign to a Partner"
                      >
                        Assign
                      </button>
                    )}
                  </div>
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
      <h1 className="text-3xl font-bold text-white mb-6">Complaints Dashboard</h1>

      {/* ... (Your Filter Buttons) ... */}
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

      {/* !! --- THIS IS THE FIX --- !!
        We pass the `handleAssignSuccess` function from this component
        to your modal's `onAssignSuccess` prop.
      */}
      {isModalOpen && (
        <AssignComplaintModal
          complaint={selectedComplaint}
          onClose={handleCloseModal}
          onAssignSuccess={handleAssignSuccess} 
        />
      )}
      
    </div>
  );
}

export default AdminDashboard;