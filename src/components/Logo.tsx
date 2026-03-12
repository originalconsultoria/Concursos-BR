import React from 'react';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div className={`bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic ${className}`}>
    BR
  </div>
);
