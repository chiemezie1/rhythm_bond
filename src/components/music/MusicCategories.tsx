'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMusic } from '@/contexts/MusicContext';

// Define music categories with YouTube genre mappings
const categories = [
  {
    id: 'afrobeats-global-pop',
    name: 'Afrobeats & Global Pop',
    description: 'Vibrant rhythms and melodies from Africa and around the world',
    url: '/genre/afrobeats-global-pop',
    coverUrl: '/images/man_with_headse.png',
    color: 'from-blue-500 to-purple-600',
  },
  {
    id: 'pop',
    name: 'Pop',
    description: 'Catchy, popular music with wide appeal',
    url: '/genre/pop',
    coverUrl: '/images/two_people_enjoying_music.png',
    color: 'from-green-500 to-teal-600',
  },
  {
    id: 'hip-hop-trap',
    name: 'Hip-Hop & Trap',
    description: 'Urban beats with powerful lyrics and bass',
    url: '/genre/hip-hop-trap',
    coverUrl: '/images/logo_bg_white.png',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'r-b',
    name: 'R&B',
    description: 'Smooth, soulful sounds with emotional depth',
    url: '/genre/r-b',
    coverUrl: '/images/logo.png',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'blues',
    name: 'Blues',
    description: 'Soulful expressions rooted in African-American history',
    url: '/genre/blues',
    coverUrl: '/images/man_with_headse.png',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'trending',
    name: 'Trending',
    description: 'Find your next favorite track',
    url: '/trending',
    coverUrl: '/images/two_people_enjoying_music.png',
    color: 'from-cyan-500 to-blue-600',
  },
];

export default function MusicCategories() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Browse Categories</h2>
        <Link href="/categories" className="text-sm text-primary hover:underline">
          See All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.url}
            className="relative overflow-hidden rounded-xl h-32 group"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-80`}></div>
            <div className="absolute inset-0 flex items-center p-4">
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl">{category.name}</h3>
                <p className="text-white text-sm opacity-90">{category.description}</p>
              </div>
              <div className="w-20 h-20 relative rounded-lg overflow-hidden shadow-lg transform rotate-12 group-hover:rotate-6 transition-transform">
                <Image
                  src={category.coverUrl}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* YouTube Attribution */}
      <div className="mt-4 text-right">
        <Link
          href="https://www.youtube.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-400"
        >
          Powered by YouTube
        </Link>
      </div>
    </div>
  );
}
