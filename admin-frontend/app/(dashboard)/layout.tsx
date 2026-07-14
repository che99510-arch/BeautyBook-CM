'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, isLoading } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (mounted && !token && !isLoading) {
      router.push('/login');
    }
  }, [token, isLoading, mounted, router]);

  if (!mounted || isLoading || !token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar — in-flow on desktop (relative), fixed drawer on mobile/tablet */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar — fixed, offset by sidebar width on desktop */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto pt-16 px-4 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
