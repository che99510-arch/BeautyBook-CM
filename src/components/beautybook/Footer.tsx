import React from 'react';
import { Scissors, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#111827] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#7C3AED] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">BeautyBook</span>
                <span className="text-xs font-semibold text-[#F59E0B] ml-1">CM</span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
            Cameroon's premier beauty booking platform. Connecting you with the best salons across Bamenda, Buea, Douala, Yaounde and Bafoussam.
            </p>
            <div className="flex gap-3">
              <a href="#" onClick={(e) => e.preventDefault()} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#6D28D9] transition-colors duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#6D28D9] transition-colors duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#6D28D9] transition-colors duration-300">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', page: 'landing' },
                { label: 'Browse Salons', page: 'listing' },
                { label: 'For Salon Owners', page: 'register' },
              ].map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => onNavigate(link.page)}
                    className="text-white/60 hover:text-[#F59E0B] transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Services</h4>
            <ul className="space-y-3">
              {['Hair Styling', 'Nail Art', 'Makeup', 'Massage & Spa', 'Bridal Packages', 'Natural Hair Care'].map((service) => (
                <li key={service}>
                  <button
                    onClick={() => onNavigate('listing')}
                    className="text-white/60 hover:text-[#F59E0B] transition-colors duration-300 text-sm"
                  >
                    {service}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                Bamenda, Buea, Douala, Yaounde & Bafoussam
              </li>
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <Phone className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                +237 6XX XXX XXX
              </li>
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <Mail className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                hello@beautybookcm.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-xs">
              &copy; 2026 BeautyBook CM. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button onClick={(e) => e.preventDefault()} className="text-white/40 hover:text-white/60 text-xs transition-colors">Privacy Policy</button>
              <button onClick={(e) => e.preventDefault()} className="text-white/40 hover:text-white/60 text-xs transition-colors">Terms of Service</button>
              <button onClick={(e) => e.preventDefault()} className="text-white/40 hover:text-white/60 text-xs transition-colors">FAQ</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
