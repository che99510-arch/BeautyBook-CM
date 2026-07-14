import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, MapPin, Save, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/api';

const API = API_BASE;

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone: string;
  city: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { token, user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [form, setForm] = useState<Profile>({ first_name: '', last_name: '', email: '', username: '', phone: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login');
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/users/current_user/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          username: data.username || '',
          phone: data.profile?.phone || '',
          city: data.profile?.city || '',
        });
      } catch {
        // fallback to auth context user
        if (user) {
          setForm(f => ({ ...f, first_name: user.first_name, last_name: user.last_name, email: user.email, username: user.username }));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Update user fields
      const userRes = await fetch(`${API}/users/${user?.id}/`, {
        method: 'PATCH',
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: form.first_name, last_name: form.last_name, email: form.email }),
      });
      if (!userRes.ok) throw new Error('Failed to update profile');

      // Update profile fields (phone, city) via profiles endpoint
      await fetch(`${API}/profiles/`, {
        method: 'PATCH',
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, city: form.city }),
      }).catch(() => {}); // non-critical

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="w-10 h-10 text-[#6D28D9] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-[#111827]">My Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Avatar section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-white">
              {(form.first_name?.[0] || form.username?.[0] || '?').toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">
              {form.first_name || form.last_name ? `${form.first_name} ${form.last_name}`.trim() : form.username}
            </h2>
            <p className="text-sm text-gray-500">{form.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] text-xs font-medium">Customer</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-base font-bold text-[#111827] mb-5">Personal Information</h3>

          {saved && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-5 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              Profile updated successfully!
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-5 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus-within:border-[#6D28D9] bg-white transition-colors">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input type="text" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                    placeholder="First name" className="w-full bg-transparent text-[#111827] text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus-within:border-[#6D28D9] bg-white transition-colors">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input type="text" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    placeholder="Last name" className="w-full bg-transparent text-[#111827] text-sm focus:outline-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus-within:border-[#6D28D9] bg-white transition-colors">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Email" className="w-full bg-transparent text-[#111827] text-sm focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus-within:border-[#6D28D9] bg-white transition-colors">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm flex-shrink-0">+237</span>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="6XX XXX XXX" className="w-full bg-transparent text-[#111827] text-sm focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus-within:border-[#6D28D9] bg-white transition-colors">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full bg-transparent text-[#111827] text-sm focus:outline-none cursor-pointer">
                  <option value="">Select city</option>
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50">
                <User className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <input type="text" value={form.username} disabled
                  className="w-full bg-transparent text-gray-400 text-sm focus:outline-none cursor-not-allowed" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
            </div>

            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-70">
              {saving ? <><Loader className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
          </form>
        </div>

        {/* Quick links */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm p-4 flex gap-3">
          <button onClick={() => navigate('/my-bookings')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#6D28D9]/10 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all">
            My Bookings
          </button>
          <button onClick={() => navigate('/')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
            Browse Salons
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
