import React from 'react';
import { Scissors, Palette, Sparkles, Heart } from 'lucide-react';

interface CategorySectionProps {
  onCategoryClick: (category: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ onCategoryClick }) => {
  const categories = [
    {
      name: 'Hair',
      icon: Scissors,
      description: 'Braids, weaves, natural hair care, and styling',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
      count: '200+ salons',
      gradient: 'from-purple-600 to-purple-800',
    },
    {
      name: 'Nails',
      icon: Sparkles,
      description: 'Manicures, pedicures, gel, acrylic, and nail art',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
      count: '150+ salons',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      name: 'Makeup',
      icon: Palette,
      description: 'Bridal, event, everyday glam, and lash extensions',
      image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop',
      count: '120+ salons',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      name: 'Massage',
      icon: Heart,
      description: 'Swedish, deep tissue, aromatherapy, and spa treatments',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
      count: '80+ salons',
      gradient: 'from-teal-500 to-emerald-600',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-semibold uppercase tracking-wider mb-4">
            Browse by Category
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-4">
            What Are You{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#F59E0B]">
              Looking For?
            </span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Explore our wide range of beauty services and find the perfect salon for your needs.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onCategoryClick(category.name)}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] text-left"
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-70 group-hover:opacity-80 transition-opacity duration-300`} />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                <p className="text-white/70 text-sm mb-2 line-clamp-2">{category.description}</p>
                <span className="text-xs font-medium text-white/50">{category.count}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
