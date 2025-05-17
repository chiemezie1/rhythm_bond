'use client';

import { useState, useEffect } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import MiniPlayer from '../player/MiniPlayer';
import Footer from './Footer';
import YouTubePlayer from '../player/YouTubePlayer';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/contexts/MusicContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const { isPlaying, currentTrack, togglePlay } = useMusic();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(true);

  // Make functions available to the window object for other components
  if (typeof window !== 'undefined') {
    (window as any).setShowYouTubePlayer = setShowYouTubePlayer;
    (window as any).showYouTubePlayer = showYouTubePlayer;
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only run this if the mobile menu is open
      if (!isMobileMenuOpen) return;

      const target = event.target as HTMLElement;
      const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

      // Check if the click was outside the mobile menu and not on the toggle button
      if (
        !target.closest('.mobile-menu') &&
        mobileMenuToggle &&
        !mobileMenuToggle.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-dark text-white">
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 pt-topbar">
        {/* Sidebar - Hidden on mobile, only visible when authenticated */}
        {isAuthenticated ? (
          <div className="hidden md:block w-64 fixed left-0 top-topbar z-40 overflow-y-auto border-r border-dark-lightest">
            <Sidebar />
          </div>
        ) : null}

        {/* Mobile Menu Toggle - Only visible on mobile when authenticated */}
        {isAuthenticated ? (
          <button
            id="mobile-menu-toggle"
            className="md:hidden fixed top-topbar left-4 z-50 p-2 rounded-full bg-primary text-white shadow-md hover:bg-primary-dark transition-colors mt-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        ) : null}

        {/* Mobile Menu - Only visible on mobile when menu is open and authenticated */}
        {isAuthenticated && isMobileMenuOpen ? (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
            <div className="mobile-menu w-64 h-full bg-dark-lighter overflow-y-auto border-r border-dark-lightest">
              <div className="pt-14">
                <Sidebar />
              </div>
            </div>
          </div>
        ) : null}

        {/* Main Content */}
        <div className={`flex-1 ${isPlaying ? 'pb-player' : 'pb-footer'} ${isAuthenticated ? 'md:ml-64' : ''}`}>
          <main className="px-4 py-4">
            {children}
          </main>

          {/* Footer - Only visible when player is not showing */}
          {!isPlaying && <Footer />}
        </div>
      </div>

      {/* Mini Player - Only visible when a track is playing and user is authenticated */}
      {isPlaying && currentTrack && isAuthenticated && (
        <MiniPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
        />
      )}

      {/* YouTube Player - Hidden but playing audio */}
      {isPlaying && currentTrack && isAuthenticated && (
        <YouTubePlayer
          visible={false}
        />
      )}

      {/* Play Button - Fixed at bottom right, only visible when not playing and authenticated */}
      {!isPlaying && isAuthenticated && (
        <button
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-lg z-40 transition-transform hover:scale-105"
          onClick={togglePlay}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
        </button>
      )}
    </div>
  );
}
