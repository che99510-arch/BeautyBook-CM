import React, { useState } from 'react';
import { Search, MapPin, Sparkles, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (service: string, location: string) => void;
  onNavigate: (page: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onNavigate }) => {
  const [searchService, setSearchService] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchService, searchLocation);
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&h=1080&fit=crop"
          alt="Beauty salon"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111827]/90 via-[#111827]/70 to-[#6D28D9]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/60 via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#6D28D9]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-sm font-medium text-white/90">Cameroon's #1 Beauty Booking Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6 animate-slide-in">
            Book Beauty Services{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]">
              Instantly
            </span>{' '}
            in Cameroon
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-xl leading-relaxed animate-slide-in" style={{ animationDelay: '0.1s' } as React.CSSProperties}>
            Discover top-rated salons in Bamenda, Buea, Douala, Yaounde & Bafoussam. Hair, nails, makeup, and massage — all at your fingertips.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 shadow-2xl shadow-black/20 flex flex-col sm:flex-row gap-2 animate-slide-in"
            style={{ animationDelay: '0.2s' } as React.CSSProperties}
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Hair, Nails, Makeup, Massage…"
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                className="w-full bg-transparent text-[#111827] placeholder-gray-400 text-sm focus:outline-none"
              />
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <select
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent text-[#111827] text-sm focus:outline-none cursor-pointer appearance-none"
                title="Select location"
              >
                <option value="">All Locations</option>
                <option value="Bamenda">Bamenda</option>
                <option value="Buea">Buea</option>
                <option value="Douala">Douala</option>
                <option value="Yaounde">Yaounde</option>
                <option value="Bafoussam">Bafoussam</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-300/50 transition-all duration-300 whitespace-nowrap"
            >
              Find Salons
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-10 animate-slide-in" style={{ animationDelay: '0.3s' } as React.CSSProperties}>
            {[
              { value: '500+', label: 'Beauty Professionals' },
              { value: '12K+', label: 'Happy Clients' },
              { value: '50K+', label: 'Bookings Made' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-white/40">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
          <div className="w-1.5 h-3 rounded-full bg-white/40 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
