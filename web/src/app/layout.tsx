import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Georgia Gas Stations | Market Analysis Dashboard',
  description: 'Interactive map visualization of 554 gas stations across Georgia. Strategic analysis of SGP, Gulf, Wissol, Rompetrol, and Lukoil market positions.',
  keywords: ['Georgia', 'gas stations', 'fuel', 'SGP', 'Gulf', 'Wissol', 'market analysis', 'map'],
  authors: [{ name: 'Gas Station Analysis Team' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Georgia Gas Stations | Market Analysis Dashboard',
    description: 'Interactive map of 554 stations with strategic insights',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
