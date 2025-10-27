import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ComplaintCard from '../components/ComplaintCard';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';

function MyComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/complaints/mycomplaints', {
          withCredentials: true,
        });
        setComplaints(response.data);
      } catch (err) {
        setError('Failed to fetch your complaints. Please try again.');
        console.error('Error fetching complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyComplaints();
  }, []);

  const renderContent = () => {
    if (loading) return <p className="text-zinc-400">Loading your complaints...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (complaints.length === 0) {
      return <p className="text-zinc-400">You have not submitted any complaints yet.</p>;
    }
    return complaints.map((complaint) => (
      <Link to={`/complaint/${complaint._id}`} key={complaint._id}>
        <ComplaintCard complaint={complaint} />
      </Link>
    ));
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-8 w-full h-full grid lg:grid-cols-[224px_1fr_320px] md:grid-cols-[224px_1fr] gap-8">
      <LeftSidebar />
      <main className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <h1 className="text-3xl font-bold text-white mb-6">My Complaints</h1>
        {renderContent()}
      </main>
      <RightSidebar />
    </div>
  );
}

export default MyComplaintsPage;