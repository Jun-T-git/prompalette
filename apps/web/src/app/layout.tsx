import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';

import { SessionProvider } from '@/components/providers/SessionProvider';
import { authOptions } from '@/lib/auth';

import '@prompalette/ui/styles.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PromPalette - AIプロンプト管理の新しいスタンダード',
  description: 'ウェブとデスクトップで使える、プロンプト管理のためのオールインワンプラットフォーム。⌘+Ctrlでどこからでも瞬時にアクセス、お気に入りプロンプトは即座にペースト。',
  keywords: [
    'AIプロンプト',
    'プロンプト管理',
    'AI効率化',
    'ワークフロー',
    'ChatGPT',
    'Claude',
    'Gemini',
    'macOS',
    'デスクトップアプリ',
    'ホットキー',
    '生産性',
    'AI',
    'プロンプトテンプレート'
  ],
  authors: [{ name: 'PromPalette Team' }],
  creator: 'PromPalette',
  publisher: 'PromPalette',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://prompalette.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PromPalette - AIプロンプト管理の新しいスタンダード',
    description: 'ウェブとデスクトップで使える、プロンプト管理のためのオールインワンプラットフォーム。⌘+Ctrlでどこからでも瞬時にアクセス、お気に入りプロンプトは即座にペースト。',
    url: 'https://prompalette.com',
    siteName: 'PromPalette',
    images: [
      {
        url: '/og-image.png',
        width: 1080,
        height: 1080,
        alt: 'PromPalette - AIプロンプト管理ツール',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromPalette - AIプロンプト管理の新しいスタンダード',
    description: 'ウェブとデスクトップで使える、プロンプト管理のためのオールインワンプラットフォーム。⌘+Ctrlでどこからでも瞬時にアクセス、お気に入りプロンプトは即座にペースト。',
    images: ['/og-image.png'],
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
  category: 'productivity',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon-192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/favicon-512.png" sizes="512x512" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}