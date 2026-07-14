import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Scissors, CalendarDays, BarChart3,
  Menu, LogOut, ChevronLeft, Bell, CheckCheck, X, Calendar,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';

const navItems = [
  { to: '/salon-dashboard', label: 'Overview',  icon: LayoutDashboard },
  { to: '/salon-services',  label: 'Services',   icon: Scissors },
  { to: '/salon-bookings',  label: 'Bookings',   icon: CalendarDays },
  { to: '/salon-analytics', label: 'Analytics',  icon: BarChart3 },
];

interface SalonNotification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  booking_detail: {
    id: number; client_name: string; service_name: string;
    booking_date: string; booking_time: string; status: string;
  } | null;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const POLL_MS = 20_000;

interface SalonLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const SalonLayout: React.FC<SalonLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const salonOwnerEmail = localStorage.getItem('salonOwnerEmail') || '';
  const salonOwnerInitial = salonOwnerEmail ? salonOwnerEmail[0].toUpperCase() : 'S';
  const token = localStorage.getItem('salonOwnerToken');

  // ── Notifications ─────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<SalonNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBell, setShowBell] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/salon/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unread_count ?? 0);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(t);
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current  && !bellRef.current.contains(e.target as Node)
      ) setShowBell(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    if (!token) return;
    await fetch(`${API_BASE}/notifications/salon/mark_read/`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [] }),
    }).catch(() => {});
    setNotifications(p => p.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const markOneRead = async (id: number) => {
    if (!token) return;
    await fetch(`${API_BASE}/notifications/salon/mark_read/`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => {});
    setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(p => Math.max(0, p - 1));
  };

  const handleNotifClick = (n: SalonNotification) => {
    markOneRead(n.id);
    setShowBell(false);
    navigate('/salon-bookings');
  };

  const handleLogout = () => {
    localStorage.removeItem('salonOwnerEmail');
    localStorage.removeItem('salonOwnerLoggedIn');
    localStorage.removeItem('salonOwnerToken');
    navigate('/login?tab=salon');
  };

  return (
    /**
     * DESKTOP  : sidebar fixed on the left, topbar fixed at the top of the content area.
     *            No external navbar is present, so we don't add any top padding.
     * TABLET   : same as desktop (sidebar visible, topbar fixed)
     * MOBILE   : sidebar slides in as a drawer; hamburger in topbar opens it.
     *
     * Key fix: removed pt-16 / pt-20 / top-16 / top-20 offsets — those assumed a
     * global navbar above the portal which does NOT exist on salon pages.
     */
    <div className="h-screen flex overflow-hidden bg-[#F3F4F6]">

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40
        w-64 flex flex-col shrink-0
        bg-[#111827] border-r border-white/5
        transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10 shrink-0">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center shadow-lg">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Salon Portal</p>
              <p className="text-[#F59E0B] text-[10px] font-semibold tracking-wider">BEAUTYBOOK CM</p>
            </div>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white shadow-lg shadow-purple-900/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-4 pt-3 space-y-1 border-t border-white/10 shrink-0">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Site
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Topbar ── */}
        <header className="shrink-0 z-20 bg-white border-b border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">

            {/* Left: hamburger (mobile/tablet) + page title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] transition"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              {title && (
                <h1 className="text-base lg:text-lg font-bold text-[#111827] capitalize truncate">
                  {title}
                </h1>
              )}
            </div>

            {/* Right: bell + user info + logout */}
            <div className="flex items-center gap-2 lg:gap-3">

              {/* Notification bell */}
              <div className="relative">
                <button
                  ref={bellRef}
                  onClick={() => { setShowBell(p => !p); if (!showBell) fetchNotifications(); }}
                  className="relative p-2 rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification panel */}
                {showBell && (
                  <div
                    ref={panelRef}
                    className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-50 flex flex-col max-h-[70vh] sm:max-h-96 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] shrink-0">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#6D28D9]" />
                        <span className="text-sm font-bold text-[#111827]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#6D28D9] hover:text-[#5B21B6]">
                            <CheckCheck className="w-3.5 h-3.5" /> All read
                          </button>
                        )}
                        <button onClick={() => setShowBell(false)} className="text-[#6B7280] hover:text-[#111827]">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center py-10 gap-2">
                          <Bell className="w-8 h-8 text-[#D1D5DB]" />
                          <p className="text-xs text-[#6B7280]">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-[#F3F4F6]">
                          {notifications.map(n => (
                            <button
                              key={n.id}
                              onClick={() => handleNotifClick(n)}
                              className={`w-full text-left px-4 py-3 hover:bg-[#F9FAFB] transition flex gap-3 items-start ${n.is_read ? 'opacity-60' : ''}`}
                            >
                              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                n.notification_type === 'new_booking' ? 'bg-[#6D28D9]/10' : 'bg-amber-100'
                              }`}>
                                <Calendar className={`w-4 h-4 ${n.notification_type === 'new_booking' ? 'text-[#6D28D9]' : 'text-amber-600'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className={`text-xs font-semibold truncate ${n.is_read ? 'text-[#6B7280]' : 'text-[#111827]'}`}>
                                    {n.title}
                                  </p>
                                  <span className="text-[10px] text-[#9CA3AF] shrink-0">{timeAgo(n.created_at)}</span>
                                </div>
                                <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                                {!n.is_read && <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-[#6D28D9]" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-2 border-t border-[#E5E7EB] shrink-0">
                      <button
                        onClick={() => { setShowBell(false); navigate('/salon-bookings'); }}
                        className="text-xs text-[#6D28D9] hover:underline"
                      >
                        View all bookings →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User info — visible from sm up */}
              {salonOwnerEmail && (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center shadow shrink-0">
                    <span className="text-white text-xs font-bold">{salonOwnerInitial}</span>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-[#111827] leading-tight max-w-[140px] truncate">{salonOwnerEmail}</p>
                    <p className="text-xs text-[#6B7280]">Salon Owner</p>
                  </div>
                </div>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition border border-transparent hover:border-red-100"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Page content (scrollable) ── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SalonLayout;
