'use client';

import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface Salon {
  id: string;
  name: string;
  location: string;
  rating: number;
  services: Service[];
}

// Mock salon data
const salon: Salon = {
  id: 'S001',
  name: 'Glamour Beauty Studio',
  location: 'Downtown, City Center',
  rating: 4.8,
  services: [
    {
      id: 'SRV001',
      name: 'Full Hair Treatment',
      description: 'Complete hair care package including wash, treatment, and styling',
      price: 50000,
      duration: 90,
    },
    {
      id: 'SRV002',
      name: 'Bridal Makeup',
      description: 'Professional makeup service for special occasions',
      price: 75000,
      duration: 120,
    },
    {
      id: 'SRV003',
      name: 'Gel Manicure',
      description: 'Long-lasting gel nail polish with hand massage',
      price: 15000,
      duration: 45,
    },
  ],
};

// Available time slots
const availableSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [step, setStep] = useState<'service' | 'datetime' | 'confirm'>('service');

  // Calculate booking fee (10%)
  const bookingFee = selectedService ? Math.round(selectedService.price * 0.10) : 0;
  const remainingAmount = selectedService ? selectedService.price : 0;

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('datetime');
  };

  const handleDateTimeConfirm = () => {
    if (selectedDate && selectedTime && selectedService) {
      setStep('confirm');
    }
  };

  const handleBookAppointment = () => {
    // Generate booking ID and redirect to payment
    const bookingId = 'BK' + Date.now();
    // In real app: Create booking in database with status 'awaiting_payment'
    // Then redirect to payment page
    window.location.href = `/booking/${bookingId}/payment?service=${selectedService?.id}&date=${selectedDate}&time=${selectedTime}`;
  };

  // Get next 7 days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{salon.name}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span>📍</span> {salon.location}
                <span className="mx-2">•</span>
                <span className="text-yellow-500">⭐</span> {salon.rating}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'service' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'service' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="font-medium">Select Service</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step === 'datetime' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'datetime' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="font-medium">Date & Time</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'confirm' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="font-medium">Confirm</span>
          </div>
        </div>

        {/* Step 1: Select Service */}
        {step === 'service' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Service</h2>
            {salon.services.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {service.duration} min
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {new Intl.NumberFormat('fr-FR').format(service.price)} FCFA
                    </div>
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                      Select
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('service')} className="text-purple-600 hover:underline">
                ← Back to services
              </button>
            </div>

            {/* Selected Service Summary */}
            {selectedService && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-purple-900">{selectedService.name}</p>
                    <p className="text-sm text-purple-700">{selectedService.duration} min • {new Intl.NumberFormat('fr-FR').format(selectedService.price)} FCFA</p>
                  </div>
                  <button onClick={() => setStep('service')} className="text-sm text-purple-600 hover:underline">
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Select Date
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {getNextDays().map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedDate === day.date
                        ? 'bg-purple-600 text-white'
                        : 'bg-white hover:bg-purple-50 text-gray-700'
                    }`}
                  >
                    <div className="text-xs font-medium uppercase">
                      {day.isToday ? 'Today' : day.isTomorrow ? 'Tomorrow' : day.display.split(' ')[0]}
                    </div>
                    <div className="text-lg font-bold mt-1">
                      {day.display.split(' ')[2]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Select Time
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 px-4 rounded-xl text-center font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-purple-600 text-white'
                        : 'bg-white hover:bg-purple-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleDateTimeConfirm}
              disabled={!selectedDate || !selectedTime}
              className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 3: Confirm & Book */}
        {step === 'confirm' && selectedService && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('datetime')} className="text-purple-600 hover:underline">
                ← Back to date & time
              </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h2>

            {/* Booking Summary Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <div className="space-y-4">
                {/* Service Details */}
                <div className="pb-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedService.name}</h3>
                  <p className="text-gray-600">{selectedService.duration} minutes</p>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Time</p>
                    <p className="font-semibold text-gray-900">{selectedTime}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Service Price:</span>
                    <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(selectedService.price)} FCFA</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Booking Fee (10%)</span>
                      <span className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(bookingFee)} FCFA</span>
                    </div>
                    <p className="text-xs text-purple-200">This confirms your appointment</p>
                  </div>

                  <div className="flex justify-between text-gray-700 pt-2 border-t border-gray-200">
                    <span>Remaining at Salon:</span>
                    <span className="font-bold text-gray-900">{new Intl.NumberFormat('fr-FR').format(remainingAmount)} FCFA</span>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-900 mb-1">Important Notice</p>
                    <p className="text-sm text-amber-800">
                      <strong>The booking fee confirms your appointment.</strong><br />
                      You will pay the full service amount ({new Intl.NumberFormat('fr-FR').format(remainingAmount)} FCFA) directly at the salon.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Appointment Button */}
            <button
              onClick={handleBookAppointment}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-purple-800 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-6 h-6" />
              Book Appointment
            </button>

            <p className="text-center text-sm text-gray-500">
              You will be redirected to complete payment
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
