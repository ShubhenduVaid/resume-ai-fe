export function buildLinkedInLoginUrl(apiBase: string): string {
  try {
    const params = new URLSearchParams();
    const tempId = localStorage.getItem('temporaryUserId');
    const chatId = localStorage.getItem('chatId');
    const cc = localStorage.getItem('cookie-consent');
    const ccd = localStorage.getItem('cookie-consent-date');
    if (tempId) params.set('temporaryUserId', tempId);
    if (chatId) params.set('chatId', chatId);
    if (cc) params.set('cookieConsent', cc);
    if (ccd) params.set('cookieConsentDate', ccd);
    const qs = params.toString();
    return `${apiBase}/api/auth/linkedinLogin${qs ? `?${qs}` : ''}`;
  } catch {
    return `${apiBase}/api/auth/linkedinLogin`;
  }
}
