"use client";

import React from 'react';

export default function RootLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        {/* Soft neutral pulsing dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-[#f2f3f6] rounded-full animate-[pulse_1.5s_infinite_ease-in-out_0s]" />
          <div className="w-2 h-2 bg-[#f2f3f6] rounded-full animate-[pulse_1.5s_infinite_ease-in-out_0.2s]" />
          <div className="w-2 h-2 bg-[#f2f3f6] rounded-full animate-[pulse_1.5s_infinite_ease-in-out_0.4s]" />
        </div>
        
        <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-[0.25em] ml-1">
          Loading
        </p>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            background-color: #f2f3f6;
          }
          50% { 
            transform: scale(1.1);
            background-color: #e0e0e0;
          }
        }
      `}</style>
    </div>
  );
}
