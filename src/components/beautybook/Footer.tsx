import React from 'react';
import { Scissors, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
              <a href="https://www.facebook.com/share/1DoRJeJ7LZ/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#6D28D9] transition-colors duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#6D28D9] transition-colors duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://wa.me/237679911937" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors duration-300">
                <WhatsAppIcon />
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
                +237 679 911 937
              </li>
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <Mail className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                beautybookcm@gmail.com
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
