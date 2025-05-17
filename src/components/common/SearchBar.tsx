'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useMusic } from '@/contexts/MusicContext';
import socialService from '@/services/socialService';
import { UserProfile } from '@/services/socialService';
import LoadingSpinner from './LoadingSpinner';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({ 
  className = '', 
  placeholder = 'Search for tracks, artists, or users...',
  onSearch
}: SearchBarProps) {
  const router = useRouter();
  const { searchTracks } = useMusic();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 1) {
      setIsSearching(true);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };
  
  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
      
      if (onSearch) {
        onSearch(query);
      }
    }
  };
  
  // Search for tracks and users
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length > 1) {
        try {
          // Search for tracks
          const foundTracks = searchTracks(query);
          setTracks(foundTracks.slice(0, 3));
          
          // Search for users
          const foundUsers = await socialService.searchUsers(query);
          setUsers(foundUsers.slice(0, 3));
          
          setIsSearching(false);
        } catch (error) {
          console.error('Error searching:', error);
          setIsSearching(false);
        }
      }
    }, 300);
    
    return () => clearTimeout(searchTimeout);
  }, [query, searchTracks]);
  
  // Handle clicking outside of search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-dark-lighter dark:bg-dark-lighter rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>
      
      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-lighter dark:bg-dark-lighter rounded-lg shadow-lg overflow-hidden z-50">
          {isSearching ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="small" />
            </div>
          ) : (
            <>
              {tracks.length === 0 && users.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  No results found
                </div>
              ) : (
                <div>
                  {/* Track Results */}
                  {tracks.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs text-gray-400 uppercase font-medium">
                        Tracks
                      </div>
                      {tracks.map(track => (
                        <Link
                          key={track.id}
                          href={`/track/${track.id}`}
                          className="flex items-center gap-3 p-3 hover:bg-dark-lightest transition-colors"
                          onClick={() => setShowResults(false)}
                        >
                          <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={track.thumbnail}
                              alt={track.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{track.title}</p>
                            <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* User Results */}
                  {users.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs text-gray-400 uppercase font-medium">
                        Users
                      </div>
                      {users.map(user => (
                        <Link
                          key={user.id}
                          href={`/user/${user.username}`}
                          className="flex items-center gap-3 p-3 hover:bg-dark-lightest transition-colors"
                          onClick={() => setShowResults(false)}
                        >
                          <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={user.avatarUrl || '/images/logo.png'}
                              alt={user.displayName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user.displayName}</p>
                            <p className="text-sm text-gray-400 truncate">@{user.username}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* View All Results */}
                  <div className="p-3 border-t border-dark-lightest">
                    <button
                      className="w-full text-center text-primary hover:underline"
                      onClick={handleSubmit}
                    >
                      View all results for "{query}"
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
