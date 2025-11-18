import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaFilter, FaUserTie, FaInfoCircle, FaCheckCircle, FaClock, FaTimesCircle, FaSync } from 'react-icons/fa';

// --- DETAIL MODAL COMPONENT ---
function ComplaintDetailModal({ complaint, onClose }) {
  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{complaint.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs font-bold 
                ${complaint.status === 'Resolved' ? 'bg-green-900 text-green-300' : 
                  complaint.status === 'Rejected' ? 'bg-red-900 text-red-300' : 
                  'bg-blue-900 text-blue-300'}`}>
                {complaint.status}
              </span>
              <span className="text-zinc-500 text-xs">ID: {complaint._id}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Complaint Info */}
          <div className="space-y-4">
            <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
              <h4 className="text-zinc-400 text-xs uppercase font-bold mb-3">Task Details</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-zinc-500 text-xs">Assigned Partner</p>
                  <p className="text-white font-medium">{complaint.assignedTo?.name || 'Unassigned'}</p>
                  <p className="text-zinc-500 text-xs">{complaint.assignedTo?.email}</p>
                </div>
                
                <div>
                  <p className="text-zinc-500 text-xs">Description</p>
                  <p className="text-zinc-300 text-sm">{complaint.description}</p>
                </div>

                <div>
                  <p className="text-zinc-500 text-xs">Location</p>
                  <p className="text-zinc-300 text-sm">{complaint.address || "No address provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Partner Feedback & Evidence */}
          <div className="space-y-4">
            
            {/* REJECTED STATE */}
            {complaint.status === 'Rejected' && (
              <div className="bg-red-900/10 border border-red-800 p-4 rounded-lg">
                <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                  <FaTimesCircle /> Rejection Reason
                </h4>
                <p className="text-zinc-200 text-sm bg-black/20 p-3 rounded">
                  "{complaint.rejectionReason || "No reason provided."}"
                </p>
              </div>
            )}

            {/* IN PROGRESS STATE (Fixed) */}
            {complaint.status === 'In Progress' && (
              <div className="bg-blue-900/10 border border-blue-800 p-4 rounded-lg">
                <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                  <FaClock /> Work in Progress
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-blue-800/30 pb-2">
                    <span className="text-zinc-400">Target Date:</span>
                    <span className="text-white font-mono">
                      {complaint.tentativeDate ? new Date(complaint.tentativeDate).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-zinc-400">Workers:</span>
                    <span className="text-white">{complaint.assignedWorkers || 'None listed'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* RESOLVED STATE */}
            {complaint.status === 'Resolved' && (
              <div className="bg-green-900/10 border border-green-800 p-4 rounded-lg">
                <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                  <FaCheckCircle /> Resolution Report
                </h4>
                
                {/* Feedback Text */}
                <div className="mb-4">
                  <p className="text-zinc-500 text-xs mb-1">PARTNER FEEDBACK</p>
                  <p className="text-zinc-200 text-sm bg-black/20 p-3 rounded italic">
                    "{complaint.partnerFeedback}"
                  </p>
                </div>

                {/* Image Proof */}
                {complaint.resolutionImage ? (
                  <div>
                    <p className="text-zinc-500 text-xs mb-2">PROOF OF WORK</p>
                    <a 
                      href={complaint.resolutionImage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block group relative overflow-hidden rounded-lg border border-zinc-600"
                    >
                      <img 
                        src={complaint.resolutionImage} 
                        alt="Resolution Proof" 
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                        onError={(e) => { e.target.style.display = 'none'; }} 
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold bg-black/70 px-2 py-1 rounded">Click to Zoom</span>
                      </div>
                    </a>
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded text-yellow-500 text-xs text-center">
                    No image evidence provided.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-zinc-800 pt-4">
          <button 
            onClick={onClose} 
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
function AssignedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [partnerFilter, setPartnerFilter] = useState('All'); 
  const [statusFilter, setStatusFilter] = useState('All'); 
  
  // Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/complaints/all', { withCredentials: true });
      // Filter out 'Pending' and 'Admin Accepted'. Include 'In Progress'
      const assignedOnly = res.data.filter(c => 
        ['Assigned', 'In Progress', 'Resolved', 'Rejected'].includes(c.status)
      );
      setComplaints(assignedOnly);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Extract Partners
  const uniquePartners = useMemo(() => {
    const partners = [];
    const map = new Map();
    complaints.forEach(c => {
      if (c.assignedTo && !map.has(c.assignedTo._id)) {
        map.set(c.assignedTo._id, true);
        partners.push({ id: c.assignedTo._id, name: c.assignedTo.name });
      }
    });
    return partners;
  }, [complaints]);

  // Filter Logic
  const filteredData = useMemo(() => {
    return complaints.filter(c => {
      const matchesPartner = partnerFilter === 'All' || (c.assignedTo && c.assignedTo._id === partnerFilter);
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesPartner && matchesStatus;
    });
  }, [complaints, partnerFilter, statusFilter]);

  return (
    <div className="h-full flex flex-col p-8">
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-white">Assigned Complaints</h1>
            <p className="text-zinc-400">Monitor partner progress and review resolutions.</p>
        </div>
        <button 
            onClick={fetchData} 
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg border border-zinc-700 transition-colors text-sm"
            title="Refresh Data"
        >
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* --- FILTERS --- */}
      <div className="flex flex-wrap gap-6 mb-6 bg-zinc-900 p-4 rounded border border-zinc-800 items-center">
        
        {/* Partner Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <FaUserTie />
            <span className="text-sm font-semibold text-white">Partner:</span>
          </div>
          <select 
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="bg-zinc-800 text-white text-sm border border-zinc-600 rounded px-3 py-1.5 focus:ring-purple-500 focus:border-purple-500 min-w-[150px]"
          >
            <option value="All">All Partners</option>
            {uniquePartners.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <FaFilter />
            <span className="text-sm font-semibold text-white">Status:</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-800 text-white text-sm border border-zinc-600 rounded px-3 py-1.5 focus:ring-purple-500 focus:border-purple-500 min-w-[150px]"
          >
            <option value="All">All Statuses</option>
            <option value="Assigned">Assigned (Pending)</option>
            <option value="In Progress">In Progress (Active)</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="flex-1 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 flex flex-col">
        <div className="overflow-y-auto h-full">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs font-medium sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Partner</th>
                <th className="px-6 py-3">Status</th>
                {/* Evidence Column Removed */}
                <th className="px-6 py-3">Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700 text-zinc-300">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-zinc-500">No complaints found.</td></tr>
              ) : (
                filteredData.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">
                      {complaint.title}
                      <span className="block text-xs text-zinc-500 font-normal">{complaint.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      {complaint.assignedTo?.name || <span className="text-red-500 italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-bold border 
                        ${complaint.status === 'Resolved' ? 'bg-green-900/30 text-green-400 border-green-800' : 
                          complaint.status === 'Rejected' ? 'bg-red-900/30 text-red-400 border-red-800' : 
                          complaint.status === 'In Progress' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                          'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>
                        {complaint.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {new Date(complaint.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedComplaint(complaint)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      <ComplaintDetailModal 
        complaint={selectedComplaint} 
        onClose={() => setSelectedComplaint(null)} 
      />

    </div>
  );
}

export default AssignedComplaints;