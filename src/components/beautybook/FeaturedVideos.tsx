import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE, MEDIA_BASE } from '@/lib/api';

const API_BASE_URL = MEDIA_BASE; // for media file URLs

interface FeaturedAd {
  id: string;
  salon_id: string;
  salon_name: string;
  tagline: string;
  video_url: string;
  thumbnail_url: string | null;
  description: string | null;
}

const ROTATE_INTERVAL = 6000;

const FeaturedVideos: React.FC = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<FeaturedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [offset, setOffset] = useState(0);

  // Fetch active featured ads from backend
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/advertisements/featured/`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAds(data.map((ad: any) => ({
              id: String(ad.id),
              salon_id: String(ad.salon_id || ad.salon),
              salon_name: ad.salon_name || 'Salon',
              tagline: ad.tagline,
              video_url: buildMediaUrl(ad.video_url || ad.video),
              thumbnail_url: ad.thumbnail_url ? buildMediaUrl(ad.thumbnail_url) : null,
              description: ad.description || null,
            })));
          }
        }
      } catch {
        // silently fall through — no ads shown if API is down
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  // Increment view count when an ad becomes current
  useEffect(() => {
    if (ads.length === 0) return;
    const ad = ads[current];
    if (!ad) return;
    fetch(`${API_BASE}/admin/advertisements/${ad.id}/increment_views/`, {
      method: 'POST',
    }).catch(() => {});
  }, [current, ads]);

  // Rotate timer
  useEffect(() => {
    if (isPaused || ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ads.length);
    }, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, ads.length]);

  // Play/pause videos
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === current) vid.play().catch(() => {});
      else vid.pause();
    });
  }, [current]);

  // Compute carousel offset
  useEffect(() => {
    const updateOffset = () => {
      if (!containerRef.current) return;
      const slide = containerRef.current.querySelector<HTMLElement>('.slide');
      if (!slide) { setOffset(0); return; }
      const style = window.getComputedStyle(slide);
      const marginRight = parseFloat(style.marginRight || '0');
      setOffset(-current * (slide.offsetWidth + marginRight));
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, [current, ads.length]);

  const resumeAfterInteraction = () => {
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), ROTATE_INTERVAL);
  };

  const goPrev = () => { setCurrent((p) => (p - 1 + ads.length) % ads.length); resumeAfterInteraction(); };
  const goNext = () => { setCurrent((p) => (p + 1) % ads.length); resumeAfterInteraction(); };

  const handleViewSalon = (ad: FeaturedAd) => {
    fetch(`${API_BASE}/admin/advertisements/${ad.id}/increment_clicks/`, { method: 'POST' }).catch(() => {});
    navigate(`/salons/${ad.salon_id}`);
  };

  const handleBookNow = (ad: FeaturedAd) => {
    fetch(`${API_BASE}/admin/advertisements/${ad.id}/increment_clicks/`, { method: 'POST' }).catch(() => {});
    navigate(`/salons/${ad.salon_id}`, { state: { scrollToBooking: true } });
  };

  const handleTouchStart = (e: TouchEvent) => { touchStartX.current = e.changedTouches[0].screenX; setIsPaused(true); };
  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { if (diff > 0) goNext(); else goPrev(); }
    setTimeout(() => setIsPaused(false), ROTATE_INTERVAL);
  };

  // Don't render section if loading or no ads
  if (loading || ads.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">Featured Salons This Week 🎥</h2>
          <p className="text-gray-500 mt-1.5 text-sm">Discover premium beauty experiences in your city.</p>
        </div>

        <div
          ref={containerRef}
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(${offset}px)` }}
          >
            {ads.map((ad, idx) => (
              <div key={ad.id} className="slide flex-shrink-0 w-full sm:w-[85%] md:w-[75%] lg:w-[65%] px-2">
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  {/* Fixed 16:9 container — prevents videos from being arbitrarily tall */}
                  <div className="relative aspect-video bg-black">
                    <video
                      ref={(el) => (videoRefs.current[idx] = el)}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                      crossOrigin="anonymous"
                      poster={ad.thumbnail_url || undefined}
                      preload="metadata"
                      src={ad.video_url}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Overlay content */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-base font-semibold leading-snug">{ad.salon_name}</h3>
                      <p className="mt-0.5 text-xs opacity-80 truncate">{ad.tagline}</p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewSalon(ad)}
                          className="px-3 py-1.5 bg-white text-[#111827] rounded-full text-xs font-medium shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                          View Salon
                        </button>
                        <button
                          onClick={() => handleBookNow(ad)}
                          className="px-3 py-1.5 bg-[#F59E0B] text-white rounded-full text-xs font-medium shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>

                    {/* Featured badge */}
                    <div className="absolute top-3 left-3 bg-[#F59E0B] text-xs font-semibold text-[#111827] px-2 py-0.5 rounded-full">
                      Featured
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Nav arrows */}
          {ads.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute top-1/2 -translate-y-1/2 left-2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6D28D9]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={goNext} className="absolute top-1/2 -translate-y-1/2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#6D28D9]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Dot indicators */}
          {ads.length > 1 && (
            <div className="flex justify-center gap-2 mt-3">
              {ads.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrent(idx); resumeAfterInteraction(); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'bg-[#6D28D9] w-6' : 'bg-gray-300 w-2'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

function buildMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Always build media URLs against the host root, not /api
  const base = MEDIA_BASE; // e.g. http://localhost:8000
  if (url.startsWith('/media/')) return `${base}${url}`;
  return `${base}/media/${url}`;
}

export default FeaturedVideos;
