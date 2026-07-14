'use client';

import React, { useState, useEffect } from 'react';
import apiService from '@/services/api';
import {
  Search, ChevronDown, CheckCircle, Clock, XCircle, Loader2, Eye, Edit2, X,
} from 'lucide-react';
import ActionDropdown, { ActionMenuItem } from '@/components/ActionDropdown';
import Pagination from '@/components/Pagination';

interface Booking {
  id: string;
  client_name: string;
  client_email?: string;
  salon_name: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: 'completed' | 'pending' | 'cancelled' | 'confirmed';
  service_price: number;
  booking_fee?: number;
  notes?: string;
  payment_status?: string;
}

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-400', label: 'Completed' },
  confirmed: { icon: CheckCircle, color: 'text-purple-400', label: 'Confirmed' },
  pending: { icon: Clock, color: 'text-blue-400', label: 'Pending' },
  cancelled: { icon: XCircle, color: 'text-red-400', label: 'Cancelled' },
};

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg}
    </div>
  );
}

// ── Booking Detail Modal ───────────────────────────────────────────────────
function DetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const config = statusConfig[booking.status] ?? statusConfig.pending;
  const StatusIcon = config.icon;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Booking Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3 text-sm">
          {[
            ['Booking ID', <span className="text-purple-400 font-mono">#{booking.id}</span>],
            ['Customer', booking.client_name],
            ['Email', booking.client_email || '—'],
            ['Salon', booking.salon_name],
            ['Service', booking.service_name],
            ['Date', new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
            ['Time', booking.booking_time],
            ['Status', <span className={`flex items-center gap-1.5 ${config.color}`}><StatusIcon className="w-4 h-4" />{config.label}</span>],
            ['Payment', booking.payment_status ?? '—'],
          ].map(([label, val], i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-gray-400">{label}</span>
              <span className="text-white text-right">{val as any}</span>
            </div>
          ))}
          {booking.notes && (
            <div className="pt-2">
              <p className="text-gray-400 mb-1">Notes</p>
              <p className="text-gray-300 bg-gray-700/50 rounded-lg p-3 text-xs">{booking.notes}</p>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-700 pt-3">
            <span className="text-gray-400">Service Price</span>
            <span className="text-white font-bold">{Number(booking.service_price).toLocaleString()} FCFA</span>
          </div>
          {booking.booking_fee != null && (
            <div className="flex justify-between">
              <span className="text-gray-400">Booking Fee</span>
              <span className="text-amber-400 font-semibold">{Number(booking.booking_fee).toLocaleString()} FCFA</span>
            </div>
          )}
        </div>
        <button onClick={onClose} className="w-full mt-6 py-2.5 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition">
          Close
        </button>
      </div>
    </div>
  );
}

// ── Edit Status Modal ──────────────────────────────────────────────────────
function EditModal({
  booking, onClose, onSave,
}: { booking: Booking; onClose: () => void; onSave: (status: Booking['status']) => Promise<void> }) {
  const [status, setStatus] = useState<Booking['status']>(booking.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(status);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Edit Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Booking ID</label>
            <input value={`#${booking.id}`} disabled
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Customer</label>
            <input value={booking.client_name} disabled
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as Booking['status'])}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || status === booking.status}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? 'Saving…' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Action Confirm Modal ───────────────────────────────────────────────────
function ActionModal({
  booking, action, onClose, onConfirm,
}: {
  booking: Booking;
  action: 'approve' | 'reject' | 'cancel' | 'complete';
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const meta = {
    approve:  { title: 'Approve Booking',        msg: 'This will confirm the booking and notify the customer.',                     btn: 'Approve',       btnClass: 'bg-green-600 hover:bg-green-700' },
    reject:   { title: 'Reject Booking',          msg: 'This will reject the booking. This action cannot be undone.',               btn: 'Reject',        btnClass: 'bg-red-600 hover:bg-red-700' },
    cancel:   { title: 'Cancel Booking',          msg: 'This will cancel the booking. This action cannot be undone.',               btn: 'Cancel Booking',btnClass: 'bg-amber-600 hover:bg-amber-700' },
    complete: { title: 'Mark as Completed',       msg: 'This will mark the booking as completed.',                                  btn: 'Mark Complete', btnClass: 'bg-purple-600 hover:bg-purple-700' },
  }[action];

  const iconBg = action === 'reject' || action === 'cancel' ? 'bg-red-900/50' : 'bg-blue-900/50';
  const Icon = action === 'reject' || action === 'cancel' ? XCircle : CheckCircle;
  const iconColor = action === 'reject' || action === 'cancel' ? 'text-red-400' : 'text-blue-400';

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{meta.title}</h2>
            <p className="text-xs text-gray-400">Booking #{booking.id}</p>
          </div>
        </div>
        <div className="bg-gray-700/40 rounded-xl p-3 mb-4 text-sm space-y-1">
          <p className="text-gray-300"><span className="text-gray-500">Customer:</span> {booking.client_name}</p>
          <p className="text-gray-300"><span className="text-gray-500">Service:</span> {booking.service_name}</p>
          <p className="text-gray-300"><span className="text-gray-500">Date:</span> {new Date(booking.booking_date).toLocaleDateString()}</p>
        </div>
        <p className="text-gray-400 text-sm mb-6">{meta.msg}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition">
            Go Back
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-white rounded-xl font-medium transition disabled:opacity-60 ${meta.btnClass}`}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Processing…' : meta.btn}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Booking['status']>('all');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [actionModal, setActionModal] = useState<{ booking: Booking; action: 'approve' | 'reject' | 'cancel' | 'complete' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBookings = async (page = currentPage) => {
    try {
      setLoading(true);
      const data = await apiService.getBookings(page, selectedStatus !== 'all' ? selectedStatus : undefined);
      setBookings(data.results || []);
      setTotalCount(data.count || 0);
    } catch {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setCurrentPage(1); }, [selectedStatus]);
  useEffect(() => { fetchBookings(currentPage); }, [selectedStatus, currentPage]);

  // ── Action handlers ──
  const handleApprove = async (booking: Booking) =>
    setActionModal({ booking, action: 'approve' });

  const handleReject = async (booking: Booking) =>
    setActionModal({ booking, action: 'reject' });

  const handleCancel = async (booking: Booking) =>
    setActionModal({ booking, action: 'cancel' });

  const handleMarkComplete = async (booking: Booking) =>
    setActionModal({ booking, action: 'complete' });

  const handleConfirmAction = async () => {
    if (!actionModal) return;
    const { booking, action } = actionModal;
    setActionLoading(booking.id);
    try {
      if (action === 'approve') await apiService.approveBooking(booking.id);
      else if (action === 'reject') await apiService.rejectBooking(booking.id);
      else if (action === 'cancel') await apiService.cancelBooking(booking.id);
      else await apiService.updateBooking(booking.id, { status: 'completed' });
      showToast(`Booking ${action === 'complete' ? 'marked complete' : action + 'd'} successfully`);
      setActionModal(null);
      fetchBookings();
    } catch {
      showToast(`Failed to ${action} booking`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSave = async (status: Booking['status']) => {
    if (!editBooking) return;
    try {
      await apiService.updateBooking(editBooking.id, { status });
      showToast('Booking status updated');
      setEditBooking(null);
      fetchBookings();
    } catch {
      showToast('Failed to update booking', 'error');
    }
  };

  const filteredBookings = bookings.filter(b =>
    !searchTerm ||
    b.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.salon_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Bookings</h1>
        <p className="text-gray-400">View and manage all bookings made on the platform.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search by customer, salon, or service..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="relative">
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
                {['Booking ID', 'Customer', 'Salon', 'Service', 'Date & Time', 'Status', 'Amount', 'Actions'].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-semibold text-gray-300 ${h === 'Amount' ? 'text-right' : h === 'Actions' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredBookings.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">No bookings found</td></tr>
              ) : filteredBookings.map(booking => {
                const config = statusConfig[booking.status] ?? statusConfig.pending;
                const StatusIcon = config.icon;
                return (
                  <tr key={booking.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-purple-400">#{booking.id}</td>
                    <td className="px-6 py-4 text-sm text-white">{booking.client_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{booking.salon_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{booking.service_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(booking.booking_date).toLocaleDateString()} · {booking.booking_time}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={config.color}>{config.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-white font-medium">
                      {Number(booking.service_price).toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-center">
                      {actionLoading === booking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-500 mx-auto" />
                      ) : (
                        <ActionDropdown actions={[
                          { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => setDetailBooking(booking) },
                          { label: 'Edit Status', icon: <Edit2 className="w-4 h-4" />, onClick: () => setEditBooking(booking) },
                          ...(booking.status === 'pending' ? [
                            { label: 'Approve', icon: <CheckCircle className="w-4 h-4" />, onClick: () => handleApprove(booking) } as ActionMenuItem,
                            { label: 'Reject', icon: <XCircle className="w-4 h-4" />, onClick: () => handleReject(booking), danger: true } as ActionMenuItem,
                          ] : []),
                          ...(booking.status === 'confirmed' || booking.status === 'pending' ? [
                            { label: 'Cancel', icon: <Clock className="w-4 h-4" />, onClick: () => handleCancel(booking), danger: true } as ActionMenuItem,
                          ] : []),
                          ...(booking.status === 'confirmed' ? [
                            { label: 'Mark Complete', icon: <CheckCircle className="w-4 h-4" />, onClick: () => handleMarkComplete(booking) } as ActionMenuItem,
                          ] : []),
                        ]} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalCount={totalCount} pageSize={10} onPageChange={setCurrentPage} />

      {detailBooking && <DetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />}
      {editBooking && <EditModal booking={editBooking} onClose={() => setEditBooking(null)} onSave={handleEditSave} />}
      {actionModal && (
        <ActionModal
          booking={actionModal.booking}
          action={actionModal.action}
          onClose={() => setActionModal(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
