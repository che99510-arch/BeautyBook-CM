'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import apiService from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState<string | null>(null);
  const [setupAvailable, setSetupAvailable] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    // Check if first-time setup is still needed
    apiService.checkSetupAvailable()
      .then(r => setSetupAvailable(r.available))
      .catch(() => {});

    // Check if admin signup is open (public endpoint)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/admin';
    fetch(`${apiUrl}/settings/`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSignupOpen(!!d.allow_admin_signup); })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (localError) setLocalError(null);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    if (!formData.email || !formData.password) {
      setLocalError('Email and password are required');
      return;
    }
    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">BeautyBook</h1>
          <p className="text-gray-400">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-6">Admin Login</h2>

          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error || localError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email" name="email" type="email"
                value={formData.email} onChange={handleChange} disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition"
                placeholder="admin@beautybook.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password" name="password" type="password"
                value={formData.password} onChange={handleChange} disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Setup / Signup links */}
          {(signupOpen || setupAvailable) && (
            <div className="mt-5 pt-4 border-t border-gray-700 space-y-2 text-center">
              {signupOpen && (
                <p className="text-sm text-gray-400">
                  Have an invitation?{' '}
                  <button
                    onClick={() => router.push('/signup')}
                    className="text-purple-400 hover:text-purple-300 font-medium transition"
                  >
                    Create an administrator account
                  </button>
                </p>
              )}
              {setupAvailable && (
                <p className="text-xs text-amber-400">
                  No administrator exists yet.{' '}
                  <button
                    onClick={() => router.push('/setup')}
                    className="underline hover:text-amber-300 transition"
                  >
                    Run first-time setup
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          © 2026 BeautyBook CM. All rights reserved.
        </p>
      </div>
    </div>
  );
}
