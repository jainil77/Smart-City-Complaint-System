import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaRegCommentAlt, FaShare } from 'react-icons/fa';

function ComplaintCard({ complaint }) {
  // --- Hooks ---
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- State ---
  const [voteCount, setVoteCount] = useState(complaint.upvoteCount || 0);
  const [hasUpvoted, setHasUpvoted] = useState(user ? complaint.upvotes?.includes(user._id) : false);

  // --- Handlers ---

  // *** THIS IS THE CORRECTED UPVOTE LOGIC ***
  const handleUpvoteToggle = useCallback(async (event) => {
    event.stopPropagation(); // Stop click from reaching parent link/div

    if (!user) {
      navigate('/login');
      return;
    }

    const endpoint = `http://localhost:8080/api/complaints/${complaint._id}/upvote`;
    const originalVoteCount = voteCount;
    const originalHasUpvoted = hasUpvoted;

    // Optimistic UI Update
    setHasUpvoted(!originalHasUpvoted);
    setVoteCount(originalHasUpvoted ? originalVoteCount - 1 : originalVoteCount + 1);

    try {
      // Perform the correct API call based on the original state
      if (originalHasUpvoted) {
        await axios.delete(endpoint, { withCredentials: true });
      } else {
        await axios.post(endpoint, {}, { withCredentials: true });
      }
    } catch (error) {
      console.error('Failed to toggle upvote:', error);
      // Revert UI on API error
      setVoteCount(originalVoteCount);
      setHasUpvoted(originalHasUpvoted);
    }
  }, [user, navigate, complaint?._id, voteCount, hasUpvoted]); // Dependencies for useCallback

  const handleCommentsClick = (event) => {
    event.stopPropagation();
    navigate(`/complaint/${complaint?._id}`);
  };

  const handleShareClick = useCallback(async (event) => {
    event.stopPropagation();
    // ... (Share logic) ...
  }, [complaint?.title, complaint?.description, complaint?._id]);

  const handleCardClick = () => {
    if (complaint?._id) {
      navigate(`/complaint/${complaint._id}`);
    }
  };

  // --- Render ---
  return (
    <div 
      onClick={handleCardClick} 
      className="bg-zinc-900 border border-zinc-700 rounded-lg mb-6 flex flex-col shadow-lg hover:border-zinc-600 transition-colors duration-200 cursor-pointer"
    >
      <div className="p-4">
        <p className="text-xs text-zinc-400">Posted by 
          <span className="font-semibold text-purple-400 ml-1">
            {complaint?.author?.anonymousName || 'Anonymous'}
          </span>
        </p>
        <h3 className="text-xl font-bold mt-1 text-white">{complaint?.title || 'No Title'}</h3>
      </div>

      {complaint?.image && (
        <div className="bg-black w-full flex items-center justify-center border-y border-zinc-700 max-h-96 overflow-hidden">
          <img 
            src={complaint.image} 
            alt={complaint?.title || 'Complaint Image'} 
            className="w-full h-96 object-cover object-center" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
      
      <div className="p-4">
        <p className="text-sm text-zinc-300">{complaint?.description || 'No Description'}</p>
      </div>

      <div className="flex items-center justify-between px-4 pb-2 text-sm font-bold text-zinc-400">
        <div className="flex items-center bg-zinc-800 p-1 rounded-full">
          <button onClick={handleUpvoteToggle} className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-700 px-2 transition-colors">
            <FaArrowUp className={`w-4 h-4 transition-colors ${hasUpvoted ? 'text-green-500' : 'text-zinc-400'}`} />
            <span className="text-white">{voteCount}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={handleCommentsClick} className="flex items-center gap-2 p-2 rounded-full hover:bg-zinc-700 transition-colors">
            <FaRegCommentAlt className="w-4 h-4" />
            <span>{complaint?.comments?.length || 0} Comments</span>
          </button>
          <button onClick={handleShareClick} className="flex items-center gap-2 p-2 rounded-full hover:bg-zinc-700 transition-colors">
            <FaShare className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComplaintCard;