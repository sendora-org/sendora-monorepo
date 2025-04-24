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
  description: '$SNDRA rises! 🚀 Building the best tool for Ethereum!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"
        />

        {/* ICON */}
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

        {/* <!-- HTML Meta Tags --> */}
        <title>sendora.org</title>
        <meta
          name="description"
          content="🚀 Building the best tool for Ethereum!"
        />

        {/* <!-- Facebook Meta Tags --> */}
        <meta property="og:url" content="https://sendora.org/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="$SNDRA" />
        <meta
          property="og:description"
          content="🚀 Building the best tool for Ethereum!"
        />
        <meta
          property="og:image"
          content="https://sendora.org/ads/wrapperads3.png"
        />

        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="sendora.org" />
        <meta property="twitter:url" content="https://sendora.org/" />
        <meta name="twitter:title" content="$SNDRA" />
        <meta
          name="twitter:description"
          content="🚀 Building the best tool for Ethereum!"
        />
        <meta
          name="twitter:image"
          content="https://sendora.org/ads/wrapperads3.png"
        />

        {/* other */}
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="Author" content="Gary Shay" />
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
