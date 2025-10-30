import React from 'react';

function SuperAdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Super Admin Dashboard</h1>
      <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700">
        <h2 className="text-xl font-bold text-white mb-4">Welcome, Super Admin</h2>
        <p className="text-zinc-400">
          Select an option from the sidebar to manage users, create new admins, or add locations.
        </p>
      </div>
    </div>
  );
}

export default SuperAdminDashboardPage;