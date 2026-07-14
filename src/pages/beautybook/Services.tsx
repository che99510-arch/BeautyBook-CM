import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, AlertCircle, DollarSign, Clock, Tag, X, Check, Loader } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import SalonLayout from '../../components/beautybook/SalonLayout';

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  duration: string;
  price: number;
  is_available: boolean;
}

interface FormData {
  name: string; category: string; description: string; duration: string; price: string;
}

const EMPTY_FORM: FormData = { name: '', category: 'Hair', description: '', duration: '1 hour', price: '' };
const CATEGORIES = ['Hair', 'Nails', 'Makeup', 'Massage'];

const CAT_COLORS: Record<string, string> = {
  Hair:    'bg-purple-100 text-purple-700',
  Nails:   'bg-pink-100   text-pink-700',
  Makeup:  'bg-amber-100  text-amber-700',
  Massage: 'bg-green-100  text-green-700',
};

const Services: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('salonOwnerToken');

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchServices = useCallback(async () => {
    if (!token) { navigate('/salon-login'); return; }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/services/my_services/`, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.status === 401) { navigate('/salon-login'); return; }
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      setServices(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId ? `${API_BASE}/services/${editingId}/` : `${API_BASE}/services/create_service/`;
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
      if (!res.ok) throw new Error(res.statusText);
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      showToast(editingId ? 'Service updated!' : 'Service added!');
      await fetchServices();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/services/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error(res.statusText);
      setDeleteId(null);
      showToast('Service deleted.');
      await fetchServices();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const openEdit = (s: Service) => {
    setForm({ name: s.name, category: s.category, description: s.description, duration: s.duration, price: s.price.toString() });
    setEditingId(s.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(false); };

  return (
    <SalonLayout title="Services">

      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#6D28D9] text-white rounded-xl shadow-xl text-sm font-semibold animate-fade-in">
          <Check className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <p className="text-[#6B7280] text-sm">Manage your salon's beauty services</p>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="mb-8 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          {/* Form header */}
          <div className="bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] px-6 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
            <button onClick={cancelForm} className="text-white/70 hover:text-white transition"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase mb-1.5">Service Name *</label>
                <input type="text" placeholder="e.g. Box Braids" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase mb-1.5">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  aria-label="Service category"
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white transition">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase mb-1.5">Duration *</label>
                <input type="text" placeholder="e.g. 2-3 hours" value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase mb-1.5">Price (FCFA) *</label>
                <input type="number" placeholder="5000" step="100" value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-1.5">Description *</label>
              <textarea placeholder="Describe this service…" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} required
                className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] resize-none transition" />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <button type="button" onClick={cancelForm}
                className="px-5 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6] transition">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition disabled:opacity-60">
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {submitting ? 'Saving…' : editingId ? 'Update Service' : 'Add Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#6D28D9]/20 border-t-[#6D28D9] animate-spin mx-auto mb-4" />
            <p className="text-[#6B7280] text-sm font-medium">Loading services…</p>
          </div>
        </div>
      )}

      {/* Grid */}
      {!loading && services.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
              {/* Top accent */}
              <div className="h-1.5 bg-gradient-to-r from-[#6D28D9] to-[#F59E0B]" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-bold text-[#111827] leading-tight">{s.name}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ml-2 ${CAT_COLORS[s.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {s.category}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] line-clamp-2 mb-4">{s.description}</p>

                <div className="flex items-center gap-4 py-3 border-y border-[#F3F4F6] mb-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <DollarSign className="w-4 h-4 text-[#F59E0B]" />
                    <span className="font-bold text-[#111827]">{s.price.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-[#6B7280]">{s.duration}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#E5E7EB] text-[#111827] text-xs font-semibold hover:border-[#6D28D9] hover:text-[#6D28D9] transition">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteId(s.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && services.length === 0 && !showForm && (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-[#D1D5DB]">
          <Tag className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
          <h3 className="text-base font-semibold text-[#111827] mb-2">No services yet</h3>
          <p className="text-[#6B7280] text-sm mb-6">Add your first service to start receiving bookings</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-[#111827] text-center mb-2">Delete Service?</h3>
            <p className="text-sm text-[#6B7280] text-center mb-6">
              "{services.find(s => s.id === deleteId)?.name}" will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6] transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </SalonLayout>
  );
};

export default Services;
