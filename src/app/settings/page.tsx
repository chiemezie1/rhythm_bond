'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Define settings categories - simplified to only implemented features
const settingsCategories = [
  { id: 'account', name: 'Account', icon: 'user' },
  { id: 'appearance', name: 'Appearance', icon: 'appearance' },
  { id: 'about', name: 'About', icon: 'info' },
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('account');
  const { data: session } = useSession();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings Categories */}
          <div className="md:col-span-1">
            <div className="bg-dark-lighter rounded-xl p-4">
              <ul className="space-y-1">
                {settingsCategories.map((category) => (
                  <li key={category.id}>
                    <button
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                        activeCategory === category.id
                          ? 'bg-primary text-white'
                          : 'text-gray-300 hover:bg-dark-lightest hover:text-white'
                      }`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <SettingsIcon name={category.icon} active={activeCategory === category.id} />
                      <span>{category.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3">
            <div className="bg-dark-lighter rounded-xl p-6">
              {activeCategory === 'account' && <AccountSettings session={session} />}
              {activeCategory === 'appearance' && <AppearanceSettings />}
              {activeCategory === 'about' && <AboutSettings />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Settings Icon Component
function SettingsIcon({ name, active }: { name: string; active: boolean }) {
  const activeClass = active ? 'text-white' : 'text-gray-400';

  switch (name) {
    case 'user':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'appearance':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    case 'info':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
  }
}

// Settings Components
function AccountSettings({ session }: { session: any }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-dark-lightest">
            <Image
              src={session?.user?.image || '/images/logo.png'}
              alt="Profile Picture"
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg">{session?.user?.name || 'User'}</h3>
            <p className="text-gray-400">@{session?.user?.email?.split('@')[0] || 'user'}</p>
            <p className="text-sm text-gray-500 mt-1">Profile picture managed by your OAuth provider</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={session?.user?.email || 'Not available'}
              className="w-full bg-dark rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Email is managed by your OAuth provider</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={session?.user?.name || 'Not available'}
              className="w-full bg-dark rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Name is managed by your OAuth provider</p>
          </div>
          <div className="pt-4">
            <div className="bg-dark rounded-lg p-4 border border-gray-600">
              <h4 className="font-medium mb-2">Account Information</h4>
              <p className="text-sm text-gray-400">
                Your account is managed through OAuth authentication.
                To change your profile information, please update it through your OAuth provider
                (Google, GitHub, etc.) and then sign in again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('blue');

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Appearance Settings</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Theme</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={(e) => setTheme(e.target.value)}
                className="text-primary focus:ring-primary"
              />
              <span>Dark Theme (Current)</span>
            </label>
            <label className="flex items-center gap-3 opacity-50">
              <input
                type="radio"
                name="theme"
                value="light"
                disabled
                className="text-primary focus:ring-primary"
              />
              <span>Light Theme (Coming Soon)</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Accent Color</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
              { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
              { name: 'Green', value: 'green', color: 'bg-green-500' },
              { name: 'Red', value: 'red', color: 'bg-red-500' },
            ].map((color) => (
              <button
                key={color.value}
                onClick={() => setAccentColor(color.value)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  accentColor === color.value
                    ? 'border-primary bg-dark-lighter'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className={`w-6 h-6 rounded-full ${color.color} mx-auto mb-1`}></div>
                <span className="text-sm">{color.name}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Accent color changes will be available in a future update</p>
        </div>
      </div>
    </div>
  );
}

function AboutSettings() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">About</h2>
      <div className="space-y-6">
        <div className="bg-dark rounded-lg p-6 border border-gray-600">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src="/images/logo.png"
              alt="Rhythm Bond Logo"
              width={64}
              height={64}
              className="rounded-lg"
            />
            <div>
              <h3 className="text-xl font-bold">Rhythm Bond</h3>
              <p className="text-gray-400">Music Discovery & Social Platform</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span>1.0.0 Beta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Build:</span>
              <span>2024.01.15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Music Database:</span>
              <span>Local JSON (public/music.json)</span>
            </div>
          </div>
        </div>

        <div className="bg-dark rounded-lg p-6 border border-gray-600">
          <h4 className="font-medium mb-3">Features</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Music discovery and playback</li>
            <li>• Custom playlists and genres</li>
            <li>• Social features and sharing</li>
            <li>• User profiles and preferences</li>
            <li>• OAuth authentication</li>
          </ul>
        </div>

        <div className="bg-dark rounded-lg p-6 border border-gray-600">
          <h4 className="font-medium mb-3">Technology Stack</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Next.js 14 with App Router</li>
            <li>• TypeScript</li>
            <li>• Tailwind CSS</li>
            <li>• NextAuth.js</li>
            <li>• Prisma ORM</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
