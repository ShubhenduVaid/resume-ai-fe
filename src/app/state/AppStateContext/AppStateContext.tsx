import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User, OAuthProvider } from '@/types';
import { useChat, type ChatState } from '@/features/chat/useChat';

import { useAuthState } from './hooks/useAuthState';
import { useLayoutState } from './hooks/useLayoutState';
import { useResponsive } from './hooks/useResponsive';
import { useDnDFileCapture } from './hooks/useDnDFileCapture';
import {
  getUploadsConfig,
  type UploadsConfig,
  validateFiles,
  formatBytes,
} from '@/features/files/attachments';
import { toast } from '@/components/ui/sonner';
import { apiService } from '@/lib/api';
import { bootstrapFlow } from './bootstrapFlow';

// Separate auth-related properties from chat-related properties
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

// Layout-related properties
interface LayoutState {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isResizing: boolean;
  setIsResizing: (value: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
  isDragActive: boolean;
  setIsDragActive: (value: boolean) => void;
}

// The complete AppState combines auth, chat, and layout states
interface AppStateContextValue extends AuthState, ChatState, LayoutState {
  uploadsCfg: UploadsConfig | null;
  hasBootstrapped: boolean;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined,
);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();
  const layout = useLayoutState();
  const chat = useChat(auth.user);

  const [uploadsCfg, setUploadsCfg] = useState<UploadsConfig | null>(null);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Run bootstrap on mount. In development StrictMode, this may run twice
    // (preflight + real mount), which is safe and idempotent.
    const runBootstrap = () =>
      bootstrapFlow(
        {
          setCreditsRemaining: chat.setCreditsRemaining,
          setChatHistory: chat.setChatHistory,
          setMarkdownContent: chat.setMarkdownContent,
          setDocumentTitle: chat.setDocumentTitle,
        },
        () => mounted,
      ).finally(() => {
        if (mounted) setHasBootstrapped(true);
      });

    runBootstrap();

    // Also re-run after login/logout to refresh guest vs real session
    const onAuthChange = () => runBootstrap();
    window.addEventListener('authLoggedIn', onAuthChange);
    window.addEventListener('authLoggedOut', onAuthChange);

    // Fetch uploads config once and cache in module; set in context
    getUploadsConfig().then((cfg) => {
      if (!mounted) return;
      setUploadsCfg(cfg);
    });
    return () => {
      mounted = false;
      window.removeEventListener('authLoggedIn', onAuthChange);
      window.removeEventListener('authLoggedOut', onAuthChange);
    };
  }, []);

  // Handle responsive behavior
  useResponsive({
    setIsMobile: layout.setIsMobile,
    setSidebarCollapsed: layout.setSidebarCollapsed,
  });

  // Handle drag and drop file capture
  useDnDFileCapture({
    enabled: true,
    user: auth.user,
    onFiles: (files) => {
      chat.setPendingFiles((prev) => {
        if (!uploadsCfg) return [...prev, ...files];
        // Validate using raw File blobs if present
        const rawFiles = files.map((f) => f.file).filter((f): f is File => !!f);
        const { accepted, rejected } = validateFiles(rawFiles, uploadsCfg);
        for (const r of rejected) {
          if (r.reason === 'not_allowed') {
            toast.error(`Unsupported file type: ${r.file.name}`);
          } else if (r.reason === 'too_large') {
            toast.error(
              `File too large: ${r.file.name} (${formatBytes(r.file.size)}). Max ${formatBytes(
                uploadsCfg.maxBytes,
              )}`,
            );
          }
        }
        // Keep only attachments whose raw file passed validation
        const acceptedSet = new Set(
          accepted.map((f) => `${f.name}::${f.size}::${f.type}`),
        );
        const acceptedAttachments = files.filter((att) =>
          att.file
            ? acceptedSet.has(
                `${att.file.name}::${att.file.size}::${att.file.type}`,
              )
            : false,
        );
        if (uploadsCfg.maxFiles <= 1) {
          return acceptedAttachments.slice(0, 1);
        }
        const merged = [...prev, ...acceptedAttachments];
        return merged.slice(0, uploadsCfg.maxFiles);
      });
    },
    onFocusChatInput: () =>
      setTimeout(() => chat.chatInputRef.current?.focus(), 100),
    setIsDragActive: layout.setIsDragActive,
    setSidebarCollapsed: layout.setSidebarCollapsed,
    sidebarCollapsed: layout.sidebarCollapsed,
  });

  // (removed) local pending files buffering; we write directly to chat state now

  const value: AppStateContextValue = useMemo(
    () => ({
      // Auth state
      ...auth,
      // Enhanced logout that clears chat state
      handleLogout: () => {
        auth.handleLogout();
        chat.setChatHistory([]);
        chat.setMarkdownContent('');
        chat.setDocumentTitle('Untitled Resume');
        chat.setPendingFiles([]);
      },

      // Layout state
      ...layout,

      // Chat state (from useChat hook)
      ...chat,

      // Uploads
      uploadsCfg,

      // Bootstrap state
      hasBootstrapped,
    }),
    [auth, layout, chat, hasBootstrapped],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
