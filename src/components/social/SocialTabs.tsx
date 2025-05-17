'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SocialTabs() {
  const [activeTab, setActiveTab] = useState('feed');
  
  const tabs = [
    { id: 'feed', name: 'Feed', path: '/social' },
    { id: 'friends', name: 'Friends', path: '/social/friends' },
    { id: 'discover', name: 'Discover', path: '/social/discover' },
    { id: 'messages', name: 'Messages', path: '/social/messages' },
    { id: 'notifications', name: 'Notifications', path: '/social/notifications' },
  ];
  
  return (
    <div className="border-b border-dark-lightest">
      <div className="flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.path}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-white hover:border-dark-lightest'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
