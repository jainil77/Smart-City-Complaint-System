import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import ComplaintCard from '../components/ComplaintCard';

/**
 * Renders the main homepage, displaying a feed of complaints.
 * Handles fetching complaints based on an optional search query from the URL.
 */
function HomePage() {
  // --- State ---
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams(); // Hook to read URL query parameters
  const searchTerm = searchParams.get('search') || ''; // Get the 'search' term, default to empty string

  // --- Data Fetching ---
  // useCallback memoizes the function to prevent unnecessary re-renders
  const fetchComplaints = useCallback(async (currentSearchTerm) => {
    setLoading(true);
    setError('');
    try {
      // Pass the search term as a query parameter to the backend
      const response = await axios.get('http://localhost:8080/api/complaints', {
        params: { search: currentSearchTerm }, // Axios automatically handles query string formation
        withCredentials: true, // Send cookies if needed (good practice for future changes)
      });

      // Validate the response data
      if (Array.isArray(response.data)) {
        setComplaints(response.data);
      } else {
        console.warn("Received non-array data for complaints:", response.data);
        setComplaints([]);
      }
    } catch (err) {
      setError('Failed to fetch complaints. The server might be down or unreachable.');
      console.error('Error fetching complaints:', err);
      setComplaints([]); // Clear complaints on error
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array: function is created only once

  // useEffect hook to trigger fetching when the component mounts or the search term changes
  useEffect(() => {
    fetchComplaints(searchTerm);
  }, [searchTerm, fetchComplaints]); // Re-run effect if searchTerm or fetchComplaints changes

  // --- Rendering Logic ---

  // Helper function to render the main content based on state
  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-zinc-400">Loading complaints...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }
    // Specific message if search yields no results
    if (complaints.length === 0 && searchTerm) {
      return <p className="text-center text-zinc-400">No complaints found matching "{searchTerm}".</p>;
    }
    // Message if there are no complaints at all
    if (complaints.length === 0) {
      return <p className="text-center text-zinc-400">No complaints found. Be the first to post!</p>;
    }
    // Render the list of complaints
    return complaints.map((complaint) => (
      // Link removed from here, handled by ComplaintCard now
      <ComplaintCard key={complaint._id} complaint={complaint} />
    ));
  };

  return (
    // Main 3-column grid layout
    <div className="max-w-screen-xl mx-auto p-8 w-full h-full grid lg:grid-cols-[224px_1fr_320px] md:grid-cols-[224px_1fr] gap-8">
      <LeftSidebar />
      <main className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Optional: Display the search term */}
        {searchTerm && (
          <h2 className="text-xl text-zinc-400 font-semibold mb-6">
            Search results for: "{searchTerm}"
          </h2>
        )}
        {renderContent()}
      </main>
      <RightSidebar />
    </div>
  );
}

export default HomePage;