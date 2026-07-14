/**
 * useGoogleAuth — loads Google Identity Services and exposes a signIn function.
 *
 * Usage:
 *   const { signInWithGoogle, loading, error } = useGoogleAuth({ onSuccess, onError });
 *
 * Set VITE_GOOGLE_CLIENT_ID in .env.local to your Google OAuth client ID.
 * The backend endpoint POST /api/users/google_auth/ verifies the id_token and
 * returns a BeautyBook CM token.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE } from '@/lib/api';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

// Extend Window to include the Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (n: any) => void) => void;
          renderButton: (parent: HTMLElement, options: object) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface UseGoogleAuthOptions {
  /** Called when Google sign-in succeeds and the backend token is returned */
  onSuccess: (token: string, user: any) => void;
  /** Called on any failure */
  onError?: (message: string) => void;
}

export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  /** Load the GSI script once */
  useEffect(() => {
    if (document.getElementById('gsi-script')) return;
    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  /** Handle the credential returned by Google */
  const handleCredential = useCallback(
    async (credential: string) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/users/google_auth/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: credential }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google login failed');
        onSuccess(data.token, data.user);
      } catch (e: any) {
        const msg = e.message || 'Google sign-in failed';
        setError(msg);
        onError?.(msg);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  /** Initialize GSI and render a button into `ref` */
  const initButton = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container) return;
      buttonRef.current = container;

      const tryInit = () => {
        if (!window.google || initializedRef.current) return;
        initializedRef.current = true;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => handleCredential(response.credential),
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(container, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: 'continue_with',
          size: 'large',
          logo_alignment: 'left',
          width: container.offsetWidth || 380,
        });
      };

      // GSI may not be loaded yet — poll until ready
      if (window.google) {
        tryInit();
      } else {
        const t = setInterval(() => {
          if (window.google) { clearInterval(t); tryInit(); }
        }, 100);
        setTimeout(() => clearInterval(t), 10000);
      }
    },
    [handleCredential]
  );

  return { initButton, loading, error, setError };
}
