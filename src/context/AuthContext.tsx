'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { googleLogout } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { fetchWithInterceptor } from '@/lib/fetchWithInterceptor';

interface User {
  _id: string;
  email: string;
  name?: string;
  profilePictureUrl?: string;
  cookieConsentDate?: Date;
  cookieConsent?: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  provider?: 'google' | 'apple' | 'linkedin';
}

interface Auth {
  jwtToken?: string;
  refreshToken?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, authData: Auth) => void;
  logout: () => Promise<void>;
  checkUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    setIsLoading(true);
    try {
      const backendBasePath = process.env.NEXT_PUBLIC_API_URL;
      if (!backendBasePath) {
        console.error('FATAL: NEXT_PUBLIC_API_URL is not defined in .env');
      }

      const jwtToken = localStorage.getItem('jwtToken');
      const isGuest = localStorage.getItem('isGuestSession') === 'true';
      if (!jwtToken || isGuest) {
        // No auth token or guest token => treat as not logged in
        setUser(null);
        return;
      }

      const response = await fetchWithInterceptor(
        `${backendBasePath}/api/users/profile`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      if (!response) return;

      if (response.ok) {
        const userData = await response.json();
        if (userData.cookieConsentDate) {
          localStorage.setItem(
            'cookie-consent-date',
            JSON.stringify(userData.cookieConsentDate),
          );
        }
        if (userData.cookieConsent) {
          localStorage.setItem(
            'cookie-consent',
            JSON.stringify(userData.cookieConsent),
          );
        }

        setUser((prev) => ({ ...userData, provider: prev?.provider }));
      } else {
        setUser(null);
        if (response.status !== 401) {
          console.log('Failed to fetch user status:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User, authData: Auth) => {
    const { jwtToken, refreshToken } = authData;
    if (!jwtToken || !refreshToken) {
      console.error('Login failed: No JWT token or refresh token provided');
      return;
    }

    localStorage.setItem('jwtToken', jwtToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.removeItem('isGuestSession');

    // Detect OAuth provider from server response fields
    const raw = userData as any;
    let provider: 'google' | 'linkedin' | 'apple' | undefined;
    if (raw?.googleId) provider = 'google';
    else if (raw?.linkedinId) provider = 'linkedin';
    else if (raw?.appleId) provider = 'apple';

    setUser({ ...userData, provider });
    try {
      window.dispatchEvent(new CustomEvent('authLoggedIn'));
    } catch {}
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const backendBasePath = process.env.NEXT_PUBLIC_API_URL;
      if (!backendBasePath) {
        console.error('FATAL: NEXT_PUBLIC_API_URL is not defined in .env');
      }

      const refreshToken = localStorage.getItem('refreshToken');
      const authToken = localStorage.getItem('jwtToken');

      const response = await fetchWithInterceptor(
        `${backendBasePath}/api/auth/logout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            refreshToken: refreshToken,
          }),
        },
      );

      if (!response) return;

      if (!response.ok) {
        throw new Error('Failed to logout the user');
      }

      localStorage.removeItem('jwtToken');
      localStorage.removeItem('refreshToken');
      googleLogout();
      router.push('/');

      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
      try {
        window.dispatchEvent(new CustomEvent('authLoggedOut'));
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, checkUserStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
