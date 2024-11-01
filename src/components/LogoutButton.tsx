'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const { logout, isLoading } = useAuth();

  return (
    <Button
      onClick={logout}
      disabled={isLoading}
      variant="destructive"
      className="flex items-center gap-2 h-max text-[16px] font-bold"
    >
      <LogOut
        strokeWidth={4}
        className="h-4 w-4"
      />
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
