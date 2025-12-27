import 'styles/global.scss';

import React from 'react';
import type { Viewport, Metadata } from 'next';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta property="og:locale" content="en_US" />
      </head>

      <body>
        {children}
      </body>
    </html>
  );
}

export const metadata = {
  title: 'Luke’s Wandrer',
} satisfies Metadata;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
} satisfies Viewport;
