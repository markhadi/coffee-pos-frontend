import type { Metadata } from 'next';
import './globals.css';
import QueryClientProviders from '@/providers/QueryClientProviders';

export const metadata: Metadata = {
  title: 'Coffee Shop POS',
  description: 'A modern Point of Sale system for coffee shops. Features include product management, order processing, payment handling, and sales reporting.',
  keywords: ['coffee shop', 'point of sale', 'POS system', 'inventory management', 'payment processing', 'sales reporting', 'order management'],
  authors: [
    {
      name: 'Markhadi',
      url: 'https://github.com/markhadi',
    },
  ],
  creator: 'Markhadi',
  publisher: 'Markhadi',
  applicationName: 'Coffee Shop POS',
  category: 'Point of Sale System',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryClientProviders>{children}</QueryClientProviders>
      </body>
    </html>
  );
}
