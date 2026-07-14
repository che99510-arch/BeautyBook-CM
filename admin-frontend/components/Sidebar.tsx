'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Store,
  Users,
  Calendar,
  CreditCard,
  AlertTriangle,
  Image,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  X,
  MessageSquare,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Salons',
    href: '/salons',
    icon: Store,
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Bookings',
    href: '/bookings',
    icon: Calendar,
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
  {
    label: 'Disputes',
    href: '/disputes',
    icon: AlertTriangle,
  },
  {
    label: 'Advertisements',
    href: '/advertisements',
    icon: Image,
  },
  {
    label: 'Testimonials',
    href: '/testimonials',
    icon: MessageSquare,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when clicking a nav item
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800
          flex flex-col z-50 transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto lg:shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header with Logo & Close Button */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">BeautyBook</h1>
            <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4" aria-label="Main navigation">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-800 p-4">
          {user && (
            <div className="mb-4 pb-4 border-b border-gray-800">
              <p className="text-xs text-gray-500">Logged in as</p>
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
