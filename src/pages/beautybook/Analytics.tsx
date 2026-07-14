import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, Users, Calendar, CheckCircle, AlertCircle,
  DollarSign, Loader, RefreshCw,
} from 'lucide-react';
import SalonLayout from '../../components/beautybook/SalonLayout';
import { API_BASE } from '@/lib/api';

interface AnalyticsData {
  summary: {
    total_revenue: number; monthly_revenue: number;
    total_bookings: number; completed_bookings: number;
    pending_bookings: number; cancelled_bookings: number;
    completion_rate: number; total_clients: number; repeat_clients: number;
  };
  status_breakdown: Record<string, number>;
  category_breakdown: Record<string, number>;
  revenue_by_month: Record<string, number>;
  top_services: Array<{ name: string; bookings: number; revenue: number; category: string }>;
}

const BRAND = { purple: '#6D28D9', amber: '#F59E0B', green: '#10B981', red: '#EF4444', blue: '#3B82F6', dark: '#111827' };
const PIE_COLORS = [BRAND.purple, BRAND.amber, BRAND.green, BRAND.red, BRAND.blue];

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('salonOwnerToken');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!token) { navigate('/salon-login'); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/salons/analytics/`, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.status === 401) { navigate('/salon-login'); return; }
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => { fetch_(); }, [fetch_]);

  if (loading) return (
    <SalonLayout title="Analytics">
      <div className="flex items-center justify-center py-28">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-4 border-[#6D28D9]/20 border-t-[#6D28D9] animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280] font-medium">Loading analytics…</p>
        </div>
      </div>
    </SalonLayout>
  );

  if (error || !data) return (
    <SalonLayout title="Analytics">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800">Failed to load analytics</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button onClick={fetch_}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    </SalonLayout>
  );

  // Chart data
  const revenueChartData = Object.entries(data.revenue_by_month).reverse()
    .map(([month, revenue]) => ({ month, revenue: parseFloat(Number(revenue).toFixed(0)) }));

  const statusChartData = Object.entries(data.status_breakdown)
    .map(([status, count]) => ({ name: status.charAt(0).toUpperCase() + status.slice(1), value: count }));

  const categoryChartData = Object.entries(data.category_breakdown)
    .map(([cat, count]) => ({ name: cat, value: count }));

  const tooltipStyle = {
    backgroundColor: '#fff', border: '1px solid #E5E7EB',
    borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    fontSize: '12px',
  };

  const summaryCards = [
    { icon: DollarSign, label: 'Total Revenue',   value: `${(data.summary.total_revenue/1000).toFixed(1)}K FCFA`,  bg: 'from-[#6D28D9] to-[#7C3AED]' },
    { icon: Calendar,   label: 'Total Bookings',  value: data.summary.total_bookings,                               bg: 'from-[#0EA5E9] to-[#38BDF8]' },
    { icon: CheckCircle,label: 'Completed',       value: data.summary.completed_bookings,                           bg: 'from-[#059669] to-[#10B981]' },
    { icon: AlertCircle,label: 'Pending',         value: data.summary.pending_bookings,                             bg: 'from-[#F59E0B] to-[#FBBF24]' },
    { icon: Users,      label: 'Total Clients',   value: data.summary.total_clients,                                bg: 'from-[#8B5CF6] to-[#A78BFA]' },
    { icon: TrendingUp, label: 'Completion Rate', value: `${data.summary.completion_rate.toFixed(1)}%`,             bg: 'from-[#EC4899] to-[#F472B6]' },
  ];

  return (
    <SalonLayout title="Analytics">
      <div className="space-y-8">

        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-[#6B7280] text-sm">Monitor your salon's performance and growth</p>
          <button onClick={fetch_}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#6B7280] hover:text-[#6D28D9] hover:border-[#6D28D9] transition shadow-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {summaryCards.map(c => {
            const Icon = c.icon;
            return (
              <div key={c.label} className={`bg-gradient-to-br ${c.bg} rounded-2xl p-5 text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">{c.label}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Revenue trend */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6D28D9]" /> Revenue Trend
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} FCFA`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke={BRAND.purple} strokeWidth={2.5}
                  dot={{ fill: BRAND.purple, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: BRAND.purple, strokeWidth: 2, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status pie */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
            <h2 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6D28D9]" /> Bookings by Status
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={3} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}>
                  {statusChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        {(categoryChartData.length > 0 || data.top_services.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {categoryChartData.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
                <h2 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2">
                  <BarChart2Icon /> Bookings by Category
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryChartData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill={BRAND.purple} radius={[8, 8, 0, 0]} name="Bookings">
                      {categoryChartData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {data.top_services.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
                <h2 className="text-base font-bold text-[#111827] mb-5">🏆 Top Services</h2>
                <div className="space-y-4">
                  {data.top_services.map((s, i) => (
                    <div key={i} className="flex items-center justify-between pb-4 border-b border-[#F3F4F6] last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6D28D9]/20 to-[#7C3AED]/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#6D28D9]">#{i+1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#111827] text-sm">{s.name}</p>
                          <p className="text-xs text-[#6B7280]">{s.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#111827]">{s.bookings} bookings</p>
                        <p className="text-xs font-semibold text-green-600">{(s.revenue/1000).toFixed(1)}K FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key insights banner */}
        <div className="bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] rounded-2xl p-7 text-white shadow-lg">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Key Insights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Monthly Revenue', value: `${(data.summary.monthly_revenue/1000).toFixed(1)}K FCFA`, sub: 'Last 30 days' },
              { label: 'Repeat Clients',  value: data.summary.repeat_clients,        sub: `of ${data.summary.total_clients} total` },
              {
                label: 'Cancellation Rate',
                value: `${data.summary.total_bookings > 0 ? ((data.summary.cancelled_bookings/data.summary.total_bookings)*100).toFixed(1) : 0}%`,
                sub: `${data.summary.cancelled_bookings} cancelled`,
              },
            ].map(k => (
              <div key={k.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{k.label}</p>
                <p className="text-3xl font-bold">{k.value}</p>
                <p className="text-white/50 text-xs mt-1">{k.sub}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </SalonLayout>
  );
};

const BarChart2Icon = () => (
  <svg className="w-4 h-4 text-[#6D28D9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

export default Analytics;
