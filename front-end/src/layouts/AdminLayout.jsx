import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import AdminLeftSidebar from '../components/AdminLeftSidebar';

function AdminLayout() {
  return (
    <div className="bg-black text-white min-h-screen">
    
      <div className="mx-auto p-4 md:p-8 w-full grid md:grid-cols-[224px_1fr] gap-8">
        {/* Sidebar remains hidden on small screens (handled within its component) */}
        <AdminLeftSidebar />
        {/* Ensure main takes full width by default */}
        <main className="w-full"> 
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;