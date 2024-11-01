import { LucideIcon } from 'lucide-react';

/**
 * Interface for navigation menu items
 *
 * @property {string} name - Display name of the navigation item
 * @property {string} href - URL path for the navigation item
 * @property {LucideIcon} icon - Lucide icon component to display
 */
export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}
