import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scissors, ArrowRight, CheckCircle, TrendingUp, Users, CalendarDays,
  BarChart2, Star, Shield, Zap, ChevronRight, MapPin,
} from 'lucide-react';

const STATS = [
  { value: '12K+', label: 'Active Clients' },
  { value: '500+', label: 'Partner Salons' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '98%', label: 'Booking Rate' },
];

const BENEFITS = [
  {
    icon: Users,
    title: 'Reach Thousands of Clients',
    desc: 'Get discovered by customers actively searching for beauty services in your city — Bamenda, Buea, Douala, Yaounde & Bafoussam.',
  },
  {
    icon: CalendarDays,
    title: 'Effortless Booking Management',
    desc: 'Accept, decline, or reschedule bookings from your dashboard. No more phone tag — your calendar runs itself.',
  },
  {
    icon: BarChart2,
    title: 'Real-Time Analytics',
    desc: 'Track revenue, monitor booking trends, and understand your best-performing services with built-in analytics.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Revenue',
    desc: 'Salons on BeautyBook CM report up to 40% more bookings within their first 3 months. Your next client is already searching.',
  },
  {
    icon: Star,
    title: 'Build Your Reputation',
    desc: 'Collect verified reviews from real clients. A strong rating on BeautyBook CM builds trust and drives repeat business.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    desc: 'Your data and your clients\' data is protected. We handle payments, notifications, and disputes so you focus on your craft.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Create Your Profile',
    desc: 'Register your salon in minutes. Add your services, photos, pricing, and location.',
  },
  {
    step: '02',
    title: 'Get Listed & Verified',
    desc: 'Our team reviews and approves your listing. You go live and become discoverable to thousands of clients.',
  },
  {
    step: '03',
    title: 'Start Getting Bookings',
    desc: 'Clients find you, book instantly, and you get notified. Manage everything from your salon dashboard.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Amina Nkemdirim',
    salon: 'Glam Studio, Douala',
    quote: 'Since joining BeautyBook CM, I\'ve tripled my client base. The booking system saves me hours every week.',
    rating: 5,
  },
  {
    name: 'Sandra Mbah',
    salon: 'Natural Crown, Bamenda',
    quote: 'I was skeptical at first but within the first month I had 30 new clients I never would have reached otherwise.',
    rating: 5,
  },
  {
    name: 'Grace Tabi',
    salon: 'Luxe Nails & Spa, Buea',
    quote: 'The analytics dashboard alone is worth it. I can see exactly what\'s working and what needs improvement.',
    rating: 5,
  },
];

export default function ForSalons() {
  const navigate = useNavigate();

  const goRegister = () => navigate('/salon-register');

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar strip ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#111827]">BeautyBook <span className="text-[#F59E0B]">CM</span></span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login?tab=salon')} className="text-sm text-gray-600 hover:text-[#6D28D9] transition-colors">
              Already listed? Sign in
            </button>
            <button
              onClick={goRegister}
              className="flex items-center gap-2 px-4 py-2 bg-[#6D28D9] text-white text-sm font-semibold rounded-xl hover:bg-[#5B21B6] transition-colors"
            >
              List Your Salon <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-16 bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#F59E0B] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-5 tracking-wide uppercase">
                For Salon Owners
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                Grow Your Salon Business with{' '}
                <span className="text-[#F59E0B]">BeautyBook CM</span>
              </h1>
              <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-lg">
                Join hundreds of salon owners already using BeautyBook CM to attract new clients, manage bookings, and grow their revenue — all from one simple dashboard.
              </p>
              <ul className="space-y-3 mb-10">
                {['Reach thousands of new clients', 'Manage bookings effortlessly', 'Grow your revenue with analytics', 'Free to get started'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-white/90 text-sm">
                    <CheckCircle className="w-5 h-5 text-[#F59E0B] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={goRegister}
                  className="flex items-center gap-2 px-8 py-4 bg-[#F59E0B] text-[#111827] font-bold rounded-xl hover:bg-[#D97706] transition-all hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5"
                >
                  List Your Salon <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/login?tab=salon')}
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                >
                  Sign In to Dashboard
                </button>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=700&h=500&fit=crop"
                  alt="Beauty salon interior"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* floating stat card */}
              <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">This month</p>
                  <p className="text-sm font-bold text-gray-900">+47 new bookings</p>
                </div>
              </div>
              {/* second floating card */}
              <div className="absolute -top-4 -right-4 bg-[#6D28D9] rounded-2xl shadow-xl px-5 py-4 text-white">
                <p className="text-xs text-white/70">Monthly Revenue</p>
                <p className="text-lg font-bold">285,000 FCFA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative bg-white/10 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-[#F59E0B]">{s.value}</p>
                <p className="text-white/70 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#6D28D9] text-sm font-semibold uppercase tracking-wider">Why BeautyBook CM</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#111827] mt-2">Everything you need to run a modern salon</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">We built the tools — you focus on making clients look and feel amazing.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENEFITS.map(b => (
              <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                <div className="w-12 h-12 rounded-xl bg-[#6D28D9]/10 flex items-center justify-center mb-4 group-hover:bg-[#6D28D9] transition-colors">
                  <b.icon className="w-6 h-6 text-[#6D28D9] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base font-bold text-[#111827] mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#6D28D9] text-sm font-semibold uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#111827] mt-2">Get listed in 3 easy steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] opacity-20" />
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-200">
                  <span className="text-2xl font-bold text-white">{s.step}</span>
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 w-6 h-6 text-[#6D28D9]/30" />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={goRegister}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-300/50 transition-all hover:-translate-y-0.5"
            >
              Start Now — It's Free <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#6D28D9] text-sm font-semibold uppercase tracking-wider">Success Stories</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#111827] mt-2">Salon owners love BeautyBook CM</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{t.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{t.salon}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing note ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> Free to list your salon
          </div>
          <h2 className="text-3xl font-bold text-[#111827] mb-4">No upfront cost. No monthly fee.</h2>
          <p className="text-gray-500 leading-relaxed mb-3">
            Listing your salon on BeautyBook CM is completely free. We only earn a small commission on confirmed bookings — meaning we succeed when you succeed.
          </p>
          <p className="text-sm text-gray-400">Standard commission rate applies per booking. No hidden charges.</p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F59E0B] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to grow your salon?</h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Join BeautyBook CM today and start reaching clients who are already looking for what you offer.
          </p>
          <button
            onClick={goRegister}
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#F59E0B] text-[#111827] font-bold text-lg rounded-2xl hover:bg-[#D97706] transition-all hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1"
          >
            List Your Salon Now <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-white/50 text-sm mt-5">Free to join · No credit card required · Live in 24 hours</p>
        </div>
      </section>

      {/* ── Footer strip ── */}
      <div className="bg-[#111827] py-6 text-center">
        <p className="text-white/40 text-xs">© 2026 BeautyBook CM. All rights reserved.</p>
      </div>
    </div>
  );
}
