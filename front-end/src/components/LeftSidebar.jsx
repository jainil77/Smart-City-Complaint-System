import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // 👈 Import useLocation

function LeftSidebar() {
  const location = useLocation(); // Get the current URL
  const currentPath = location.pathname;

  // Helper to determine if a link is active
  const isActive = (path) => currentPath === path;

  return (
    <aside className="hidden md:block w-full md:w-56 flex-shrink-0">
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 shadow-lg ">
        <nav className="space-y-2">
          <Link 
            to="/" 
            className={`flex items-center p-3 rounded-lg ${isActive('/') ? 'bg-purple-600 font-semibold text-white' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'}`}>
            Home
          </Link>
          <Link 
            to="/lodge-complaint" 
            className={`flex items-center p-3 rounded-lg ${isActive('/lodge-complaint') ? 'bg-purple-600 font-semibold text-white' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'}`}>
            Lodge Complaint
          </Link>
          <Link 
            to="/my-complaints" // 👈 Set the correct path
            className={`flex items-center p-3 rounded-lg ${isActive('/my-complaints') ? 'bg-purple-600 font-semibold text-white' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'}`}>
            My Complaints
          </Link>
          <Link 
            to="/map" 
            className={`flex items-center p-3 rounded-lg ${isActive('/map') ? 'bg-purple-600 font-semibold text-white' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'}`}>
            Map
          </Link>
        </nav>
      </div>
    </aside>
  );
}

export default LeftSidebar;