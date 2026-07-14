import React from 'react';
import { Search, CalendarCheck, Sparkles } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Search,
      title: 'Search',
      description: 'Browse hundreds of beauty salons in Douala and Yaoundé. Filter by service, location, and price.',
      color: 'from-[#6D28D9] to-[#7C3AED]',
      bgColor: 'bg-[#6D28D9]/5',
    },
    {
      icon: CalendarCheck,
      title: 'Book',
      description: 'Choose your preferred service, date, and time. Confirm your booking instantly with just a few taps.',
      color: 'from-[#F59E0B] to-[#FBBF24]',
      bgColor: 'bg-[#F59E0B]/5',
    },
    {
      icon: Sparkles,
      title: 'Get Beautiful',
      description: 'Visit the salon and enjoy your beauty service. Leave feeling confident, refreshed, and gorgeous.',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] text-xs font-semibold uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-4">
            Beauty Booking Made{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#F59E0B]">Simple</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Three easy steps to your perfect beauty appointment. No hassle, no waiting, just beautiful results.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center group">
              {/* Connector Line */}
              {index < 2 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-gray-200 to-gray-100" />
              )}

              {/* Icon */}
              <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-2xl ${step.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                  <span className="text-xs font-bold text-[#6D28D9]">{index + 1}</span>
                </div>
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-[#111827] mb-3">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
