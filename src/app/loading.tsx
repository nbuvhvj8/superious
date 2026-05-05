import React from 'react';

export default function RootLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-primary uppercase tracking-widest animate-pulse">
          Loading outlier...
        </p>
      </div>
    </div>
  );
}
