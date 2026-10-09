import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/bricolage-grotesque';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tracker } from '@/components/Tracker';
import { SiteChrome } from '@/components/SiteChrome';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'La Cajita · Backoffice Administrativo', template: '%s · Admin La Cajita' },
  description: 'Panel de control de pedidos, inventario, ventas y clientes de Pimentones La Cajita.',
  openGraph: { type: 'website', locale: 'es_CO', siteName: 'La Cajita Backoffice', images: ['/og.jpg'] },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.png', apple: '/icon-192.png' },
  manifest: '/manifest.webmanifest',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#1a1714' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" data-scroll-behavior="smooth">
      <body>
        <Tracker />
        <SiteChrome><Header /></SiteChrome>
        <main id="contenido">{children}</main>
        <SiteChrome>
          <Footer />
          <FloatingWhatsApp />
        </SiteChrome>
      </body>
    </html>
  );
}
