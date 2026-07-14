import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/beautybook/Navbar';
import Footer from '@/components/beautybook/Footer';
import HeroSection from '@/components/beautybook/HeroSection';
import HowItWorks from '@/components/beautybook/HowItWorks';
import FeaturedVideos from '@/components/beautybook/FeaturedVideos';
import FeaturedSalons from '@/components/beautybook/FeaturedSalons';
import CategorySection from '@/components/beautybook/CategorySection';
import Testimonials from '@/components/beautybook/Testimonials';
import CTASection from '@/components/beautybook/CTASection';
import SalonListing from '@/pages/beautybook/SalonListing';

type Page = 'landing' | 'listing';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchService, setSearchService] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleNavigate = useCallback((page: string) => {
    // login/register are now full routes — redirect via router
    if (page === 'login') { navigate('/login'); return; }
    if (page === 'register') { navigate('/register'); return; }
    setCurrentPage(page as Page);
  }, [navigate]);

  const handleViewProfile = useCallback((salonId: string) => {
    navigate(`/salons/${salonId}`);
  }, [navigate]);

  const handleToggleFavorite = useCallback((salonId: string) => {
    setFavorites(prev => prev.includes(salonId) ? prev.filter(id => id !== salonId) : [...prev, salonId]);
  }, []);

  const handleSearch = useCallback((service: string, location: string) => {
    setSearchService(service);
    setSearchLocation(location);
    setCurrentPage('listing');
  }, []);

  const handleCategoryClick = useCallback((category: string) => {
    setSearchService(category);
    setSearchLocation('');
    setCurrentPage('listing');
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {currentPage === 'landing' && (
        <>
          <HeroSection onSearch={handleSearch} onNavigate={handleNavigate} />
          <FeaturedVideos />
          <CategorySection onCategoryClick={handleCategoryClick} />
          <FeaturedSalons
            onViewProfile={handleViewProfile}
            onNavigate={handleNavigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
          <HowItWorks />
          <Testimonials />
          <CTASection onNavigate={handleNavigate} />
        </>
      )}

      {currentPage === 'listing' && (
        <SalonListing
          onViewProfile={handleViewProfile}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          initialService={searchService}
          initialLocation={searchLocation}
        />
      )}

      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default AppLayout;
