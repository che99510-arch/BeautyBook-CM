'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download, TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react';
import apiService from '../../../services/api';

// ── Tiny inline bar chart (no external lib needed) ─────────────────────────
function BarChart({ data, color = '#9333ea' }: { data: { label: string; value: number }[]; color?: string }) {
  if (!data.length) return <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-48 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div className="w-full rounded-t-sm transition-all duration-500"
            style={{ height: `${Math.max((d.value / max) * 160, 4)}px`, background: color, opacity: 0.85 }} />
          <span className="text-[9px] text-gray-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Inline donut chart ─────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No data</div>;

  let cumulative = 0;
  const cx = 60; const cy = 60; const r = 50; const inner = 30;
  const toXY = (pct: number) => {
    const rad = (pct * 2 * Math.PI) - Math.PI / 2;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const innerXY = (pct: number) => {
    const rad = (pct * 2 * Math.PI) - Math.PI / 2;
    return { x: cx + inner * Math.cos(rad), y: cy + inner * Math.sin(rad) };
  };

  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" className="shrink-0">
        {segments.map((seg, i) => {
          const frac = seg.value / total;
          const start = cumulative;
          const end = cumulative + frac;
          cumulative = end;
          const s1 = toXY(start); const e1 = toXY(end);
          const s2 = innerXY(end); const e2 = innerXY(start);
          const large = frac > 0.5 ? 1 : 0;
          const d = `M ${s1.x} ${s1.y} A ${r} ${r} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${inner} ${inner} 0 ${large} 0 ${e2.x} ${e2.y} Z`;
          return <path key={i} d={d} fill={seg.color} opacity={0.9} />;
        })}
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-xs text-gray-300">{seg.label}</span>
            <span className="text-xs text-gray-500 ml-auto pl-2">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [reportType, setReportType] = useState('monthly');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [salonsData, setSalonsData] = useState<any>(null);
  const [revenueByDate, setRevenueByDate] = useState<any[]>([]);
  const [bookingsData, setBookingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prevOverview, setPrevOverview] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [overview, salons, revenue, bookings] = await Promise.allSettled([
        apiService.getReportOverview(),
        apiService.getSalonsReport(reportType),
        apiService.getRevenueByDate(30),
        apiService.getBookingsReport(reportType),
      ]);
      setPrevOverview(overviewData);
      if (overview.status === 'fulfilled') setOverviewData(overview.value.overview ?? overview.value);
      if (salons.status   === 'fulfilled') setSalonsData(salons.value);
      if (revenue.status  === 'fulfilled') setRevenueByDate(Array.isArray(revenue.value) ? revenue.value : []);
      if (bookings.status === 'fulfilled') setBookingsData(bookings.value);
    } catch (e) {
      console.error('Reports fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [reportType]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Compute trend vs previous snapshot (or show 0)
  const trend = (curr: number, prev: number | undefined) => {
    if (!prev || prev === 0) return 0;
    return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
  };

  const metrics = overviewData ? [
    {
      label: 'Total Revenue',
      value: `${Number(overviewData.total_revenue ?? 0).toLocaleString()} FCFA`,
      change: trend(overviewData.total_revenue, prevOverview?.total_revenue),
    },
    {
      label: 'Completed Bookings',
      value: Number(overviewData.completed_bookings ?? 0).toLocaleString(),
      change: trend(overviewData.completed_bookings, prevOverview?.completed_bookings),
    },
    {
      label: 'Active Salons',
      value: Number(overviewData.active_salons ?? 0).toLocaleString(),
      change: trend(overviewData.active_salons, prevOverview?.active_salons),
    },
    {
      label: 'New Users / Month',
      value: Number(overviewData.new_users_this_month ?? 0).toLocaleString(),
      change: trend(overviewData.new_users_this_month, prevOverview?.new_users_this_month),
    },
    {
      label: 'Avg Booking Value',
      value: `${Number(overviewData.average_booking_value ?? 0).toFixed(0)} FCFA`,
      change: trend(overviewData.average_booking_value, prevOverview?.average_booking_value),
    },
    {
      label: 'Active Users',
      value: overviewData.total_users
        ? `${((overviewData.active_users / overviewData.total_users) * 100).toFixed(1)}%`
        : '—',
      change: 0,
    },
  ] : [];

  // Revenue bar chart — last 30 days grouped by week
  const revenueChartData = (() => {
    if (!revenueByDate.length) return [];
    // Group into 6 buckets of 5 days
    const buckets: { label: string; value: number }[] = [];
    for (let i = 0; i < revenueByDate.length; i += 5) {
      const slice = revenueByDate.slice(i, i + 5);
      const total = slice.reduce((s: number, d: any) => s + (d.revenue ?? 0), 0);
      const label = slice[0]?.date?.slice(5) ?? `W${Math.floor(i / 5) + 1}`;
      buckets.push({ label, value: total });
    }
    return buckets;
  })();

  // Booking distribution donut
  const bookingSegments = bookingsData?.status_breakdown
    ? [
        { label: 'Completed', value: bookingsData.status_breakdown.completed ?? 0, color: '#22c55e' },
        { label: 'Confirmed', value: bookingsData.status_breakdown.confirmed ?? 0, color: '#a855f7' },
        { label: 'Pending',   value: bookingsData.status_breakdown.pending   ?? 0, color: '#3b82f6' },
        { label: 'Cancelled', value: bookingsData.status_breakdown.cancelled ?? 0, color: '#ef4444' },
      ]
    : [];

  const handleExportReport = async () => {
    try {
      const csvData = await apiService.generateReport('overview', reportType);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_overview_report.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export report');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-gray-400">Comprehensive platform analytics and reporting.</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Report Controls */}
      <div className="mb-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Period</h3>
            <div className="flex flex-wrap gap-2">
              {['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].map(type => (
                <button key={type} onClick={() => setReportType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize
                    ${reportType === type ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleExportReport}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
            <Download className="w-5 h-5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, i) => {
            const isPositive = metric.change >= 0;
            return (
              <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <p className="text-gray-400 text-sm font-medium mb-2">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                  {metric.change !== 0 && (
                    <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-sm font-semibold">{Math.abs(metric.change)}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts + Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend — real bar chart */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" /> Revenue Trend (last 30 days)
          </h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <BarChart data={revenueChartData} color="#9333ea" />
          )}
          <p className="text-xs text-gray-500 mt-2 text-center">Revenue in FCFA · grouped by 5-day windows</p>
        </div>

        {/* Booking Distribution — real donut */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" /> Booking Distribution
          </h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <DonutChart segments={bookingSegments} />
          )}
          <p className="text-xs text-gray-500 mt-3 text-center">Breakdown by booking status</p>
        </div>

        {/* Top 5 Salons */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🏆 Top 5 Salons</h3>
          <div className="space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-700 rounded-lg animate-pulse" />)
            ) : salonsData?.salons?.length ? (
              salonsData.salons.slice(0, 5).map((salon: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-purple-400 w-6">#{i + 1}</span>
                    <span className="text-sm text-white truncate max-w-[160px]">{salon.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-400 shrink-0">
                    {Number(salon.total_revenue).toLocaleString()} FCFA
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4 text-sm">No salon data yet</p>
            )}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">👥 Customer Segments</h3>
          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-700 rounded-lg animate-pulse" />)
            ) : overviewData ? (
              [
                { segment: 'Active Users',         count: overviewData.active_users,         total: overviewData.total_users },
                { segment: 'New This Month',        count: overviewData.new_users_this_month, total: overviewData.total_users },
                { segment: 'Inactive Users',        count: overviewData.total_users - overviewData.active_users, total: overviewData.total_users },
              ].map((seg, i) => {
                const pct = overviewData.total_users ? Math.round((seg.count / overviewData.total_users) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{seg.segment}</span>
                      <span className="text-gray-400">{seg.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center py-4 text-sm">No user data</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          <strong>Note:</strong> Revenue trend and booking distribution reflect real-time data from the selected period.
          Export generates a CSV summary for the selected timeframe.
        </p>
      </div>
    </div>
  );
}
