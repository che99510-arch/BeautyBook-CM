import React, { useState } from 'react';
import { ArrowLeft, Star, MapPin, Phone, Clock, Heart, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { Salon, Service, formatPrice } from '@/data/salonData';
import BookingModal from '@/components/beautybook/BookingModal';

interface SalonProfileProps {
  salon: Salon;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (salonId: string) => void;
}

const SalonProfile: React.FC<SalonProfileProps> = ({ salon, onBack, isFavorite, onToggleFavorite }) => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAllReviews, setShowAllReviews] = useState(false);

  const categories = ['All', ...Array.from(new Set(salon.services.map((s) => s.category)))];

  const filteredServices = activeCategory === 'All'
    ? salon.services
    : salon.services.filter((s) => s.category === activeCategory);

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setBookingOpen(true);
  };

  const displayedReviews = showAllReviews ? salon.reviews : salon.reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Cover Image */}
      <div className="relative h-64 sm:h-80 lg:h-96">
        <img
          src={salon.coverImage}
          alt={salon.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-20 lg:top-24 left-0 right-0 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-[#111827] text-sm font-medium hover:bg-white transition-colors shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onToggleFavorite(salon.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'
                }`}
                title="Add to favorites"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:bg-white transition-colors shadow-lg"
                title="Share salon link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Salon Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {salon.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-[#6D28D9]/10 text-[#6D28D9]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#111827] mb-2">{salon.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#6D28D9]" />
                  {salon.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="font-semibold text-[#111827]">{salon.rating}</span>
                  <span>({salon.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-green-500" />
                  {salon.openHours}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">{salon.description}</p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end flex-shrink-0">
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Starting from</span>
                <span className="text-2xl font-bold text-[#6D28D9]">{formatPrice(salon.startingPrice)}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${salon.phone}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
                <button
                  onClick={() => {
                    setSelectedService(undefined);
                    setBookingOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all duration-300"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
          {/* Services */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-[#111827] mb-6">Services</h2>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeCategory === cat
                        ? 'bg-[#6D28D9] text-white shadow-md shadow-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Service List */}
              <div className="space-y-3">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#6D28D9]/20 hover:bg-[#6D28D9]/[0.02] transition-all duration-200 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-[#111827] text-sm">{service.name}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] text-[10px] font-medium">
                          {service.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1.5">{service.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {service.duration}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                      <span className="font-bold text-[#6D28D9] text-sm">{formatPrice(service.price)}</span>
                      <button
                        onClick={() => handleBookService(service)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6D28D9]/10 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all duration-300 whitespace-nowrap"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Reviews */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111827]">Reviews</h2>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="font-bold text-[#111827]">{salon.rating}</span>
                </div>
              </div>

              {/* Rating Bars */}
              <div className="space-y-2 mb-6">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = salon.reviews.filter((r) => r.rating === stars).length;
                  const percentage = salon.reviews.length > 0 ? (count / salon.reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-3">{stars}</span>
                      <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#F59E0B] transition-all duration-500"
                          style={{ width: `${percentage}%` } as React.CSSProperties}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {displayedReviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="text-sm font-semibold text-[#111827]">{review.author}</h5>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                          ))}
                          <span className="text-[10px] text-gray-400 ml-1">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>

              {salon.reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full mt-4 flex items-center justify-center gap-1 text-sm font-medium text-[#6D28D9] hover:text-[#5B21B6] transition-colors"
                >
                  {showAllReviews ? (
                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show All Reviews <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        services={salon.services}
        salonName={salon.name}
        preSelectedService={selectedService}
      />
    </div>
  );
};

export default SalonProfile;
