import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '@prompalette/ui/styles.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PromPalette - Your AI Prompts, Beautifully Organized',
  description: 'Save, organize, and share your AI prompts across all platforms',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}