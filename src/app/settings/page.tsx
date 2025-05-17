'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';

// Define settings categories
const settingsCategories = [
  { id: 'account', name: 'Account', icon: 'user' },
  { id: 'profile', name: 'Profile', icon: 'profile' },
  { id: 'privacy', name: 'Privacy', icon: 'lock' },
  { id: 'notifications', name: 'Notifications', icon: 'bell' },
  { id: 'playback', name: 'Playback', icon: 'music' },
  { id: 'devices', name: 'Devices', icon: 'device' },
  { id: 'social', name: 'Social', icon: 'social' },
  { id: 'appearance', name: 'Appearance', icon: 'appearance' },
  { id: 'language', name: 'Language & Region', icon: 'globe' },
  { id: 'accessibility', name: 'Accessibility', icon: 'accessibility' },
  { id: 'about', name: 'About', icon: 'info' },
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('account');

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
              {activeCategory === 'account' && <AccountSettings />}
              {activeCategory === 'profile' && <ProfileSettings />}
              {activeCategory === 'privacy' && <PrivacySettings />}
              {activeCategory === 'notifications' && <NotificationSettings />}
              {activeCategory === 'playback' && <PlaybackSettings />}
              {activeCategory === 'devices' && <DevicesSettings />}
              {activeCategory === 'social' && <SocialSettings />}
              {activeCategory === 'appearance' && <AppearanceSettings />}
              {activeCategory === 'language' && <LanguageSettings />}
              {activeCategory === 'accessibility' && <AccessibilitySettings />}
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
    case 'profile':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'lock':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case 'bell':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
    case 'music':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    case 'device':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'social':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'appearance':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    case 'globe':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'accessibility':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

// Account Settings Component
function AccountSettings() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-dark-lightest">
            <Image
              src="/images/logo.png"
              alt="Profile Picture"
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg">John Doe</h3>
            <p className="text-gray-400">@johndoe</p>
            <button className="text-primary hover:underline text-sm mt-1">Change profile picture</button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value="john.doe@example.com"
              className="w-full bg-dark rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <input
              type="text"
              value="johndoe"
              className="w-full bg-dark rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              readOnly
            />
          </div>

          <div className="pt-4">
            <button className="text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg font-medium transition-colors">
              Change Password
            </button>
          </div>

          <div className="border-t border-dark-lightest pt-6 mt-6">
            <h3 className="font-bold text-lg mb-4">Subscription</h3>
            <div className="bg-dark rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Free Plan</p>
                  <p className="text-sm text-gray-400">Basic features with ads</p>
                </div>
                <button className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full text-sm font-medium">
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-lightest pt-6 mt-6">
            <h3 className="font-bold text-lg mb-4">Danger Zone</h3>
            <div className="bg-dark rounded-lg p-4 border border-red-800">
              <p className="text-sm text-gray-400 mb-3">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="text-red-500 hover:text-red-400 font-medium">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
