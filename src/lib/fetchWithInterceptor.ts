export async function fetchWithInterceptor(
  input: RequestInfo,
  init?: RequestInit,
) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const headers = new Headers(init?.headers);

  // Attach Authorization header if not explicitly provided and a jwtToken exists
  try {
    const hasAuthHeader = headers.has('Authorization');
    if (!hasAuthHeader && typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('jwtToken');
      if (jwtToken) headers.set('Authorization', `Bearer ${jwtToken}`);
    }
  } catch {}

  const newInit: RequestInit = { ...init, headers };

  let res = await fetch(input, newInit);

  if (typeof window !== 'undefined') {
    if (res.status === 429) {
      const response = await res.json();
      const { count, limit, message, nextSlotAvailableAt } = response;
      const event = new CustomEvent('apiError', {
        detail: {
          message,
          count,
          limit,
          nextSlotAvailableAt,
        },
      });
      window.dispatchEvent(event);
      return null;
    }
    if (res.status === 401 && API_BASE) {
      // Attempt refresh flow
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshHeaders = new Headers({
            Authorization: `Bearer ${refreshToken}`,
          });
          const refreshOpts: RequestInit = {
            method: 'POST',
            headers: refreshHeaders,
          };
          const refreshRes = await fetch(
            `${API_BASE}/api/auth/refresh`,
            refreshOpts,
          );
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (data?.auth?.jwtToken && data?.auth?.refreshToken) {
              localStorage.setItem('jwtToken', data.auth.jwtToken);
              localStorage.setItem('refreshToken', data.auth.refreshToken);
              // Retry original request with new token
              const retryHeaders = new Headers(newInit.headers);
              retryHeaders.set('Authorization', `Bearer ${data.auth.jwtToken}`);
              const retryOpts: RequestInit = {
                ...newInit,
                headers: retryHeaders,
              };
              res = await fetch(input, retryOpts);
              return res;
            }
          }
        }
        // Fallback: bootstrap reissue for same temp user
        const tempId = localStorage.getItem('temporaryUserId');
        if (tempId) {
          const bootHeaders = new Headers();
          const bootOpts: RequestInit = { headers: bootHeaders };
          const bootRes = await fetch(
            `${API_BASE}/api/bootstrap?temporaryUserId=${encodeURIComponent(
              tempId,
            )}`,
            bootOpts,
          );
          if (bootRes.ok) {
            const boot = await bootRes.json();
            if (boot?.jwtToken && boot?.refreshToken) {
              localStorage.setItem('jwtToken', boot.jwtToken);
              localStorage.setItem('refreshToken', boot.refreshToken);
              if (boot.temporaryUserId) {
                localStorage.setItem(
                  'temporaryUserId',
                  String(boot.temporaryUserId),
                );
              }
              if (boot.chatId) {
                localStorage.setItem('chatId', String(boot.chatId));
              }
              // Retry original request with new token
              const retryHeaders = new Headers(newInit.headers);
              retryHeaders.set('Authorization', `Bearer ${boot.jwtToken}`);
              const retryOpts: RequestInit = {
                ...newInit,
                headers: retryHeaders,
              };
              res = await fetch(input, retryOpts);
              return res;
            }
          }
        }
      } catch (e) {
        console.warn('Auth refresh/bootstrap failed:', e);
      }
      // If we couldn't refresh/reissue, fall through to original 401 response
      return res;
    }
    if (res.status === 500) {
      const response = await res.json();
      const { status, message } = response;
      if (status === '401') {
        if (message) {
          const _message = JSON.parse(message);
          if (_message.status === '401') {
            const event = new CustomEvent('authError', {
              detail: {
                message: _message.message,
              },
            });
            window.dispatchEvent(event);
            return null;
          }
        }
      }
    }
  }
  return res;
}
