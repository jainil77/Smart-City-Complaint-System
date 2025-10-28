import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaRegCommentAlt, FaShare } from 'react-icons/fa';

// This component is dedicated to showing the full post on the detail page.
function ComplaintPost({ complaint }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [voteCount, setVoteCount] = useState(complaint.upvoteCount || 0);
  const [hasUpvoted, setHasUpvoted] = useState(user ? complaint.upvotes.includes(user._id) : false);

  const handleUpvoteToggle = useCallback(async (event) => {
    event.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    // ... (The upvote toggle logic remains the same as in ComplaintCard)
  }, [user, navigate, complaint._id, voteCount, hasUpvoted]);

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg flex flex-col shadow-lg">
      {/* Post Header */}
      <div className="p-4">
        <p className="text-xs text-zinc-400">Posted by 
          <span className="font-semibold text-purple-400 ml-1">
            {complaint.author?.anonymousName || 'Anonymous'}
          </span>
        </p>
        <h3 className="text-2xl font-bold mt-2 text-white">{complaint.title}</h3>
      </div>
      
      {/* Post Body (Description) */}
      <div className="p-4 text-zinc-300">
        {complaint.description}
      </div>

      {/* Post Image */}
      {complaint.image && (
        <div className="bg-black w-full flex items-center justify-center">
          <img 
            src={complaint.image} 
            alt={complaint.title || 'Complaint Image'} 
            // Changed object-contain to object-cover and adjusted height
            className="w-full max-h-[600px] object-cover object-center" 
          />
        </div>
      )}
      
      {/* Action Bar */}
      <div className="flex items-center justify-between p-2 text-sm font-bold text-zinc-400 border-t border-zinc-700">
        <div className="flex items-center bg-zinc-800 p-1 rounded-full">
          <button onClick={handleUpvoteToggle} className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-700 px-2 transition-colors">
            <FaArrowUp className={`w-4 h-4 transition-colors ${hasUpvoted ? 'text-green-500' : 'text-zinc-400'}`} />
            <span className="text-white">{voteCount}</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 p-2 rounded-full hover:bg-zinc-700 transition-colors">
            <FaRegCommentAlt className="w-4 h-4" />
            <span>{complaint.comments?.length || 0} Comments</span>
          </button>
          <button className="flex items-center gap-2 p-2 rounded-full hover:bg-zinc-700 transition-colors">
            <FaShare className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComplaintPost;