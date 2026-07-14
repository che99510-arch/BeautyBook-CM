'use client';

import React, { useState, useEffect } from 'react';
import apiService from '@/services/api';
import {
  Search, ChevronDown, CheckCircle, XCircle, Clock, Loader2,
  Eye, Edit2, Trash2, TrendingUp, X, Star, MapPin, Phone, Calendar,
} from 'lucide-react';
import ActionDropdown, { ActionMenuItem } from '@/components/ActionDropdown';
import Pagination from '@/components/Pagination';

interface Salon {
  id: string;
  name: string;
  owner_name: string;
  owner_email: string;
  location: string;
  is_active: boolean;
  created_at: string;
  city: string;
  rating: number;
  review_count?: number;
  phone?: string;
  starting_price?: number;
}

const statusConfig = {
  active:    { icon: CheckCircle, color: 'text-green-400',  label: 'Active' },
  pending:   { icon: Clock,       color: 'text-amber-400',  label: 'Pending' },
  suspended: { icon: XCircle,     color: 'text-red-400',    label: 'Suspended' },
};

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg}
    </div>
  );
}

// ── Analytics Modal ────────────────────────────────────────────────────────
function AnalyticsModal({ salon, onClose }: { salon: Salon; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiService.getRevenueBySalon();
        const salonData = Array.isArray(res)
          ? res.find((s: any) => String(s.salon_id) === String(salon.id))
          : null;
        setData(salonData ?? { total_bookings: 0, total_revenue: 0, total_booking_fees: 0 });
      } catch {
        setData({ total_bookings: 0, total_revenue: 0, total_booking_fees: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [salon.id]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" /> Salon Analytics
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">{salon.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-gray-700/40 rounded-xl p-4 mb-5 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">{salon.location}, {salon.city}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Star className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{Number(salon.rating).toFixed(1)} / 5 ({salon.review_count ?? 0} reviews)</span>
          </div>
          {salon.phone && (
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-4 h-4 text-green-400 shrink-0" />
              <span>{salon.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Joined {new Date(salon.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Bookings', value: (data?.total_bookings ?? 0).toLocaleString(), color: 'text-blue-400' },
              { label: 'Total Revenue',  value: `${Number(data?.total_revenue ?? 0).toLocaleString()} FCFA`, color: 'text-green-400' },
              { label: 'Platform Fees',  value: `${Number(data?.total_booking_fees ?? 0).toLocaleString()} FCFA`, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-700/50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">Based on confirmed + completed bookings.</p>
        <button onClick={onClose} className="w-full mt-5 py-2.5 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition">
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [analyticsModalSalon, setAnalyticsModalSalon] = useState<Salon | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [editForm, setEditForm] = useState({ name: '', owner_name: '', owner_email: '', location: '', city: '' });

  const fetchSalons = async (page = currentPage) => {
    try {
      setLoading(true);
      const data = await apiService.getSalons(page, searchTerm || undefined);
      setSalons(Array.isArray(data.results) ? data.results : (data || []));
      setTotalCount(data.count || 0);
    } catch {
      setSalons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalons(currentPage); }, [currentPage]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await apiService.approveSalon(id);
      showToast('Salon approved successfully');
      fetchSalons();
    } catch { showToast('Failed to approve salon', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleSuspend = async (id: string) => {
    setActionLoading(id);
    try {
      await apiService.suspendSalon(id);
      showToast('Salon suspended');
      fetchSalons();
    } catch { showToast('Failed to suspend salon', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleEdit = (salon: Salon) => {
    setSelectedSalon(salon);
    setEditForm({ name: salon.name, owner_name: salon.owner_name, owner_email: salon.owner_email, location: salon.location, city: salon.city });
    setEditModalOpen(true);
  };

  const handleUpdateSalon = async () => {
    if (!selectedSalon) return;
    try {
      await apiService.updateSalon(selectedSalon.id, { name: editForm.name, location: editForm.location, city: editForm.city });
      showToast(`Salon "${editForm.name}" updated`);
      setEditModalOpen(false);
      setSelectedSalon(null);
      fetchSalons();
    } catch { showToast('Failed to update salon', 'error'); }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSalon) return;
    try {
      await apiService.deleteSalon(selectedSalon.id);
      showToast(`Salon "${selectedSalon.name}" deleted`);
      setDeleteModalOpen(false);
      setSelectedSalon(null);
      fetchSalons();
    } catch { showToast('Failed to delete salon', 'error'); }
  };

  const filteredSalons = salons.filter(salon => {
    const matchesSearch =
      salon.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const salonStatus = salon.is_active ? 'active' : 'suspended';
    return matchesSearch && (selectedStatus === 'all' || salonStatus === selectedStatus);
  });

  const getSalonStatus = (salon: Salon): 'active' | 'suspended' | 'pending' =>
    salon.is_active ? 'active' : 'suspended';

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-12 h-12 animate-spin text-purple-500" /></div>;
  }

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Salons Management</h1>
        <p className="text-gray-400">Manage and monitor all partner salons on the platform.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search salons or owners..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="relative">
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
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
                {['Salon Name', 'Owner', 'Location', 'City', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-semibold text-gray-300 ${h === 'Actions' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSalons.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No salons found</td></tr>
              ) : filteredSalons.map(salon => {
                const status = getSalonStatus(salon);
                const config = statusConfig[status];
                const StatusIcon = config.icon;
                return (
                  <tr key={salon.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-white">{salon.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div>{salon.owner_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{salon.owner_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{salon.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{salon.city}</td>
                    <td className="px-6 py-4 text-sm text-amber-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {Number(salon.rating).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={config.color}>{config.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {actionLoading === salon.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-500 mx-auto" />
                      ) : (
                        <ActionDropdown actions={[
                          { label: 'View Analytics', icon: <TrendingUp className="w-4 h-4" />, onClick: () => setAnalyticsModalSalon(salon) },
                          { label: 'Edit', icon: <Edit2 className="w-4 h-4" />, onClick: () => handleEdit(salon) },
                          ...(salon.is_active
                            ? [{ label: 'Suspend', icon: <XCircle className="w-4 h-4" />, onClick: () => handleSuspend(salon.id), danger: true } as ActionMenuItem]
                            : [{ label: 'Approve', icon: <CheckCircle className="w-4 h-4" />, onClick: () => handleApprove(salon.id) } as ActionMenuItem]
                          ),
                          { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => { setSelectedSalon(salon); setDeleteModalOpen(true); }, danger: true },
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

      {/* Analytics Modal */}
      {analyticsModalSalon && (
        <AnalyticsModal salon={analyticsModalSalon} onClose={() => setAnalyticsModalSalon(null)} />
      )}

      {/* Edit Salon Modal */}
      {editModalOpen && selectedSalon && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditModalOpen(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Salon</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Salon Name', key: 'name' as const, type: 'text' },
                { label: 'Owner Email', key: 'owner_email' as const, type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{f.label}</label>
                  <input type={f.type} value={editForm[f.key]}
                    onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input type="text" value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                  <select value={editForm.city}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="Bamenda">Bamenda</option>
                    <option value="Buea">Buea</option>
                    <option value="Douala">Douala</option>
                    <option value="Yaounde">Yaounde</option>
                    <option value="Bafoussam">Bafoussam</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditModalOpen(false)} className="flex-1 py-2.5 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition">Cancel</button>
                <button onClick={handleUpdateSalon} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-lg transition">Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && selectedSalon && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDeleteModalOpen(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Delete Salon</h2>
                <p className="text-sm text-gray-400">{selectedSalon.name}</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 text-sm">
              This will permanently delete "{selectedSalon.name}" and all its data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2.5 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
