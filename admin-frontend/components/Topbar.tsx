'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Bell, LogOut, User, Menu, X, CheckCheck,
  Calendar, Store, Star, Users, CreditCard, TrendingUp,
  AlertCircle, CheckCircle, Info,
} from 'lucide-react';
import Link from 'next/link';
import apiService from '@/services/api';

interface TopbarProps {
  onMenuClick: () => void;
}

// Notification preference keys (must match backend pref_key values)
const NOTIF_KEY = 'admin_notification_prefs';
const ALL_PREF_KEYS = ['disputes', 'refunds', 'suspensions', 'daily', 'weekly', 'maintenance'];

interface Notification {
  id: string;
  type: string;
  pref_key: string;
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  link: string;
  timestamp: string;
  read: boolean;
}

// ── helpers ────────────────────────────────────────────────────────────────
function getEnabledPrefs(): string[] {
  try {
    const saved = localStorage.getItem(NOTIF_KEY);
    if (!saved) return ALL_PREF_KEYS; // default: all enabled
    const prefs: { id: string; enabled: boolean }[] = JSON.parse(saved);
    return prefs.filter(p => p.enabled).map(p => p.id);
  } catch {
    return ALL_PREF_KEYS;
  }
}

function severityIcon(severity: Notification['severity']) {
  const base = 'w-4 h-4 shrink-0';
  switch (severity) {
    case 'error':   return <AlertCircle className={`${base} text-red-400`} />;
    case 'warning': return <AlertCircle className={`${base} text-amber-400`} />;
    case 'success': return <CheckCircle className={`${base} text-green-400`} />;
    default:        return <Info        className={`${base} text-blue-400`} />;
  }
}

function typeIcon(type: string) {
  const base = 'w-4 h-4';
  switch (type) {
    case 'booking':     return <Calendar  className={`${base} text-purple-400`} />;
    case 'salon':       return <Store     className={`${base} text-amber-400`} />;
    case 'testimonial': return <Star      className={`${base} text-yellow-400`} />;
    case 'users':       return <Users     className={`${base} text-blue-400`} />;
    case 'payment':     return <CreditCard className={`${base} text-red-400`} />;
    case 'revenue':     return <TrendingUp className={`${base} text-green-400`} />;
    default:            return <Bell      className={`${base} text-gray-400`} />;
  }
}

function severityBg(severity: Notification['severity']) {
  switch (severity) {
    case 'error':   return 'bg-red-900/30 border-red-800/40';
    case 'warning': return 'bg-amber-900/30 border-amber-800/40';
    case 'success': return 'bg-green-900/20 border-green-800/30';
    default:        return 'bg-gray-700/40 border-gray-600/40';
  }
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

// ── Poll interval: 30 seconds ──────────────────────────────────────────────
const POLL_MS = 30_000;

// ── Topbar component ───────────────────────────────────────────────────────
export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef  = useRef<HTMLButtonElement>(null);

  // Page title from path
  const pageTitle = pathname.split('/').filter(Boolean).pop() || 'dashboard';
  const formattedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  // Fetch notifications (respects prefs from localStorage)
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setNotifLoading(true);
    try {
      const prefs = getEnabledPrefs();
      const data = await apiService.getNotifications(prefs);
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unread_count ?? 0);
    } catch {
      // silently fail — don't disrupt the UI
    } finally {
      if (!silent) setNotifLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(() => fetchNotifications(true), POLL_MS);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current  && !bellRef.current.contains(e.target as Node)
      ) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = () => {
    setShowNotifPanel(prev => !prev);
    setShowUserDropdown(false);
    if (!showNotifPanel) fetchNotifications(); // refresh on open
  };

  const handleMarkAllRead = async () => {
    try {
      await apiService.markNotificationsRead([]); // empty = all
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await apiService.markNotificationsRead([id]);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleNotifClick = (notif: Notification) => {
    handleMarkOneRead(notif.id);
    setShowNotifPanel(false);
    router.push(notif.link);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 lg:px-6 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
          aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white">{formattedTitle}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* ── Bell button ── */}
        <button ref={bellRef} onClick={handleBellClick}
          className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
          aria-label="Notifications">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* ── Notification Panel ── */}
        {showNotifPanel && (
          <div ref={panelRef}
            className="absolute top-14 right-4 lg:right-6 w-[380px] max-w-[calc(100vw-2rem)] bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[520px]">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition">
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button onClick={() => setShowNotifPanel(false)}
                  className="p-1 text-gray-500 hover:text-white transition rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {notifLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <CheckCircle className="w-10 h-10 text-gray-600" />
                  <p className="text-gray-500 text-sm">All caught up!</p>
                  <p className="text-gray-600 text-xs">No notifications right now.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700/50">
                  {notifications.map(notif => (
                    <button key={notif.id} onClick={() => handleNotifClick(notif)}
                      className={`w-full text-left px-4 py-3 transition hover:bg-gray-700/40 flex items-start gap-3
                        ${notif.read ? 'opacity-60' : ''}`}>

                      {/* Type icon in coloured circle */}
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0
                        ${severityBg(notif.severity)} border`}>
                        {typeIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-semibold truncate ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {severityIcon(notif.severity)}
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">{timeAgo(notif.timestamp)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                        {!notif.read && (
                          <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full bg-purple-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-700 shrink-0">
              <Link href="/settings" onClick={() => setShowNotifPanel(false)}
                className="text-xs text-gray-500 hover:text-purple-400 transition">
                Manage notification preferences →
              </Link>
            </div>
          </div>
        )}

        {/* ── User menu ── */}
        <div className="relative">
          <button onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifPanel(false); }}
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
            aria-label="User menu" aria-expanded={showUserDropdown}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">{user?.name || 'Admin'}</span>
          </button>

          {showUserDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} aria-hidden="true" />
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
