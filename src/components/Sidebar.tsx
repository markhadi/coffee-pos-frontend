'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';
import { NavigationItem } from '@/types/navigation';
import SidebarSkeleton from './skeletons/SidebarSkeleton';

interface SidebarProps {
  role: string;
  navigation: NavigationItem[];
  isLoading?: boolean;
}

/**
 * Navigation link component for sidebar items
 *
 * @component
 * @param {Object} props - Component props
 * @param {NavigationItem} props.item - Navigation item data
 * @param {boolean} props.isActive - Whether the link is currently active
 * @param {() => void} [props.onClick] - Optional click handler
 */
const NavLink: React.FC<{ item: NavigationItem; isActive: boolean; onClick?: () => void }> = ({ item: { name, href, icon: Icon }, isActive, onClick }) => (
  <li>
    <Link
      href={href}
      className={`px-4 py-2 flex gap-2 items-center font-bold rounded-md w-full min-w-max hover:bg-indigo-700 hover:text-white transition-all duration-300 ${isActive ? 'bg-indigo-200 text-indigo-600' : ''}`}
      onClick={onClick}
    >
      <Icon />
      <span>{name}</span>
    </Link>
  </li>
);

/**
 * Sidebar component that displays navigation menu
 * Includes both desktop and mobile responsive versions
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.role - User role
 * @param {NavigationItem[]} props.navigation - Navigation items to display
 */
const Sidebar: React.FC<SidebarProps> = ({ navigation, isLoading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (isLoading) {
    return <SidebarSkeleton />;
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  /**
   * Renders navigation menu items
   *
   * @param {() => void} [onClick] - Optional click handler for mobile navigation
   * @returns {JSX.Element} Navigation menu
   */
  const renderNavigation = (onClick?: () => void) => (
    <nav>
      <ul className="flex flex-col gap-2 text-neutral-900">
        {navigation.map(item => (
          <NavLink
            key={item.name}
            item={item}
            isActive={pathname === item.href}
            onClick={onClick}
          />
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        onClick={toggleSidebar}
        className="sm:hidden fixed top-4 bg-white shadow-xl right-10 z-50 h-max p-3 rounded-lg flex items-center justify-center"
      >
        {isOpen ? (
          <X
            strokeWidth={3}
            className="h-6 w-6"
          />
        ) : (
          <Menu
            strokeWidth={3}
            className="h-6 w-6"
          />
        )}
      </button>

      {/* Desktop sidebar */}
      <section className="bg-indigo-50 px-6 py-16 w-80 flex-col justify-between hidden sm:flex">
        {renderNavigation()}
        <LogoutButton />
      </section>

      {/* Mobile sidebar */}
      <div className={`fixed z-30 flex inset-0 w-full h-full bg-black/50 transition-opacity duration-300 sm:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed top-0 left-0 bg-indigo-50 w-max px-4 py-8 pt-16 h-full flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {renderNavigation(toggleSidebar)}
          <LogoutButton />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
