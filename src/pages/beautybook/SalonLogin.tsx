import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Scissors } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { API_BASE } from '@/lib/api';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

interface SalonLoginFormData {
  email: string;
  password: string;
}

const SalonLogin: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<SalonLoginFormData>();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ── Google OAuth ──────────────────────────────────────────────────────
  const { initButton: initGoogleButton, loading: googleLoading } = useGoogleAuth({
    onSuccess: (token, user) => {
      localStorage.setItem('salonOwnerToken', token);
      localStorage.setItem('salonOwnerEmail', user.email || '');
      localStorage.setItem('salonOwnerLoggedIn', 'true');
      navigate('/salon-dashboard');
    },
    onError: (msg) => setLoginError(msg),
  });
  // ─────────────────────────────────────────────────────────────────────

  const onSubmit = async (data: SalonLoginFormData) => {
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await fetch(`${API_BASE}/users/salon_login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setLoginError(result.error || 'Invalid credentials');
      } else {
        localStorage.setItem('salonOwnerToken', result.token);
        localStorage.setItem('salonOwnerEmail', data.email);
        localStorage.setItem('salonOwnerLoggedIn', 'true');
        // redirect on success
        navigate('/salon-dashboard');
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Left Panel - Brand & Trust */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#6D28D9] to-[#7C3AED]">
        <img
          src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&h=1600&fit=crop"
          alt="Salon"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#6D28D9]/95 to-[#111827]/80" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Beaty CM</span>
          </button>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Manage Your Salon Business
              </h2>
              <p className="text-white/80 text-lg">
                Get discovered by thousands of clients in Douala and Yaoundé.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '📅', text: 'Manage all your bookings in one place' },
                { icon: '⭐', text: 'Track customer reviews and ratings' },
                { icon: '💰', text: 'Monitor your revenue in real-time' },
                { icon: '📊', text: 'Get insights about your business' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-white/90">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/20 pt-8">
              <p className="text-white/60 text-sm">
                Developed for salons in Cameroon. Fast, reliable, and easy to use.
              </p>
            </div>
          </div>

          <p className="text-white/60 text-sm">© 2026 Beaty CM. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">

          {/* Back to site — always visible */}
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#6D28D9] transition-colors mb-6">
            ← Back to site
          </button>

          {/* Header */}
          <div className="mb-8">
            <button onClick={() => navigate('/')} className="lg:hidden flex items-center gap-2 mb-6 group hover:opacity-80 transition">
              <div className="w-10 h-10 rounded-xl bg-[#6D28D9]/20 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-[#6D28D9]" />
              </div>
              <span className="font-bold text-[#111827]">Beaty CM</span>
            </button>
            <h1 className="text-3xl font-bold text-[#111827] mb-2">
              Salon Owner Login
            </h1>
            <p className="text-[#6B7280]">
              Sign in to your salon dashboard
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{loginError}</p>
            </div>
          )}

          {/* Login Form */}
          <div className="mb-6">
            <div ref={(el) => initGoogleButton(el)} className="w-full" />
            {googleLoading && (
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-[#6D28D9]/30 border-t-[#6D28D9] rounded-full animate-spin" />
                Verifying with Google…
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-xs text-[#9CA3AF]">OR SIGN IN WITH EMAIL</span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Email Address
              </label>
              <div
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  errors.email
                    ? 'border-red-300 bg-red-50/50'
                    : 'border-[#E5E7EB] focus-within:border-[#6D28D9]'
                }`}
              >
                <Mail className="w-4 h-4 text-[#9CA3AF]" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  placeholder="owner@salon.com"
                  className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Password
              </label>
              <div
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  errors.password
                    ? 'border-red-300 bg-red-50/50'
                    : 'border-[#E5E7EB] focus-within:border-[#6D28D9]'
                }`}
              >
                <Lock className="w-4 h-4 text-[#9CA3AF]" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#9CA3AF] hover:text-[#6B7280]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] disabled:bg-[#9CA3AF] text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <p className="text-center text-[#6B7280] text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/salon-register')}
                className="text-[#6D28D9] hover:underline font-semibold"
              >
                Create one
              </button>
            </p>
          </div>

          {/* Support */}
          <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Need help?</strong> Contact our support team at support@beautybook.cm
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonLogin;
