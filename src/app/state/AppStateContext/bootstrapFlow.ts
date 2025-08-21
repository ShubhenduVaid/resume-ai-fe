import { apiService } from '@/lib/api';

interface ApplyFns {
  setCreditsRemaining: (n: number) => void;
  setChatHistory: (arr: any[]) => void;
  setMarkdownContent: (s: string) => void;
  setDocumentTitle: (s: string) => void;
}

/**
 * Runs the app bootstrap flow. It:
 * - Calls /api/bootstrap (optionally with temporaryUserId)
 * - Persists tokens and ids
 * - Updates credits and chat history
 */
export async function bootstrapFlow(apply: ApplyFns, isMounted: () => boolean) {
  const existingUserId =
    typeof window !== 'undefined'
      ? localStorage.getItem('temporaryUserId')
      : null;

  const { data } = await apiService.bootstrap(existingUserId);
  if (!isMounted() || !data) return;

  if (data.isAuthenticated === false) {
    // Guest bootstrap: store tokens and ids
    localStorage.setItem('temporaryUserId', String(data.temporaryUserId));
    localStorage.setItem('chatId', String(data.chatId));
    localStorage.setItem('isGuestSession', 'true');
    try {
      window.dispatchEvent(
        new CustomEvent('guestSessionChanged', { detail: { isGuest: true } }),
      );
    } catch {}
    if (data.jwtToken) {
      localStorage.setItem('jwtToken', data.jwtToken);
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (typeof data.credits === 'number') {
      apply.setCreditsRemaining(data.credits);
      try {
        localStorage.setItem('creditsRemaining', String(data.credits));
      } catch {}
    }
    if (data.chatTitle) {
      apply.setDocumentTitle(data.chatTitle);
    }

    const hist = await apiService.getChatHistory(
      String(data.chatId),
      existingUserId,
    );
    if (hist.data && isMounted()) {
      const arr = hist.data || [];
      apply.setChatHistory(arr);
      // Set current resume content from the latest snapshot in history
      const latest = [...arr].reverse().find((m: any) => m?.resumeSnapshot);
      if (latest?.resumeSnapshot)
        apply.setMarkdownContent(latest.resumeSnapshot);
    }
  } else if (data.isAuthenticated === true) {
    // Authenticated bootstrap
    if (data.isGuestUser) {
      // Server indicates this JWT belongs to a guest/temp user
      localStorage.setItem('isGuestSession', 'true');
      try {
        window.dispatchEvent(
          new CustomEvent('guestSessionChanged', { detail: { isGuest: true } }),
        );
      } catch {}
      // Keep temporaryUserId to preserve guest identity
    } else {
      localStorage.removeItem('temporaryUserId');
      localStorage.removeItem('isGuestSession');
      try {
        window.dispatchEvent(
          new CustomEvent('guestSessionChanged', {
            detail: { isGuest: false },
          }),
        );
      } catch {}
    }
    localStorage.setItem('chatId', String(data.chatId));
    if (typeof data.credits === 'number') {
      apply.setCreditsRemaining(data.credits);
      try {
        localStorage.setItem('creditsRemaining', String(data.credits));
      } catch {}
    }
    if (data.chatTitle) {
      apply.setDocumentTitle(data.chatTitle);
    }

    const hist = await apiService.getChatHistory(
      String(data.chatId),
      existingUserId,
    );
    if (hist.data && isMounted()) {
      const arr = hist.data || [];
      apply.setChatHistory(arr);
      const latest = [...arr].reverse().find((m: any) => m?.resumeSnapshot);
      if (latest?.resumeSnapshot)
        apply.setMarkdownContent(latest.resumeSnapshot);
    }
  }
}
