import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { Service, formatPrice } from '@/data/salonData';
import { useAuth } from '@/contexts/AuthContext';

const API = 'http://localhost:8000/api';

const toBackendTime = (t: string) => {
  const [time, period] = t.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
};

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  salonName: string;
  salonId?: number | string;
  preSelectedService?: Service;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, services, salonName, salonId, preSelectedService }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(preSelectedService || null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingRef, setBookingRef] = useState<number | string>('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM',
  ];

  const availableDates = useMemo(() => {
    const dates: { label: string; value: string; day: string }[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      dates.push({
        label: `${monthNames[date.getMonth()]} ${date.getDate()}`,
        value: date.toISOString().split('T')[0],
        day: dayNames[date.getDay()],
      });
    }
    return dates;
  }, []);

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    if (!isAuthenticated || !token) {
      // Redirect to login, return here after
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      onClose();
      return;
    }
    setSubmitting(true);
    setBookingError('');
    try {
      const res = await fetch(`${API}/bookings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify({
          salon: salonId,
          service: selectedService.id,
          service_name: selectedService.name,
          client_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username,
          client_email: user?.email,
          booking_date: selectedDate,
          booking_time: toBackendTime(selectedTime),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || JSON.stringify(err));
      }
      const booking = await res.json();
      setBookingRef(booking.id);
      setStep(4);
    } catch (e) {
      setBookingError(e instanceof Error ? e.message : 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedService(preSelectedService || null);
    setSelectedDate('');
    setSelectedTime('');
    setBookingRef('');
    setBookingError('');
    setSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetAndClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            {step < 4 && (
              <div className="flex items-center gap-2 mb-1">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      s <= step ? 'bg-[#6D28D9] w-8' : 'bg-gray-200 w-6'
                    }`}
                  />
                ))}
              </div>
            )}
            <h2 className="text-lg font-bold text-[#111827]">
              {step === 1 && 'Select Service'}
              {step === 2 && 'Choose Date & Time'}
              {step === 3 && 'Confirm Booking'}
              {step === 4 && 'Booking Confirmed!'}
            </h2>
            <p className="text-sm text-gray-500">{salonName}</p>
          </div>
          <button
            onClick={resetAndClose}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setStep(2);
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedService?.id === service.id
                      ? 'border-[#6D28D9] bg-[#6D28D9]/5'
                      : 'border-gray-100 hover:border-[#6D28D9]/30 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[#111827] text-sm">{service.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {service.duration}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] text-xs font-medium">
                          {service.category}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-[#6D28D9] text-sm whitespace-nowrap ml-3">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div>
              {/* Date Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-[#6D28D9]" />
                  <h4 className="font-semibold text-[#111827] text-sm">Select Date</h4>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`p-2 rounded-xl text-center transition-all duration-200 ${
                        selectedDate === date.value
                          ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-200'
                          : 'bg-gray-50 hover:bg-[#6D28D9]/10 text-[#111827]'
                      }`}
                    >
                      <div className="text-[10px] font-medium opacity-70">{date.day}</div>
                      <div className="text-xs font-bold">{date.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#6D28D9]" />
                  <h4 className="font-semibold text-[#111827] text-sm">Select Time</h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                        selectedTime === time
                          ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-200'
                          : 'bg-gray-50 hover:bg-[#6D28D9]/10 text-[#111827]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => {
                    if (selectedDate && selectedTime) setStep(3);
                  }}
                  disabled={!selectedDate || !selectedTime}
                  className={`flex-1 flex items-center justify-center gap-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    selectedDate && selectedTime
                      ? 'bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && selectedService && (
            <div>
              <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Service</span>
                  <span className="text-sm font-semibold text-[#111827]">{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Duration</span>
                  <span className="text-sm font-medium text-[#111827]">{selectedService.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Date</span>
                  <span className="text-sm font-medium text-[#111827]">{selectedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Time</span>
                  <span className="text-sm font-medium text-[#111827]">{selectedTime}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#111827]">Service Price</span>
                  <span className="text-lg font-bold text-[#6D28D9]">{formatPrice(selectedService.price)}</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-green-600">🎉</span>
                  <span className="text-xs text-green-800 font-medium">Free booking — no upfront payment!</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                {bookingError && (
                  <p className="text-red-500 text-xs text-center mb-2">{bookingError}</p>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader className="w-4 h-4 animate-spin" />Booking...</> : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">Booking Submitted!</h3>
              <p className="text-gray-500 text-sm mb-4">
                Your booking request has been submitted successfully. The salon will confirm your appointment.
              </p>
              <div className="bg-[#6D28D9]/5 rounded-xl p-4 mb-6 inline-block">
                <span className="text-xs text-gray-500 block mb-1">Booking Reference</span>
                <span className="text-lg font-bold text-[#6D28D9] tracking-wider">{bookingRef}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
                <p className="text-sm"><span className="text-gray-500">Service:</span> <span className="font-medium">{selectedService?.name}</span></p>
                <p className="text-sm"><span className="text-gray-500">Date:</span> <span className="font-medium">{selectedDate}</span></p>
                <p className="text-sm"><span className="text-gray-500">Time:</span> <span className="font-medium">{selectedTime}</span></p>
                <p className="text-sm"><span className="text-gray-500">Total:</span> <span className="font-bold text-[#6D28D9]">{selectedService && formatPrice(selectedService.price)}</span></p>
              </div>
              <button
                onClick={resetAndClose}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-purple-300/50 transition-all duration-300"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
