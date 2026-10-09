import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'La Cajita · Backoffice Administrativo',
    short_name: 'Admin Cajita',
    description: 'Panel de control de pedidos, inventario, ventas y clientes de Pimentones La Cajita.',
    lang: 'es-CO',
    start_url: '/admin',
    scope: '/admin',
    display: 'standalone',
    background_color: '#1a1714',
    theme_color: '#c0291f',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
