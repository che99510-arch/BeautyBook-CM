'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle, Clock, AlertCircle, Eye, DollarSign, TrendingUp, Info, ShieldCheck, XCircle, Loader2 } from 'lucide-react';
import ActionDropdown, { ActionMenuItem } from '@/components/ActionDropdown';
import apiService from '@/services/api';

interface Payment {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  salon_name: string;
  service_name: string;
  booking_date: string;
  booking_status: string;
  service_price: string;
  booking_fee: string;
  payment_method: string;
  momo_reference: string | null;
  status: 'pending' | 'paid' | 'verified' | 'failed';
  created_at: string;
  paid_at: string | null;
}

interface PaymentStats {
  total_revenue: string;
  today_revenue: string;
  pending_payments: number;
  verified_payments: number;
  failed_payments: number;
  total_transactions: number;
}

const statusConfig = {
  paid:     { icon: CheckCircle,  color: 'text-green-400',  label: 'Paid' },
  pending:  { icon: Clock,        color: 'text-blue-400',   label: 'Pending' },
  verified: { icon: ShieldCheck,  color: 'text-purple-400', label: 'Verified' },
  failed:   { icon: XCircle,      color: 'text-red-400',    label: 'Failed' },
};

function formatCurrency(amount: string | number): string {
  return new Intl.NumberFormat('fr-FR').format(Number(amount)) + ' FCFA';
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'paid' | 'verified' | 'failed'>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsData, statsData] = await Promise.all([
        apiService.getPayments(1, selectedStatus !== 'all' ? selectedStatus : undefined),
        apiService.getPaymentStats(),
      ]);
      setPayments(paymentsData?.results || paymentsData || []);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedStatus]);

  const handleAction = async (id: string, action: 'verify' | 'mark-paid' | 'fail') => {
    const labels = { verify: 'verify', 'mark-paid': 'mark as paid', fail: 'mark as failed' };
    if (!confirm(`Are you sure you want to ${labels[action]} this payment?`)) return;
    setActionLoading(id);
    try {
      if (action === 'verify')     await apiService.verifyPayment(id);
      if (action === 'mark-paid')  await apiService.markPaymentPaid(id);
      if (action === 'fail')       await apiService.failPayment(id);
      fetchData();
    } catch (err) {
      alert(`Failed to ${labels[action]} payment`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.customer_name?.toLowerCase().includes(q) ||
      p.salon_name?.toLowerCase().includes(q) ||
      p.service_name?.toLowerCase().includes(q) ||
      String(p.booking_id).includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Payments & Revenue</h1>
        <p className="text-gray-400">Track platform revenue from booking fees (10% of service price).</p>
      </div>

      {/* Notice */}
      <div className="mb-6 bg-blue-900/20 border border-blue-700 rounded-lg p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">Platform Revenue Model</p>
          <p>The platform only collects <strong>booking fees (10%)</strong>. Customers pay the full service amount directly at the salon.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg border border-purple-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-gray-400">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats ? formatCurrency(stats.total_revenue) : '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Today: {stats ? formatCurrency(stats.today_revenue) : '—'}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-blue-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">Pending</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats?.pending_payments ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-green-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Verified</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats?.verified_payments ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Confirmed payments</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-red-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <p className="text-xs text-gray-400">Failed</p>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats?.failed_payments ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Total: {stats?.total_transactions ?? '—'} transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by customer, salon, service or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="verified">Verified</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Salon</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Service Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Booking Fee (10%)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const config = statusConfig[payment.status] ?? statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <tr key={payment.id} className="hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 text-sm font-mono text-purple-400">#{payment.booking_id}</td>
                      <td className="px-6 py-4 text-sm text-white">
                        <div>{payment.customer_name}</div>
                        <div className="text-xs text-gray-500">{payment.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{payment.salon_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{payment.service_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{formatCurrency(payment.service_price)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-900/30 border border-purple-700 rounded text-xs font-semibold text-purple-400">
                            {formatCurrency(payment.booking_fee)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${config.color}`} />
                          <span className={config.color}>{config.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {actionLoading === payment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-purple-500 mx-auto" />
                        ) : (
                          <ActionDropdown
                            actions={[
                              ...(payment.status === 'paid' ? [{
                                label: 'Verify Payment',
                                icon: <ShieldCheck className="w-4 h-4" />,
                                onClick: () => handleAction(payment.id, 'verify'),
                              }] : []),
                              ...(payment.status === 'pending' ? [{
                                label: 'Mark as Paid',
                                icon: <CheckCircle className="w-4 h-4" />,
                                onClick: () => handleAction(payment.id, 'mark-paid'),
                              }] : []),
                              ...(payment.status !== 'failed' && payment.status !== 'verified' ? [{
                                label: 'Mark as Failed',
                                icon: <XCircle className="w-4 h-4" />,
                                onClick: () => handleAction(payment.id, 'fail'),
                                danger: true,
                              } as ActionMenuItem] : []),
                            ]}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer count */}
      <div className="mt-4">
        <p className="text-sm text-gray-400">
          Showing <span className="font-semibold text-white">{filteredPayments.length}</span> of{' '}
          <span className="font-semibold text-white">{payments.length}</span> payments
        </p>
      </div>
    </div>
  );
}
