import { useState, useEffect } from 'react';
import type { User, OAuthProvider } from '@/types';
import { buildOAuthUrl } from '../utils/oauth';
import { apiService } from '@/lib/api';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  loginLoading: boolean;
  loadingProvider: OAuthProvider | null;
  handleLogin: (provider: OAuthProvider) => Promise<void>;
  handleLogout: () => void;
}

export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(
    null,
  );

  // Load user from localStorage on mount
  useEffect(() => {
    const isGuest = localStorage.getItem('isGuestSession') === 'true';
    if (isGuest) {
      // Guest session - don't load saved user
      setUser(null);
      return;
    }

    const savedUser =
      typeof window !== 'undefined'
        ? localStorage.getItem('resumeBuilder_user')
        : null;
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setUser(parsedUser);
        setShowLoginModal(false);
      } catch {
        localStorage.removeItem('resumeBuilder_user');
      }
    }
  }, []);

  const handleLogin = async (provider: OAuthProvider) => {
    setLoginLoading(true);
    setLoadingProvider(provider);
    try {
      const redirectUri = encodeURIComponent(
        window.location.origin + '/auth/callback',
      );

      const hasAny =
        !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        !!process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ||
        !!process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;

      if (!hasAny) {
        // Mock login flow
        await new Promise((r) => setTimeout(r, 800));
        const mockUsers: Record<OAuthProvider, User> = {
          google: {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@gmail.com',
            avatar:
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
            provider: 'google',
          },
          apple: {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@icloud.com',
            provider: 'apple',
          },
          linkedin: {
            id: '3',
            name: 'Michael Chen',
            email: 'michael.chen@company.com',
            avatar:
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format',
            provider: 'linkedin',
          },
        };
        const userData = mockUsers[provider];
        setUser(userData);
        localStorage.setItem('resumeBuilder_user', JSON.stringify(userData));
        localStorage.removeItem('isGuestSession');
        setShowLoginModal(false);
      } else {
        // Real OAuth flow
        const authUrl = buildOAuthUrl(provider, redirectUri);
        window.location.href = authUrl;
      }
    } finally {
      setLoginLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleLogout = async () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      await apiService.logout();
      localStorage.removeItem('resumeBuilder_user');
      localStorage.removeItem('temporaryUserId');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('chatId');
      typeof window !== 'undefined' && window.location.reload();
    }
    setShowLoginModal(true);
  };

  return {
    user,
    setUser,
    showLoginModal,
    setShowLoginModal,
    loginLoading,
    loadingProvider,
    handleLogin,
    handleLogout,
  };
}
