/**
 * PWAInstallPrompt
 * Shows an in-app "Add to Home Screen" banner on supported browsers.
 * - Android Chrome / Samsung Internet: uses the beforeinstallprompt event
 * - iOS Safari: shows a manual instruction (iOS doesn't support the prompt API)
 * - Dismissed state is persisted to localStorage for 30 days
 */
import React, { useEffect, useState } from 'react';
import { X, Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa_install_dismissed_at';
const DISMISS_DAYS = 30;

function isDismissed(): boolean {
  const ts = localStorage.getItem(DISMISS_KEY);
  if (!ts) return false;
  const age = (Date.now() - parseInt(ts, 10)) / (1000 * 60 * 60 * 24);
  return age < DISMISS_DAYS;
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as any).MSStream;
}

function isInStandaloneMode(): boolean {
  return (window.matchMedia('(display-mode: standalone)').matches) ||
    (window.navigator as any).standalone === true;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Already installed or user dismissed recently
    if (isInStandaloneMode() || isDismissed()) return;

    if (isIOS()) {
      // Show iOS instruction after a short delay
      setIsIos(true);
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after a short delay so it doesn't pop immediately on load
      setTimeout(() => setShow(true), 4000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[9999] max-w-sm mx-auto"
      role="dialog"
      aria-label="Install BeautyBook CM"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header strip */}
        <div className="bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] px-4 py-3 flex items-center gap-3">
          <img src="/icons/icon-192.png" alt="BeautyBook CM" className="w-10 h-10 rounded-xl shadow" />
          <div className="flex-1">
            <p className="text-white font-bold text-sm leading-tight">BeautyBook CM</p>
            <p className="text-white/70 text-xs">Install for the best experience</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3">
          {isIos ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 font-medium">Add to your Home Screen:</p>
              <ol className="text-xs text-gray-500 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#6D28D9] text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                  Tap <Share className="w-3.5 h-3.5 inline mx-1 text-blue-500" /> Share in Safari
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#6D28D9] text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  Select <strong className="mx-1">"Add to Home Screen"</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#6D28D9] text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  Tap <strong className="ml-1">Add</strong>
                </li>
              </ol>
              <button
                onClick={handleDismiss}
                className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Maybe later
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="flex-1 text-sm text-gray-600">
                Install the app for faster bookings and offline access.
              </p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition"
                >
                  Not now
                </button>
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] rounded-lg hover:shadow-md transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
