import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth { user: User; }

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavItemChild {
  title: string;
  href: NonNullable<InertiaLinkProps['href']>;
  disabled?: boolean;
}

export interface NavItem {
  title: string;
  href?: NonNullable<InertiaLinkProps['href']>; // padre puede NO tener href
  icon?: LucideIcon | null;
  isActive?: boolean;
  items?: NavItemChild[];                       // submenú
}

export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: Auth;
  sidebarOpen: boolean;
  [key: string]: unknown;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
  [key: string]: unknown;
}
