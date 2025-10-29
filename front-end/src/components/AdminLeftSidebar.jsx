import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Renders the navigation sidebar for the Admin section.
 * Highlights the active link based on the current URL path.
 */
function AdminLeftSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Helper function to check if a link is active or is a parent of the current path
  const isActive = (path) => currentPath === path || (path !== '/admin' && currentPath.startsWith(path));

  return (
    <aside className="w-full md:w-56 flex-shrink-0">
      {/* Floating module styling */}
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 shadow-lg h-full">
        <nav className="space-y-2">
          {/* Link to the main admin dashboard */}
          <Link
            to="/admin"
            // Dynamic classes: Apply purple background if active, otherwise apply hover effects
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
              isActive('/admin') ? 'bg-purple-600 font-semibold text-white' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            Complaints Dashboard
          </Link>

          <Link
            to="/admin/users" 
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
              isActive('/admin/users') ? 'bg-purple-600 font-semibold text-white' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            User Management
          </Link>

    

          {/* Add more admin-specific links here as needed */}

        </nav>
      </div>
    </aside>
  );
}

export default AdminLeftSidebar;