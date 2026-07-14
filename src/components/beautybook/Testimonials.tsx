import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, X, CheckCircle, Loader2, MessageSquarePlus } from 'lucide-react';
import { testimonials as fallbackTestimonials } from '@/data/salonData';
import { API_BASE } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────
interface Testimonial {
  id: string | number;
  name: string;
  avatar?: string;
  avatar_url?: string;
  avatar_display_url?: string;
  location: string;
  comment: string;
  rating: number;
  role?: 'client' | 'salon_owner';
}

interface SubmitForm {
  name: string;
  role: 'client' | 'salon_owner';
  location: string;
  comment: string;
  rating: number;
}

const ROTATE_INTERVAL = 5000;

// Generate a consistent color from a name string
function nameToColor(name: string): string {
  const colors = [
    '#6D28D9', '#7C3AED', '#DB2777', '#DC2626',
    '#D97706', '#059669', '#0284C7', '#7C3AED',
  ];
  const safe = String(name || '');
  let hash = 0;
  for (let i = 0; i < safe.length; i++) hash = safe.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// Returns initials (up to 2 chars) from a display name
function getInitials(name: string): string {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Avatar component — shows real photo if available, otherwise colored initials
const Avatar: React.FC<{ name: string | null | undefined; src?: string; size?: number }> = ({ name, src, size = 40 }) => {
  const [imgError, setImgError] = useState(false);
  const showImg = !!src && !imgError;
  const safeName = String(name || '?');
  const bg = nameToColor(safeName);
  const initials = getInitials(safeName);
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white shadow-sm"
      style={{ width: size, height: size, background: showImg ? undefined : bg }}
    >
      {showImg ? (
        <img
          src={src}
          alt={safeName}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-white font-bold" style={{ fontSize: size * 0.36 }}>
          {initials}
        </span>
      )}
    </div>
  );
};

// ── StarRating component ───────────────────────────────────────────────────
const StarRating: React.FC<{ value: number; onChange?: (v: number) => void; readonly?: boolean }> = ({
  value, onChange, readonly = false,
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer transition-transform hover:scale-110'}
          aria-label={`${star} star`}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hovered || value)
                ? 'text-[#F59E0B] fill-[#F59E0B]'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// ── Submit Modal ───────────────────────────────────────────────────────────
const SubmitModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState<SubmitForm>({
    name: '',
    role: 'client',
    location: '',
    comment: '',
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) {
      setError('Please fill in your name and comment.');
      return;
    }
    if (form.comment.trim().length < 20) {
      setError('Please write at least 20 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/testimonials/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          role: form.role,
          location: form.location.trim(),
          comment: form.comment.trim(),
          rating: form.rating,
          avatar_url: '',
        }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => { onSuccess(); onClose(); }, 2500);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6D28D9] to-[#F59E0B] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-bold">Share Your Experience</h3>
          <p className="text-white/80 text-sm mt-1">
            Tell us how BeautyBook CM has helped you.
          </p>
        </div>

        <div className="p-6">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="w-14 h-14 text-green-500" />
              <h4 className="text-lg font-semibold text-[#111827]">Thank you!</h4>
              <p className="text-gray-500 text-sm max-w-xs">
                Your review is submitted and will appear after a quick review by our team.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Role row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Marie Nguema"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none transition"
                    maxLength={100}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">I am a</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as 'client' | 'salon_owner' })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none transition bg-white"
                  >
                    <option value="client">Client</option>
                    <option value="salon_owner">Salon Owner</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">City (optional)</label>
                <input
                  type="text"
                  placeholder="Douala or Yaoundé"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none transition"
                  maxLength={80}
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Your Rating *</label>
                <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Your Review *</label>
                <textarea
                  placeholder="Tell us about your experience with BeautyBook CM…"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none transition resize-none"
                  maxLength={600}
                  required
                />
                <p className="text-right text-xs text-gray-400 mt-0.5">{form.comment.length}/600</p>
              </div>

              {error && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] rounded-xl hover:shadow-lg hover:shadow-[#6D28D9]/30 transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Testimonials component ────────────────────────────────────────────
const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const touchStartX = useRef(0);

  // Visible group: show 3 cards at a time on desktop, 1 on mobile (handled via CSS)
  // Slideshow cycles through individual cards
  const total = testimonials.length;

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/testimonials/`);
      if (res.ok) {
        const data = await res.json();
        const items: Testimonial[] = Array.isArray(data)
          ? data
          : data.results ?? [];
        if (items.length > 0) {
          setTestimonials(items);
          setLoading(false);
          return;
        }
      }
    } catch {
      /* fall through to fallback */
    }
    // Fallback to static data
    setTestimonials(
      fallbackTestimonials.map((t) => ({
        id: t.id,
        name: t.name,
        avatar: t.avatar,
        location: t.location,
        comment: t.comment,
        rating: t.rating,
        role: 'client' as const,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  // Auto-rotate
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % total);
    }, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, total]);

  const goPrev = () => {
    setCurrent((p) => (p - 1 + total) % total);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), ROTATE_INTERVAL);
  };

  const goNext = () => {
    setCurrent((p) => (p + 1) % total);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), ROTATE_INTERVAL);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    setTimeout(() => setIsPaused(false), ROTATE_INTERVAL);
  };

  // Indices for the trio of visible cards
  const getVisible = (): number[] => {
    if (total === 0) return [];
    if (total === 1) return [0];
    if (total === 2) return [0, 1];
    return [
      (current - 1 + total) % total,
      current,
      (current + 1) % total,
    ];
  };

  const visibleIndices = getVisible();

  if (loading) {
    return (
      <section className="py-20 lg:py-28 bg-gradient-to-b from-[#F3F4F6] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-72 h-52 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className="py-20 lg:py-28 bg-gradient-to-b from-[#F3F4F6] to-white overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-semibold uppercase tracking-wider mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-4">
              Loved by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#F59E0B]">
                Thousands
              </span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              See what our happy clients and salon owners have to say about their BeautyBook CM experience.
            </p>
          </div>

          {/* Slideshow */}
          {total > 0 && (
            <div className="relative">
              {/* Navigation arrows */}
              {total > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    aria-label="Previous testimonial"
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white hover:bg-[#6D28D9] hover:text-white text-[#6D28D9] border border-gray-200 rounded-full p-2.5 shadow-md transition-all duration-200 hover:shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Next testimonial"
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white hover:bg-[#6D28D9] hover:text-white text-[#6D28D9] border border-gray-200 rounded-full p-2.5 shadow-md transition-all duration-200 hover:shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                {visibleIndices.map((idx, position) => {
                  const t = testimonials[idx];
                  const isCenter = position === 1 || total <= 2;
                  return (
                    <div
                      key={`${t.id}-${position}`}
                      className={`
                        bg-white rounded-2xl p-8 border border-gray-100 relative
                        transition-all duration-500
                        ${isCenter
                          ? 'shadow-xl scale-105 border-[#6D28D9]/20 z-10'
                          : 'shadow-sm opacity-80 hover:opacity-100 hover:shadow-lg hover:-translate-y-1'
                        }
                      `}
                    >
                      {/* Quote icon */}
                      <div className="absolute top-6 right-6">
                        <Quote className="w-8 h-8 text-[#6D28D9]/10" />
                      </div>

                      {/* Role badge */}
                      {t.role && (
                        <span className={`
                          inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full mb-3
                          ${t.role === 'salon_owner'
                            ? 'bg-[#6D28D9]/10 text-[#6D28D9]'
                            : 'bg-[#F59E0B]/10 text-[#D97706]'
                          }
                        `}>
                          {t.role === 'salon_owner' ? '✂️ Salon Owner' : '💅 Client'}
                        </span>
                      )}

                      {/* Stars */}
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < t.rating
                                ? 'text-[#F59E0B] fill-[#F59E0B]'
                                : 'text-gray-200 fill-gray-200'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-4">
                        "{t.comment}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <Avatar
                          name={t.name}
                          src={t.avatar_display_url || t.avatar_url || t.avatar}
                          size={40}
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-[#111827]">{t.name}</h4>
                          {t.location && (
                            <p className="text-xs text-gray-400">📍 {t.location}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dot indicators */}
              {total > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setCurrent(idx); setIsPaused(true); setTimeout(() => setIsPaused(false), ROTATE_INTERVAL); }}
                      aria-label={`Go to testimonial ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === current ? 'bg-[#6D28D9] w-7' : 'bg-gray-300 w-2 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm mb-4">
              Had a great experience? We'd love to hear from you!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-sm font-semibold rounded-full shadow-md hover:shadow-xl hover:shadow-[#6D28D9]/30 hover:scale-105 transition-all duration-200"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Share Your Experience
            </button>
          </div>
        </div>
      </section>

      {/* Submit Modal */}
      {showModal && (
        <SubmitModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchTestimonials}
        />
      )}
    </>
  );
};

export default Testimonials;
