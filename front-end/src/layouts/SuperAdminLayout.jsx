import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import SuperAdminLeftSidebar from '../components/SuperAdminLeftSidebar';

function SuperAdminLayout() {
  return (
    // 1. Set the main container to a fixed screen height and a vertical flex layout
    <div className="bg-black text-white h-screen flex flex-col overflow-hidden">
      
      {/* 2. This container grows to fill the remaining space below the header */}
      <div className="flex-grow overflow-hidden">

        {/* 3. This grid contains the sidebar and main content */}
        <div className="max-w-screen-xl mx-auto p-4 md:p-8 w-full h-full grid md:grid-cols-[224px_1fr] gap-8">
          <SuperAdminLeftSidebar />
          
          {/* 4. The <main> element is now scrollable */}
          <main className="h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Outlet /> {/* Child pages like CreateStaffPage will render here and scroll */}
          </main>
        </div>
        
      </div>
    </div>
  );
}

export default SuperAdminLayout;