'use client';

import BackgroundBlob from './BackgroundBlob';
import Wave from './Wave';

export default function Layout({ children }) {
  return (
    <main className="min-h-screen bg-peach relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-candy-pink rounded-full filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-nba-orange rounded-full filter blur-3xl opacity-20 animate-blob-delayed"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-candy-pink rounded-full filter blur-3xl opacity-20 animate-blob-top-right"></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1/2 h-1/2 bg-nba-orange rounded-full filter blur-3xl opacity-20 animate-blob-middle"></div>
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1/2 h-1/2 bg-candy-pink rounded-full filter blur-3xl opacity-20 animate-blob-right"></div>
      </div>
      <BackgroundBlob />
      <Wave />
      <main className="relative max-w-[1024px] mx-auto flex flex-col items-center p-8">
        {children}
      </main>
    </main>
  );
} 