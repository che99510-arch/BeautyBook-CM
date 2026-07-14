import React, { useState } from 'react';
import {
  LayoutDashboard, Scissors, CalendarDays, BarChart3, Menu, X,
  TrendingUp, Users, DollarSign, Clock, Plus, ChevronRight, Search
} from 'lucide-react';
import { dashboardBookings, formatPrice } from '@/data/salonData';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [services, setServices] = useState([
    { id: '1', name: 'Box Braids', category: 'Hair', duration: '3-4 hours', price: 15000 },
    { id: '2', name: 'Gel Manicure', category: 'Nails', duration: '1 hour', price: 5000 },
    { id: '3', name: 'Bridal Makeup', category: 'Makeup', duration: '2 hours', price: 25000 },
    { id: '4', name: 'Cornrows', category: 'Hair', duration: '2-3 hours', price: 8000 },
    { id: '5', name: 'Acrylic Nails', category: 'Nails', duration: '1.5 hours', price: 8000 },
    { id: '6', name: 'Locs Retwist', category: 'Hair', duration: '2 hours', price: 10000 },
  ]);
  const [newService, setNewService] = useState({ name: '', category: 'Hair', duration: '', price: '' });
  const [bookingFilter, setBookingFilter] = useState('all');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const metrics = [
    { label: 'Total Bookings', value: '247', change: '+12%', icon: CalendarDays, color: 'from-[#6D28D9] to-[#7C3AED]' },
    { label: 'Revenue', value: '2.4M FCFA', change: '+8%', icon: DollarSign, color: 'from-[#F59E0B] to-[#FBBF24]' },
    { label: 'Active Clients', value: '189', change: '+15%', icon: Users, color: 'from-pink-500 to-rose-500' },
    { label: 'Avg. Rating', value: '4.8', change: '+0.2', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
  ];

  const filteredBookings = bookingFilter === 'all'
    ? dashboardBookings
    : dashboardBookings.filter((b) => b.status === bookingFilter);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name || !newService.duration || !newService.price) return;
    const service = {
      id: Date.now().toString(),
      name: newService.name,
      category: newService.category,
      duration: newService.duration,
      price: parseInt(newService.price),
    };
    setServices([...services, service]);
    setNewService({ name: '', category: 'Hair', duration: '', price: '' });
    setAddServiceOpen(false);
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex pt-16 lg:pt-20">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-16 lg:top-20 left-0 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] w-64 bg-white border-r border-gray-100 z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-[#111827] mb-1">Salon Dashboard</h2>
          <p className="text-xs text-gray-400">Glamour Studio Douala</p>
        </div>
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-[#6D28D9]/10 text-[#6D28D9]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#111827]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-3 right-3">
          <button
            onClick={() => onNavigate('landing')}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Home
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="sticky top-16 lg:top-20 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-[#111827] capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center text-white text-sm font-bold">
              G
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                        <metric.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {metric.change}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#111827]">{metric.value}</h3>
                    <p className="text-xs text-gray-400 mt-1">{metric.label}</p>
                  </div>
                ))}
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-[#111827]">Upcoming Appointments</h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-sm font-medium text-[#6D28D9] hover:text-[#5B21B6] transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Client</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Service</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Time</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dashboardBookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-[#111827]">{booking.clientName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{booking.service}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{booking.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{booking.time}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[booking.status]}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-[#111827] text-right">{formatPrice(booking.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{services.length} services listed</p>
                <button
                  onClick={() => setAddServiceOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#6D28D9]/10 text-[#6D28D9]">
                        {service.category}
                      </span>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="font-bold text-[#111827] mb-1">{service.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <Clock className="w-3 h-3" />
                      {service.duration}
                    </div>
                    <p className="text-lg font-bold text-[#6D28D9]">{formatPrice(service.price)}</p>
                  </div>
                ))}
              </div>

              {/* Add Service Modal */}
              {addServiceOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddServiceOpen(false)} />
                  <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#111827]">Add New Service</h3>
                      <button onClick={() => setAddServiceOpen(false)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <form onSubmit={handleAddService} className="p-6 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-[#111827] mb-1.5 block">Service Name</label>
                        <input
                          type="text"
                          required
                          value={newService.name}
                          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                          placeholder="e.g. Box Braids"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-[#6D28D9] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#111827] mb-1.5 block">Category</label>
                        <select
                          value={newService.category}
                          onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-[#6D28D9] transition-colors cursor-pointer"
                        >
                          <option>Hair</option>
                          <option>Nails</option>
                          <option>Makeup</option>
                          <option>Massage</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#111827] mb-1.5 block">Duration</label>
                        <input
                          type="text"
                          required
                          value={newService.duration}
                          onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                          placeholder="e.g. 2-3 hours"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-[#6D28D9] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#111827] mb-1.5 block">Price (FCFA)</label>
                        <input
                          type="number"
                          required
                          value={newService.price}
                          onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                          placeholder="e.g. 15000"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-[#6D28D9] transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all duration-300"
                      >
                        Add Service
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setBookingFilter(filter)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                        bookingFilter === filter
                          ? 'bg-[#6D28D9] text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="bg-transparent text-sm focus:outline-none text-[#111827] placeholder-gray-400"
                  />
                </div>
              </div>

              {filteredBookings.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Client</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Service</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Time</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                          <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-[#111827]">{booking.clientName}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{booking.service}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{booking.date}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{booking.time}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[booking.status]}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-[#111827] text-right">{formatPrice(booking.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <CalendarDays className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#111827] mb-2">No bookings yet</h3>
                  <p className="text-sm text-gray-500">Bookings matching this filter will appear here.</p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Revenue Chart Placeholder */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-[#111827] mb-6">Revenue Overview</h3>
                <div className="flex items-end gap-2 h-48">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month, i) => {
                    const heights = [40, 65, 50, 80, 70, 90, 85, 95];
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#6D28D9] to-[#7C3AED] transition-all duration-500 hover:from-[#F59E0B] hover:to-[#FBBF24] cursor-pointer"
                          style={{ height: `${heights[i]}%` }}
                          title={`${month}: ${(heights[i] * 30000).toLocaleString()} FCFA`}
                        />
                        <span className="text-[10px] text-gray-400">{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service Popularity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-[#111827] mb-4">Popular Services</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Box Braids', percentage: 85, color: 'bg-[#6D28D9]' },
                      { name: 'Gel Manicure', percentage: 72, color: 'bg-[#F59E0B]' },
                      { name: 'Bridal Makeup', percentage: 65, color: 'bg-pink-500' },
                      { name: 'Cornrows', percentage: 58, color: 'bg-emerald-500' },
                      { name: 'Locs Retwist', percentage: 45, color: 'bg-blue-500' },
                    ].map((item) => (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{item.name}</span>
                          <span className="text-xs font-semibold text-gray-400">{item.percentage}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all duration-700`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-[#111827] mb-4">Client Demographics</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Douala', value: '62%', color: 'bg-[#6D28D9]' },
                      { label: 'Yaoundé', value: '38%', color: 'bg-[#F59E0B]' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                        <span className="text-sm font-bold text-[#111827]">{item.value}</span>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Age Groups</h4>
                      {[
                        { label: '18-24', value: '35%' },
                        { label: '25-30', value: '40%' },
                        { label: '31-40', value: '25%' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-1">
                          <span className="text-sm text-gray-600">{item.label}</span>
                          <span className="text-sm font-semibold text-[#111827]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
