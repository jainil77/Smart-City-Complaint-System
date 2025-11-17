import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

// --- Inline SVG Icon ---
const MapMarkerIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67a24 24 0 0 1-35.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
  </svg>
);

// --- Unified Action Modal Component ---
function ActionModal({ config, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ 
    text: '', 
    date: '', 
    file: null 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (config.type === 'reject' && formData.text.trim().length < 5) {
      setError('Please provide a reason for rejection.');
      return;
    }
    if (config.type === 'resolve') {
      if (formData.text.trim().length < 5) { // Lowered limit slightly for testing
        setError('Please provide a detailed resolution note.');
        return;
      }
      if (!formData.file) {
        setError('Please upload a proof of work image.');
        return;
      }
    }
    if (config.type === 'accept') {
      if (!formData.date) {
        setError('Please provide a tentative date.');
        return;
      }
      if (!formData.text || formData.text.trim() === '') {
        setError('Please provide assigned worker name(s).');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(config.complaint._id, formData);
      // Parent handles closing on success
    } catch (err) {
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = config.type === 'accept' ? 'Accept Task' 
              : config.type === 'reject' ? 'Reject Task' 
              : 'Resolve Task';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* REJECT: Reason Input */}
          {config.type === 'reject' && (
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Reason for Rejection</label>
              <textarea 
                required 
                rows="3"
                className="w-full bg-zinc-800 text-white p-2.5 rounded border border-zinc-600 focus:border-red-500 focus:ring-red-500"
                placeholder="Why are you rejecting this task?"
                onChange={(e) => setFormData({...formData, text: e.target.value})} 
              />
            </div>
          )}

          {/* ACCEPT: Date & Worker Input */}
          {config.type === 'accept' && (
            <>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Tentative Completion Date</label>
                <input 
                  type="date" 
                  required 
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-zinc-800 text-white p-2.5 rounded border border-zinc-600 focus:border-green-500 focus:ring-green-500"
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Assigned Worker(s)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., John Doe, Team A"
                  className="w-full bg-zinc-800 text-white p-2.5 rounded border border-zinc-600 focus:border-green-500 focus:ring-green-500"
                  onChange={(e) => setFormData({...formData, text: e.target.value})} 
                />
              </div>
            </>
          )}

          {/* RESOLVE: Image + Desc */}
          {config.type === 'resolve' && (
            <>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Resolution Description</label>
                <textarea 
                  required 
                  rows="3"
                  className="w-full bg-zinc-800 text-white p-2.5 rounded border border-zinc-600 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Describe how the issue was fixed..."
                  onChange={(e) => setFormData({...formData, text: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Proof of Work (Image)</label>
                <input 
                  type="file" 
                  required 
                  accept="image/*" 
                  className="w-full text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  onChange={(e) => setFormData({...formData, file: e.target.files[0]})} 
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-zinc-300 hover:text-white transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className={`px-4 py-2 text-white rounded font-semibold transition-colors ${
                config.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 
                config.type === 'accept' ? 'bg-green-600 hover:bg-green-700' : 
                'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Partner Dashboard ---
function PartnerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [originalComplaints, setOriginalComplaints] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('New');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', complaint: null });

  const filters = [
    { name: 'New', status: 'Assigned' },
    { name: 'Active', status: 'In Process' },
    { name: 'Completed', status: 'Resolved' },
  ];

  const fetchMyComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/partner/complaints', {
        withCredentials: true,
      });
      setComplaints(response.data || []);
      setOriginalComplaints(response.data || []); 
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

  const filteredComplaints = useMemo(() => {
    const activeStatus = filters.find(f => f.name === filter)?.status;
    let result = complaints.filter(c => c.status === activeStatus);

    if (activeStatus === 'In Process') {
      result.sort((a, b) => {
        if (!a.tentativeDate) return 1;
        if (!b.tentativeDate) return -1;
        return new Date(a.tentativeDate) - new Date(b.tentativeDate);
      });
    }
    return result;
  }, [complaints, filter, filters]);


  // --- API Actions (Fixed) ---

  const handleAcceptSubmit = async (id, formData) => {
    const newComplaints = complaints.map(c => 
      c._id === id 
        ? { ...c, status: 'In Process', tentativeDate: formData.date, assignedWorkers: formData.text } 
        : c
    );
    setComplaints(newComplaints);
    setModalConfig({ ...modalConfig, isOpen: false });

    try {
      await axios.patch(`http://localhost:8080/api/partner/complaints/${id}/accept`, 
        { tentativeDate: formData.date, assignedWorkers: formData.text }, 
        { withCredentials: true }
      );
      setOriginalComplaints(newComplaints);
    } catch (err) {
      setComplaints(originalComplaints);
      throw new Error('Failed to accept task.');
    }
  };

  const handleRejectSubmit = async (id, formData) => {
    const newComplaints = complaints.filter(c => c._id !== id);
    setComplaints(newComplaints);
    setModalConfig({ ...modalConfig, isOpen: false });

    try {
      await axios.patch(`http://localhost:8080/api/partner/complaints/${id}/reject`, 
        { reason: formData.text }, 
        { withCredentials: true }
      );
      setOriginalComplaints(newComplaints);
    } catch (err) {
      setComplaints(originalComplaints);
      throw new Error('Failed to reject task.');
    }
  };

  // --- !! CRITICAL FIX HERE !! ---
  const handleResolveSubmit = async (id, formData) => {
    // 1. Optimistic Update
    const newComplaints = complaints.map(c => 
      c._id === id ? { ...c, status: 'Resolved', partnerFeedback: formData.text } : c
    );
    setComplaints(newComplaints);
    setModalConfig({ ...modalConfig, isOpen: false });

    try {
      const payload = new FormData();
      payload.append('feedback', formData.text);
      payload.append('image', formData.file);

      // 2. Send API Call - REMOVED MANUAL HEADER
      await axios.patch(`http://localhost:8080/api/partner/complaints/${id}/resolve`, 
        payload, 
        { 
          withCredentials: true 
          // Do NOT set Content-Type here. Browser will do it.
        }
      );
      setOriginalComplaints(newComplaints);
    } catch (err) {
      setComplaints(originalComplaints);
      throw new Error('Failed to resolve task. ' + (err.response?.data?.message || ''));
    }
  };

  const handleWorkerUpdate = async (id, workerNames) => {
    setComplaints(prev => prev.map(c => c._id === id ? { ...c, assignedWorkers: workerNames } : c));
    try {
       await axios.patch(`http://localhost:8080/api/partner/complaints/${id}/workers`, 
        { workers: workerNames }, 
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to update workers");
    }
  };


  const renderTable = () => {
    if (filteredComplaints.length === 0) {
      return <p className="text-center text-zinc-400 mt-8">No tasks in the "{filter}" category.</p>;
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-700 mt-6">
        <table className="min-w-full bg-zinc-900">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase">Title / Desc</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase">Category</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase">Created</th>
              {filter !== 'New' && <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase">Target Date</th>}
              {filter === 'Active' && <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase">Workers</th>}
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase">Location</th>
              <th className="text-left p-3 text-xs font-medium text-zinc-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {filteredComplaints.map((complaint) => (
              <tr key={complaint._id} className="hover:bg-zinc-800">
                <td className="p-3 text-sm text-white max-w-xs">
                  <div className="font-bold">{complaint.title}</div>
                  <div className="text-zinc-400 text-xs truncate">{complaint.description}</div>
                </td>
                <td className="p-3">
                   <span className="text-xs font-semibold text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded-full">{complaint.category}</span>
                </td>
                <td className="p-3 text-sm text-zinc-400 whitespace-nowrap">
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </td>
                {filter !== 'New' && (
                  <td className="p-3 text-sm whitespace-nowrap">
                     <span className="text-yellow-500 font-medium">
                       {complaint.tentativeDate ? new Date(complaint.tentativeDate).toLocaleDateString() : '-'}
                     </span>
                  </td>
                )}
                {filter === 'Active' && (
                  <td className="p-3 text-sm">
                    <input 
                      type="text"
                      className="bg-zinc-800 text-white px-2 py-1 rounded border border-zinc-600 text-xs w-32 focus:border-purple-500 outline-none"
                      placeholder="Assign..."
                      defaultValue={complaint.assignedWorkers || ''}
                      onBlur={(e) => handleWorkerUpdate(complaint._id, e.target.value)}
                    />
                  </td>
                )}
                <td className="p-3 text-sm text-zinc-300 whitespace-nowrap">
                  {complaint.coordinates && complaint.coordinates.lat ? (
                    <a href={`http://googleusercontent.com/maps/google.com/0{complaint.coordinates.lat},${complaint.coordinates.lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:underline">
                      <MapMarkerIcon /> Map
                    </a>
                  ) : complaint.address ? (
                    <div className="flex items-center gap-1 text-zinc-300" title={complaint.address}>
                       <MapMarkerIcon /> <span className="truncate w-24">{complaint.address}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-500 text-xs">N/A</span>
                  )}
                </td>
                <td className="p-3 text-sm whitespace-nowrap">
                  {complaint.status === 'Assigned' && (
                    <div className="flex gap-2">
                      <button onClick={() => setModalConfig({ isOpen: true, type: 'accept', complaint })} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs">Accept</button>
                      <button onClick={() => setModalConfig({ isOpen: true, type: 'reject', complaint })} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">Reject</button>
                    </div>
                  )}
                  {complaint.status === 'In Process' && (
                    <button onClick={() => setModalConfig({ isOpen: true, type: 'resolve', complaint })} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs">Resolve</button>
                  )}
                  {complaint.status === 'Resolved' && <span className="text-green-500 font-semibold text-xs">Done</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Partner Dashboard</h1>
      <p className="text-zinc-400 mb-6">View and manage your assigned tasks.</p>
      <div className="mb-6 flex gap-2">
        {filters.map(f => (
          <button
            key={f.name}
            onClick={() => { setFilter(f.name); setError(''); }}
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
      {loading && <p className="text-center text-zinc-400 mt-8">Loading tasks...</p>}
      {error && <p className="text-center text-red-500 mt-8">{error}</p>}
      {!loading && !error && renderTable()}
      {modalConfig.isOpen && (
        <ActionModal
          config={modalConfig}
          onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
          onSubmit={
            modalConfig.type === 'accept' ? handleAcceptSubmit :
            modalConfig.type === 'reject' ? handleRejectSubmit : handleResolveSubmit
          }
        />
      )}
    </div>
  );
}
export default PartnerDashboard;