import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/AuthProvider';
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
    default: 'SellFlow.io — AI Inventory & Waste Management',
    template: '%s | SellFlow.io',
  },
  description:
    'AI-powered inventory management system for small businesses. Predict demand, eliminate waste, and automate restocking — built for SMEs.',
  keywords: ['inventory management', 'AI forecasting', 'waste reduction', 'FIFO', 'small business'],
  authors: [{ name: 'SellFlow.io' }],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster
            position="bottom-right"
            theme="system"
            richColors
            closeButton
            toastOptions={{
              duration: 5000,
              style: {
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                backdropFilter: 'blur(12px)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
