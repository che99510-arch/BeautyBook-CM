import React, { useState, useEffect } from 'react';
import { Menu, Scissors, User, LogIn, LogOut, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const navigateRouter = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', page: 'landing' },
    { label: 'Salons', page: 'listing' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    onNavigate('landing');
  };


  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : currentPage === 'landing'
          ? 'bg-transparent'
          : 'bg-white shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center shadow-lg group-hover:shadow-purple-300 transition-shadow duration-300">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-lg font-bold leading-tight transition-colors duration-300 ${
                isScrolled || currentPage !== 'landing' ? 'text-[#111827]' : 'text-white'
              }`}>
                BeautyBook
              </span>
              <span className="text-xs font-semibold text-[#F59E0B] leading-tight -mt-0.5">CM</span>
            </div>
          </button>


          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  currentPage === link.page
                    ? 'bg-[#6D28D9]/10 text-[#6D28D9]'
                    : isScrolled || currentPage !== 'landing'
                    ? 'text-[#111827]/70 hover:text-[#6D28D9] hover:bg-[#6D28D9]/5'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigateRouter('/my-bookings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isScrolled || currentPage !== 'landing'
                      ? 'text-[#111827]/70 hover:text-[#6D28D9] hover:bg-[#6D28D9]/5'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  My Bookings
                </button>
                <button
                  onClick={() => navigateRouter('/profile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isScrolled || currentPage !== 'landing'
                      ? 'text-[#111827]/70 hover:text-[#6D28D9] hover:bg-[#6D28D9]/5'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#6D28D9] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
                    </span>
                  </div>
                  {user?.first_name || user?.username}
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isScrolled || currentPage !== 'landing'
                      ? 'text-[#111827]/70 hover:text-red-600 hover:bg-red-50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigateRouter('/login')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isScrolled || currentPage !== 'landing'
                      ? 'text-[#111827]/70 hover:text-[#6D28D9] hover:bg-[#6D28D9]/5'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={() => navigateRouter('/register')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <User className="w-4 h-4" />
                  Register
                </button>
              </>
            )}
          </div>

          {/* mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors duration-300 ${
              isScrolled || currentPage !== 'landing'
                ? 'text-[#111827] hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Menu className="w-6 h-6" />
          </button>

        </div>
      </div>

      {/* mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  onNavigate(link.page);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentPage === link.page
                    ? 'bg-[#6D28D9]/10 text-[#6D28D9]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={() => {
                  navigateRouter('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-[#6D28D9]" />
                Sign In
              </button>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => { navigateRouter('/my-bookings'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4 text-[#6D28D9]" />
                    My Bookings
                  </button>
                  <button
                    onClick={() => { navigateRouter('/profile'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#6D28D9]" />
                    My Profile
                  </button>
                  <div className="px-4 py-2 text-sm text-gray-600 border-t border-gray-100">
                    Logged in as <span className="font-medium">{user?.first_name || user?.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigateRouter('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:opacity-90"
                >
                  Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
