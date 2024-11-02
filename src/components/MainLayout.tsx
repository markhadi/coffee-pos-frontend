'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';
import { Toaster } from 'sonner';
import { getNavigationByRole } from '@/constants/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, isLoading } = useAuth();

  // Check authentication on component mount
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={user.role}
        navigation={getNavigationByRole(user.role)}
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
