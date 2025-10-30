import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import SuperAdminLeftSidebar from '../components/SuperAdminLeftSidebar'; // We'll create this next

function SuperAdminLayout() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-screen-xl mx-auto p-8 w-full grid md:grid-cols-[224px_1fr] gap-8">
        <SuperAdminLeftSidebar />
        <main className="h-full">
          <Outlet /> {/* Super Admin pages will render here */}
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;