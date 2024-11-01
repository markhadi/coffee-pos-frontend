'use client';

import LogoutButton from '@/components/LogoutButton';

const CashierPage = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cashier Dashboard</h1>
        <LogoutButton />
      </div>
    </div>
  );
};

export default CashierPage;
