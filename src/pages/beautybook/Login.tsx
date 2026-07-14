import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import {
  Scissors, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, Store, ChevronLeft,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';

type Tab = 'client' | 'salon';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // ?next= for redirect after login, ?tab= to pre-select tab
  const params = new URLSearchParams(location.search);
  const nextUrl = params.get('next') || '/';
  const initialTab = (params.get('tab') as Tab) || 'client';

  const [tab, setTab] = useState<Tab>(initialTab);

  // ── Client state ─────────────────────────────────────────────────────
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [showClientPwd, setShowClientPwd] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState('');

  // ── Salon state ───────────────────────────────────────────────────────
  const [salonEmail, setSalonEmail] = useState('');
  const [salonPassword, setSalonPassword] = useState('');
  const [showSalonPwd, setShowSalonPwd] = useState(false);
  const [salonLoading, setSalonLoading] = useState(false);
  const [salonError, setSalonError] = useState('');

  // Redirect if client already authenticated
  React.useEffect(() => {
    if (isAuthenticated) navigate(nextUrl, { replace: true });
  }, [isAuthenticated, navigate, nextUrl]);

  // ── Google OAuth (client only) ────────────────────────────────────────
  const { initButton: initGoogleButton, loading: googleLoading, error: googleError } = useGoogleAuth({
    onSuccess: (token, user) => {
      localStorage.setItem('customerToken', token);
      localStorage.setItem('customerUser', JSON.stringify(user));
      navigate(nextUrl, { replace: true });
    },
    onError: (msg) => setClientError(msg),
  });

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !clientPassword) { setClientError('Email and password are required.'); return; }
    setClientLoading(true);
    setClientError('');
    try {
      const result = await login(clientEmail, clientPassword);
      if (result.success) {
        navigate(nextUrl, { replace: true });
      } else {
        setClientError(result.error || 'Login failed');
      }
    } catch { setClientError('An unexpected error occurred'); }
    finally { setClientLoading(false); }
  };

  const handleSalonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonEmail || !salonPassword) { setSalonError('Email and password are required.'); return; }
    setSalonLoading(true);
    setSalonError('');
    try {
      const res = await fetch(`${API_BASE}/users/salon_login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: salonEmail, password: salonPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      localStorage.setItem('salonOwnerToken', data.token);
      localStorage.setItem('salonOwnerEmail', salonEmail);
      localStorage.setItem('salonOwnerLoggedIn', 'true');
      navigate('/salon-dashboard');
    } catch (e: any) {
      setSalonError(e.message || 'Login failed');
    } finally { setSalonLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=1600&fit=crop"
          alt="Beauty salon"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#6D28D9]/90 to-[#111827]/80" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">BeautyBook</span>
              <span className="text-xs font-semibold text-[#F59E0B] ml-1">CM</span>
            </div>
          </button>
          <div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              {tab === 'client'
                ? 'Welcome Back to Your Beauty Journey'
                : 'Manage Your Salon Business'}
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              {tab === 'client'
                ? 'Sign in to manage your bookings, discover new salons, and keep looking fabulous.'
                : 'Access your salon dashboard, manage bookings and grow your business in Cameroon.'}
            </p>
          </div>
          <div className="flex gap-8">
            <div><div className="text-2xl font-bold text-white">12K+</div><div className="text-sm text-white/50">Happy Clients</div></div>
            <div><div className="text-2xl font-bold text-white">500+</div><div className="text-sm text-white/50">Partner Salons</div></div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Back to site — always visible */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#6D28D9] transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to site
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#111827]">
              BeautyBook <span className="text-[#F59E0B]">CM</span>
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-[#111827] mb-2">Sign In</h1>
          <p className="text-gray-500 mb-6">Welcome back! Choose your account type.</p>

          {/* ── Tab switcher ── */}
          <div className="flex bg-[#F3F4F6] rounded-2xl p-1 mb-8">
            <button
              onClick={() => { setTab('client'); setClientError(''); setSalonError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === 'client'
                  ? 'bg-white shadow-sm text-[#6D28D9]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <User className="w-4 h-4" />
              Client
            </button>
            <button
              onClick={() => { setTab('salon'); setClientError(''); setSalonError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === 'salon'
                  ? 'bg-white shadow-sm text-[#6D28D9]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Store className="w-4 h-4" />
              Salon Owner
            </button>
          </div>

          {/* ════════════════ CLIENT TAB ════════════════ */}
          {tab === 'client' && (
            <>
              {(clientError || googleError) && (
                <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{clientError || googleError}</p>
                </div>
              )}

              {/* Google button */}
              <div className="mb-5">
                <div ref={(el) => initGoogleButton(el)} className="w-full" />
                {googleLoading && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-[#6D28D9]/30 border-t-[#6D28D9] rounded-full animate-spin" />
                    Verifying with Google…
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">OR WITH EMAIL</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <form onSubmit={handleClientSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#111827] mb-1.5 block">Email or Username</label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-white transition-all ${clientError && !clientEmail ? 'border-red-300' : 'border-gray-200 focus-within:border-[#6D28D9]'}`}>
                    <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                    <input type="text" placeholder="your@email.com"
                      value={clientEmail} onChange={e => { setClientEmail(e.target.value); setClientError(''); }}
                      className="w-full bg-transparent text-[#111827] placeholder-gray-400 text-sm focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#111827] mb-1.5 block">Password</label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-white transition-all ${clientError && !clientPassword ? 'border-red-300' : 'border-gray-200 focus-within:border-[#6D28D9]'}`}>
                    <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                    <input type={showClientPwd ? 'text' : 'password'} placeholder="••••••••"
                      value={clientPassword} onChange={e => { setClientPassword(e.target.value); setClientError(''); }}
                      className="w-full bg-transparent text-[#111827] placeholder-gray-400 text-sm focus:outline-none" />
                    <button type="button" onClick={() => setShowClientPwd(!showClientPwd)} className="text-gray-400 hover:text-gray-600 shrink-0">
                      {showClientPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={clientLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-70">
                  {clientLoading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <button onClick={() => navigate('/register')} className="font-semibold text-[#6D28D9] hover:text-[#5B21B6]">
                  Create Account
                </button>
              </p>
            </>
          )}

          {/* ════════════════ SALON TAB ════════════════ */}
          {tab === 'salon' && (
            <>
              {salonError && (
                <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{salonError}</p>
                </div>
              )}

              <div className="mb-5 p-4 rounded-xl bg-[#6D28D9]/5 border border-[#6D28D9]/20">
                <p className="text-sm text-[#6D28D9] font-medium flex items-center gap-2">
                  <Store className="w-4 h-4 shrink-0" />
                  Sign in with the email you used to register your salon.
                </p>
              </div>

              <form onSubmit={handleSalonSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#111827] mb-1.5 block">Email Address</label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-white transition-all ${salonError && !salonEmail ? 'border-red-300' : 'border-gray-200 focus-within:border-[#6D28D9]'}`}>
                    <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                    <input type="email" placeholder="owner@salon.com"
                      value={salonEmail} onChange={e => { setSalonEmail(e.target.value); setSalonError(''); }}
                      className="w-full bg-transparent text-[#111827] placeholder-gray-400 text-sm focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#111827] mb-1.5 block">Password</label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-white transition-all ${salonError && !salonPassword ? 'border-red-300' : 'border-gray-200 focus-within:border-[#6D28D9]'}`}>
                    <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                    <input type={showSalonPwd ? 'text' : 'password'} placeholder="••••••••"
                      value={salonPassword} onChange={e => { setSalonPassword(e.target.value); setSalonError(''); }}
                      className="w-full bg-transparent text-[#111827] placeholder-gray-400 text-sm focus:outline-none" />
                    <button type="button" onClick={() => setShowSalonPwd(!showSalonPwd)} className="text-gray-400 hover:text-gray-600 shrink-0">
                      {showSalonPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={salonLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-70">
                  {salonLoading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Sign In to Dashboard</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have a salon account?{' '}
                <button onClick={() => navigate('/salon-register')} className="font-semibold text-[#6D28D9] hover:text-[#5B21B6]">
                  Register your salon
                </button>
              </p>

              <div className="mt-5 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Need help?</strong> Contact support@beautybook.cm
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
