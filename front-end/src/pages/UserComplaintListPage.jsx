import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ComplaintCard from '../components/ComplaintCard';

function UserComplaintListPage() {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userId } = useParams(); // Get the user's ID from the URL

  useEffect(() => {
    const fetchUserComplaints = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/superadmin/users/${userId}/complaints`,
          { withCredentials: true }
        );
        setUser(response.data.user);
        setComplaints(response.data.complaints);
      } catch (err) {
        setError('Failed to fetch user complaints.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserComplaints();
  }, [userId]);

  if (loading) return <p className="text-zinc-400">Loading user's complaints...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">
        Complaints by {user?.anonymousName || 'User'}
      </h1>
      <p className="text-zinc-400 mb-6">{user?.email}</p>
      
      <div className="space-y-6">
        {complaints.length > 0 ? (
          complaints.map(complaint => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))
        ) : (
          <p className="text-zinc-400">This user has not filed any complaints.</p>
        )}
      </div>
    </div>
  );
}

export default UserComplaintListPage;