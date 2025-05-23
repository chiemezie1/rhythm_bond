'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from "@/components/layout/Layout";
import CreatePost from "@/components/social/CreatePost";
import SimplifiedSocialFeed from "@/components/social/SimplifiedSocialFeed";
import { useAuth } from '@/hooks/useAuth';

export default function SocialPage() {
  const { isAuthenticated, user } = useAuth();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') as 'all' | 'following' | 'trending' || 'all';
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'trending'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Set active tab from URL params
  useEffect(() => {
    if (filter && ['all', 'following', 'trending'].includes(filter)) {
      setActiveTab(filter as 'all' | 'following' | 'trending');
    }
  }, [filter]);



  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Social</span>
          </nav>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Social Feed</h1>
            <p className="text-gray-400">Connect with music lovers and share your favorite tracks</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-dark-lighter/50 rounded-xl p-1 border border-dark-lightest/30">
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-dark-lighter/50'
              }`}
              onClick={() => setActiveTab('all')}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
                </svg>
                All Posts
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'following'
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-dark-lighter/50'
              }`}
              onClick={() => setActiveTab('following')}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Following
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'trending'
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-dark-lighter/50'
              }`}
              onClick={() => setActiveTab('trending')}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Trending
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Create Post */}
            {isAuthenticated && (
              <div className="mb-8">
                <CreatePost />
              </div>
            )}

            {/* Social Feed */}
            <SimplifiedSocialFeed filter={activeTab} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Actions */}
            <div className="bg-dark-lighter/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-lightest/30">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/library"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-lighter/50 transition-colors text-gray-300 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span className="text-sm">Share a Playlist</span>
                </Link>
                <Link
                  href="/browse"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-lighter/50 transition-colors text-gray-300 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm">Discover Music</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-lighter/50 transition-colors text-gray-300 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">View Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


