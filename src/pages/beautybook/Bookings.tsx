import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, User, Phone, FileText, CheckCircle,
  AlertCircle, Loader, Eye, X, Scissors, CalendarDays, MessageSquare,
} from 'lucide-react';
import SalonLayout from '../../components/beautybook/SalonLayout';
import { API_BASE } from '@/lib/api';

interface Booking {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string;
  service_price: number;
  decline_reason?: string;
  decline_message?: string;
  reschedule_date?: string;
  reschedule_time?: string;
  reschedule_message?: string;
}

const STATUS_META: Record<string, { label: string; pill: string; dot: string }> = {
  pending:              { label: 'Pending',             pill: 'bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/30',  dot: 'bg-[#F59E0B]' },
  confirmed:            { label: 'Confirmed',           pill: 'bg-[#6D28D9]/10 text-[#6D28D9] border border-[#6D28D9]/20',  dot: 'bg-[#6D28D9]' },
  declined:             { label: 'Declined',            pill: 'bg-red-100 text-red-700 border border-red-200',               dot: 'bg-red-500' },
  reschedule_requested: { label: 'Reschedule',          pill: 'bg-blue-100 text-blue-700 border border-blue-200',            dot: 'bg-blue-500' },
  completed:            { label: 'Completed',           pill: 'bg-green-100 text-green-700 border border-green-200',         dot: 'bg-green-500' },
  expired:              { label: 'Expired',             pill: 'bg-gray-100 text-gray-500 border border-gray-200',            dot: 'bg-gray-400' },
  cancelled:            { label: 'Cancelled',           pill: 'bg-red-100 text-red-600 border border-red-200',               dot: 'bg-red-400' },
};

const DECLINE_REASONS = [
  { value: 'fully_booked',       label: 'Fully booked' },
  { value: 'staff_unavailable',  label: 'Staff unavailable' },
  { value: 'salon_closed',       label: 'Salon closed' },
  { value: 'service_unavailable',label: 'Requested service unavailable' },
  { value: 'emergency_closure',  label: 'Emergency closure' },
  { value: 'other',              label: 'Other (explain below)' },
];

const FILTERS = ['all','pending','confirmed','declined','reschedule_requested','completed','expired','cancelled'] as const;
type Filter = typeof FILTERS[number];

// ── Decline Modal ──────────────────────────────────────────────────────────
interface DeclineModalProps {
  booking: Booking;
  onClose: () => void;
  onConfirm: (reason: string, message: string) => Promise<void>;
}
const DeclineModal: React.FC<DeclineModalProps> = ({ booking, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!reason) { setErr('Please select a reason.'); return; }
    if (reason === 'other' && !message.trim()) { setErr('Please provide an explanation.'); return; }
    setSaving(true);
    await onConfirm(reason, message.trim());
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Decline Booking</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-[#F9FAFB] rounded-xl p-3 text-sm">
            <p className="font-semibold text-[#111827]">{booking.client_name}</p>
            <p className="text-[#6B7280]">{booking.service_name} · {booking.booking_date}</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">Reason *</label>
            <div className="space-y-2">
              {DECLINE_REASONS.map(r => (
                <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition
                  ${reason === r.value ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] hover:border-red-200'}`}>
                  <input type="radio" name="reason" value={r.value}
                    checked={reason === r.value} onChange={() => { setReason(r.value); setErr(''); }}
                    className="accent-red-500" />
                  <span className="text-sm text-[#111827]">{r.label}</span>
                </label>
              ))}
            </div>
          </div>
          {reason === 'other' && (
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-1.5">Explanation *</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder="Explain the reason to the customer…"
                className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
            </div>
          )}
          {err && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6] transition">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : null}
              {saving ? 'Declining…' : 'Decline Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Reschedule Modal ──────────────────────────────────────────────────────
interface RescheduleModalProps {
  booking: Booking;
  onClose: () => void;
  onConfirm: (date: string, time: string, message: string) => Promise<void>;
}
const RescheduleModal: React.FC<RescheduleModalProps> = ({ booking, onClose, onConfirm }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // Minimum date = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!date) { setErr('Please select a new date.'); return; }
    if (!time) { setErr('Please select a new time.'); return; }
    setSaving(true);
    await onConfirm(date, time, message.trim());
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Request Reschedule</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-[#F9FAFB] rounded-xl p-3 text-sm">
            <p className="font-semibold text-[#111827]">{booking.client_name}</p>
            <p className="text-[#6B7280]">{booking.service_name} · currently {booking.booking_date} at {booking.booking_time.substring(0,5)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-1.5">New Date *</label>
              <input type="date" value={date} min={minDateStr}
                onChange={e => { setDate(e.target.value); setErr(''); }}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-1.5">New Time *</label>
              <input type="time" value={time}
                onChange={e => { setTime(e.target.value); setErr(''); }}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#6B7280] uppercase mb-1.5">Message to Customer (optional)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
              placeholder="e.g. Your usual stylist is available at this new time…"
              className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
          </div>
          {err && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6] transition">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0EA5E9] text-white text-sm font-semibold hover:bg-[#0284C7] transition disabled:opacity-60">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
              {saving ? 'Sending…' : 'Send Reschedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('salonOwnerToken');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, string | null>>({});
  const [selected, setSelected] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [declineBooking, setDeclineBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBookings = useCallback(async () => {
    if (!token) { navigate('/salon-login'); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/bookings/salon_bookings/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.status === 401) { navigate('/salon-login'); return; }
      if (!res.ok) throw new Error(res.statusText);
      setBookings(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const apiAction = async (id: number, path: string, body?: object): Promise<Booking | null> => {
    const res = await fetch(`${API_BASE}/bookings/${id}/${path}/`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || e.detail || 'Action failed'); }
    return res.json();
  };

  const handleConfirm = async (id: number) => {
    setActionLoading(p => ({ ...p, [id]: 'confirm' }));
    try {
      const updated = await apiAction(id, 'confirm');
      if (updated) setBookings(prev => prev.map(b => b.id === id ? updated : b));
      showToast('Booking confirmed! Customer notified.');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleComplete = async (id: number) => {
    setActionLoading(p => ({ ...p, [id]: 'complete' }));
    try {
      const updated = await apiAction(id, 'complete');
      if (updated) setBookings(prev => prev.map(b => b.id === id ? updated : b));
      showToast('Booking marked as completed.');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleCancel = async (id: number) => {
    setActionLoading(p => ({ ...p, [id]: 'cancel' }));
    try {
      const updated = await apiAction(id, 'cancel');
      if (updated) setBookings(prev => prev.map(b => b.id === id ? updated : b));
      showToast('Booking cancelled.');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleDeclineConfirm = async (reason: string, message: string) => {
    if (!declineBooking) return;
    const id = declineBooking.id;
    try {
      const updated = await apiAction(id, 'decline', { decline_reason: reason, decline_message: message });
      if (updated) setBookings(prev => prev.map(b => b.id === id ? updated : b));
      setDeclineBooking(null);
      showToast('Booking declined. Customer notified.');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  const handleRescheduleConfirm = async (date: string, time: string, message: string) => {
    if (!rescheduleBooking) return;
    const id = rescheduleBooking.id;
    try {
      const updated = await apiAction(id, 'request_reschedule', {
        reschedule_date: date, reschedule_time: time, reschedule_message: message,
      });
      if (updated) setBookings(prev => prev.map(b => b.id === id ? updated : b));
      setRescheduleBooking(null);
      showToast('Reschedule proposal sent to customer.');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const countOf = (s: string) => bookings.filter(b => b.status === s).length;

  return (
    <SalonLayout title="Bookings">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white transition-all
          ${toast.type === 'success' ? 'bg-[#6D28D9]' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Summary pills */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <p className="text-[#6B7280] text-sm">Manage customer appointments</p>
        <div className="flex gap-2 flex-wrap">
          {(['pending','confirmed','declined','reschedule_requested'] as const).map(s => countOf(s) > 0 && (
            <span key={s} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_META[s].pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[s].dot}`} />
              {countOf(s)} {STATUS_META[s].label}
            </span>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap capitalize
              ${filter === f
                ? 'bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white shadow-md shadow-purple-200'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#6D28D9] hover:text-[#6D28D9]'}`}>
            {f === 'all' ? `All (${bookings.length})` : `${STATUS_META[f]?.label ?? f} (${countOf(f)})`}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 rounded-full border-4 border-[#6D28D9]/20 border-t-[#6D28D9] animate-spin mx-auto" />
        </div>
      )}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">{error}</p>
            <button onClick={fetchBookings} className="mt-2 px-4 py-1.5 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700 transition">Retry</button>
          </div>
        </div>
      )}

      {/* Pending booking cards at top */}
      {!loading && filter === 'all' && countOf('pending') > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            Awaiting your response ({countOf('pending')})
          </h3>
          {bookings.filter(b => b.status === 'pending').map(b => (
            <div key={b.id} className="bg-white border-2 border-[#F59E0B]/40 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6D28D9]/20 to-[#7C3AED]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#6D28D9] text-xs font-bold">{b.client_name[0]?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#111827] text-sm truncate">{b.client_name}</p>
                  <p className="text-xs text-[#6B7280] truncate">{b.service_name} · {new Date(b.booking_date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })} at {b.booking_time.substring(0,5)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button onClick={() => handleConfirm(b.id)} disabled={!!actionLoading[b.id]}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6D28D9] text-white text-xs font-bold hover:bg-[#5B21B6] transition disabled:opacity-60">
                  {actionLoading[b.id] === 'confirm' ? <Loader className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                  Approve
                </button>
                <button onClick={() => setDeclineBooking(b)} disabled={!!actionLoading[b.id]}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 text-red-700 text-xs font-bold hover:bg-red-600 hover:text-white transition disabled:opacity-60">
                  <X className="w-3 h-3" /> Decline
                </button>
                <button onClick={() => setRescheduleBooking(b)} disabled={!!actionLoading[b.id]}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-600 hover:text-white transition disabled:opacity-60">
                  <CalendarDays className="w-3 h-3" /> Reschedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  {['Customer','Service','Date & Time','Price','Status','Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filtered.map(b => {
                  const meta = STATUS_META[b.status] ?? STATUS_META.pending;
                  const busy = actionLoading[b.id];
                  return (
                    <tr key={b.id} className="hover:bg-[#F9FAFB] transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D28D9]/20 to-[#7C3AED]/20 flex items-center justify-center shrink-0">
                            <span className="text-[#6D28D9] text-xs font-bold">{b.client_name[0]?.toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-[#111827] text-sm">{b.client_name}</p>
                            <p className="text-xs text-[#6B7280]">{b.client_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Scissors className="w-3.5 h-3.5 text-[#6D28D9] shrink-0" />
                          <span className="text-[#111827] text-sm font-medium">{b.service_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-[#111827] font-medium">
                          {new Date(b.booking_date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{b.booking_time.substring(0,5)}</p>
                        {b.status === 'reschedule_requested' && b.reschedule_date && (
                          <p className="text-xs text-blue-600 mt-0.5">→ {b.reschedule_date} {b.reschedule_time?.substring(0,5)}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-[#111827] text-sm">{(b.service_price ?? 0).toLocaleString()} FCFA</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button onClick={() => setSelected(b)} title="View details"
                            className="p-2 rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition">
                            <Eye className="w-4 h-4" />
                          </button>
                          {b.status === 'pending' && (<>
                            <button onClick={() => handleConfirm(b.id)} disabled={!!busy}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#6D28D9]/10 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition text-xs font-semibold disabled:opacity-50">
                              {busy === 'confirm' ? <Loader className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              Approve
                            </button>
                            <button onClick={() => setDeclineBooking(b)} disabled={!!busy}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-600 hover:text-white transition text-xs font-semibold disabled:opacity-50">
                              <X className="w-3 h-3" /> Decline
                            </button>
                            <button onClick={() => setRescheduleBooking(b)} disabled={!!busy}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white transition text-xs font-semibold disabled:opacity-50">
                              <CalendarDays className="w-3 h-3" /> Reschedule
                            </button>
                          </>)}
                          {b.status === 'confirmed' && (
                            <button onClick={() => handleComplete(b.id)} disabled={!!busy}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition text-xs font-semibold disabled:opacity-50">
                              {busy === 'complete' ? <Loader className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              Complete
                            </button>
                          )}
                          {(b.status === 'pending' || b.status === 'confirmed') && (
                            <button onClick={() => handleCancel(b.id)} disabled={!!busy}
                              className="p-1.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition disabled:opacity-50" title="Cancel">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E7EB]">
          <Calendar className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
          <h3 className="text-base font-semibold text-[#111827] mb-2">
            {filter === 'all' ? 'No bookings yet' : `No ${STATUS_META[filter]?.label ?? filter} bookings`}
          </h3>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')}
              className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-sm font-semibold transition">
              View All
            </button>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Booking #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#F9FAFB] rounded-xl p-4">
                <p className="text-xs font-bold text-[#6B7280] uppercase mb-2">Customer</p>
                <p className="text-base font-bold text-[#111827]">{selected.client_name}</p>
                <p className="text-sm text-[#6B7280]">{selected.client_email}</p>
                {selected.client_phone && <p className="text-sm text-[#6B7280] flex items-center gap-1 mt-1"><Phone className="w-3.5 h-3.5" />{selected.client_phone}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Service', value: selected.service_name },
                  { label:'Price',   value: `${(selected.service_price??0).toLocaleString()} FCFA`, green:true },
                  { label:'Date',    value: new Date(selected.booking_date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'long',year:'numeric'}) },
                  { label:'Time',    value: selected.booking_time.substring(0,5) },
                ].map(f => (
                  <div key={f.label} className="bg-[#F9FAFB] rounded-xl p-3">
                    <p className="text-xs text-[#6B7280] font-semibold mb-1">{f.label}</p>
                    <p className={`text-sm font-bold ${f.green ? 'text-green-600' : 'text-[#111827]'}`}>{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#6B7280] uppercase">Status</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_META[selected.status]?.pill ?? 'bg-gray-100 text-gray-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[selected.status]?.dot ?? 'bg-gray-400'}`} />
                  {STATUS_META[selected.status]?.label ?? selected.status}
                </span>
              </div>
              {selected.status === 'declined' && selected.decline_reason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-red-700 mb-1">Decline Reason</p>
                  <p className="text-sm text-red-800">{DECLINE_REASONS.find(r=>r.value===selected.decline_reason)?.label ?? selected.decline_reason}</p>
                  {selected.decline_message && <p className="text-xs text-red-600 mt-1">{selected.decline_message}</p>}
                </div>
              )}
              {selected.status === 'reschedule_requested' && selected.reschedule_date && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-blue-700 mb-1">Proposed Reschedule</p>
                  <p className="text-sm text-blue-800">{selected.reschedule_date} at {selected.reschedule_time?.substring(0,5)}</p>
                  {selected.reschedule_message && <p className="text-xs text-blue-600 mt-1">{selected.reschedule_message}</p>}
                </div>
              )}
              {selected.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-[#6B7280] flex items-center gap-1 mb-1"><FileText className="w-3 h-3" /> Notes</p>
                  <p className="text-sm text-[#111827]">{selected.notes}</p>
                </div>
              )}
            </div>
            <div className="px-6 pb-5">
              <button onClick={() => setSelected(null)}
                className="w-full py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[#111827] text-sm font-semibold hover:bg-[#F3F4F6] transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {declineBooking && (
        <DeclineModal booking={declineBooking} onClose={() => setDeclineBooking(null)} onConfirm={handleDeclineConfirm} />
      )}
      {rescheduleBooking && (
        <RescheduleModal booking={rescheduleBooking} onClose={() => setRescheduleBooking(null)} onConfirm={handleRescheduleConfirm} />
      )}
    </SalonLayout>
  );
};

export default Bookings;
