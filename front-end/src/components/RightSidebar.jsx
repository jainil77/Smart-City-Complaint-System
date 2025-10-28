import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function RightSidebar() {
  const [topComplaints, setTopComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopComplaints = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:8080/api/complaints/top');
        setTopComplaints(response.data);
      } catch (err) {
        setError('Could not load top complaints.');
        console.error('Error fetching top complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopComplaints();
  }, []); // Fetch only once when the component mounts

  return (
    <aside className="hidden lg:block w-full lg:w-80 flex-shrink-0 flex flex-col">
      {/* 1. The Floating Module for "Top Complaint" */}
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 shadow-lg mb-6">
        <h3 className="font-bold text-lg mb-3 text-white">Top Complaints</h3>
        
        {/* Conditional Rendering based on state */}
        {loading && <p className="text-sm text-zinc-400">Loading...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="space-y-3">
            {topComplaints.length > 0 ? (
              topComplaints.map((complaint) => (
                <div key={complaint._id} className="text-sm">
                  {/* Link each title to its detail page */}
                  <Link to={`/complaint/${complaint._id}`} className="font-semibold text-white hover:underline block truncate">
                    {complaint.title}
                  </Link>
                  <p className="text-zinc-400">{complaint.upvoteCount} Upvotes</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">No complaints found.</p>
            )}
          </div>
        )}
      </div>

      {/* 2. Invisible spacer */}
      <div className="flex-grow"></div>

      {/* 3. The Footer */}
      <footer className="text-xs text-zinc-500 p-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
          <a href="#" className="hover:underline">User Agreement</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Accessibility</a>
        </div>
        <p>SCCS, Inc. © 2025. All rights reserved.</p>
      </footer>
    </aside>
  );
}

export default RightSidebar;