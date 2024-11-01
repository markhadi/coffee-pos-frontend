'use client';

import LogoutButton from '@/components/LogoutButton';

const AdminPage = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </div>
    </div>
  );
};

export default AdminPage;
