import type { Metadata } from 'next';
import './globals.css';
import QueryClientProviders from '@/providers/QueryClientProviders';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Coffee Shop POS',
  description: 'A modern Point of Sale system for coffee shops. Features include product management, order processing, payment handling, and sales reporting.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QueryClientProviders>{children}</QueryClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
