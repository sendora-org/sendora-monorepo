import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SENDORA',
  description: '$SNDRA rises! 🚀 Building the best tool for Web3!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="SENDORA" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"
        />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="Author" content="Gary Shay" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="sendora.org" />
        <meta property="og:url" content="https://sendora.org/native-coins/1" />
        <meta property="og:site_name" content="SENDORA" />
        <meta
          property="og:image"
          content="https://sendora.org/adswrapperads3.png"
        />
        <meta
          property="og:description"
          content="🚀 Building the best tool for Web3!"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="SENDORA" />
        <meta name="twitter:title" content="sendora.org" />
        <meta
          name="twitter:description"
          content="🚀 Building the best tool for Web3!"
        />
        <meta
          name="twitter:image"
          content="https://sendora.org/adswrapperads3.png"
        />
        <meta name="full-screen" content="yes" />
        <meta name="browsermode" content="application" />
        <meta name="x5-orientation" content="portrait" />
        <meta name="x5-fullscreen" content="true" />
        <meta name="x5-page-mode" content="app" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>

        <script
          defer
          src="https://assets.onedollarstats.com/stonks.js"
          data-debug="sendora.org"
        />
      </body>
    </html>
  );
}
