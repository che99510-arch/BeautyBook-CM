import { useState, useEffect, useCallback, useRef } from 'react';
import { salons as fallbackSalons, testimonials as fallbackTestimonials, dashboardBookings as fallbackBookings } from '@/data/salonData';
import type { Salon, Service, Review, Booking } from '@/data/salonData';

// API Configuration
const API_URL = 'http://localhost:8000/api';

// ── Convert DB rows to app Salon format ──
function toAppSalon(s: any, services: any[], reviews: any[]): Salon {
  return {
    id: s.id.toString(),
    name: s.name,
    location: s.location,
    city: s.city as 'Bamenda' | 'Buea' | 'Douala' | 'Yaounde' | 'Bafoussam',
    description: s.description || '',
    image: s.image || '',
    coverImage: s.cover_image || '',
    rating: Number(s.rating) || 0,
    reviewCount: s.review_count || 0,
    startingPrice: Number(s.starting_price) || 0,
    phone: s.phone || '',
    openHours: s.open_hours || '',
    tags: s.tags || [],
    services: services
      .filter(svc => svc.salon_id === s.id)
      .map(svc => ({
        id: svc.id.toString(),
        name: svc.name,
        category: svc.category as Service['category'],
        duration: svc.duration,
        price: Number(svc.price),
        description: svc.description || '',
      })),
    reviews: reviews
      .filter(r => r.salon_id === s.id)
      .map(r => ({
        id: r.id.toString(),
        author: r.author_name || r.author || '',
        avatar: r.avatar || '',
        rating: r.rating,
        date: r.created_at ? r.created_at.split('T')[0] : (r.date || ''),
        comment: r.comment || '',
      })),
  };
}

function toAppBooking(b: any): Booking {
  return {
    id: b.id.toString(),
    clientName: b.client_name,
    service: b.service_name,
    date: b.booking_date || b.date,
    time: b.booking_time || b.time,
    status: b.status as Booking['status'],
    price: Number(b.price || b.service_price),
  };
}

// ── Main hook: all salons ──
export function useSalons() {
  const [salons, setSalons] = useState<Salon[]>(fallbackSalons);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Fetch from Django backend
        const [salonRes, svcRes, revRes] = await Promise.all([
          fetch(`${API_URL}/salons/?ordering=-rating`),
          fetch(`${API_URL}/services/`),
          fetch(`${API_URL}/reviews/?ordering=-created_at`),
        ]);

        if (cancelled) return;

        if (salonRes.ok && salonRes.ok) {
          const salonsData = await salonRes.json();
          const servicesData = svcRes.ok ? await svcRes.json() : [];
          const reviewsData = revRes.ok ? await revRes.json() : [];
          
          if (salonsData && salonsData.length > 0) {
            const mapped = salonsData.map((s: any) =>
              toAppSalon(s, servicesData, reviewsData)
            );
            setSalons(mapped);
            setDbReady(true);
          }
        }
      } catch (e) {
        console.warn('Backend fetch failed, using fallback data:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { salons, loading, dbReady };
}

// ── Single salon by ID ──
export function useSalon(id: string | null) {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;

    async function load() {
      try {
        const [salonRes, svcRes, revRes] = await Promise.all([
          fetch(`${API_URL}/salons/${id}/`),
          fetch(`${API_URL}/salons/${id}/services/`),
          fetch(`${API_URL}/salons/${id}/reviews/`),
        ]);

        if (cancelled) return;

        if (salonRes.ok) {
          const salonData = await salonRes.json();
          const servicesData = svcRes.ok ? await svcRes.json() : [];
          const reviewsData = revRes.ok ? await revRes.json() : [];
          setSalon(toAppSalon(salonData, servicesData, reviewsData));
        } else {
          // Fallback
          const fb = fallbackSalons.find(s => s.id === id);
          if (fb) setSalon(fb);
        }
      } catch {
        const fb = fallbackSalons.find(s => s.id === id);
        if (fb) setSalon(fb);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  return { salon, loading };
}

// ── Testimonials ──
export function useTestimonials() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_URL}/admin/testimonials/`);
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.results ?? []);
        if (cancelled || items.length === 0) return;
        setTestimonials(
          items.map((t: any) => ({
            id: String(t.id),
            name: t.name,
            avatar: t.avatar_display_url || t.avatar_url || t.avatar || '',
            location: t.location || '',
            comment: t.comment,
            rating: t.rating,
          }))
        );
      } catch {
        // keep fallback
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return testimonials;
}

// ── Dashboard bookings ──
export function useDashboardBookings(salonId?: string) {
  const [bookings, setBookings] = useState<Booking[]>(fallbackBookings);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('salonOwnerToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const url = salonId 
        ? `${API_URL}/bookings/?salon=${salonId}`
        : `${API_URL}/bookings/my_bookings/`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.map((b: any) => toAppBooking(b)));
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, refetch: fetchBookings };
}

// ── Create a booking ──
export async function createBooking(params: {
  salonId: string;
  serviceId: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
}): Promise<{ ref: string } | null> {
  try {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }

    const response = await fetch(`${API_URL}/bookings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        service: parseInt(params.serviceId),
        booking_date: params.date,
        booking_time: params.time,
        client_name: params.clientName,
        notes: '',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return { ref: data.id.toString() };
    }
    return null;
  } catch (error) {
    console.error('Booking error:', error);
    return null;
  }
}

// ── Add a service (salon owner) ──
export async function addService(salonId: string, svc: { name: string; category: string; duration: string; price: number; description?: string }) {
  try {
    const token = localStorage.getItem('salonOwnerToken');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }

    const response = await fetch(`${API_URL}/services/create_service/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        salon: parseInt(salonId),
        ...svc,
      }),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Add service error:', error);
    return null;
  }
}

// ── Delete a service (salon owner) ──
export async function deleteService(serviceId: string) {
  try {
    const token = localStorage.getItem('salonOwnerToken');
    if (!token) {
      console.error('No authentication token found');
      return false;
    }

    const response = await fetch(`${API_URL}/services/${serviceId}/delete_service/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Delete service error:', error);
    return false;
  }
}

// ── Add a review ──
export async function addReview(salonId: string, review: { authorName: string; avatar?: string; rating: number; comment: string }) {
  try {
    const response = await fetch(`${API_URL}/reviews/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        salon: parseInt(salonId),
        author_name: review.authorName,
        avatar: review.avatar || '',
        rating: review.rating,
        comment: review.comment,
      }),
    });
    
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Review error:', error);
    return false;
  }
}
