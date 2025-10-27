import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';

/**
 * Renders the application header.
 * Includes the site title, a search bar, and user authentication status (Login/Logout).
 * Handles search submission by navigating to the homepage with a search query parameter.
 */
function Header() {
  // --- Hooks ---
  const { user, logout } = useAuth(); // Authentication status
  const navigate = useNavigate(); // For programmatic navigation
  const [searchParams] = useSearchParams(); // To read the current search term from the URL

  // --- State ---
  // State for the controlled search input field
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // --- Effects ---
  // Update the search input if the URL search parameter changes (e.g., browser back button)
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  // --- Event Handlers ---

  // Handles logging the user out
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/api/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear frontend state and redirect, even if API fails
      logout();
      navigate('/login'); // Redirect to login after logout
    }
  };

  // Handles submitting the search form
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent the default browser form submission
    // Navigate to the homepage, adding the search term as a URL query parameter
    navigate(`/?search=${encodeURIComponent(searchInput)}`);
  };

  // --- JSX Rendering ---
  return (
    <header className="bg-zinc-900 p-4 border-b border-zinc-700 sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center gap-8">

        {/* Site Title/Logo */}
        <Link to="/" className="text-2xl font-bold flex-shrink-0 text-white hover:text-purple-400 transition-colors">SCCS</Link>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative flex-grow max-w-xl">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <FaSearch className="text-zinc-500" />
          </span>
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)} // Update state as user types
            className="bg-zinc-800 border border-zinc-700 text-white rounded-lg w-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </form>

        {/* Authentication Status */}
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-semibold text-zinc-300">{user.anonymousName || user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0 transition-colors"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;