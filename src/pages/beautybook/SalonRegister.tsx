import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scissors, Mail, Lock, Eye, EyeOff, ArrowRight, Phone, Building2, MapPin, Users, FileText,
  Upload, X, CheckCircle, AlertCircle, ImagePlus
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { API_BASE } from '@/lib/api';

interface SalonFormData {
  ownerName: string;
  email: string;
  phone: string;
  whatsapp: string;
  mobileMoney: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  city: 'Bamenda' | 'Buea' | 'Douala' | 'Yaounde' | 'Bafoussam';
  address: string;
  workers: '1-3' | '4-7' | '8-15' | '15+';
  description: string;
}

interface UploadedImage {
  id: string;
  url: string;
  file: File;
}

const SalonRegister: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SalonFormData>({
    mode: 'onChange',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentSection, setCurrentSection] = useState(1);
  const password = watch('password');

  // ── Google OAuth ──────────────────────────────────────────────────────
  const { initButton: initGoogleButton, loading: googleLoading } = useGoogleAuth({
    onSuccess: (token, user) => {
      localStorage.setItem('salonOwnerToken', token);
      localStorage.setItem('salonOwnerEmail', user.email || '');
      localStorage.setItem('salonOwnerLoggedIn', 'true');
      navigate('/salon-dashboard');
    },
    onError: (msg) => setFormError(msg),
  });
  // ─────────────────────────────────────────────────────────────────────

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, text: '', color: '' };
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    const levels = [
      { level: 0, text: '', color: '' },
      { level: 1, text: 'Weak', color: '#EF4444' },
      { level: 2, text: 'Fair', color: '#F59E0B' },
      { level: 3, text: 'Good', color: '#F59E0B' },
      { level: 4, text: 'Strong', color: '#10B981' },
      { level: 5, text: 'Very Strong', color: '#10B981' },
    ];
    return levels[strength] || levels[5];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) handleFiles(files);
  };

  const handleFiles = (files: FileList) => {
    if (uploadedImages.length >= 5) {
      setFormError('Maximum 5 images allowed');
      return;
    }

    Array.from(files).forEach((file) => {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setFormError('Only JPG and PNG files are allowed');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setFormError('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newImage: UploadedImage = {
            id: Date.now().toString(),
            url: e.target.result as string,
            file,
          };
          setUploadedImages((prev) => [...prev, newImage]);
          setFormError('');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: SalonFormData) => {
    // Validate images
    if (uploadedImages.length === 0) {
      setFormError('Please upload at least one salon photo');
      return;
    }

    // Validate phone numbers
    const phoneRegex = /^[\d\s\-+()]{9,20}$/
    if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
      setFormError('Invalid phone number format');
      return;
    }

    setIsLoading(true);
    setFormError('');

    try {
      // prepare form data for backend
      const formData = new FormData();
      // user fields
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('password2', data.confirmPassword);
      formData.append('first_name', data.ownerName.split(' ')[0] || '');
      formData.append('last_name', data.ownerName.split(' ').slice(1).join(' ') || '');
      formData.append('phone', data.phone);
      formData.append('whatsapp', data.whatsapp);
      formData.append('mobile_money', data.mobileMoney);
      // salon/business fields
      formData.append('business_name', data.businessName);
      formData.append('city', data.city);
      formData.append('address', data.address);
      formData.append('workers', data.workers);
      formData.append('description', data.description);

      uploadedImages.forEach((img, idx) => {
        formData.append('images', img.file);
      });

      const response = await fetch(`${API_BASE}/salons/register_owner/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        setFormError(errData.error || 'Registration failed');
        return;
      }

      const json = await response.json();
      console.log('backend response', json);

      setSuccessMessage('Salon account created successfully! Redirecting...');
      localStorage.setItem('salonOwnerData', JSON.stringify(data));

      setTimeout(() => {
        navigate('/login?tab=salon');
      }, 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <CheckCircle className="w-20 h-20 text-[#10B981] mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-[#111827] mb-3">
            Welcome to BeautyBook CM! 🎉
          </h1>
          <p className="text-[#6B7280] mb-8">
            Your salon account has been created successfully. Our team will review your salon and contact you soon. You can now login with your credentials.
          </p>
          <button
            onClick={() => navigate('/login?tab=salon')}
            className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold py-3 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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
                Grow Your Salon With Online Bookings
              </h2>
              <p className="text-white/80 text-lg">
                Get discovered by thousands of clients across Bamenda, Buea, Douala, Yaounde and Bafoussam.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '📅', text: 'Receive bookings 24/7' },
                { icon: '✓', text: 'Reduce fake appointments' },
                { icon: '👥', text: 'Manage clients easily' },
                { icon: '💰', text: 'Increase monthly revenue' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-white/90">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/20 pt-8">
              <div className="text-sm text-white/70">
                Step {currentSection} of 3
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentSection / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-white/60 text-sm">© 2026 Beaty CM. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Back to site */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#6D28D9] transition-colors mb-6"
          >
            ← Back to site
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111827] mb-2">
              {currentSection === 1 && 'Your Information'}
              {currentSection === 2 && 'Business Details'}
              {currentSection === 3 && 'Salon Verification'}
            </h1>
            <p className="text-[#6B7280]">
              {currentSection === 1 && 'Let\'s start by collecting your basic information'}
              {currentSection === 2 && 'Tell us about your salon business'}
              {currentSection === 3 && 'Help clients see your beautiful salon'}
            </p>
          </div>

          {formError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* SECTION 1 */}
            {currentSection === 1 && (
              <>
                {/* Google sign-up option */}
                <div className="mb-2">
                  <div ref={(el) => initGoogleButton(el)} className="w-full" />
                  {googleLoading && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                      <div className="w-4 h-4 border-2 border-[#6D28D9]/30 border-t-[#6D28D9] rounded-full animate-spin" />
                      Verifying with Google…
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1 h-px bg-[#E5E7EB]" />
                  <span className="text-xs text-[#9CA3AF]">OR FILL IN BELOW</span>
                  <div className="flex-1 h-px bg-[#E5E7EB]" />
                </div>
                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Full Name *</label>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                    errors.ownerName ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9]'
                  }`}>
                    <Building2 className="w-4 h-4 text-[#9CA3AF]" />
                    <input
                      {...register('ownerName', { required: 'Full name is required' })}
                      type="text"
                      placeholder="Your full name"
                      className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                    />
                  </div>
                  {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Email Address *</label>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                    errors.email ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9]'
                  }`}>
                    <Mail className="w-4 h-4 text-[#9CA3AF]" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                      })}
                      type="email"
                      placeholder="owner@salon.com"
                      className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Mobile Phone Number *</label>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                    errors.phone ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9]'
                  }`} title="Phone Number">
                    <Phone className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-[#9CA3AF] text-sm">+237</span>
                    <input
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: { value: /^[\d\s-()]{9,}$/, message: 'Invalid phone format' },
                      })}
                      type="tel"
                      placeholder="6XX XXX XXX"
                      className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                      title="Phone Number"
                    />
                  </div>
                  <p className="text-[#9CA3AF] text-xs mt-1">For receiving appointment notifications</p>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">WhatsApp Number *</label>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                    errors.whatsapp ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9]'
                  }`}>
                    <Phone className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-[#9CA3AF] text-sm">+237</span>
                    <input
                      {...register('whatsapp', {
                        required: 'WhatsApp number is required',
                        pattern: { value: /^[\d\s-()]{9,}$/, message: 'Invalid WhatsApp number' },
                      })}
                      type="tel"
                      placeholder="6XX XXX XXX"
                      className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                    />
                  </div>
                  <p className="text-[#9CA3AF] text-xs mt-1">Clients will message you here</p>
                  {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
                </div>

                {/* Mobile Money */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Mobile Money Account (Orange/MTN) *</label>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                    errors.mobileMoney ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9]'
                  }`}>
                    <Phone className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-[#9CA3AF] text-sm">+237</span>
                    <input
                      {...register('mobileMoney', {
                        required: 'Mobile Money number is required',
                        pattern: { value: /^[\d\s-()]{9,}$/, message: 'Invalid Mobile Money number' },
                      })}
                      type="tel"
                      placeholder="6XX XXX XXX"
                      className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                    />
                  </div>
                  <p className="text-[#9CA3AF] text-xs mt-1">For payment processing</p>
                  {errors.mobileMoney && <p className="text-red-500 text-xs mt-1">{errors.mobileMoney.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Password *</label>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                    errors.password ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9]'
                  }`}>
                    <Lock className="w-4 h-4 text-[#9CA3AF]" />
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Minimum 6 characters' },
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
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(passwordStrength.level / 5) * 100}%`,
                              backgroundColor: passwordStrength.color,
                            } as React.CSSProperties}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: passwordStrength.color } as React.CSSProperties}>
                          {passwordStrength.text}
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Confirm Password *</label>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9]'
                  }`}>
                    <Lock className="w-4 h-4 text-[#9CA3AF]" />
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[#9CA3AF] hover:text-[#6B7280]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </>
            )}

            {/* SECTION 2 */}
            {currentSection === 2 && (
              <>
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Business Name *</label>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                    errors.businessName ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9]'
                  }`}>
                    <Building2 className="w-4 h-4 text-[#9CA3AF]" />
                    <input
                      {...register('businessName', { required: 'Business name is required' })}
                      type="text"
                      placeholder="e.g., Glamour Studio Douala"                      className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                    />
                  </div>
                  {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">City *</label>
                  <select
                    {...register('city', { required: 'City is required' })}
                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all text-sm focus:outline-none ${
                      errors.city ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus:border-[#6D28D9]'
                    }`}
                  >
                  <option value="">Select a city</option>
                    <option value="Bamenda">Bamenda</option>
                    <option value="Buea">Buea</option>
                    <option value="Douala">Douala</option>
                    <option value="Yaounde">Yaounde</option>
                    <option value="Bafoussam">Bafoussam</option>
                  </select>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Detailed Address *</label>
                  <div className={`flex items-start gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                    errors.address ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus-within:border-[#6D28D9]'
                  }`}>
                    <MapPin className="w-4 h-4 text-[#9CA3AF] mt-1 flex-shrink-0" />
                    <input
                      {...register('address', { required: 'Address is required' })}
                      type="text"
                      placeholder="Street, neighborhood, area"
                      className="w-full bg-transparent text-[#111827] placeholder-[#D1D5DB] text-sm focus:outline-none"
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>

                {/* Number of Workers */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Number of Workers *</label>
                  <select
                    {...register('workers', { required: 'Select number of workers' })}
                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all text-sm focus:outline-none ${
                      errors.workers ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus:border-[#6D28D9]'
                    }`}
                  >
                    <option value="">Select team size</option>
                    <option value="1-3">1–3 people</option>
                    <option value="4-7">4–7 people</option>
                    <option value="8-15">8–15 people</option>
                    <option value="15+">15+ people</option>
                  </select>
                  {errors.workers && <p className="text-red-500 text-xs mt-1">{errors.workers.message}</p>}
                </div>

                {/* Business Description */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Business Description *</label>
                  <textarea
                    {...register('description', {
                      required: 'Business description is required',
                      maxLength: { value: 300, message: 'Maximum 300 characters' },
                    })}
                    placeholder="Tell us about your salon, specialties, and unique services..."
                    maxLength={300}
                    rows={4}
                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all text-sm focus:outline-none resize-none ${
                      errors.description ? 'border-red-300 bg-red-50/50' : 'border-[#E5E7EB] focus:border-[#6D28D9]'
                    }`}
                  />
                  <div className="flex justify-between mt-1">
                    <div>
                      {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                    </div>
                    <span className="text-[#9CA3AF] text-xs">{300} characters max</span>
                  </div>
                </div>
              </>
            )}

            {/* SECTION 3 - IMAGE UPLOAD */}
            {currentSection === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-3">
                    Upload clear photos of your salon interior *
                  </label>

                  {/* Drag & Drop Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-[#6D28D9] bg-[#6D28D9]/5'
                        : 'border-[#E5E7EB] hover:border-[#6D28D9]'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <Upload className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
                      <p className="text-sm font-medium text-[#111827]">
                        Drag & drop salon photos here or click to upload
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-1">JPG or PNG • Max 5MB each • Up to 5 images</p>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-[#374151] mb-3">
                        Uploaded Images ({uploadedImages.length}/5)
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {uploadedImages.map((img) => (
                          <div key={img.id} className="relative group">
                            <img
                              src={img.url}
                              alt="Salon"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(img.id)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#6D28D9] text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notice */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>📋 Note:</strong> Your salon profile will be reviewed by our team before approval. You'll receive an email once it's live.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-[#E5E7EB]">
              {currentSection > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentSection(currentSection - 1)}
                  className="flex-1 px-6 py-2.5 rounded-lg text-[#6D28D9] font-semibold border-2 border-[#6D28D9] hover:bg-[#6D28D9]/5 transition"
                >
                  Previous
                </button>
              )}

              {currentSection < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentSection(currentSection + 1)}
                  className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#9CA3AF] text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Salon Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default SalonRegister;
