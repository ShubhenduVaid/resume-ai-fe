import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/types/chat';

export interface AuthState {
  user: User | null;
  showLoginModal: boolean;
  loginLoading: boolean;
  loadingProvider: 'google' | 'apple' | 'linkedin' | null;
  handleLogin: (provider: 'google' | 'apple' | 'linkedin') => Promise<void>;
  handleLogout: () => void;
  setShowLoginModal: (v: boolean) => void;
}

/**
 * Handles local-storage backed mock auth used by the app.
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(true);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loadingProvider, setLoadingProvider] = useState<
    'google' | 'apple' | 'linkedin' | null
  >(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('resumeBuilder_user');
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

  const handleLogin = useCallback(
    async (provider: 'google' | 'apple' | 'linkedin') => {
      setLoginLoading(true);
      setLoadingProvider(provider);
      try {
        // Mock users as before
        await new Promise((r) => setTimeout(r, 800));
        const mockUsers: Record<string, User> = {
          google: {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@gmail.com',
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
            provider: 'linkedin',
          },
        };
        const u = mockUsers[provider];
        setUser(u);
        localStorage.setItem('resumeBuilder_user', JSON.stringify(u));
        setShowLoginModal(false);
      } finally {
        setLoginLoading(false);
        setLoadingProvider(null);
      }
    },
    [],
  );

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('resumeBuilder_user');
    setShowLoginModal(true);
  }, []);

  return {
    user,
    showLoginModal,
    loginLoading,
    loadingProvider,
    handleLogin,
    handleLogout,
    setShowLoginModal,
  };
}
