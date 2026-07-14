import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, CheckCircle, AlertCircle,
  XCircle, Loader, ChevronLeft, X, Star, Bell, CheckCheck,
  CalendarDays, MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/api';

const API = API_BASE;

const formatPrice = (v: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(v);

interface Booking {
  id: number;
  salon: number;
  salon_name: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  service_price: number;
  booking_fee: number;
  amount_due_at_salon: number;
  notes: string | null;
  created_at: string;
  decline_reason?: string;
  decline_message?: string;
  reschedule_date?: string;
  reschedule_time?: string;
  reschedule_message?: string;
}

interface CustomerNotif {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  booking_detail: { id: number; salon_name: string; service_name: string; booking_date: string; booking_time: string; status: string } | null;
}

const STATUS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:              { label: 'Pending',           color: 'bg-amber-50 text-amber-700 border-amber-200',   icon: AlertCircle },
  confirmed:            { label: 'Confirmed',         color: 'bg-blue-50 text-blue-700 border-blue-200',       icon: CheckCircle },
  declined:             { label: 'Declined',          color: 'bg-red-50 text-red-700 border-red-200',          icon: XCircle },
  reschedule_requested: { label: 'Reschedule Proposed', color: 'bg-sky-50 text-sky-700 border-sky-200',        icon: CalendarDays },
  completed:            { label: 'Completed',         color: 'bg-green-50 text-green-700 border-green-200',    icon: CheckCircle },
  expired:              { label: 'Expired',           color: 'bg-gray-100 text-gray-500 border-gray-200',      icon: XCircle },
  cancelled:            { label: 'Cancelled',         color: 'bg-red-50 text-red-600 border-red-200',          icon: XCircle },
};

const FILTERS = ['all','pending','confirmed','declined','reschedule_requested','completed','expired','cancelled'] as const;
const POLL_MS = 20_000;

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<typeof FILTERS[number]>('all');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());

  // ── Customer notifications ────────────────────────────────────────────
  const [notifs, setNotifs] = useState<CustomerNotif[]>([]);
  const [unread, setUnread] = useState(0);
  const [showBell, setShowBell] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/notifications/customer/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifs(data.notifications ?? []);
      setUnread(data.unread_count ?? 0);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) { fetchNotifs(); }
    const t = setInterval(() => { if (isAuthenticated) fetchNotifs(); }, POLL_MS);
    return () => clearInterval(t);
  }, [isAuthenticated, fetchNotifs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
          bellRef.current && !bellRef.current.contains(e.target as Node))
        setShowBell(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    if (!token) return;
    await fetch(`${API}/notifications/customer/mark_read/`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [] }),
    }).catch(() => {});
    setNotifs(p => p.map(n => ({ ...n, is_read: true })));
    setUnread(0);
  };
  // ─────────────────────────────────────────────────────────────────────

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/bookings/my_bookings/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login');
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated, fetchBookings]);

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      const res = await fetch(`${API}/bookings/${id}/cancel/`, {
        method: 'POST',
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to cancel');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch {
      alert('Could not cancel booking. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget || !token) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API}/reviews/`, {
        method: 'POST',
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salon: reviewTarget.salon,
          rating: reviewRating,
          comment: reviewComment,
          author_name: reviewTarget.salon_name, // will be overridden by backend
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.non_field_errors?.[0] || err.detail || 'Failed to submit review');
      }
      setReviewedIds(prev => new Set(prev).add(reviewTarget.id));
      setReviewTarget(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const displayed = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="w-10 h-10 text-[#6D28D9] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#111827]">My Bookings</h1>
            <p className="text-sm text-gray-500">{bookings.length} total appointment{bookings.length !== 1 ? 's' : ''}</p>
          </div>

          {/* ── Customer notification bell ── */}
          <div className="relative">
            <button ref={bellRef} onClick={() => { setShowBell(p => !p); if (!showBell) fetchNotifs(); }}
              className="relative p-2 rounded-xl hover:bg-[#F3F4F6] transition" aria-label="Notifications">
              <Bell className="w-5 h-5 text-[#6B7280]" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>

            {showBell && (
              <div ref={panelRef}
                className="absolute right-0 top-12 w-80 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-50 flex flex-col max-h-96 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] shrink-0">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#6D28D9]" />
                    <span className="text-sm font-bold text-[#111827]">Notifications</span>
                    {unread > 0 && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{unread}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
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
                  {notifs.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-2">
                      <Bell className="w-8 h-8 text-[#D1D5DB]" />
                      <p className="text-xs text-[#6B7280]">No notifications yet</p>
                    </div>
                  ) : notifs.map(n => {
                    const isPositive = n.notification_type === 'booking_confirmed' || n.notification_type === 'booking_completed';
                    const isWarning = n.notification_type === 'booking_reschedule';
                    const isNeg = n.notification_type === 'booking_declined' || n.notification_type === 'booking_expired' || n.notification_type === 'booking_cancelled';
                    return (
                      <div key={n.id} className={`px-4 py-3 border-b border-[#F3F4F6] last:border-0 ${n.is_read ? 'opacity-60' : ''}`}>
                        <div className="flex gap-3 items-start">
                          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0
                            ${isPositive ? 'bg-green-100' : isWarning ? 'bg-blue-100' : isNeg ? 'bg-red-100' : 'bg-[#6D28D9]/10'}`}>
                            {isPositive ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                             isWarning ? <CalendarDays className="w-4 h-4 text-blue-600" /> :
                             isNeg ? <XCircle className="w-4 h-4 text-red-500" /> :
                             <Bell className="w-4 h-4 text-[#6D28D9]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <p className={`text-xs font-bold truncate ${n.is_read ? 'text-[#6B7280]' : 'text-[#111827]'}`}>{n.title}</p>
                              <span className="text-[10px] text-[#9CA3AF] shrink-0">{timeAgo(n.created_at)}</span>
                            </div>
                            <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3">{n.message}</p>
                            {!n.is_read && <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-[#6D28D9]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-[#E5E7EB] shrink-0">
                  <p className="text-xs text-[#9CA3AF]">Notifications refresh every 20s</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-[#6D28D9] text-white shadow-md shadow-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {(STATUS[f]?.label ?? (f === 'all' ? 'All' : f)).replace('_', ' ')}
              {(() => { const c = f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length; return c > 0 ? (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === f ? 'bg-white/30 text-white' : 'bg-gray-300 text-gray-700'}`}>{c}</span>
              ) : null; })()}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-10 h-10 text-[#6D28D9] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchBookings} className="px-6 py-2 bg-[#6D28D9] text-white rounded-lg hover:bg-[#5B21B6] transition">Retry</button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {filter === 'all' ? 'Book a service at any salon to get started.' : `You have no ${filter} bookings.`}
            </p>
            {filter === 'all' ? (
              <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#6D28D9] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all">
                Browse Salons
              </button>
            ) : (
              <button onClick={() => setFilter('all')} className="px-6 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                View All Bookings
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map(booking => {
              const cfg = STATUS[booking.status] || STATUS.pending;
              const Icon = cfg.icon;
              const canCancel = booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'reschedule_requested';
              return (
                <div key={booking.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-[#6D28D9] bg-[#6D28D9]/10 px-2 py-0.5 rounded">#{booking.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#111827] text-base truncate">{booking.service_name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{booking.salon_name}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-[#6D28D9]">{formatPrice(booking.booking_fee)}</p>
                        <p className="text-xs text-gray-400">booking fee</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#6D28D9]" />
                        {new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#6D28D9]" />
                        {booking.booking_time.substring(0, 5)}
                      </div>
                    </div>

                    {/* Decline / Reschedule / Expired banners */}
                    {booking.status === 'declined' && (
                      <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        <p className="text-xs font-semibold text-red-700">❌ Declined by salon</p>
                        {booking.decline_message && <p className="text-xs text-red-600 mt-0.5">"{booking.decline_message}"</p>}
                      </div>
                    )}
                    {booking.status === 'reschedule_requested' && booking.reschedule_date && (
                      <div className="mb-3 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
                        <p className="text-xs font-semibold text-sky-700">📅 New time proposed: {booking.reschedule_date} at {booking.reschedule_time?.substring(0,5)}</p>
                        {booking.reschedule_message && <p className="text-xs text-sky-600 mt-0.5">"{booking.reschedule_message}"</p>}
                      </div>
                    )}
                    {booking.status === 'expired' && (
                      <div className="mb-3 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2">
                        <p className="text-xs text-gray-500">⏰ The salon did not respond within 24 hours. Please book again.</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(booking)}
                        className="flex-1 py-2 rounded-xl text-sm font-medium bg-[#6D28D9]/10 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all duration-200">
                        View Details
                      </button>
                      {canCancel && (
                        <button onClick={() => handleCancel(booking.id)} disabled={cancelling === booking.id}
                          className="flex-1 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1">
                          {cancelling === booking.id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : null}
                          Cancel
                        </button>
                      )}
                      {booking.status === 'completed' && !reviewedIds.has(booking.id) && (
                        <button onClick={() => { setReviewTarget(booking); setReviewRating(5); setReviewComment(''); }}
                          className="flex-1 py-2 rounded-xl text-sm font-medium bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all duration-200 flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5" />
                          Review
                        </button>
                      )}
                      {booking.status === 'completed' && reviewedIds.has(booking.id) && (
                        <span className="flex-1 py-2 rounded-xl text-sm font-medium bg-green-50 text-green-600 text-center flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Reviewed
                        </span>
                      )}
                      {(booking.status === 'declined' || booking.status === 'expired' || booking.status === 'cancelled') && (
                        <button onClick={() => navigate(`/salons/${booking.salon}`)}
                          className="flex-1 py-2 rounded-xl text-sm font-medium bg-[#6D28D9]/10 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all duration-200">
                          Book Again
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <button onClick={() => navigate(`/salons/${booking.salon}`)}
                          className="flex-1 py-2 rounded-xl text-sm font-medium border border-[#6D28D9] text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all duration-200">
                          Book Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setReviewTarget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">Leave a Review</h2>
                <p className="text-sm text-gray-500">{reviewTarget.salon_name}</p>
              </div>
              <button onClick={() => setReviewTarget(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Star rating */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 ${star <= reviewRating ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Your Review</p>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder={`Share your experience at ${reviewTarget.salon_name}...`}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#6D28D9] text-sm text-[#111827] placeholder-gray-400 focus:outline-none resize-none transition-colors"
                />
              </div>
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setReviewTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmitReview} disabled={!reviewComment.trim() || reviewSubmitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {reviewSubmitting ? <><Loader className="w-4 h-4 animate-spin" />Submitting...</> : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">Booking Details</h2>
                <p className="text-xs text-[#6D28D9] font-mono">#{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-sm">
              {[
                ['Salon', selected.salon_name],
                ['Service', selected.service_name],
                ['Date', new Date(selected.booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
                ['Time', selected.booking_time.substring(0, 5)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-[#111827] text-right max-w-[60%]">{value}</span>
                </div>
              ))}

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service Price</span>
                  <span className="font-medium">{formatPrice(selected.service_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Booking Fee (10%)</span>
                  <span className="font-semibold text-[#6D28D9]">{formatPrice(selected.booking_fee)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-500">Pay at Salon</span>
                  <span className="font-bold text-[#111827]">{formatPrice(selected.amount_due_at_salon)}</span>
                </div>
              </div>

              {(() => {
                const cfg = STATUS[selected.status] || STATUS.pending;
                const Icon = cfg.icon;
                return (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{cfg.label}</span>
                  </div>
                );
              })()}

              {selected.status === 'declined' && selected.decline_message && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-red-700 mb-1">Decline Reason</p>
                  <p className="text-xs text-red-600">{selected.decline_message}</p>
                </div>
              )}
              {selected.status === 'reschedule_requested' && selected.reschedule_date && (
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-sky-700 mb-1">📅 Proposed New Appointment</p>
                  <p className="text-sm font-semibold text-sky-800">{selected.reschedule_date} at {selected.reschedule_time?.substring(0,5)}</p>
                  {selected.reschedule_message && <p className="text-xs text-sky-600 mt-1">"{selected.reschedule_message}"</p>}
                </div>
              )}
              {selected.status === 'expired' && (
                <div className="bg-gray-100 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-gray-500">The salon did not respond within 24 hours. Your booking has expired.</p>
                </div>
              )}

              {selected.notes && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-xs text-amber-700"><span className="font-semibold">Notes: </span>{selected.notes}</p>
                </div>
              )}
            </div>

            <div className="p-5 pt-0 flex gap-3">
              {(selected.status === 'pending' || selected.status === 'confirmed' || selected.status === 'reschedule_requested') && (
                <button onClick={() => { handleCancel(selected.id); setSelected(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                  Cancel Booking
                </button>
              )}
              {(selected.status === 'completed' || selected.status === 'declined' || selected.status === 'expired' || selected.status === 'cancelled') && (
                <button onClick={() => { navigate(`/salons/${selected.salon}`); setSelected(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#6D28D9] text-white hover:bg-[#5B21B6] transition-colors">
                  Book Again
                </button>
              )}
              <button onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
