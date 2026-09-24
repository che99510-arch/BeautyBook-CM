'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import apiService from '@/services/api';

export default function AdminSignupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [signupOpen, setSignupOpen] = useState(false);
  const [needsCode, setNeedsCode] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm_password: '', invitation_code: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check settings — use public endpoint (no auth required)
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/admin'}/public_settings/`)
      .then(r => r.json())
      .then(data => {
        setSignupOpen(!!data.allow_admin_signup);
        setNeedsCode(!!data.requires_invitation_code);
      })
      .catch(() => setSignupOpen(false))
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (!needsCode) delete payload.invitation_code;
      await apiService.adminSignup(payload);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      try {
        const parsed = JSON.parse(err.message);
        setErrors(parsed);
      } catch {
        setErrors({ _: err.message || 'Signup failed' });
      }
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type === 'password' ? (showPwd ? 'text' : 'password') : type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          placeholder={label}
        />
        {(key === 'password' || key === 'confirm_password') && (
          <button type="button" onClick={() => setShowPwd(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  if (checking) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
    </div>
  );

  if (!signupOpen) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center border border-gray-700">
        <Lock className="w-14 h-14 text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Registration Closed</h2>
        <p className="text-gray-400 text-sm mb-6">Administrator registration is currently disabled. Contact your super administrator.</p>
        <button onClick={() => router.push('/login')}
          className="w-full py-2.5 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition">
          Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-900/50">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">BeautyBook CM</h1>
          <p className="text-purple-300 text-sm mt-1">Create Administrator Account</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Account Created!</h3>
              <p className="text-gray-400 text-sm">Redirecting to login…</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-white mb-5">Sign Up as Administrator</h2>

              {errors._ && (
                <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-800 rounded-xl mb-4 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errors._}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {field('name', 'Full Name')}
                {field('email', 'Email Address', 'email')}
                {field('password', 'Password', 'password')}
                {field('confirm_password', 'Confirm Password', 'password')}
                {needsCode && field('invitation_code', 'Invitation Code')}

                <button type="submit" disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-900/50 transition disabled:opacity-60 mt-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Creating Account…' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-gray-500 text-xs mt-4">
                Already have an account?{' '}
                <button onClick={() => router.push('/login')} className="text-purple-400 hover:text-purple-300 transition">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
