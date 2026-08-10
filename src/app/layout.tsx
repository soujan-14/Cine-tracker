import type { Metadata } from 'next';
import Script from 'next/script';
import '@/styles/globals.css';
import { ReactQueryProvider } from '@/providers/react-query-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'Cine Tracker',
    template: '%s | Cine Tracker',
  },
  description: 'Track trending movies, box office data, and discover new films with Cine Tracker — your premium movie analytics experience.',
  keywords: ['movies', 'box office', 'trending', 'film tracker', 'TMDB', 'cinema'],
  authors: [{ name: 'Soujan' }],
  creator: 'Soujan',
  metadataBase: new URL('https://cinetracker.app'),
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo.png', type: 'image/png', sizes: 'any' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/logo.svg' },
    ],
    shortcut: ['/favicon.png'],
  },
  openGraph: {
    type: 'website',
    siteName: 'Cine Tracker',
    title: 'Cine Tracker — Premium Box Office Intelligence',
    description: 'Track trending movies, box office data, and discover new films.',
    images: [
      { url: '/logo-full.png', width: 1280, height: 720, type: 'image/png' },
      { url: '/logo-full.svg', width: 800, height: 512, type: 'image/svg+xml' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cine Tracker',
    description: 'Track trending movies and box office data.',
    images: ['/logo-full.png', '/logo-full.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="storage-polyfill" strategy="beforeInteractive">
          {`(function () {
            if (typeof window === 'undefined') return;
            const createStorage = () => {
              const store = new Map();
              return {
                getItem(key) {
                  return store.has(key) ? store.get(key) : null;
                },
                setItem(key, value) {
                  store.set(String(key), String(value));
                },
                removeItem(key) {
                  store.delete(String(key));
                },
                clear() {
                  store.clear();
                },
                key(index) {
                  return Array.from(store.keys())[index] ?? null;
                },
                get length() {
                  return store.size;
                },
              };
            };

            if (!window.localStorage || typeof window.localStorage.getItem !== 'function') {
              window.localStorage = createStorage();
            }
            if (!window.sessionStorage || typeof window.sessionStorage.getItem !== 'function') {
              window.sessionStorage = createStorage();
            }
          })();`}
        </Script>
        <ReactQueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
