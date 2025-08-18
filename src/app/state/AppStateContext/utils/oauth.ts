import type { OAuthProvider } from '@/types';

export function buildOAuthUrl(
  provider: OAuthProvider,
  redirectUri: string,
): string {
  switch (provider) {
    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&state=${provider}`;
    case 'apple':
      return `https://appleid.apple.com/auth/authorize?client_id=${process.env.NEXT_PUBLIC_APPLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=name%20email&response_mode=form_post&state=${provider}`;
    case 'linkedin':
      return `https://www.linkedin.com/oauth/v2/authorization?client_id=${process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=r_liteprofile%20r_emailaddress&state=${provider}`;
    default:
      throw new Error(`Unknown OAuth provider: ${provider}`);
  }
}
