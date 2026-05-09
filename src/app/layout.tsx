import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import Script from 'next/script';
import '../styles/tailwind.css';
import ThemeSwitcher from '../components/ThemeSwitcher';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'outlier — AI Video Script Research Engine',
  description:
    'Submit a topic, let outlier research the web and generate a structured video script with verified source screenshots — ready to shoot.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${ibmPlexMono.variable}`}>
      <body className={plusJakartaSans.className}>
        {children}

        <ThemeSwitcher />

        <Script
          id="rocket-web"
          src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fscriptforg4662back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18"
          strategy="afterInteractive"
          type="module"
        />
        <Script
          id="rocket-shot"
          src="https://static.rocket.new/rocket-shot.js?v=0.0.2"
          strategy="lazyOnload"
          type="module"
        />
      </body>
    </html>
  );
}
