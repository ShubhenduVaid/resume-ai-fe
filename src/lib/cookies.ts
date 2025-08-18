export function setCookie(
  name: string,
  value: string,
  options?: { path?: string; maxAge?: number },
) {
  if (typeof document === 'undefined') return;
  const path = options?.path ?? '/';
  const maxAge = options?.maxAge != null ? `; max-age=${options.maxAge}` : '';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}${maxAge}`;
}
