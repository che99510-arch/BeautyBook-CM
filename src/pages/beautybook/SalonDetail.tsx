import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Star, MapPin, Phone, Clock, Calendar, CheckCircle,
  ChevronLeft, Heart, Share2, Scissors, Sparkles, Droplet, Loader,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE, MEDIA_BASE } from '@/lib/api';

const API = API_BASE;

// ── Avatar helper ──────────────────────────────────────────────────────────
function nameToColor(name: string): string {
  const colors = ['#6D28D9','#7C3AED','#DB2777','#DC2626','#D97706','#059669','#0284C7','#0EA5E9'];
  const safe = String(name || '');
  let hash = 0;
  for (let i = 0; i < safe.length; i++) hash = safe.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
function getInitials(name: string): string {
  const safe = String(name || '?').trim();
  const parts = safe.split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
const ReviewAvatar: React.FC<{ name: string | null | undefined; size?: number }> = ({ name, size = 40 }) => {
  const safeName = String(name || '?');
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm"
      style={{ width: size, height: size, background: nameToColor(safeName) }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.36 }}>
        {getInitials(safeName)}
      </span>
    </div>
  );
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(price);

const getNext14Days = () => {
  const dates = [];
  const today = new Date();
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      label: `${monthNames[date.getMonth()]} ${date.getDate()}`,
      value: date.toISOString().split('T')[0],
      day: dayNames[date.getDay()],
      fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    });
  }
  return dates;
};

const timeSlots = [
  '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM',
  '3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM',
];

// Convert "9:00 AM" → "09:00:00" for the backend
const toBackendTime = (t: string) => {
  const [time, period] = t.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
};

const iconMap: Record<string, React.ElementType> = {
  Hair: Scissors, Nails: Droplet, Makeup: Sparkles, Massage: Sparkles,
};

// ── Types ──
interface Service { id: number; name: string; category: string; description: string; duration: string; price: number; }
interface Review { id: number; author: number | null; author_name?: string; display_name?: string; rating: number; comment: string; created_at: string; }
interface SalonData {
  id: number; name: string; location: string; city: string; description: string;
  phone: string | null; whatsapp: string | null; rating: number; review_count: number; starting_price: number;
  image: string | null; cover_image: string | null; open_hours: string | null;
  services: Service[]; reviews: Review[];
}

// ── Sub-components ──

const ServicesList: React.FC<{
  services: Service[];
  selected: Service | null;
  onSelect: (s: Service) => void;
}> = ({ services, selected, onSelect }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
    <h2 className="text-xl font-bold text-gray-900 mb-6">Our Services</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((s) => {
        const Icon = iconMap[s.category] || Scissors;
        const isSelected = selected?.id === s.id;
        return (
          <button key={s.id} onClick={() => onSelect(s)}
            className={`text-left p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-purple-600' : 'bg-gray-100'}`}>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate">{s.name}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />{s.duration}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-purple-600 text-sm">{formatPrice(s.price)}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${isSelected ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'}`}>
                {isSelected ? 'Selected' : 'Select'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const BookingForm: React.FC<{
  selected: Service | null; date: string; time: string;
  onDate: (d: string) => void; onTime: (t: string) => void;
  onConfirm: () => void; canBook: boolean; submitting: boolean;
}> = ({ selected, date, time, onDate, onTime, onConfirm, canBook, submitting }) => {
  const dates = getNext14Days();
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Book Your Appointment</h2>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3"><Calendar className="w-5 h-5 text-purple-600" /><h3 className="font-semibold text-gray-900">Select Date</h3></div>
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-7 gap-2">
          {dates.map((d) => (
            <button key={d.value} onClick={() => onDate(d.value)}
              className={`p-2 rounded-xl text-center transition-all duration-200 ${date === d.value ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-gray-50 hover:bg-purple-50 text-gray-900'}`}>
              <div className="text-[10px] font-medium opacity-70">{d.day}</div>
              <div className="text-xs font-bold">{d.label}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3"><Clock className="w-5 h-5 text-purple-600" /><h3 className="font-semibold text-gray-900">Select Time</h3></div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {timeSlots.map((t) => (
            <button key={t} onClick={() => onTime(t)}
              className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200 ${time === t ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-gray-50 hover:bg-purple-50 text-gray-900'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onConfirm} disabled={!canBook || submitting}
        className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${canBook && !submitting ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-300/50' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
        {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Booking...</> : canBook ? 'Confirm Booking' : 'Select Service, Date & Time'}
      </button>
    </div>
  );
};

const BookingSummary: React.FC<{
  selected: Service | null; date: string; time: string; salonName: string;
  onConfirm: () => void; submitting: boolean;
}> = ({ selected, date, time, salonName, onConfirm, submitting }) => {
  const dates = getNext14Days();
  const dateInfo = dates.find((d) => d.value === date);
  const canBook = !!selected && !!date && !!time;
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 lg:sticky lg:top-24 border-2 border-purple-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h2>
      <div className="space-y-4">
        <div className="flex justify-between"><span className="text-sm text-gray-500">Service</span><span className="text-sm font-semibold text-gray-900 text-right">{selected?.name || '-'}</span></div>
        <div className="flex justify-between"><span className="text-sm text-gray-500">Duration</span><span className="text-sm font-medium text-gray-900">{selected?.duration || '-'}</span></div>
        <div className="flex justify-between"><span className="text-sm text-gray-500">Date</span><span className="text-sm font-medium text-gray-900 text-right">{dateInfo?.fullDate || '-'}</span></div>
        <div className="flex justify-between"><span className="text-sm text-gray-500">Time</span><span className="text-sm font-medium text-gray-900">{time || '-'}</span></div>
        {selected && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Price</span>
              <span className="font-medium text-gray-900">{formatPrice(selected.price)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Pay at the salon after your appointment.</p>
          </div>
        )}
        {/* Free booking badge */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2 items-center">
          <span className="text-green-600 text-lg">🎉</span>
          <p className="text-xs text-green-800 font-medium">Free booking — no upfront payment required!</p>
        </div>
        <button onClick={onConfirm} disabled={!canBook || submitting}
          className="w-full py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Booking...</> : 'Confirm Booking'}
        </button>
        <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">Booking at <span className="font-medium text-gray-700">{salonName}</span></p>
      </div>
    </div>
  );
};

const ReviewsSection: React.FC<{ reviews: Review[]; rating: number; reviewCount: number; salonId: number; token: string | null; onReviewAdded: () => void }> = ({ reviews, rating, reviewCount, salonId, token, onReviewAdded }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.comment.trim().length < 10) { setFormError('Please write at least 10 characters.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify({ salon: salonId, rating: form.rating, comment: form.comment.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.non_field_errors?.[0] || 'Failed to submit review');
      }
      setFormSuccess(true);
      setForm({ rating: 5, comment: '' });
      setShowForm(false);
      onReviewAdded();
      setTimeout(() => setFormSuccess(false), 4000);
    } catch (e: any) {
      setFormError(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-200'}`} />
              ))}
            </div>
            <span className="font-bold text-gray-900">{Number(rating).toFixed(1)}</span>
            <span className="text-gray-500 text-sm">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>
        {token && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/40 transition-all duration-300"
          >
            <Star className="w-4 h-4" />
            Write a Review
          </button>
        )}
      </div>

      {/* Success banner */}
      {formSuccess && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800">Your review has been submitted. Thank you!</p>
        </div>
      )}

      {/* Write review form */}
      {showForm && token && (
        <form onSubmit={handleSubmitReview} className="mb-8 bg-[#F9FAFB] rounded-2xl p-5 border border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-[#111827] mb-4">Share your experience</h3>

          {/* Star picker */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))}
                  className="transition-transform hover:scale-110">
                  <Star className={`w-7 h-7 ${s <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Your Review</label>
            <textarea
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Tell others about your experience at this salon..."
              rows={4}
              maxLength={600}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] text-sm resize-none transition"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{form.comment.length}/600</p>
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">{formError}</p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => { setShowForm(false); setFormError(''); }}
              className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-[#111827] text-sm font-medium hover:bg-gray-100 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-300/40 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? <><Loader className="w-4 h-4 animate-spin" />Submitting…</> : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Login prompt */}
      {!token && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <Star className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            <button
              onClick={() => navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)}
              className="font-semibold underline hover:text-amber-900"
            >Sign in</button> to leave a review for this salon.
          </p>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-10">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No reviews yet — be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <ReviewAvatar name={r.display_name || r.author_name || 'Anonymous'} size={40} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{r.display_name || r.author_name || 'Anonymous'}</h4>
                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Page ──
const SalonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, isAuthenticated } = useAuth();

  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const shareRef = React.useRef<HTMLDivElement>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{ ref: number; fee: number } | null>(null);

  const bookingSectionRef = React.useRef<HTMLDivElement>(null);
  const canBook = !!selectedService && !!selectedDate && !!selectedTime;

  // Fetch salon + services + reviews from real API
  const fetchSalon = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [salonRes, servicesRes, reviewsRes] = await Promise.all([
        fetch(`${API}/salons/${id}/`),
        fetch(`${API}/salons/${id}/services/`),
        fetch(`${API}/salons/${id}/reviews/`),
      ]);
      if (!salonRes.ok) throw new Error('Salon not found');
      const salonData = await salonRes.json();
      const services = servicesRes.ok ? await servicesRes.json() : [];
      const reviews = reviewsRes.ok ? await reviewsRes.json() : [];
      setSalon({ ...salonData, services: Array.isArray(services) ? services : [], reviews: Array.isArray(reviews) ? reviews : [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load salon');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalon();
  }, [id]);

  // Load saved like state from localStorage
  useEffect(() => {
    if (!id) return;
    const saved = JSON.parse(localStorage.getItem('salonLikes') || '{}');
    setIsFavorite(!!saved[id]);
    // Load stored like count (starts at 0, increments per device)
    const counts = JSON.parse(localStorage.getItem('salonLikeCounts') || '{}');
    setLikeCount(counts[id] || 0);
  }, [id]);

  // Close share dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-scroll to booking section
  useEffect(() => {
    const state = location.state as { scrollToBooking?: boolean };
    if (state?.scrollToBooking && bookingSectionRef.current) {
      window.history.replaceState({}, document.title);
      setTimeout(() => bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500);
    }
  }, [location, loading]);

  const handleToggleLike = () => {
    if (!id) return;
    const newState = !isFavorite;
    setIsFavorite(newState);
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);

    // Persist
    const saved = JSON.parse(localStorage.getItem('salonLikes') || '{}');
    if (newState) saved[id] = true; else delete saved[id];
    localStorage.setItem('salonLikes', JSON.stringify(saved));

    // Update count
    const counts = JSON.parse(localStorage.getItem('salonLikeCounts') || '{}');
    counts[id] = Math.max(0, (counts[id] || 0) + (newState ? 1 : -1));
    setLikeCount(counts[id]);
    localStorage.setItem('salonLikeCounts', JSON.stringify(counts));
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = salon?.name || 'BeautyBook CM';
    const text = `Check out ${title} on BeautyBook CM!`;
    // Use native share sheet on mobile if available
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch { /* user cancelled */ }
    } else {
      setShareOpen(p => !p);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => { setShareCopied(false); setShareOpen(false); }, 1800);
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out ${salon?.name} on BeautyBook CM! ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShareOpen(false);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out ${salon?.name} on BeautyBook CM!`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShareOpen(false);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !salon) return;
    if (!isAuthenticated || !token) {
      // Preserve current URL so user returns here after login
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/bookings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify({
          salon: salon.id,
          service: selectedService.id,
          service_name: selectedService.name,
          client_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username,
          client_email: user?.email,
          booking_date: selectedDate,
          booking_time: toBackendTime(selectedTime),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || JSON.stringify(err));
      }
      const booking = await res.json();
      setBookingSuccess({ ref: booking.id, fee: 0 });
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader className="w-12 h-12 text-purple-600 animate-spin" />
    </div>
  );

  if (error || !salon) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Salon Not Found</h1>
        <p className="text-gray-500 mb-4">{error || 'The salon you\'re looking for doesn\'t exist.'}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">Go Back</button>
      </div>
    </div>
  );

  const coverImg = salon.cover_image
    ? (salon.cover_image.startsWith('http') ? salon.cover_image : `${MEDIA_BASE}${salon.cover_image}`)
    : salon.image
      ? (salon.image.startsWith('http') ? salon.image : `${MEDIA_BASE}${salon.image}`)
      : 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=400&fit=crop';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Booking success banner */}
      {bookingSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-md w-full mx-4">
          <CheckCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-bold">Booking #{bookingSuccess.ref} submitted!</p>
            <p className="text-sm text-green-100">Your booking request has been submitted successfully.</p>
          </div>
          <button onClick={() => setBookingSuccess(null)} className="ml-auto text-green-200 hover:text-white">✕</button>
        </div>
      )}

      {/* Contact Modal */}
      {contactOpen && salon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setContactOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Contact {salon.name}</h2>
                <p className="text-white/70 text-xs mt-0.5">Choose how to reach us</p>
              </div>
              <button onClick={() => setContactOpen(false)} className="text-white/70 hover:text-white transition">
                <Phone className="w-0 h-0" />
                <span className="text-xl leading-none">✕</span>
              </button>
            </div>
            <div className="p-5 space-y-3">
              {salon.phone && (
                <a href={`tel:${salon.phone}`}
                  onClick={() => setContactOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#6D28D9] hover:bg-[#6D28D9]/5 transition-all group">
                  <div className="w-11 h-11 rounded-xl bg-[#6D28D9]/10 flex items-center justify-center group-hover:bg-[#6D28D9] transition-colors">
                    <Phone className="w-5 h-5 text-[#6D28D9] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Call Salon</p>
                    <p className="text-gray-500 text-xs mt-0.5">{salon.phone}</p>
                  </div>
                </a>
              )}
              {salon.whatsapp && (
                <a href={`https://wa.me/${salon.whatsapp.replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => setContactOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 transition-all group">
                  <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">WhatsApp</p>
                    <p className="text-gray-500 text-xs mt-0.5">{salon.whatsapp}</p>
                  </div>
                </a>
              )}
              {!salon.phone && !salon.whatsapp && (
                <p className="text-center text-gray-500 text-sm py-4">No contact details available yet.</p>
              )}
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => setContactOpen(false)}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative">
        <div className="relative h-64 sm:h-80 lg:h-96 w-full">
          <img src={coverImg} alt={salon.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')} className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-800 hover:bg-white transition-colors shadow-lg">
            <ChevronLeft className="w-4 h-4" />Back
          </button>
          <div className="absolute top-4 right-4 flex gap-2">
            {/* ── Like / Heart ── */}
            <button
              onClick={handleToggleLike}
              title={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              className={`relative flex items-center gap-1.5 px-3 h-10 rounded-xl shadow-lg transition-all duration-200
                ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'}
                ${likeAnimating ? 'scale-125' : 'scale-100'}`}
            >
              <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'fill-current' : ''} ${likeAnimating ? 'scale-150' : ''}`} />
              {likeCount > 0 && (
                <span className="text-xs font-bold">{likeCount}</span>
              )}
            </button>

            {/* ── Share ── */}
            <div ref={shareRef} className="relative">
              <button
                onClick={handleShare}
                title="Share this salon"
                className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:bg-white transition-colors shadow-lg"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* Share dropdown (desktop fallback) */}
              {shareOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <button onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#6D28D9] transition-colors">
                    {shareCopied ? '✅ Link copied!' : '🔗 Copy link'}
                  </button>
                  <button onClick={handleShareWhatsApp}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-t border-gray-50">
                    💬 Share on WhatsApp
                  </button>
                  <button onClick={handleShareTwitter}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors border-t border-gray-50">
                    🐦 Share on Twitter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{salon.name}</h1>
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(salon.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="font-semibold text-gray-900">{salon.rating}</span>
                  <span className="text-gray-500">({salon.review_count} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-purple-600" />{salon.location}, {salon.city}</div>
                  {salon.open_hours && <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-green-600" />{salon.open_hours}</div>}
                </div>
                <p className="text-gray-600 leading-relaxed">{salon.description}</p>
              </div>
              <div className="flex lg:flex-col gap-3 lg:items-end flex-shrink-0">
                <button onClick={() => bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all duration-300">
                  <Calendar className="w-4 h-4" />Book Appointment
                </button>
                {(salon.phone || salon.whatsapp) && (
                  <button
                    onClick={() => setContactOpen(true)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <Phone className="w-4 h-4" />Contact Salon
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {salon.services.length > 0 && (
              <ServicesList services={salon.services} selected={selectedService} onSelect={setSelectedService} />
            )}
            <div ref={bookingSectionRef}>
              {/* Free booking banner */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-sm">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-white font-semibold text-sm">Enjoy free bookings for a limited time!</p>
                  <p className="text-green-100 text-xs">No upfront payment required — just book and show up.</p>
                </div>
              </div>
              {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
                  <span className="text-amber-600 text-lg">🔒</span>
                  <p className="text-sm text-amber-800">
                    <button onClick={() => navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)} className="font-semibold underline">Sign in</button> to book an appointment.
                  </p>
                </div>
              )}
              <BookingForm
                selected={selectedService} date={selectedDate} time={selectedTime}
                onDate={setSelectedDate} onTime={setSelectedTime}
                onConfirm={handleConfirmBooking} canBook={canBook && isAuthenticated} submitting={submitting}
              />
            </div>
            <ReviewsSection
                reviews={salon.reviews}
                rating={salon.rating}
                reviewCount={salon.review_count}
                salonId={salon.id}
                token={token}
                onReviewAdded={fetchSalon}
              />
          </div>
          <div className="lg:col-span-1">
            <BookingSummary
              selected={selectedService} date={selectedDate} time={selectedTime}
              salonName={salon.name} onConfirm={handleConfirmBooking} submitting={submitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonDetail;
