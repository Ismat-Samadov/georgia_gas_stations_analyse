import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Color Palette Generator - Create Beautiful Color Schemes | Free Online Tool",
  description: "Generate stunning color palettes for your design projects. Copy hex codes instantly, create beautiful color combinations, and discover perfect color schemes for web design, UI/UX, and graphic design. Free online color generator.",
  keywords: ["color palette", "color generator", "hex codes", "color schemes", "design tools", "color picker", "web design", "UI design", "color combinations"],
  authors: [{ name: "Color Palette Generator" }],
  creator: "Color Palette Generator",
  publisher: "Color Palette Generator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://colorpalette.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Color Palette Generator - Create Beautiful Color Schemes",
    description: "Generate stunning color palettes for your design projects. Copy hex codes instantly and create beautiful color combinations with our free online tool.",
    url: 'https://colorpalette.vercel.app',
    siteName: 'Color Palette Generator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Color Palette Generator - Beautiful Color Schemes',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Color Palette Generator - Create Beautiful Color Schemes",
    description: "Generate stunning color palettes for your design projects. Copy hex codes instantly and create beautiful color combinations.",
    images: ['/og-image.png'],
    creator: '@colorpalette',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ColorGen" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Color Palette Generator" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
