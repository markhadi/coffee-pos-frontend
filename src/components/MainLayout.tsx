'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';
import { Toaster } from 'sonner';
import { DecodedToken } from '@/types/auth';
import { getNavigationByRole } from '@/constants/navigation';

/**
 * Main layout component that wraps the application content
 * Handles user authentication and role-based navigation
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the main content area
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [role, setRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and set user role on component mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/login');
        return;
      }
      const user = JSON.parse(userStr) as DecodedToken;
      setRole(user.role);
      setIsLoading(false);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={role}
        navigation={getNavigationByRole(role)}
        isLoading={isLoading}
      />
      <main className="w-full px-10 py-16 bg-neutral-50 overflow-auto">{children}</main>
      <Toaster
        position="top-right"
        richColors
      />
    </div>
  );
};

export default MainLayout;
