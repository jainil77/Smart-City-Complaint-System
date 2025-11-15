import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

// --- Inline SVG Icon ---
const MapMarkerIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67a24 24 0 0 1-35.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
  </svg>
);

// --- Feedback Modal Component ---
function ResolveComplaintModal({ complaint, onClose, onSubmit }) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (feedback.trim().length < 10) {
      setError('Please provide a detailed resolution note (min 10 characters).');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // Call the parent's submit handler
      await onSubmit(complaint._id, feedback);
      // On success, the parent will close the modal
    } catch (err) {
      // The parent will re-throw the error, which we catch here
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">Resolve Complaint</h3>
        <p className="text-sm text-zinc-400 mb-1">
          <strong>Title:</strong> {complaint.title}
        </p>
        <p className="text-sm text-zinc-400 mb-6">
          <strong>Category:</strong> {complaint.category}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="feedback" className="block text-sm font-medium text-zinc-300 mb-2">
            Resolution Notes
          </label>
          <textarea
            id="feedback"
            rows="5"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full rounded-md border-zinc-600 bg-zinc-800 p-2.5 text-white focus:border-purple-500 focus:ring-purple-500"
            placeholder="Describe how the complaint was resolved..."
          />
          
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg text-sm font-semibold hover:bg-zinc-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || feedback.trim().length < 10}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Resolution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Partner Dashboard Component ---
function PartnerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [originalComplaints, setOriginalComplaints] = useState([]); // For reverting on error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('New');
  const [modalState, setModalState] = useState({ isOpen: false, complaint: null });

  const filters = [
    { name: 'New', status: 'Assigned' },
    { name: 'Active', status: 'In Process' },
    { name: 'Completed', status: 'Resolved' },
  ];

  // --- Data Fetching ---
  const fetchMyComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/partner/complaints', {
        withCredentials: true,
      });
      setComplaints(response.data || []);
      setOriginalComplaints(response.data || []); // Save a backup
    } catch (err) {
      console.error('Error fetching partner complaints:', err);
      setError('Failed to fetch assigned complaints.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyComplaints();
  }, [fetchMyComplaints]);

  // --- Memoized Filtering ---
  const filteredComplaints = useMemo(() => {
    const activeStatus = filters.find(f => f.name === filter)?.status;
    return complaints.filter(c => c.status === activeStatus);
  }, [complaints, filter, filters]); 

  // --- CORRECTED OPTIMISTIC UPDATES FOR ALL ACTIONS ---

  // 1. Handle Accept
  const handleAccept = async (id) => {
    setError('');
    // 1. Calculate the new state first
    const newComplaintsState = complaints.map(complaint =>
      complaint._id === id ? { ...complaint, status: 'In Progress' } : complaint
    );
    // 2. Optimistically update the UI
    setComplaints(newComplaintsState);

    // 3. Send API call
    try {
      await axios.patch(`http://localhost:8080/api/partner/complaints/${id}/accept`, {}, {
        withCredentials: true,
      });
      // 4. On success, update the backup to the new state
      setOriginalComplaints(newComplaintsState);
    } catch (err) {
      console.error('Error accepting complaint:', err);
      setError('Failed to accept. Reverting change.');
      // 5. On error, revert to the old backup
      setComplaints(originalComplaints);
    }
  };

  // 2. Handle Reject
  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this task? It will be sent back to the admin.')) {
        return;
    }
    setError('');
    
    // 1. Calculate the new state first
    const newComplaintsState = complaints.filter(complaint => complaint._id !== id);
    // 2. Optimistically update the UI
    setComplaints(newComplaintsState);

    // 3. Send API call
    try {
      await axios.patch(`http://localhost:8080/api/partner/complaints/${id}/reject`, {}, {
        withCredentials: true,
      });
      // 4. On success, update the backup to the new state
      setOriginalComplaints(newComplaintsState);
    } catch (err)
 {
      console.error('Error rejecting complaint:', err);
      setError('Failed to reject. Reverting change.');
      // 5. On error, revert to the old backup
      setComplaints(originalComplaints);
    }
  };

  // 3. Handle Resolve
  const handleResolveSubmit = async (id, feedback) => {
    setError(''); 
    
    // 1. Calculate the new state first
    const newComplaintsState = complaints.map(complaint =>
      complaint._id === id 
        ? { ...complaint, status: 'Resolved', partnerFeedback: feedback } 
        : complaint
    );
    
    // 2. Optimistically update the UI
    setComplaints(newComplaintsState);
    setModalState({ isOpen: false, complaint: null }); // Close modal

    // 3. Send API call
    try {
      await axios.patch(`http://localhost:8080/api/partner/complaints/${id}/resolve`, 
        { feedback },
        { withCredentials: true }
      );
      // 4. On success, update the backup to the new state
      setOriginalComplaints(newComplaintsState);
    } catch (err) {
      console.error('Error resolving complaint:', err);
      setError('Failed to resolve. Reverting change.');
      // 5. On error, revert to the old backup
      setComplaints(originalComplaints);
      // Re-throw error to show in modal
      throw new Error(err.response?.data?.message || 'Failed to submit resolution.');
    }
  };
  
  // --- END OF FIX ---


  // --- Card Rendering ---
  const renderComplaintCard = (complaint) => {
    let actionButtons = null;

    if (complaint.status === 'Assigned') {
      actionButtons = (
        <div className="flex gap-2">
          <button
            onClick={() => handleReject(complaint._id)}
            className="w-full px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => handleAccept(complaint._id)}
            className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            Accept
          </button>
        </div>
      );
    } else if (complaint.status === 'In Progress') {
      actionButtons = (
        <button
          onClick={() => setModalState({ isOpen: true, complaint: complaint })}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
        >
          Mark as Resolved
        </button>
      );
    } else if (complaint.status === 'Resolved') {
      actionButtons = (
        <div className="text-sm text-zinc-400 p-2 text-center">
          <p className="font-semibold">Completed</p>
          {complaint.partnerFeedback && (
             <p className="text-xs italic mt-1">"{complaint.partnerFeedback.substring(0, 50)}..."</p>
          )}
        </div>
      );
    }

    return (
      <div key={complaint._id} className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-md flex flex-col justify-between">
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded-full">
              {complaint.category}
            </span>
            <span className="text-xs text-zinc-400">
              {new Date(complaint.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h4 className="text-lg font-bold text-white mb-2">{complaint.title}</h4>
          <p className="text-sm text-zinc-300 mb-4 line-clamp-3">
            {complaint.description || "No description provided."}
          </p>
        </div>
        
        <div className="border-t border-zinc-700 p-4">
           
           {/* --- THIS IS THE UPDATED SECTION --- */}
           {complaint.coordinates && complaint.coordinates.lat ? (
            // 1. If we have coordinates, show map link
            <a
              href={`http://googleusercontent.com/maps/google.com/0{complaint.coordinates.lat},${complaint.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline text-sm mb-4"
            >
              <MapMarkerIcon />
              View on Map
            </a>
          ) : complaint.address ? (
            // 2. ELSE if we have a manual address, show that
            <div className="flex items-start gap-2 text-sm text-zinc-300 mb-4">
              <span className="text-zinc-500 pt-1"><MapMarkerIcon /></span>
              <p>{complaint.address}</p>
            </div>
          ) : (
            // 3. ELSE show no location
            <div className="text-sm text-zinc-500 mb-4">No Location Provided</div>
          )}
          {/* --- END OF UPDATE --- */}

          {actionButtons}
        </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Partner Dashboard</h1>
      <p className="text-zinc-400 mb-6">View and manage your assigned tasks.</p>

      {/* Filter Buttons */}
      <div className="mb-6 flex gap-2">
        {filters.map(f => (
          <button
            key={f.name}
            onClick={() => {
              setFilter(f.name);
              setError(''); // Clear any errors when changing tabs
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              filter === f.name ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            {f.name} ({f.name === 'New' ? complaints.filter(c => c.status === 'Assigned').length :
                      f.name === 'Active' ? complaints.filter(c => c.status === 'In Process').length :
                      complaints.filter(c => c.status === 'Resolved').length})
          </button>
        ))}
      </div>

      {/* Main Content */}
      {loading && <p className="text-center text-zinc-400 mt-8">Loading tasks...</p>}
      
      {error && <p className="text-center text-red-500 mt-8">{error}</p>}
      
      {!loading && !error && (
        <>
          {filteredComplaints.length === 0 ? (
            <p className="text-center text-zinc-400 mt-8">No tasks in the "{filter}" category.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComplaints.map(renderComplaintCard)}
            </div>
          )}
        </>
      )}

      {/* Render the modal */}
      {modalState.isOpen && (
        <ResolveComplaintModal
          complaint={modalState.complaint}
          onClose={() => setModalState({ isOpen: false, complaint: null })}
          onSubmit={handleResolveSubmit}
        />
      )}
    </div>
  );
}

export default PartnerDashboard;