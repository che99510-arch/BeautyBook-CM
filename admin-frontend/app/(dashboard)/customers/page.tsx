'use client';

import React, { useState, useEffect } from 'react';
import apiService from '@/services/api';
import {
  Search, Loader2, Eye, Edit2, UserCheck, UserX, Trash2, Clock, X,
  Calendar, CheckCircle, XCircle,
} from 'lucide-react';
import ActionDropdown, { ActionMenuItem } from '@/components/ActionDropdown';
import Pagination from '@/components/Pagination';

interface Customer {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  phone?: string;
  profile?: { phone?: string };
}

interface CustomerBooking {
  id: string;
  salon_name: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  service_price: number;
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {msg}
    </div>
  );
}

// ── Booking History Modal ──────────────────────────────────────────────────
function BookingHistoryModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fullName = `${customer.first_name} ${customer.last_name}`.trim() || customer.username;

  useEffect(() => {
    async function load() {
      try {
        // Fetch all bookings and filter by client username match (backend filters by client)
        const data = await apiService.getBookings(1, undefined);
        // Filter by customer id — the admin bookings endpoint returns client info
        const all: CustomerBooking[] = (data.results || []).filter(
          (b: any) => String(b.client) === String(customer.id) || b.client_name?.toLowerCase().includes(fullName.toLowerCase())
        );
        setBookings(all);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [customer.id, fullName]);

  const statusColor: Record<string, string> = {
    completed: 'text-green-400', confirmed: 'text-purple-400',
    pending: 'text-blue-400', cancelled: 'text-red-400',
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" /> Booking History
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">{fullName} · {customer.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No bookings found for this customer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="bg-gray-700/50 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{b.service_name}</p>
                    <p className="text-gray-400 text-xs">{b.salon_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gray-300 text-xs">{new Date(b.booking_date).toLocaleDateString('en-GB')} · {b.booking_time}</p>
                    <p className={`text-xs font-semibold capitalize mt-0.5 ${statusColor[b.status] ?? 'text-gray-400'}`}>{b.status}</p>
                  </div>
                  <div className="text-right shrink-0 min-w-[90px]">
                    <p className="text-white text-sm font-bold">{Number(b.service_price).toLocaleString()} FCFA</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingHistoryCustomer, setBookingHistoryCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });

  const fetchCustomers = async (page = currentPage) => {
    try {
      setLoading(true);
      const data = await apiService.getCustomers(page, searchTerm || undefined);
      setCustomers(data?.results || []);
      setTotalCount(data?.count || 0);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage]);

  const handleSuspend = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this customer?')) return;
    setActionLoading(id);
    try {
      await apiService.suspendUser(id);
      showToast('Customer suspended');
      fetchCustomers();
    } catch (err) {
      showToast('Failed to suspend customer', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm('Are you sure you want to activate this customer?')) return;
    setActionLoading(id);
    try {
      await apiService.activateUser(id);
      showToast('Customer activated');
      fetchCustomers();
    } catch (err) {
      showToast('Failed to activate customer', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone || customer.profile?.phone || '',
    });
    setEditModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone || customer.profile?.phone || '',
    });
    setEditModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteModalOpen(true);
  };

  const handleViewBookingHistory = (customer: Customer) => {
    setBookingHistoryCustomer(customer);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      await apiService.updateCustomer(selectedCustomer.id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
      });
      showToast(`Customer "${editForm.first_name} ${editForm.last_name}" updated`);
      setEditModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      showToast('Failed to update customer', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;
    const fullName = `${selectedCustomer.first_name} ${selectedCustomer.last_name}`.trim() || selectedCustomer.username;
    try {
      await apiService.deleteCustomer(selectedCustomer.id);
      showToast(`Customer "${fullName}" deleted`);
      setDeleteModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      showToast('Failed to delete customer', 'error');
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.first_name} ${customer.last_name}`.trim() || customer.username;
    if (!fullName && !customer.email) {
      return false;
    }
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Customers</h1>
        <p className="text-gray-400">View and manage all registered customers on the platform.</p>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Join Date</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const fullName = `${customer.first_name} ${customer.last_name}`.trim() || customer.username;
                  return (
                    <tr key={customer.id} className="hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-white">{fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{customer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{customer.phone || customer.profile?.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(customer.date_joined).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {actionLoading === customer.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-purple-500 mx-auto" />
                        ) : (
                          <ActionDropdown
                            actions={[
                              {
                                label: 'View Details',
                                icon: <Eye className="w-4 h-4" />,
                                onClick: () => handleViewDetails(customer),
                              },
                              {
                                label: 'Booking History',
                                icon: <Clock className="w-4 h-4" />,
                                onClick: () => handleViewBookingHistory(customer),
                              },
                              customer.is_active
                                ? {
                                    label: 'Suspend',
                                    icon: <UserX className="w-4 h-4" />,
                                    onClick: () => handleSuspend(customer.id),
                                    danger: true,
                                  } as ActionMenuItem
                                : {
                                    label: 'Activate',
                                    icon: <UserCheck className="w-4 h-4" />,
                                    onClick: () => handleActivate(customer.id),
                                  } as ActionMenuItem,
                              {
                                label: 'Edit',
                                icon: <Edit2 className="w-4 h-4" />,
                                onClick: () => handleEdit(customer),
                              },
                              {
                                label: 'Delete',
                                icon: <Trash2 className="w-4 h-4" />,
                                onClick: () => handleDelete(customer),
                                danger: true,
                              },
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

      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={10}
        onPageChange={setCurrentPage}
      />

      {/* Booking History Modal */}
      {bookingHistoryCustomer && (
        <BookingHistoryModal customer={bookingHistoryCustomer} onClose={() => setBookingHistoryCustomer(null)} />
      )}

      {/* Edit Customer Modal */}
      {editModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditModalOpen(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Customer</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditModalOpen(false)} className="flex-1 py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition">
                  Cancel
                </button>
                <button onClick={handleUpdateCustomer} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDeleteModalOpen(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Delete Customer</h2>
                <p className="text-sm text-gray-400">{`${selectedCustomer.first_name} ${selectedCustomer.last_name}`}</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{`${selectedCustomer.first_name} ${selectedCustomer.last_name}`}"? This action cannot be undone and will remove all customer data.
            </p>

            <div className="flex gap-3">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2.5 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
