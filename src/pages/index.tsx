import { GoogleOAuthProvider } from '@react-oauth/google';

import { AppStateProvider } from '@/context/AppStateContext';
import { Workbench } from '@/components/workbench/Workbench';
import { AuthProvider } from '@/context/AuthContext';

export default function Home() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error('FATAL: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in .env');
  }

  return (
    <>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <AppStateProvider>
              <Workbench />
            </AppStateProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      ) : (
        <AuthProvider>
          <AppStateProvider>
            <Workbench />
          </AppStateProvider>
        </AuthProvider>
      )}
    </>
  );
}
