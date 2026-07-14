import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Scissors, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // ── Google OAuth ──────────────────────────────────────────────────────
  const { initButton: initGoogleButton, loading: googleLoading, error: googleError } = useGoogleAuth({
    onSuccess: (token, user) => {
      localStorage.setItem('customerToken', token);
      localStorage.setItem('customerUser', JSON.stringify(user));
      navigate('/');
    },
    onError: (msg) => setRegisterError(msg),
  });
  // ─────────────────────────────────────────────────────────────────────

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    else if (firstName.trim().length < 2) newErrors.firstName = 'First name must be at least 2 characters';

    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    else if (lastName.trim().length < 2) newErrors.lastName = 'Last name must be at least 2 characters';

    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email address';

    if (!phone) newErrors.phone = 'Phone number is required';
    else if (phone.replace(/\D/g, '').length < 9) newErrors.phone = 'Please enter a valid phone number';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!agreeToTerms) newErrors.terms = 'You must agree to the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setRegisterError('');

    const result = await register({
      username: email.split('@')[0],
      email,
      password,
      password2: confirmPassword,
      first_name: firstName,
      last_name: lastName,
    });

    if (result.success) {
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setRegisterError(result.error || 'Registration failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1606014175185-fe88c4e1f5bf?w=1200&h=1600&fit=crop"
          alt="Beauty"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#6D28D9]/90 to-[#111827]/80" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Beaty CM</span>
          </button>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">Join Our Community</h2>
              <p className="text-white/80 text-lg leading-relaxed">
                Create your account and discover the best beauty salons in Cameroon.
                Book appointments, save your favorites, and get exclusive deals.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '✨', text: 'Access to top-rated beauty salons' },
                { icon: '📅', text: 'Easy online booking system' },
                { icon: '❤️', text: 'Save your favorite services' },
                { icon: '🎁', text: 'Exclusive member discounts' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/60 text-sm">© 2026 Beaty CM. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Back to site */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#6D28D9] transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to site
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111827] mb-2">Create Account</h1>
            <p className="text-[#6B7280]">Join Beaty CM and book your beauty services today</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 text-sm font-medium">{successMessage}</p>
                <p className="text-green-700 text-xs mt-1">Redirecting to login...</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {registerError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{registerError}</p>
            </div>
          )}

          {/* Google sign-up */}
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
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR REGISTER WITH EMAIL</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">First Name *</label>
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  errors.firstName ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9] bg-white'
                }`}>
                  <User className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setErrors({ ...errors, firstName: '' }); }}
                    className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Last Name *</label>
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  errors.lastName ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9] bg-white'
                }`}>
                  <User className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setErrors({ ...errors, lastName: '' }); }}
                    className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                  />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Email Address *</label>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                errors.email ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9] bg-white'
              }`}>
                <Mail className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
                  className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Phone Number *</label>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                errors.phone ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9] bg-white'
              }`}>
                <Phone className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <span className="text-[#9CA3AF] text-sm flex-shrink-0">+237</span>
                <input
                  type="tel"
                  placeholder="6XX XXX XXX"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/[^\d\s\-\(\)]/g, '')); setErrors({ ...errors, phone: '' }); }}
                  className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Password *</label>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                errors.password ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9] bg-white'
              }`}>
                <Lock className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                  className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#9CA3AF] hover:text-[#6B7280] flex-shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-[#9CA3AF] text-xs mt-1">Minimum 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Confirm Password *</label>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                errors.confirmPassword ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9] bg-white'
              }`}>
                <Lock className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: '' }); }}
                  className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[#9CA3AF] hover:text-[#6B7280] flex-shrink-0"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => { setAgreeToTerms(e.target.checked); setErrors({ ...errors, terms: '' }); }}
                className="w-4 h-4 mt-1 rounded border-[#E5E7EB] text-[#6D28D9] focus:ring-[#6D28D9] cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-[#6B7280] leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-[#6D28D9] hover:underline font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#6D28D9] hover:underline font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] disabled:bg-[#9CA3AF] text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-[#6B7280] mt-6 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#6D28D9] hover:underline font-semibold"
            >
              Sign in
            </button>
          </p>

          {/* Salon owner link */}
          <p className="text-center text-[#6B7280] mt-4 text-sm">
            Are you a salon owner?{' '}
            <button
              onClick={() => navigate('/login?tab=salon')}
              className="text-[#6D28D9] hover:underline font-semibold"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
