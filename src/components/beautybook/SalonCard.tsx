import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Heart } from 'lucide-react';
import { Salon, formatPrice } from '@/data/salonData';

interface SalonCardProps {
  salon: Salon;
  onViewProfile?: (salonId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (salonId: string) => void;
}

const SalonCard: React.FC<SalonCardProps> = ({ salon, onViewProfile, isFavorite = false, onToggleFavorite }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(salon.id);
    } else {
      navigate(`/salons/${salon.id}`);
    }
  };
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={salon.image}
          alt={salon.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(salon.id);
            }}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              isFavorite
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Tags */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {salon.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-[#6D28D9] backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-[#111827] text-base leading-tight group-hover:text-[#6D28D9] transition-colors duration-300">
            {salon.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-sm font-semibold text-[#111827]">{salon.rating}</span>
            <span className="text-xs text-gray-400">({salon.reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-sm">{salon.location}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400">Starting from</span>
            <p className="text-sm font-bold text-[#6D28D9]">{formatPrice(salon.startingPrice)}</p>
          </div>
          <button
            onClick={handleViewProfile}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#6D28D9]/10 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white transition-all duration-300"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalonCard;
