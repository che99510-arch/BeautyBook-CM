'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StatsCard } from '@/components/StatsCard';
import apiService from '@/services/api';
import {
  Store,
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  Activity,
  Loader2,
} from 'lucide-react';

interface DashboardData {
  summary: {
    total_customers: number;
    total_salons: number;
    total_bookings: number;
    total_revenue: number;
    total_booking_fees: number;
  };
  booking_stats: {
    pending_bookings: number;
    confirmed_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
  };
  payment_stats: {
    pending_payments: number;
    paid_payments: number;
    failed_payments: number;
  };
  growth_metrics: {
    new_customers_this_month: number;
    new_salons_this_month: number;
    bookings_this_month: number;
    revenue_this_month: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await apiService.getDashboardOverview();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const stats = {
    totalSalons: dashboardData.summary.total_salons,
    salonsTrend: { value: dashboardData.growth_metrics.new_salons_this_month, isPositive: true },
    totalCustomers: dashboardData.summary.total_customers,
    customersTrend: { value: dashboardData.growth_metrics.new_customers_this_month, isPositive: true },
    activeBookings: dashboardData.booking_stats.pending_bookings,
    bookingsTrend: { value: dashboardData.growth_metrics.bookings_this_month, isPositive: true },
    totalRevenue: `$${dashboardData.summary.total_booking_fees.toLocaleString()}`,
    revenueTrend: { value: 15, isPositive: true },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, {user?.name || 'Admin'}! Here's what's happening on BeautyBook.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Salons"
          value={stats.totalSalons}
          icon={Store}
          trend={stats.salonsTrend}
          color="purple"
        />
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          trend={stats.customersTrend}
          color="blue"
        />
        <StatsCard
          title="Active Bookings"
          value={stats.activeBookings}
          icon={Calendar}
          trend={stats.bookingsTrend}
          color="green"
        />
        <StatsCard
          title="Total Revenue (Fees)"
          value={stats.totalRevenue}
          icon={CreditCard}
          trend={stats.revenueTrend}
          color="amber"
        />
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Booking Status */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Booking Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Pending</span>
              <span className="text-lg font-bold text-blue-400">
                {dashboardData.booking_stats.pending_bookings}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Confirmed</span>
              <span className="text-lg font-bold text-purple-400">
                {dashboardData.booking_stats.confirmed_bookings}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Completed</span>
              <span className="text-lg font-bold text-green-400">
                {dashboardData.booking_stats.completed_bookings}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Cancelled</span>
              <span className="text-lg font-bold text-red-400">
                {dashboardData.booking_stats.cancelled_bookings}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Stats */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Pending</span>
              <span className="text-lg font-bold text-amber-400">
                {dashboardData.payment_stats.pending_payments}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Paid</span>
              <span className="text-lg font-bold text-green-400">
                {dashboardData.payment_stats.paid_payments}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Failed</span>
              <span className="text-lg font-bold text-red-400">
                {dashboardData.payment_stats.failed_payments}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          This Month's Growth
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">New Customers</p>
            <p className="text-2xl font-bold text-white">
              {dashboardData.growth_metrics.new_customers_this_month}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">New Salons</p>
            <p className="text-2xl font-bold text-white">
              {dashboardData.growth_metrics.new_salons_this_month}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Bookings</p>
            <p className="text-2xl font-bold text-white">
              {dashboardData.growth_metrics.bookings_this_month}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Revenue (Fees)</p>
            <p className="text-2xl font-bold text-green-400">
              ${dashboardData.growth_metrics.revenue_this_month.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Info */}
      <div className="mt-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          <strong>Note:</strong> Revenue shown is from booking fees only (10% commission). 
          Total service revenue: <span className="font-bold">${dashboardData.summary.total_revenue.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}
