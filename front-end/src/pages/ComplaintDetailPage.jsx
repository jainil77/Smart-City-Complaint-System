import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ComplaintPost from '../components/ComplaintPost'; // Displays the main complaint
import Comment from '../components/Comment';             // Displays a single comment
import CommentForm from '../components/CommentForm';   // Form for adding comments

/**
 * Renders the detailed view of a single complaint, including its post,
 * a form to add comments, and the list of existing comments.
 * Handles fetching data, submitting new comments, and deleting comments.
 */
function ComplaintDetailPage() {
  // --- State ---
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams(); // Complaint ID from the URL

  // --- Data Fetching ---
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const axiosConfig = { withCredentials: true };
      // Fetch complaint details and comments concurrently
      const [complaintRes, commentsRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/complaints/${id}`, axiosConfig),
        axios.get(`http://localhost:8080/api/complaints/${id}/comments`, axiosConfig)
      ]);
      setComplaint(complaintRes.data);
      setComments(commentsRes.data || []); // Ensure comments is always an array
    } catch (err) {
      setError('Could not load complaint details. Please ensure you are logged in or try again.');
      console.error("Failed to fetch complaint details:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id, fetchDetails]); // fetchDetails is now included in dependency array

  // --- Event Handlers ---

  // Handles submitting a new comment
  const handleCommentSubmit = useCallback(async (commentText) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/complaints/${id}/comments`,
        { text: commentText },
        { withCredentials: true }
      );
      // Add the newly created comment to the top of the list for instant UI update
      setComments(prevComments => [response.data, ...prevComments]);
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert("Could not post your comment. Please try again.");
    }
  }, [id]);

  // Handles deleting a comment
  const handleCommentDelete = useCallback(async (commentId) => {
    try {
      await axios.delete(`http://localhost:8080/api/comments/${commentId}`, {
        withCredentials: true,
      });
      // Remove the deleted comment from the state for instant UI update
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Could not delete the comment. Please try again.");
    }
  }, []);

  // --- Render Logic ---

  if (loading) {
    return <p className="p-8 text-center text-zinc-400">Loading...</p>;
  }

  if (error) {
    return <p className="p-8 text-center text-red-500">{error}</p>;
  }

  if (!complaint) {
    return <p className="p-8 text-center">Complaint not found.</p>;
  }

  return (
    // Main container with scrolling and scrollbar hidden
    <div className="max-w-3xl mx-auto p-4 md:p-8 h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      
      {/* 1. Display the main complaint details */}
      <ComplaintPost complaint={complaint} />

      {/* 2. Display the comment submission form */}
      <div className="my-8">
        <CommentForm onSubmit={handleCommentSubmit} />
      </div>

      {/* 3. Display the list of comments */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
        {comments.length > 0 ? (
          comments.map(comment => (
            <Comment
              key={comment._id}
              comment={comment}
              onDelete={handleCommentDelete} // Pass the delete handler to each comment
            />
          ))
        ) : (
          <p className="text-zinc-400">No comments yet.</p>
        )}
      </div>
    </div>
  );
}

export default ComplaintDetailPage;