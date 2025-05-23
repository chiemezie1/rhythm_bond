'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import GenreMenu from './GenreMenu';

// Default categories for new users
const defaultCategories = [
  {
    id: 'afrobeats-global-pop',
    name: 'Afrobeats & Global Pop',
    description: 'Vibrant rhythms and melodies from Africa and around the world',
    url: '/genre/afrobeats',
    coverUrl: '/images/man_with_headse.png',
    color: '#6366f1', // Indigo
  },
  {
    id: 'pop',
    name: 'Pop',
    description: 'Catchy, popular music with wide appeal',
    url: '/genre/pop',
    coverUrl: '/images/two_people_enjoying_music.png',
    color: '#ec4899', // Pink
  },
  {
    id: 'hip-hop-trap',
    name: 'Hip-Hop & Trap',
    description: 'Urban beats with powerful lyrics and bass',
    url: '/genre/hiphop',
    coverUrl: '/images/logo_bg_white.png',
    color: '#f59e0b', // Amber
  },
  {
    id: 'r-b',
    name: 'R&B',
    description: 'Smooth, soulful sounds with emotional depth',
    url: '/genre/rnb',
    coverUrl: '/images/logo.png',
    color: '#8b5cf6', // Violet
  },
  {
    id: 'blues',
    name: 'Blues',
    description: 'Soulful expressions rooted in African-American history',
    url: '/genre/blues',
    coverUrl: '/images/man_with_headse.png',
    color: '#3b82f6', // Blue
  },
  {
    id: 'trending',
    name: 'Trending',
    description: 'Find your next favorite track',
    url: '/trending',
    coverUrl: '/images/two_people_enjoying_music.png',
    color: '#10b981', // Emerald
  },
];

export default function MusicCategories() {
  const { isAuthenticated } = useAuth();
  const { getGenres, createGenre, updateGenreOrder, getHomeLayout, updateHomeLayout } = useMusic();

  const [userGenres, setUserGenres] = useState<any[]>([]);
  const [homeLayout, setHomeLayout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<any>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Load user genres and home layout
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated) {
        setUserGenres(defaultCategories);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get user genres
        const genresResponse = await getGenres();
        console.log('getGenres() returned:', genresResponse);

        // Ensure genres is always an array
        const genres = Array.isArray(genresResponse)
          ? genresResponse
          : ((genresResponse as any)?.genres || []);

        console.log('Processed genres array:', genres);

        // Get home layout
        const layout = await getHomeLayout();

        if (layout && layout.layoutConfig) {
          const config = JSON.parse(layout.layoutConfig);
          setHomeLayout(config);

          // If user has selected genres for home page, filter and order them
          if (config.genreIds && config.genreIds.length > 0) {
            // Filter genres to only include those in the home layout
            const filteredGenres = genres.filter((genre: any) =>
              config.genreIds.includes(genre.id)
            );

            // Sort genres according to the order in genreIds
            const orderedGenres = config.genreIds.map((id: string) =>
              filteredGenres.find((genre: any) => genre.id === id)
            ).filter(Boolean);

            setUserGenres(orderedGenres.length > 0 ? orderedGenres : genres.slice(0, 6));
          } else {
            // If no genres are selected for home page, show the first 6
            setUserGenres(genres.length > 0 ? genres.slice(0, 6) : defaultCategories);
          }
        } else {
          // If no home layout exists, show the first 6 genres
          setUserGenres(genres.length > 0 ? genres.slice(0, 6) : defaultCategories);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user genres:', error);
        setUserGenres(defaultCategories);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, getGenres, getHomeLayout]);

  // Handle opening the genre menu
  const handleOpenMenu = (genre: any, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.right,
      y: rect.top
    });

    setSelectedGenre(genre);
    setShowMenu(true);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setIsDragging(true);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (dragIndex === dropIndex) return;

    const newGenres = [...userGenres];
    const draggedGenre = newGenres[dragIndex];

    // Remove the dragged item
    newGenres.splice(dragIndex, 1);

    // Insert at the new position
    newGenres.splice(dropIndex, 0, draggedGenre);

    setUserGenres(newGenres);
    setIsDragging(false);

    // Update the home layout with the new order
    if (isAuthenticated && homeLayout) {
      const newGenreIds = newGenres.map(genre => genre.id);
      const newLayout = {
        ...homeLayout,
        genreIds: newGenreIds
      };

      await updateHomeLayout(newLayout);

      // Also update the genre order in the database
      await updateGenreOrder(newGenres);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Browse Categories</h2>
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={toggleEditMode}
              className="text-sm text-primary hover:underline"
            >
              {isEditing ? 'Done' : 'Edit'}
            </button>
          )}
          <Link href="/categories" className="text-sm text-primary hover:underline">
            See All
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userGenres.map((genre, index) => (
            <div
              key={genre.id}
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`relative ${isEditing ? 'cursor-move' : ''}`}
            >
              <Link
                href={genre.url || `/genre/${genre.id}`}
                className="relative overflow-hidden rounded-xl h-32 group block"
                onClick={(e) => isEditing && e.preventDefault()}
              >
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    background: index === 0 ? 'linear-gradient(to right, #6366f1, #2563eb)' :   // Afrobeats - Indigo to Blue
                              index === 1 ? 'linear-gradient(to right, #ec4899, #db2777)' :     // Pop - Pink to Rose
                              index === 2 ? 'linear-gradient(to right, #f59e0b, #ea580c)' :     // Hip-Hop - Amber to Orange
                              index === 3 ? 'linear-gradient(to right, #8b5cf6, #7c3aed)' :     // R&B - Violet to Purple
                              index === 4 ? 'linear-gradient(to right, #3b82f6, #0284c7)' :     // Blues - Blue to Sky
                              index === 5 ? 'linear-gradient(to right, #10b981, #16a34a)' :     // Trending - Emerald to Green
                              genre.color                                                       // Fallback to genre color
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center p-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl">{genre.name}</h3>
                    <p className="text-white text-sm opacity-90">{genre.description}</p>
                  </div>
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden shadow-lg transform rotate-12 group-hover:rotate-6 transition-transform">
                    <Image
                      src={genre.coverUrl || '/images/logo.png'}
                      alt={genre.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </Link>

              {/* Three-dot menu button - visible when editing or on hover */}
              {isAuthenticated && (
                <button
                  className={`absolute top-2 right-2 p-1 rounded-full bg-dark-lighter hover:bg-dark-lightest z-10 ${
                    isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } transition-opacity`}
                  onClick={(e) => handleOpenMenu(genre, e)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Genre Menu */}
      {showMenu && selectedGenre && menuPosition && (
        <GenreMenu
          genre={selectedGenre}
          onClose={() => setShowMenu(false)}
          position={menuPosition}
          onGenreUpdated={(updatedGenre) => {
            setUserGenres(userGenres.map(g => g.id === updatedGenre.id ? updatedGenre : g));
          }}
          onGenreRemoved={(genreId) => {
            setUserGenres(userGenres.filter(g => g.id !== genreId));
          }}
        />
      )}

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
