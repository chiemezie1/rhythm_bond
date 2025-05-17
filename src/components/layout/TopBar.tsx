'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import SearchBar from '../common/SearchBar';

export default function TopBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);

  // Handle clicking outside of menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Handle profile menu
      if (isProfileMenuOpen &&
          profileMenuRef.current &&
          profileButtonRef.current &&
          !profileMenuRef.current.contains(target) &&
          !profileButtonRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }

      // Handle notifications menu
      if (isNotificationsOpen &&
          notificationsMenuRef.current &&
          notificationsButtonRef.current &&
          !notificationsMenuRef.current.contains(target) &&
          !notificationsButtonRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    }

    // Add the event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen, isNotificationsOpen]);

  // Close menus when clicking on links or buttons inside them
  const closeMenus = () => {
    setIsProfileMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-topbar bg-dark-lighter/95 backdrop-blur-sm dark:bg-dark-lighter/95 z-50 border-b border-dark-lightest flex items-center justify-between px-4 py-1">
      {/* Logo - Hidden when search is expanded on mobile */}
      <div className={`flex items-center ${isSearchExpanded ? 'hidden sm:flex' : 'flex'} ml-2 md:ml-0`}>
        <Link href="/">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="RhythmBond Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold text-xl hidden md:block">RhythmBond</span>
          </div>
        </Link>
      </div>

      {/* Search Bar */}
      <div className={`${isSearchExpanded ? 'flex-1' : 'flex-1 max-w-xl'} mx-4 transition-all duration-300`}>
        <div className="relative flex items-center">
          {!isSearchExpanded && (
            <button
              className="md:hidden mr-2 p-1 rounded-full hover:bg-dark-lightest"
              onClick={() => setIsSearchExpanded(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          <div className="flex-1">
            <SearchBar
              placeholder="Search tracks, artists, users..."
              onSearch={(query) => {
                window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                setIsSearchExpanded(false);
              }}
            />
          </div>

          {isSearchExpanded && (
            <button
              className="absolute right-3 top-1.5 md:hidden bg-dark-lightest rounded-full p-1"
              onClick={() => setIsSearchExpanded(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* User Profile - Hidden when search is expanded on mobile */}
      <div className={`flex items-center gap-4 ${isSearchExpanded ? 'hidden sm:flex' : 'flex'}`}>
        {/* Notifications - Only visible when authenticated */}
        {isAuthenticated && (
          <div className="relative">
            <button
              ref={notificationsButtonRef}
              className="relative hover:bg-dark-lightest p-2 rounded-full"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileMenuOpen(false); // Close profile menu when opening notifications
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div
                ref={notificationsMenuRef}
                className="absolute right-0 mt-2 w-80 bg-dark-lighter dark:bg-dark-lighter rounded-lg shadow-lg py-1 z-50 border border-dark-lightest max-h-[80vh] overflow-y-auto"
              >
                <div className="px-4 py-2 border-b border-dark-lightest flex justify-between items-center">
                  <h3 className="font-medium">Notifications</h3>
                  <button
                    className="text-xs text-primary hover:underline"
                    onClick={() => {
                      alert('Marked all as read!');
                      closeMenus();
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <button
                    className="w-full text-left p-4 border-b border-dark-lightest hover:bg-dark-lightest"
                    onClick={() => {
                      alert('Opening shared playlist...');
                      closeMenus();
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-medium">Sarah</span> shared a playlist with you</p>
                        <p className="text-xs text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                  </button>
                  <button
                    className="w-full text-left p-4 border-b border-dark-lightest hover:bg-dark-lightest"
                    onClick={() => {
                      alert('Viewing Mike\'s profile...');
                      closeMenus();
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-medium">Mike</span> started following you</p>
                        <p className="text-xs text-gray-400">Yesterday</p>
                      </div>
                    </div>
                  </button>
                  <button
                    className="w-full text-left p-4 hover:bg-dark-lightest"
                    onClick={() => {
                      alert('Opening Discover playlist...');
                      closeMenus();
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm">Weekly <span className="font-medium">Discover</span> playlist updated</p>
                        <p className="text-xs text-gray-400">3 days ago</p>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="p-2 border-t border-dark-lightest text-center">
                  <button
                    className="text-sm text-primary hover:underline w-full py-1"
                    onClick={() => {
                      alert('View all notifications feature coming soon!');
                      closeMenus();
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upgrade Button - Only visible when authenticated and on larger screens */}
        {isAuthenticated && (
          <Link
            href="/premium"
            className="hidden md:block text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              alert('Premium features coming soon!');
            }}
          >
            Upgrade
          </Link>
        )}

        {/* Profile Dropdown or Login Button */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              ref={profileButtonRef}
              className="flex items-center gap-2 hover:bg-dark-lightest p-1 rounded-full"
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsNotificationsOpen(false); // Close notifications when opening profile menu
              }}
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
              )}
              <span className="hidden md:block">{user.name || "User"}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-gray-400 hidden md:block transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                ref={profileMenuRef}
                className="absolute right-0 mt-2 w-56 bg-dark-lighter dark:bg-dark-lighter rounded-lg shadow-lg py-1 z-50 border border-dark-lightest max-h-[80vh] overflow-y-auto"
              >
                <div className="px-4 py-2 border-b border-dark-lightest">
                  <p className="font-medium">{user?.name || "User"}</p>
                  <p className="text-sm text-gray-400">{user?.email || ""}</p>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-dark-lightest"
                  onClick={closeMenus}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                <Link
                  href="/library"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-dark-lightest"
                  onClick={closeMenus}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  Your Library
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-dark-lightest"
                  onClick={closeMenus}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <div className="border-t border-dark-lightest mt-1 pt-1">
                  <button
                    className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest text-red-500"
                    onClick={() => {
                      logout();
                      closeMenus();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}
