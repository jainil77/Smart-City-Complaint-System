import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LodgeComplaintPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null); // State to hold the selected image file
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default page reload
    setLoading(true);
    setError('');

    // FormData is necessary for sending files (like images)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (image) {
      formData.append('image', image); // Append the image file if selected
    }

    try {
      // Send the POST request to the backend
      await axios.post('http://localhost:8080/api/complaints', formData, {
        headers: {
          // Important: Set content type for file uploads
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, // Send the authentication cookie
      });
      
      // If successful, navigate back to the homepage
      navigate('/');
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
      console.error('Complaint submission error:', err);
    } finally {
      setLoading(false); // Stop loading state regardless of success/failure
    }
  };

  // Handles changes to the file input
  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Get the selected file
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Lodge a New Complaint</h1>
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-lg shadow-lg border border-zinc-700">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-zinc-400 mb-2" htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        
        {/* Description Textarea */}
        <div className="mb-4">
          <label className="block text-zinc-400 mb-2" htmlFor="description">Description</label>
          <textarea
            id="description"
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        
        {/* Image File Input */}
        <div className="mb-6">
          <label className="block text-zinc-400 mb-2" htmlFor="image">Image (Optional)</label>
          <input
            type="file"
            id="image"
            accept="image/*" // Only accept image files
            onChange={handleImageChange}
            className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
          />
        </div>
        
        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading} // Disable button while submitting
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}

export default LodgeComplaintPage;