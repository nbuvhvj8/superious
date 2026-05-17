import React from 'react';
import '../styles/tailwind.css';
import { ColorManager } from '@/components/ColorManager';
import ZoomManager from '@/components/ZoomManager';
import UpdaterManager from '@/components/UpdaterManager';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-outfit antialiased">
        <UpdaterManager />
        <ZoomManager />
        <ColorManager />
        {children}
      </body>
    </html>
  );
}
