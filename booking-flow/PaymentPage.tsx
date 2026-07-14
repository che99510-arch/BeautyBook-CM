'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Smartphone, CreditCard, Shield } from 'lucide-react';

interface BookingDetails {
  bookingId: string;
  salonName: string;
  serviceName: string;
  servicePrice: number;
  bookingFee: number;
  date: string;
  time: string;
}

export default function BookingPaymentPage({ params }: { params: { bookingId: string } }) {
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'orange'>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  // Mock booking details - in real app, fetch from API
  useEffect(() => {
    // Simulate fetching booking details
    setBookingDetails({
      bookingId: params.bookingId,
      salonName: 'Glamour Beauty Studio',
      serviceName: 'Full Hair Treatment',
      servicePrice: 50000,
      bookingFee: 5000, // 10%
      date: 'Tomorrow',
      time: '2:00 PM',
    });
  }, [params.bookingId]);

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to success page
      window.location.href = `/booking/${params.bookingId}/success`;
    }, 2500);
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Secure Payment</h1>
                <p className="text-sm text-gray-500">Your payment is protected</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="font-mono font-bold text-purple-600">{bookingDetails.bookingId}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT - Booking Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">🏢</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{bookingDetails.salonName}</p>
                    <p className="text-sm text-gray-500">Beauty Salon</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">💇</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{bookingDetails.serviceName}</p>
                    <p className="text-sm text-gray-500">{bookingDetails.date} at {bookingDetails.time}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Price:</span>
                    <span className="font-medium text-gray-900">
                      {new Intl.NumberFormat('fr-FR').format(bookingDetails.servicePrice)} FCFA
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-purple-200 mb-1">Booking Fee (10%)</p>
                        <p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(bookingDetails.bookingFee)} FCFA</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-purple-200" />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Pay at Salon:</span>
                    <span className="font-bold text-gray-900">
                      {new Intl.NumberFormat('fr-FR').format(bookingDetails.servicePrice)} FCFA
                    </span>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 text-sm mb-1">Payment Information</p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      You are paying only the <strong>booking fee</strong> now.<br />
                      The full service price will be paid at the salon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Payment Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Details</h2>

              {/* Amount to Pay */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 text-center mb-6">
                <p className="text-sm text-purple-700 mb-2">Amount to Pay Now</p>
                <p className="text-4xl font-bold text-purple-600 mb-2">
                  {new Intl.NumberFormat('fr-FR').format(bookingDetails.bookingFee)} FCFA
                </p>
                <p className="text-xs text-purple-600">Booking fee only</p>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* MTN MoMo */}
                  <button
                    onClick={() => setPaymentMethod('mtn')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'mtn'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-black">
                        MTN
                      </div>
                      <span className="text-xs font-medium text-gray-700">Mobile Money</span>
                    </div>
                    {paymentMethod === 'mtn' && (
                      <div className="mt-2 text-yellow-600 text-xs font-semibold">✓ Selected</div>
                    )}
                  </button>

                  {/* Orange Money */}
                  <button
                    onClick={() => setPaymentMethod('orange')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'orange'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white">
                        Orange
                      </div>
                      <span className="text-xs font-medium text-gray-700">Mobile Money</span>
                    </div>
                    {paymentMethod === 'orange' && (
                      <div className="mt-2 text-orange-600 text-xs font-semibold">✓ Selected</div>
                    )}
                  </button>
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="mb-6">
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Money Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 9-digit number"
                    maxLength={9}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition text-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We'll send payment confirmation to this number
                </p>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || !phoneNumber}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    Pay {new Intl.NumberFormat('fr-FR').format(bookingDetails.bookingFee)} FCFA
                  </>
                )}
              </button>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Instant Confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
