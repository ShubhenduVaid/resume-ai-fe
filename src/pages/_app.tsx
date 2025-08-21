import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import { Toaster } from '@/components/ui/sonner';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no"
        />
      </Head>
      <Component {...pageProps} />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
