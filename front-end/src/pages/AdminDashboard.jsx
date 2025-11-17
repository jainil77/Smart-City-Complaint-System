import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// --- Inline SVG Icon ---
const FaMapMarkerAlt = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67a24 24 0 0 1-35.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
  </svg>
);

// --- 1. Assign Complaint Modal (For assigning partners) ---
function AssignComplaintModal({ complaint, onClose, onAssignSuccess }) {
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [partners, setPartners] = useState([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const [partnersError, setPartnersError] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoadingPartners(true);
      setPartnersError(null);
      if (!complaint || !complaint.category) return setIsLoadingPartners(false);
      
      try {
        const response = await axios.get(
          `http://localhost:8080/api/admin/partners?category=${complaint.category}`,
          { withCredentials: true }
        );
        setPartners(response.data || []);
      } catch (err) {
        setPartnersError('Could not fetch partners.');
      } finally {
        setIsLoadingPartners(false);
      }
    };
    fetchPartners();
  }, [complaint]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!selectedPartnerId) return alert('Please select a partner');
    setIsAssigning(true);
    try {
      await axios.patch(
        `http://localhost:8080/api/admin/complaints/${complaint._id}/assign`,
        { partnerId: selectedPartnerId }, 
        { withCredentials: true }
      );
      onAssignSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment Failed');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">Assign Complaint</h3>
        <p className="text-sm text-zinc-400 mb-4">Category: {complaint.category}</p>
        <form onSubmit={submitHandler}>
          {isLoadingPartners ? <p className="text-zinc-500">Loading...</p> : partnersError ? <p className="text-red-500">{partnersError}</p> : (
            <select 
              className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-600 mb-4"
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
            >
              <option value="">-- Select Partner --</option>
              {partners.map(p => (
                <option key={p._id} value={p._id}>{p.name} - Load: {p.workload ?? 0}</option>
              ))}
            </select>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-zinc-300">Cancel</button>
            <button type="submit" disabled={isAssigning || !selectedPartnerId} className="px-4 py-2 bg-purple-600 text-white rounded">Assign</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 2. Complaint Details Modal (NEW: To view partner feedback/images) ---
function ComplaintDetailsModal({ complaint, onClose }) {
  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">Complaint Details</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        
        <div className="space-y-4">
            {/* Basic Info */}
            <div className="bg-zinc-800 p-3 rounded">
                <p className="text-sm text-zinc-400">Status: <span className={`font-bold ${
                    complaint.status === 'Resolved' ? 'text-green-400' : 
                    complaint.status === 'Rejected' ? 'text-red-400' : 'text-white'
                }`}>{complaint.status}</span></p>
                <p className="text-sm text-zinc-400 mt-1">Assigned To: <span className="text-white">{complaint.assignedTo?.name || 'Unassigned'}</span></p>
            </div>

            {/* Rejected Logic */}
            {complaint.status === 'Rejected' && (
                <div className="bg-red-900/20 border border-red-800 p-3 rounded">
                    <h4 className="text-red-400 font-bold text-sm mb-1">Rejection Reason:</h4>
                    <p className="text-zinc-300 text-sm">{complaint.rejectionReason || 'No reason provided.'}</p>
                </div>
            )}

            {/* In Process Logic */}
            {complaint.status === 'In Progress' && (
                <div className="bg-blue-900/20 border border-blue-800 p-3 rounded">
                    <h4 className="text-blue-400 font-bold text-sm mb-2">Partner Updates:</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-zinc-400 uppercase">Target Date</p>
                            <p className="text-white font-mono text-sm">{complaint.tentativeDate ? new Date(complaint.tentativeDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-400 uppercase">Workers</p>
                            <p className="text-white text-sm">{complaint.assignedWorkers || 'None assigned'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Resolved Logic */}
            {complaint.status === 'Resolved' && (
                <div className="bg-green-900/20 border border-green-800 p-3 rounded space-y-3">
                    <div>
                        <h4 className="text-green-400 font-bold text-sm mb-1">Resolution Note:</h4>
                        <p className="text-zinc-300 text-sm">{complaint.partnerFeedback}</p>
                    </div>
                    {complaint.resolutionImage && (
                        <div>
                            <h4 className="text-green-400 font-bold text-sm mb-2">Proof of Work:</h4>
                            <img src={complaint.resolutionImage} alt="Proof" className="w-full rounded border border-zinc-700 object-cover max-h-64" />
                        </div>
                    )}
                </div>
            )}

            {/* Fallback */}
            {['Pending', 'Admin Accepted', 'Assigned'].includes(complaint.status) && (
                <p className="text-zinc-500 italic text-center py-4">No partner updates available yet.</p>
            )}
        </div>

        <button onClick={onClose} className="mt-6 w-full bg-zinc-700 text-white py-2 rounded hover:bg-zinc-600 font-semibold">Close</button>
      </div>
    </div>
  );
}

// --- Constants ---
const CATEGORIES = ['All', 'Hygiene', 'Roads', 'Electricity', 'Water', 'Other', 'Pending Classification'];
const STATUSES = ['All', 'Pending', 'Admin Accepted', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

/**
 * Renders the Admin Dashboard for managing complaints.
 */
function AdminDashboard() {
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modals State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
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
      setError('Failed to fetch complaints.');
      setAllComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

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


  // --- Modal Triggers ---
  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignModalOpen(true);
  };

  const openDetailsModal = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailsModalOpen(true);
  };

  const handleAssignSuccess = () => {
    setAssignModalOpen(false);
    setSelectedComplaint(null);
    fetchAllComplaints();
  };

  // --- Status Change Handler ---
  const handleStatusChange = useCallback(async (id, newStatus) => {
    if (newStatus === 'Assigned') {
      const complaintToAssign = allComplaints.find(c => c._id === id);
      if (complaintToAssign) openAssignModal(complaintToAssign);
      fetchAllComplaints(); // Reset dropdown visually
      return;
    }
    
    const originalComplaints = [...allComplaints];
    setAllComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));

    try {
      await axios.patch(`http://localhost:8080/api/admin/complaints/${id}/status`,
        { status: newStatus }, { withCredentials: true }
      );
    } catch (err) {
      console.error('Error updating status:', err);
      setAllComplaints(originalComplaints);
    }
  }, [allComplaints, fetchAllComplaints]);

  // --- Rendering ---
  const renderComplaintTable = () => {
    if (filteredComplaints.length === 0) return <p className="text-zinc-400 text-center mt-4">No complaints match filters.</p>;

    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-700 shadow-md mt-6">
        <table className="min-w-full bg-zinc-900">
           <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Title</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Category</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Author</th>
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
                    {complaint.title.length > 25 ? `${complaint.title.substring(0, 25)}...` : complaint.title}
                  </Link>
                </td>
                <td className="p-3 text-sm text-zinc-300 whitespace-nowrap">{complaint.category || 'N/A'}</td>
                <td className="p-3 text-sm text-zinc-300 whitespace-nowrap">{complaint.author?.anonymousName || 'N/A'}</td>
                <td className="p-3 text-sm text-zinc-400 whitespace-nowrap">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                
                {/* Location Cell */}
                <td className="p-3 text-sm text-zinc-300 whitespace-nowrap">
                  {complaint.coordinates && complaint.coordinates.lat ? (
                    <a href={`http://googleusercontent.com/maps/google.com/0{complaint.coordinates.lat},${complaint.coordinates.lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:underline">
                      <FaMapMarkerAlt /> Map
                    </a>
                  ) : complaint.address ? (
                    <span className="text-zinc-300 flex items-center gap-1" title={complaint.address}>
                      <FaMapMarkerAlt className="text-zinc-500"/> {complaint.address.length > 20 ? `${complaint.address.substring(0, 20)}...` : complaint.address}
                    </span>
                  ) : (
                    <span className="text-zinc-500">No Location</span>
                  )}
                </td>

                <td className="p-3 text-sm text-white whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                    ${complaint.status === 'Resolved' ? 'bg-green-900 text-green-300' : 
                      complaint.status === 'Rejected' ? 'bg-red-900 text-red-300' : 'bg-zinc-700 text-zinc-300'}`}>
                    {complaint.status}
                  </span>
                </td>

                <td className="p-3 text-sm text-white whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                      className="bg-zinc-800 border border-zinc-600 rounded p-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {STATUSES.slice(1).filter(s => s !== 'Assigned').map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>

                    {/* Assign Button */}
                    {(complaint.status === 'Pending' || complaint.status === 'Admin Accepted') && (
                      <button onClick={() => openAssignModal(complaint)} className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700">Assign</button>
                    )}

                    {/* View Details Button (New) */}
                    {['In Progress', 'Resolved', 'Rejected'].includes(complaint.status) && (
                      <button onClick={() => openDetailsModal(complaint)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700">
                        Details
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

      {/* Filters */}
       <div className="mb-4">
        <span className="text-sm font-semibold text-zinc-400 mr-3">Filter by Category:</span>
        <div className="inline-flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${selectedCategory === category ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <span className="text-sm font-semibold text-zinc-400 mr-3">Filter by Status:</span>
        <div className="inline-flex flex-wrap gap-2">
          {STATUSES.map(status => (
            <button key={status} onClick={() => setSelectedStatus(status)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedStatus === status ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {loading && <p className="text-center text-zinc-400 mt-4">Loading complaints...</p>}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      {!loading && !error && renderComplaintTable()}

      {/* Modals */}
      {assignModalOpen && (
        <AssignComplaintModal
          complaint={selectedComplaint}
          onClose={() => { setAssignModalOpen(false); setSelectedComplaint(null); }}
          onAssignSuccess={handleAssignSuccess} 
        />
      )}

      {detailsModalOpen && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          onClose={() => { setDetailsModalOpen(false); setSelectedComplaint(null); }}
        />
      )}
    </div>
  );
}

export default AdminDashboard;