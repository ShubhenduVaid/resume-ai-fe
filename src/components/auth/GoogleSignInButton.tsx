'use client';

import { useEffect, useRef, useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
// import { jwtDecode } from "jwt-decode"; // If you need to decode the token on the client side (optional)
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { fetchWithInterceptor } from '@/lib/fetchWithInterceptor';

// interface DecodedToken {
//   email?: string;
//   name?: string;
//   picture?: string;
// }

type Props = {
  isSignIn?: boolean;
  widthPx?: number;
  onWidthChange?: (w: number) => void;
};

const GoogleSignInButton = ({
  isSignIn = true,
  widthPx,
  onWidthChange,
}: Props) => {
  const [buttonWidth, setButtonWidth] = useState(400);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { login, user } = useAuth();

  useEffect(() => {
    const refEl = containerRef.current;

    if (typeof widthPx === 'number') {
      setButtonWidth(Math.round(Math.max(220, Math.min(400, widthPx))));
      return; // Explicit width provided; no observers needed
    }

    if (!refEl) return;

    const updateFromContainer = () => {
      const safe = Math.max(220, Math.min(400, refEl.clientWidth));
      setButtonWidth(Math.round(safe));
    };

    updateFromContainer();

    let ro: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => updateFromContainer());
      ro.observe(refEl);
    }

    return () => {
      if (ro) ro.unobserve(refEl);
    };
  }, [widthPx]);

  // Report the actual rendered width of the Google inner element to parent
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onWidthChange) return;
    const measure = () => {
      const inner = el.firstElementChild as HTMLElement | null;
      if (inner) onWidthChange(inner.clientWidth);
    };
    // In case the inner is added asynchronously
    const mo = new MutationObserver(measure);
    mo.observe(el, { childList: true, subtree: true });

    let ro: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
    // initial tick
    setTimeout(measure, 0);
    return () => {
      mo.disconnect();
      if (ro) ro.disconnect();
    };
  }, [onWidthChange]);

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    console.log('Google Login Success:', credentialResponse);

    if (credentialResponse.credential) {
      const idToken = credentialResponse.credential;
      // For debugging: decode the token on the client side
      // const decodedToken: DecodedToken = jwtDecode(idToken);
      // console.log("Decoded ID Token:", decodedToken);

      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (!apiBase) {
        console.error('FATAL: NEXT_PUBLIC_API_URL is not defined in .env');
      }

      let cookieConsentStr: string | null = null;
      let cookieConsentDateStr: string | null = null;
      let temporaryUserId = null;
      let chatId = null;

      try {
        cookieConsentStr = localStorage.getItem('cookie-consent');
        cookieConsentDateStr = localStorage.getItem('cookie-consent-date');
        temporaryUserId = localStorage.getItem('temporaryUserId') || null;
        chatId = localStorage.getItem('chatId') || null;
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      // Send the ID token to your backend for verification and user session management
      try {
        const payload: Record<string, any> = {
          temporaryUserId,
          chatId,
        };
        if (cookieConsentStr) {
          payload.cookieConsent = cookieConsentStr;
        }
        if (cookieConsentDateStr) {
          payload.cookieConsentDate = cookieConsentDateStr;
        }

        const response = await fetchWithInterceptor(
          `${apiBase}/api/auth/googleLogin`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response) return;

        if (response.ok) {
          const data = await response.json();
          if (data.user && data.auth) {
            login(data.user, data.auth);
            router.push('/');
            console.log('Backend login success:', data.user);
          } else {
            console.error('Backend login failed: No user data received', data);
          }
        } else {
          console.error('Backend login failed:', response);
        }
      } catch (error) {
        console.error('Error sending token to backend:', error);
        alert('An error occurred during login.');
      }
    } else {
      console.error('Google Login Error: No credential received');
      alert('Google login failed: No credential received.');
    }
  };

  const handleLoginError = () => {
    console.error('Google Login Failed');
    alert('Google login failed. Please try again.');
  };

  if (user) {
    console.log('User is already logged in:', user);
    return null;
  }

  return (
    <div ref={containerRef} className="w-full">
      <GoogleLogin
        key={buttonWidth}
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
        text={isSignIn ? 'signin_with' : 'signup_with'}
        logo_alignment="center"
        size="large"
        width={buttonWidth}
      />
    </div>
  );
};

export default GoogleSignInButton;
