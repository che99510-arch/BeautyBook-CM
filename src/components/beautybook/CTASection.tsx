import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface CTASectionProps {
  onNavigate: (page: string) => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onNavigate }) => {
  const navigateRouter = useNavigate();
  const benefits = [
    'Reach thousands of new clients',
    'Manage bookings effortlessly',
    'Grow your revenue with analytics',
    'Free to get started',
  ];

  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] rounded-3xl overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F59E0B]/10 rounded-full translate-y-1/3 -translate-x-1/4" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 sm:p-12 lg:p-16">
            {/* Left */}
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold uppercase tracking-wider mb-6">
                For Salon Owners
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Grow Your Salon Business with{' '}
                <span className="text-[#F59E0B]">BeautyBook CM</span>
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">
                Join hundreds of salon owners who are already using BeautyBook CM to attract new clients, manage bookings, and grow their revenue.
              </p>

              <ul className="space-y-3 mb-8">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
                    <span className="text-white/80 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigateRouter('/salon-login')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-[#F59E0B] text-[#111827] hover:bg-[#FBBF24] transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/30"
                >
                  List Your Salon
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right - Image */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=600&fit=crop"
                    alt="Salon owner"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">This month</p>
                      <p className="text-sm font-bold text-[#111827]">+47 new bookings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
