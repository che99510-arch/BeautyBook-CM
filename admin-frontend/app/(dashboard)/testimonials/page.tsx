'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle, Trash2, Search, MessageSquare, Clock, Users, Loader2, ChevronLeft, ChevronRight, Quote, RefreshCw } from 'lucide-react';
import Cookies from 'js-cookie';

// ── API helpers ──────────────────────────────────────────────────────────────
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined')
    return `${window.location.protocol}//${window.location.hostname}:8000/api/admin`;
  return 'http://localhost:8000/api/admin';
};

interface Testimonial {
  id: number;
  name: string;
  avatar_display_url?: string;
  avatar_url?: string;
  role: 'client' | 'salon_owner';
  location: string;
  comment: string;
  rating: number;
  is_approved: boolean;
  created_at: string;
}

const AVATAR_FALLBACKS = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
];

function avatarFor(t: Testimonial, idx: number) {
  return t.avatar_display_url || t.avatar_url || AVATAR_FALLBACKS[idx % AVATAR_FALLBACKS.length];
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  );
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-fade-in
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : '⚠️'}
      {message}
    </div>
  );
}

// ── Page component ────────────────────────────────────────────────────────────
export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'salon_owner'>('all');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  const PER_PAGE = 9;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Token ${Cookies.get('admin_token') || ''}`,
  });

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${getApiUrl()}/testimonials/?approved=all`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      const items: Testimonial[] = Array.isArray(data) ? data : (data.results ?? []);
      setTestimonials(items);
      setStats({
        total: items.length,
        pending: items.filter((t) => !t.is_approved).length,
        approved: items.filter((t) => t.is_approved).length,
      });
    } catch (e) {
      showToast('Failed to load testimonials', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const handleApprove = async (id: number) => {
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`${getApiUrl()}/testimonials/${id}/approve/`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed');
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_approved: true } : t))
      );
      setStats((s) => ({ ...s, pending: s.pending - 1, approved: s.approved + 1 }));
      showToast('Testimonial approved and published!');
    } catch {
      showToast('Failed to approve', 'error');
    } finally {
      setActionLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const handleReject = async (id: number, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"? This cannot be undone.`)) return;
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`${getApiUrl()}/testimonials/${id}/reject/`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed');
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      setStats((s) => ({
        total: s.total - 1,
        pending: s.pending - (testimonials.find((t) => t.id === id)?.is_approved ? 0 : 1),
        approved: s.approved - (testimonials.find((t) => t.id === id)?.is_approved ? 1 : 0),
      }));
      showToast('Testimonial deleted.');
    } catch {
      showToast('Failed to delete', 'error');
    } finally {
      setActionLoading((p) => ({ ...p, [id]: false }));
    }
  };

  // Filter + search
  const filtered = testimonials.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.comment.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'pending' && !t.is_approved) ||
      (filter === 'approved' && t.is_approved);
    const matchRole = roleFilter === 'all' || t.role === roleFilter;
    return matchSearch && matchFilter && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and approve platform testimonials before they appear on the site.
          </p>
        </div>
        <button
          onClick={fetchTestimonials}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reviews', value: stats.total, icon: MessageSquare, color: 'bg-violet-50 text-violet-600' },
          { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Published', value: stats.approved, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, comment, city…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
          />
        </div>

        {/* Status filter */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                filter === f ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as typeof roleFilter); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-violet-300 outline-none"
        >
          <option value="all">All Roles</option>
          <option value="client">Clients</option>
          <option value="salon_owner">Salon Owners</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : paged.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No testimonials found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {paged.map((t, idx) => (
            <div
              key={t.id}
              className={`relative bg-white rounded-2xl p-6 border shadow-sm transition-shadow hover:shadow-md
                ${t.is_approved ? 'border-green-100' : 'border-amber-100'}`}
            >
              {/* Status badge */}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                  ${t.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {t.is_approved ? (
                    <><CheckCircle className="w-3 h-3" /> Published</>
                  ) : (
                    <><Clock className="w-3 h-3" /> Pending</>
                  )}
                </span>
              </div>

              {/* Quote */}
              <Quote className="w-7 h-7 text-violet-100 mb-2" />

              {/* Role badge */}
              <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-2
                ${t.role === 'salon_owner' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                {t.role === 'salon_owner' ? '✂️ Salon Owner' : '💅 Client'}
              </span>

              {/* Stars */}
              <div className="mb-2"><StarRow rating={t.rating} /></div>

              {/* Comment */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
                "{t.comment}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <img
                  src={avatarFor(t, idx)}
                  alt={t.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                  onError={(e) => { (e.target as HTMLImageElement).src = AVATAR_FALLBACKS[idx % AVATAR_FALLBACKS.length]; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                  {t.location && <p className="text-xs text-gray-400 truncate">📍 {t.location}</p>}
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                {!t.is_approved && (
                  <button
                    onClick={() => handleApprove(t.id)}
                    disabled={actionLoading[t.id]}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {actionLoading[t.id] ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <><CheckCircle className="w-3.5 h-3.5" /> Approve</>
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleReject(t.id, t.name)}
                  disabled={actionLoading[t.id]}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60 ${t.is_approved ? 'flex-1' : 'px-4'}`}
                >
                  {actionLoading[t.id] ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <><Trash2 className="w-3.5 h-3.5" /> Delete</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm text-gray-600 px-2">
            Page {page} of {totalPages} · <span className="font-medium">{filtered.length} results</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
