import { LayoutGrid, DollarSign, Package, Tag, User, CreditCard, ChartArea } from 'lucide-react';
import { NavigationItem } from '@/types/navigation';

/**
 * Navigation configuration for different user roles
 * Contains the menu items and their properties for each role
 *
 * @property {NavigationItem[]} ADMIN - Navigation items for admin users
 * @property {NavigationItem[]} CASHIER - Navigation items for cashier users
 */
export const NAVIGATION_CONFIG: Record<string, NavigationItem[]> = {
  ADMIN: [
    { name: 'Dashboard', href: '/admin', icon: LayoutGrid },
    { name: 'Transactions', href: '/admin/transactions', icon: DollarSign },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Users', href: '/admin/users', icon: User },
    { name: 'Payment Method', href: '/admin/payment-methods', icon: CreditCard },
    { name: 'Reports', href: '/admin/reports', icon: ChartArea },
  ],
  CASHIER: [
    { name: 'Dashboard', href: '/cashier', icon: LayoutGrid },
    { name: 'Transactions', href: '/cashier/transactions', icon: DollarSign },
  ],
};

/**
 * Get navigation items based on user role
 *
 * @param {string} role - User role (ADMIN or CASHIER)
 * @returns {NavigationItem[]} Array of navigation items for the specified role
 * @default Returns CASHIER navigation if role is not found
 */
export const getNavigationByRole = (role: string): NavigationItem[] => {
  return [...(NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.CASHIER)];
};
