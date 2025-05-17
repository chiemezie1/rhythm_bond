'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HomeTabsProps {
  activeTab: 'home' | 'social';
  onTabChange: (tab: 'home' | 'social') => void;
}

export default function HomeTabs({ activeTab, onTabChange }: HomeTabsProps) {
  const pathname = usePathname();
  
  return (
    <div className="flex border-b border-gray-700 mb-6">
      <button
        className={`px-4 py-2 font-medium text-sm ${
          activeTab === 'home'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-400 hover:text-white'
        }`}
        onClick={() => onTabChange('home')}
      >
        Home
      </button>
      <button
        className={`px-4 py-2 font-medium text-sm ${
          activeTab === 'social'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-400 hover:text-white'
        }`}
        onClick={() => onTabChange('social')}
      >
        Social
      </button>
    </div>
  );
}
