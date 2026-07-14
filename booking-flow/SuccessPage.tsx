'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Calendar, Clock, Building, CreditCard, Download, Share2 } from 'lucide-react';

interface BookingConfirmation {
  bookingRef: string;
  salonName: string;
  serviceName: string;
  date: string;
  time: string;
  servicePrice: number;
  bookingFee: number;
  paymentMethod: string;
  status: 'confirmed';
}

export default function BookingSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    // Generate booking confirmation (in real app, fetch from API)
    setBooking({
      bookingRef: 'BB-' + Date.now(),
      salonName: 'Glamour Beauty Studio',
      serviceName: 'Full Hair Treatment',
      date: 'Tomorrow',
      time: '2:00 PM',
      servicePrice: 50000,
      bookingFee: 5000,
      paymentMethod: 'MTN MoMo',
      status: 'confirmed',
    });

    // Trigger confetti animation
    setShowConfetti(true);
  }, []);

  const handleDownloadConfirmation = () => {
    alert('Downloading booking confirmation...');
    // In real app: Generate PDF and download
  };

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Booking Confirmation',
        text: `Booking at ${booking?.salonName} on ${booking?.date} at ${booking?.time}`,
        url: window.location.href,
      });
    } else {
      alert('Share link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      {/* Confetti Animation */}
      {showConfetti && <ConfettiEffect />}

      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-xl animate-bounce-slow">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h1>
          <p className="text-xl text-gray-600">Your booking is confirmed</p>
        </div>

        {/* Booking Reference */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white text-center mb-6 shadow-lg">
          <p className="text-purple-200 text-sm mb-2">Booking Reference</p>
          <p className="text-3xl font-mono font-bold">{booking?.bookingRef}</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border-2 border-green-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Appointment Details
          </h2>

          <div className="space-y-4">
            {/* Salon */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Salon</p>
                <p className="font-semibold text-gray-900">{booking?.salonName}</p>
              </div>
            </div>

            {/* Service */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💇</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Service</p>
                <p className="font-semibold text-gray-900">{booking?.serviceName}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-500">Date</p>
                </div>
                <p className="font-semibold text-gray-900">{booking?.date}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-500">Time</p>
                </div>
                <p className="font-semibold text-gray-900">{booking?.time}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-900">Payment Summary</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Price:</span>
                  <span className="font-medium text-gray-900">
                    {booking && new Intl.NumberFormat('fr-FR').format(booking.servicePrice)} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Fee Paid:</span>
                  <span className="font-bold text-green-600">
                    {booking && new Intl.NumberFormat('fr-FR').format(booking.bookingFee)} FCFA
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-200">
                  <span className="text-gray-600">Pay at Salon:</span>
                  <span className="font-bold text-gray-900">
                    {booking && new Intl.NumberFormat('fr-FR').format(booking.servicePrice)} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Paid via</p>
              <p className="font-semibold text-gray-900">{booking?.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Important Reminder */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">ℹ️</span>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Important Reminder</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Please arrive <strong>10 minutes early</strong> for your appointment.<br />
                Remember to pay <strong className="text-blue-900">
                  {booking && new Intl.NumberFormat('fr-FR').format(booking?.servicePrice)} FCFA
                </strong> at the salon for the service.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleDownloadConfirmation}
            className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
          <button
            onClick={handleShareBooking}
            className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:underline"
          >
            ← Back to Home
          </a>
        </div>

        {/* SMS/Email Confirmation Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          A confirmation SMS and email have been sent to you
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </div>
  );
}

// Confetti Effect Component
function ConfettiEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#6C63FF', '#FF6584', '#4CAF50', '#FFCC00', '#2196F3'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
