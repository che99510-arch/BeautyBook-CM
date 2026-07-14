import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, X, ChevronDown, SearchX, Loader, Star, Heart } from 'lucide-react';
import { formatPrice } from '@/data/salonData';
import { API_BASE, MEDIA_BASE } from '@/lib/api';

const API = API_BASE;

interface ApiSalon {
  id: number;
  name: string;
  location: string;
  city: string;
  description: string;
  image: string | null;
  cover_image: string | null;
  rating: number;
  review_count: number;
  starting_price: number;
  tags: string[];
  open_hours: string | null;
  phone: string | null;
}

const buildImgUrl = (url: string | null) => {
  if (!url) return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop';
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
};

const SERVICE_CATEGORIES = ['All', 'Hair', 'Nails', 'Makeup', 'Massage'];
const CITIES = ['All', 'Bamenda', 'Buea', 'Douala', 'Yaounde', 'Bafoussam'];

interface SalonListingProps {
  onViewProfile?: (salonId: string) => void;
  favorites?: string[];
  onToggleFavorite?: (salonId: string) => void;
  initialService?: string;
  initialLocation?: string;
}

const SalonListing: React.FC<SalonListingProps> = ({
  onViewProfile,
  favorites = [],
  onToggleFavorite,
  initialService = '',
  initialLocation = '',
}) => {
  const navigate = useNavigate();
  const [salons, setSalons] = useState<ApiSalon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialService);
  const [selectedCity, setSelectedCity] = useState(initialLocation);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  const fetchSalons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
      // search covers salon name, description, location AND service type via tags
      const combinedSearch = [searchQuery, selectedCategory !== 'All' ? selectedCategory : ''].filter(Boolean).join(' ');
      if (combinedSearch) params.set('search', combinedSearch);
      if (sortBy === 'rating') params.set('ordering', '-rating');
      else if (sortBy === 'reviews') params.set('ordering', '-review_count');
      else if (sortBy === 'price-low') params.set('ordering', 'starting_price');
      else if (sortBy === 'price-high') params.set('ordering', '-starting_price');

      const res = await fetch(`${API}/salons/?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load salons');
      const data = await res.json();
      setSalons(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load salons');
    } finally {
      setLoading(false);
    }
  }, [selectedCity, searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchSalons, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchSalons]);

  const filteredSalons = selectedCategory === 'All'
    ? salons
    : salons.filter(s => s.tags?.some(t => t.toLowerCase() === selectedCategory.toLowerCase()));

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedCategory('All');
    setSortBy('rating');
  };

  const hasActiveFilters = searchQuery || (selectedCity && selectedCity !== 'All') || selectedCategory !== 'All';

  const handleView = (id: number) => {
    if (onViewProfile) onViewProfile(String(id));
    else navigate(`/salons/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pt-20 lg:pt-24">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 lg:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus-within:border-[#6D28D9] focus-within:ring-2 focus-within:ring-[#6D28D9]/10 transition-all">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search salons, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[#111827] placeholder-gray-400 text-sm focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 min-w-[180px]">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent text-[#111827] text-sm focus:outline-none cursor-pointer appearance-none"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city === 'All' ? '' : city}>
                    {city === 'All' ? 'All Locations' : city}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${showFilters ? 'bg-[#6D28D9] text-white' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Service Type</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${selectedCategory === cat ? 'bg-[#6D28D9] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 cursor-pointer">
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
              <div className="flex items-end">
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-10 h-10 text-[#6D28D9] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchSalons} className="px-6 py-2 bg-[#6D28D9] text-white rounded-lg hover:bg-[#5B21B6] transition">Retry</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-[#111827]">{filteredSalons.length}</span> salon{filteredSalons.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filteredSalons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSalons.map((salon) => (
                  <div key={salon.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={buildImgUrl(salon.image)}
                        alt={salon.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      {onToggleFavorite && (
                        <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(String(salon.id)); }}
                          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${favorites.includes(String(salon.id)) ? 'bg-red-500 text-white shadow-lg' : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'}`}>
                          <Heart className={`w-4 h-4 ${favorites.includes(String(salon.id)) ? 'fill-current' : ''}`} />
                        </button>
                      )}
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
                        <button onClick={() => handleView(salon.id)}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#6D28D9]/10 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all duration-300">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <SearchX className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">No salons found</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#6D28D9] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all duration-300">
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SalonListing;
