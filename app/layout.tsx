import { RootProvider } from 'fumadocs-ui/provider/next';
import '@/public/global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Terp Network Docs',
    template: '%s | Terp Network Docs',
  },
  description: 'Documentation for Terp Network — CosmWasm smart contracts, validators, governance, and developer guides.',
  metadataBase: new URL('https://docs.terp.network'),
  openGraph: {
    type: 'website',
    siteName: 'Terp Network Docs',
    title: 'Terp Network Docs',
    description: 'Documentation for Terp Network — CosmWasm smart contracts, validators, governance, and developer guides.',
    images: [{ url: '/og-banner.svg', width: 1200, height: 630, alt: 'Terp Network' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terp Network Docs',
    description: 'Documentation for Terp Network',
    images: ['/og-banner.svg'],
  },
};

/**
 * Docs-only root: no React Query, no wallet, no calendar.
 * Wallet content is written guides under /docs/guides/authentication/wallets.
 */
export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <div aria-hidden="true" className="glyph-bg" />
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
