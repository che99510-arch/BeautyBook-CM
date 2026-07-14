import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Heart, Loader } from 'lucide-react';
import { formatPrice } from '@/data/salonData';
import { API_BASE, MEDIA_BASE } from '@/lib/api';

const API = API_BASE;

interface ApiSalon {
  id: number;
  name: string;
  location: string;
  city: string;
  image: string | null;
  rating: number;
  review_count: number;
  starting_price: number;
  tags: string[];
}

const buildImgUrl = (url: string | null) => {
  if (!url) return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop';
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
};

interface FeaturedSalonsProps {
  onViewProfile: (salonId: string) => void;
  onNavigate: (page: string) => void;
  favorites: string[];
  onToggleFavorite: (salonId: string) => void;
}

const FeaturedSalons: React.FC<FeaturedSalonsProps> = ({ onViewProfile, onNavigate, favorites, onToggleFavorite }) => {
  const navigate = useNavigate();
  const [salons, setSalons] = useState<ApiSalon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/salons/?ordering=-rating`)
      .then(r => r.json())
      .then(data => setSalons(Array.isArray(data) ? data.slice(0, 6) : (data.results || []).slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleView = (id: number) => {
    onViewProfile(String(id));
    navigate(`/salons/${id}`);
  };

  return (
    <section className="py-20 lg:py-28 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] text-xs font-semibold uppercase tracking-wider mb-4">
              Featured Salons
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827]">
              Top-Rated{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#F59E0B]">
                Salons
              </span>
            </h2>
            <p className="text-gray-500 mt-2 max-w-lg">
              Discover the most popular beauty salons trusted by thousands of clients across Cameroon.
            </p>
          </div>
          <button
            onClick={() => onNavigate('listing')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#6D28D9] bg-white hover:bg-[#6D28D9] hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg whitespace-nowrap"
          >
            View All Salons
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-8 h-8 text-[#6D28D9] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <div key={salon.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={buildImgUrl(salon.image)}
                    alt={salon.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(String(salon.id)); }}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      favorites.includes(String(salon.id)) ? 'bg-red-500 text-white shadow-lg' : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(String(salon.id)) ? 'fill-current' : ''}`} />
                  </button>
                  <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                    {(salon.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-[#6D28D9] backdrop-blur-sm">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-[#111827] text-base leading-tight group-hover:text-[#6D28D9] transition-colors duration-300">{salon.name}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="text-sm font-semibold text-[#111827]">{salon.rating}</span>
                      <span className="text-xs text-gray-400">({salon.review_count})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-sm">{salon.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400">Starting from</span>
                      <p className="text-sm font-bold text-[#6D28D9]">{formatPrice(salon.starting_price)}</p>
                    </div>
                    <button
                      onClick={() => handleView(salon.id)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#6D28D9]/10 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all duration-300"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSalons;
