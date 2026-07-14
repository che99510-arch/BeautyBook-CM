import React, { useState } from 'react';
import { Home, Scissors, LayoutDashboard, LogIn, User, Menu, X } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { page: 'landing', label: 'Home', icon: Home },
  { page: 'listing', label: 'Salons', icon: Scissors },
  { page: 'login', label: 'Login', icon: LogIn },
  { page: 'register', label: 'Register', icon: User },
];

const CustomerSidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const [open, setOpen] = useState(false);

  const handleLinkClick = (page: string) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <>
      {/* hamburger fixed top-left for mobile/always */}
      <button
        className="fixed top-4 left-4 z-[60] p-2 bg-white rounded-xl shadow-lg lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="w-6 h-6 text-[#6D28D9]" />
      </button>

      {/* overlay for mobile when sidebar open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-[50] transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none`}
      >
        <div className="p-6 flex items-center justify-between lg:justify-center">
          <h2 className="text-lg font-bold text-[#111827]">Menu</h2>
          <button
            className="lg:hidden p-1"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleLinkClick(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left
                ${currentPage === item.page
                  ? 'bg-[#6D28D9]/10 text-[#6D28D9]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#111827]'}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default CustomerSidebar;
