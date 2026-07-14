import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Star, TrendingUp, Users, ArrowRight,
  CheckCircle, Clock, AlertCircle, Scissors, Loader,
} from 'lucide-react';
import SalonLayout from '../../components/beautybook/SalonLayout';
import { API_BASE } from '@/lib/api';

interface DashboardData {
  salon: { id: number; name: string; location: string; rating: number };
  stats: { total_bookings: number; monthly_revenue: number; total_clients: number; rating: number };
  upcoming_bookings: Array<{
    id: number; client_name: string; service_name: string;
    booking_date: string; booking_time: string; status: string;
  }>;
  services: Array<{ id: number; name: string; category: string; price: number }>;
  analytics: {
    status_breakdown: Record<string, number>;
    category_breakdown: Record<string, number>;
    revenue_by_month: Record<string, number>;
  };
}

const statusMeta: Record<string, { label: string; cls: string }> = {
  confirmed:            { label: 'Confirmed',   cls: 'bg-[#6D28D9]/10 text-[#6D28D9]' },
  pending:              { label: 'Pending',     cls: 'bg-[#F59E0B]/10 text-[#D97706]' },
  declined:             { label: 'Declined',    cls: 'bg-red-100 text-red-700' },
  reschedule_requested: { label: 'Reschedule',  cls: 'bg-blue-100 text-blue-700' },
  completed:            { label: 'Completed',   cls: 'bg-green-100 text-green-700' },
  expired:              { label: 'Expired',     cls: 'bg-gray-100 text-gray-500' },
  cancelled:            { label: 'Cancelled',   cls: 'bg-red-100 text-red-600' },
};

const SalonDashboard: React.FC = () => {
  const navigate = useNavigate();
  const salonOwnerToken = localStorage.getItem('salonOwnerToken');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchDashboard = async () => {
    if (!salonOwnerToken) { navigate('/salon-login'); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/salons/dashboard/`, {
        headers: { Authorization: `Token ${salonOwnerToken}`, 'Content-Type': 'application/json' },
      });
      if (res.status === 401) { navigate('/salon-login'); return; }
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const quickApprove = async (bookingId: number) => {
    setActionLoading(p => ({ ...p, [bookingId]: 'confirm' }));
    try {
      await fetch(`${API_BASE}/bookings/${bookingId}/confirm/`, {
        method: 'POST', headers: { Authorization: `Token ${salonOwnerToken}` },
      });
      showToast('Booking approved! Customer notified.');
      await fetchDashboard();
    } catch { showToast('Failed to approve'); }
    finally { setActionLoading(p => ({ ...p, [bookingId]: '' })); }
  };

  useEffect(() => { fetchDashboard(); }, [salonOwnerToken]);

  const statCards = data ? [
    {
      icon: Calendar, label: 'Total Bookings',
      value: data.stats.total_bookings.toLocaleString(),
      bg: 'from-[#6D28D9] to-[#7C3AED]', iconBg: 'bg-white/20',
    },
    {
      icon: TrendingUp, label: 'Monthly Revenue',
      value: `${(data.stats.monthly_revenue / 1000).toFixed(1)}K FCFA`,
      bg: 'from-[#F59E0B] to-[#FBBF24]', iconBg: 'bg-white/20',
    },
    {
      icon: Users, label: 'Total Clients',
      value: data.stats.total_clients.toLocaleString(),
      bg: 'from-[#059669] to-[#10B981]', iconBg: 'bg-white/20',
    },
    {
      icon: Star, label: 'Average Rating',
      value: `${Number(data.stats.rating).toFixed(1)} / 5`,
      bg: 'from-[#0EA5E9] to-[#38BDF8]', iconBg: 'bg-white/20',
    },
  ] : [];

  return (
    <SalonLayout title="Overview">
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full border-4 border-[#6D28D9]/30 border-t-[#6D28D9] animate-spin mx-auto mb-4" />
            <p className="text-[#6B7280] font-medium">Loading dashboard…</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Failed to load dashboard</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition">
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-8">

          {/* Toast */}
          {toast && (
            <div className="fixed top-24 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#6D28D9] text-white rounded-xl shadow-xl text-sm font-semibold">
              <CheckCircle className="w-4 h-4" /> {toast}
            </div>
          )}

          {/* Pending booking alert */}
          {data.upcoming_bookings.filter(b => b.status === 'pending').length > 0 && (
            <div className="bg-[#F59E0B]/10 border-2 border-[#F59E0B]/40 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                <h3 className="text-sm font-bold text-[#111827]">
                  {data.upcoming_bookings.filter(b => b.status === 'pending').length} booking{data.upcoming_bookings.filter(b => b.status === 'pending').length > 1 ? 's' : ''} awaiting your response
                </h3>
              </div>
              <div className="space-y-2">
                {data.upcoming_bookings.filter(b => b.status === 'pending').map(b => (
                  <div key={b.id} className="bg-white rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#111827] truncate">{b.client_name}</p>
                      <p className="text-xs text-[#6B7280] truncate">{b.service_name} · {new Date(b.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at {b.booking_time.substring(0, 5)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => quickApprove(b.id)}
                        disabled={!!actionLoading[b.id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6D28D9] text-white text-xs font-bold hover:bg-[#5B21B6] transition disabled:opacity-60"
                      >
                        {actionLoading[b.id] === 'confirm'
                          ? <Loader className="w-3 h-3 animate-spin" />
                          : <CheckCircle className="w-3 h-3" />}
                        Approve
                      </button>
                      <button
                        onClick={() => navigate('/salon-bookings')}
                        className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#6B7280] hover:text-[#111827] hover:border-gray-400 transition"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Welcome */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#111827]">
                Welcome back 👋
              </h1>
              <p className="text-[#6B7280] mt-1">{data.salon.name} · {data.salon.location}</p>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
              <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="font-bold text-[#111827]">{Number(data.salon.rating).toFixed(1)}</span>
              <span className="text-xs text-[#6B7280]">rating</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-2xl p-5 text-white shadow-lg`}>
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              );
            })}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Upcoming bookings */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#6D28D9]" />
                  Upcoming Bookings
                </h2>
                <button
                  onClick={() => navigate('/salon-bookings')}
                  className="flex items-center gap-1 text-[#6D28D9] text-sm font-medium hover:underline"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {data.upcoming_bookings.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Calendar className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
                  <p className="text-[#6B7280] text-sm">No upcoming bookings</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {data.upcoming_bookings.map(b => {
                    const meta = statusMeta[b.status] ?? { label: b.status, cls: 'bg-gray-100 text-gray-600' };
                    return (
                      <div key={b.id} className="px-6 py-4 hover:bg-[#F9FAFB] transition flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6D28D9]/20 to-[#7C3AED]/20 flex items-center justify-center shrink-0">
                            <span className="text-[#6D28D9] text-xs font-bold">{b.client_name[0]?.toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#111827] text-sm truncate">{b.client_name}</p>
                            <p className="text-xs text-[#6B7280] truncate">{b.service_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-medium text-[#111827]">
                              {new Date(b.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </p>
                            <p className="text-xs text-[#6B7280]">{b.booking_time.substring(0, 5)}</p>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar cards */}
            <div className="space-y-5">

              {/* Status breakdown */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
                  <BarChart3Icon />
                  Bookings by Status
                </h3>
                <div className="space-y-3">
                  {Object.entries(data.analytics.status_breakdown).map(([status, count]) => {
                    const total = Object.values(data.analytics.status_breakdown).reduce((a,b) => a+b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    const colors: Record<string, string> = {
                      pending: 'bg-[#F59E0B]', confirmed: 'bg-[#6D28D9]',
                      completed: 'bg-emerald-500', cancelled: 'bg-red-400',
                    };
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="capitalize text-[#6B7280] font-medium">{status}</span>
                          <span className="text-[#111827] font-semibold">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${colors[status] ?? 'bg-gray-400'} transition-all duration-500`}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="text-sm font-bold text-[#111827] mb-4">Quick Actions</h3>
                <div className="space-y-2.5">
                  <button onClick={() => navigate('/salon-services')}
                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-300/40 transition-all">
                    Manage Services
                  </button>
                  <button onClick={() => navigate('/salon-bookings')}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F59E0B] text-[#111827] font-semibold text-sm hover:bg-[#D97706] hover:text-white transition">
                    View Bookings
                  </button>
                  <button onClick={() => navigate('/salon-analytics')}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[#111827] font-semibold text-sm hover:border-[#6D28D9] hover:text-[#6D28D9] transition">
                    Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Services snapshot */}
          {data.services.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#6D28D9]" />
                  Your Services
                </h2>
                <button onClick={() => navigate('/salon-services')}
                  className="text-[#6D28D9] text-sm font-medium hover:underline flex items-center gap-1">
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E7EB]">
                {data.services.slice(0, 4).map(s => (
                  <div key={s.id} className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9] bg-[#6D28D9]/10 px-2 py-0.5 rounded-full">
                      {s.category}
                    </span>
                    <p className="font-semibold text-[#111827] text-sm mt-2">{s.name}</p>
                    <p className="text-[#F59E0B] font-bold text-sm mt-1">{s.price.toLocaleString()} FCFA</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SalonLayout>
  );
};

// tiny inline icon component to avoid extra import
const BarChart3Icon = () => (
  <svg className="w-4 h-4 text-[#6D28D9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/>
  </svg>
);

export default SalonDashboard;
