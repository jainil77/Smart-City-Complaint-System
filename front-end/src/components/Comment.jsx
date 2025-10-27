import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaTrash } from 'react-icons/fa'; // Import trash icon

// The component now accepts an onDelete prop
function Comment({ comment, onDelete }) {
  const { user } = useAuth(); // Get the current logged-in user

  // Check if the current user can delete this comment
  const canDelete = user && (user._id === comment.author?._id || user.role === 'admin');

  const handleDeleteClick = (event) => {
    event.stopPropagation(); // Prevent any parent click handlers
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment._id); // Call the delete function passed from the parent
    }
  };

  return (
    <div className="flex gap-3 group"> {/* Added 'group' for hover effect */}
      <div className="w-10 h-10 rounded-full bg-purple-600 flex-shrink-0"></div>
      <div className="bg-zinc-800 p-3 rounded-lg w-full relative"> {/* Added relative positioning */}
        <p className="font-bold text-sm text-white">{comment.author?.anonymousName || 'Anonymous'}</p>
        <p className="text-zinc-300 mt-1">{comment.text}</p>
        
        {/* Delete button, shown only if canDelete is true */}
        {canDelete && (
          <button 
            onClick={handleDeleteClick}
            className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
            aria-label="Delete comment"
          >
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
}

export default Comment;