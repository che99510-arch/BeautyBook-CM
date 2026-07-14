import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Scissors, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:8000/api';

type Step = 'email' | 'code' | 'done';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState(''); // dev only

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/users/request_password_reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      if (data.dev_code) setDevCode(data.dev_code); // dev only
      setStep('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) { setError('Reset code is required'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/users/confirm_password_reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center shadow-lg">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-[#111827]">BeautyBook</span>
            <span className="text-xs font-semibold text-[#F59E0B] ml-1">CM</span>
          </div>
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {step === 'done' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-[#111827] mb-2">Password Reset!</h1>
              <p className="text-gray-500 text-sm mb-6">Your password has been updated. You can now sign in with your new password.</p>
              <button onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all">
                Go to Login
              </button>
            </div>
          ) : step === 'email' ? (
            <>
              <h1 className="text-2xl font-bold text-[#111827] mb-1">Forgot Password?</h1>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a reset code.</p>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Email Address</label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 focus-within:border-[#6D28D9] transition-colors">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-transparent text-[#111827] text-sm focus:outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-70">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight className="w-4 h-4" />Send Reset Code</>}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#111827] mb-1">Enter Reset Code</h1>
              <p className="text-gray-500 text-sm mb-2">We sent a 6-digit code to <span className="font-medium text-[#111827]">{email}</span>.</p>

              {devCode && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-800">
                  Dev mode — your code is: <span className="font-bold text-lg tracking-widest">{devCode}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">6-Digit Code</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000" maxLength={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#6D28D9] text-center text-2xl font-bold tracking-[0.5em] text-[#111827] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">New Password</label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 focus-within:border-[#6D28D9] transition-colors">
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-transparent text-[#111827] text-sm focus:outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Confirm Password</label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 focus-within:border-[#6D28D9] transition-colors">
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-transparent text-[#111827] text-sm focus:outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-70">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                </button>
                <button type="button" onClick={() => { setStep('email'); setError(''); }}
                  className="w-full py-2 text-sm text-gray-500 hover:text-[#6D28D9] transition-colors">
                  ← Use a different email
                </button>
              </form>
            </>
          )}

          {step !== 'done' && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Remember your password?{' '}
              <button onClick={() => navigate('/login')} className="font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition-colors">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
