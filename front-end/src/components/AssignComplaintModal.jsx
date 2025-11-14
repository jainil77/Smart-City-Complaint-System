import React, { useState, useEffect } from 'react';
import axios from 'axios';

// This is a basic loader, replace with your own if you have one
const Loader = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>Loading partners...</div>
);

/**
 * Renders a modal to assign a complaint to a partner.
 * Fetches partners by category and handles the assignment logic.
 */
function AssignComplaintModal({ complaint, onClose, onAssignSuccess }) {
  const [selectedPartnerId, setSelectedPartnerId] = useState('');

  // State for fetching partners
  const [partners, setPartners] = useState([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const [partnersError, setPartnersError] = useState(null);

  // State for the assignment action
  const [isAssigning, setIsAssigning] = useState(false);

  // 1. Fetch the list of partners when the modal opens
  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoadingPartners(true);
      setPartnersError(null);
      try {
        // Correctly fetching by category
        const response = await axios.get(
          `http://localhost:8080/api/admin/partners?category=${complaint.category}`,
          {
            withCredentials: true, 
          }
        );
        setPartners(response.data || []);
      } catch (err) {
        setPartnersError(
          err.response?.data?.message ||
            'Could not fetch partners for this category.'
        );
        console.error('Error fetching partners:', err);
      } finally {
        setIsLoadingPartners(false);
      }
    };

    fetchPartners();
  }, [complaint.category]); // Re-run if the complaint or category changes

  // 2. Handle the form submission
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!selectedPartnerId) {
      alert('Please select a partner');
      return;
    }

    setIsAssigning(true);
    try {
      await axios.patch(
        `http://localhost:8080/api/admin/complaints/${complaint._id}/assign`,
        { partnerId: selectedPartnerId }, 
        {
          withCredentials: true, 
        }
      );

      alert('Complaint assigned successfully');
      
      // !! --- THIS IS THE FIX --- !!
      // This call now triggers handleAssignSuccess in the dashboard
      onAssignSuccess(); 

    } catch (err) {
      alert(
        `Assignment Failed: ${
          err.response?.data?.message || err.message
        }`
      );
      console.error('Error assigning complaint:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  // --- Rendering ---
  const renderContent = () => {
    if (isLoadingPartners) {
      return <Loader />;
    }
    if (partnersError) {
      return <p className="text-center text-red-500">{partnersError}</p>;
    }
    if (partners.length === 0) {
      return (
        <p className="text-center text-zinc-400">
          No partners found for the "{complaint.category}" category.
        </p>
      );
    }

    return (
      <>
        <label htmlFor="partner" className="block text-sm font-medium text-zinc-300">
          Select a Partner:
        </label>
        <select
          id="partner"
          value={selectedPartnerId}
          onChange={(e) => setSelectedPartnerId(e.target.value)}
          required
          className="mt-1 block w-full p-2.5 bg-zinc-800 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">-- Select --</option>
          {partners.map((partner) => (
            <option key={partner._id} value={partner._id}>
              {/* This workload count will be fresh next time */}
              {partner.name} ({partner.email}) - Workload: {partner.workload ?? 0}
            </option>
          ))}
        </select>
      </>
    );
  };

  return (
    // Modal Overlay
    <div 
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Card 
        - Added scrolling fix
        - Added e.stopPropagation()
      */}
      <div 
        className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white">Assign Complaint</h3>
        <p className="text-sm text-zinc-400 mb-2 mt-4">
          <strong>ID:</strong> <span className="font-mono">{complaint._id}</span>
        </p>
        <p className="text-sm text-zinc-400 mb-6">
          <strong>Category:</strong> {complaint.category}
        </p>

        <form onSubmit={submitHandler}>
          <div className="mb-6 min-h-[60px]">
            {renderContent()}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isAssigning}
              className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg text-sm font-semibold hover:bg-zinc-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isAssigning ||
                isLoadingPartners ||
                !selectedPartnerId
              }
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignComplaintModal;