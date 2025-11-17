import React from 'react';
import { Outlet } from 'react-router-dom';
// Adjust this import path to match where your sidebar is located
import AdminLeftSidebar from '../components/AdminLeftSidebar'; 

function AdminLayout() {
  return (
    // 1. h-screen: Forces the layout to be exactly the height of the window
    // 2. overflow-hidden: Prevents the whole browser window from having double scrollbars
    <div className="flex h-screen bg-black overflow-hidden">
      
      {/* Your Sidebar remains fixed on the left */}
      <AdminLeftSidebar />

      {/* Main Content Area */}
      {/* 1. flex-1: Takes up all remaining width */}
      {/* 2. overflow-y-auto: THIS IS THE FIX. It allows this specific area to scroll vertically */}
      <main className="flex-1 overflow-y-auto p-4 relative">
        {/* This renders your AdminDashboard */}
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;