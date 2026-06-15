import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'SmartStock — AI Inventory & Waste Management',
    template: '%s | SmartStock',
  },
  description:
    'AI-powered inventory management system for small businesses. Predict demand, eliminate waste, and automate restocking — built for SMEs.',
  keywords: ['inventory management', 'AI forecasting', 'waste reduction', 'FIFO', 'small business'],
  authors: [{ name: 'SmartStock' }],
  robots: 'noindex, nofollow', // internal tool
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            duration: 5000,
            style: {
              background: 'oklch(0.15 0.02 265 / 0.9)',
              border: '1px solid oklch(0.30 0.025 265 / 0.6)',
              backdropFilter: 'blur(12px)',
            },
          }}
        />
      </body>
    </html>
  );
}
