'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMusic } from '@/contexts/MusicContext';
import { Track } from '@/services/musicDatabase';
import socialService from '@/services/socialService';
import { UserProfile } from '@/services/socialService';
import LoadingSpinner from './LoadingSpinner';

// This will be replaced with real data from the Music Context
const searchResults = {
  tracks: [
    {
      id: 1,
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: '3:20',
      coverUrl: '/images/man_with_headse.png',
    },
    {
      id: 2,
      title: 'Lights Up',
      artist: 'Harry Styles',
      album: 'Fine Line',
      duration: '2:52',
      coverUrl: '/images/two_people_enjoying_music.png',
    },
    {
      id: 3,
      title: 'City Lights',
      artist: 'White Lies',
      album: 'Five',
      duration: '4:37',
      coverUrl: '/images/logo_bg_white.png',
    },
  ],
  artists: [
    {
      id: 1,
      name: 'The Weeknd',
      followers: '12.7M',
      coverUrl: '/images/man_with_headse.png',
    },
    {
      id: 2,
      name: 'Lights Down Low',
      followers: '245K',
      coverUrl: '/images/logo.png',
    },
  ],
  albums: [
    {
      id: 1,
      title: 'After Hours',
      artist: 'The Weeknd',
      year: 2020,
      coverUrl: '/images/man_with_headse.png',
    },
    {
      id: 2,
      title: 'Bright Lights',
      artist: 'Ellie Goulding',
      year: 2010,
      coverUrl: '/images/two_people_enjoying_music.png',
    },
  ],
  playlists: [
    {
      id: 1,
      title: 'City Lights Playlist',
      creator: 'RhythmBond',
      trackCount: 42,
      coverUrl: '/images/logo_bg_white.png',
    },
    {
      id: 2,
      title: 'Northern Lights',
      creator: 'Sarah',
      trackCount: 28,
      coverUrl: '/images/logo.png',
    },
  ],
};

// Filter types
type FilterType = 'all' | 'tracks' | 'artists' | 'albums' | 'playlists' | 'users';

export default function AdvancedSearch() {
  const { allTracks, genres, searchTracks, playTrack } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [timeRange, setTimeRange] = useState('all-time');
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>({
    tracks: [],
    artists: [],
    albums: [],
    playlists: [],
    users: []
  });

  // Filter options
  const filterOptions: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'tracks', label: 'Tracks' },
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'users', label: 'Users' },
  ];

  // Sort options
  const sortOptions = [
    { id: 'relevance', label: 'Relevance' },
    { id: 'newest', label: 'Newest' },
    { id: 'popularity', label: 'Popularity' },
    { id: 'a-z', label: 'A-Z' },
  ];

  // Time range options
  const timeRangeOptions = [
    { id: 'all-time', label: 'All Time' },
    { id: 'last-year', label: 'Last Year' },
    { id: 'last-6-months', label: 'Last 6 Months' },
    { id: 'last-month', label: 'Last Month' },
  ];

  // Initialize search query from URL parameters
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Perform search when query changes
  useEffect(() => {
    setIsLoading(true);

    if (searchQuery.trim() === '') {
      // If search query is empty, show some tracks from each genre
      const tracks = allTracks.slice(0, 10);

      // Extract unique artists from tracks
      const artistsMap = new Map();
      tracks.forEach(track => {
        if (!artistsMap.has(track.artist)) {
          artistsMap.set(track.artist, {
            id: track.artist.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: track.artist,
            followers: `${Math.floor(Math.random() * 900) + 100}K`,
            coverUrl: track.thumbnail
          });
        }
      });

      // Create some playlists from genres
      const playlists = genres.map(genre => ({
        id: genre.id,
        title: `${genre.name} Mix`,
        creator: 'RhythmBond',
        trackCount: genre.tracks.length,
        coverUrl: genre.tracks[0]?.thumbnail || '/images/logo.png'
      }));

      setSearchResults({
        tracks,
        artists: Array.from(artistsMap.values()),
        albums: [],
        playlists: playlists.slice(0, 5),
        users: []
      });
      setIsLoading(false);
    } else {
      // Search for tracks matching the query
      const matchedTracks = allTracks.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10);

      // Extract artists matching the query
      const artistsMap = new Map();
      allTracks.forEach(track => {
        if (track.artist.toLowerCase().includes(searchQuery.toLowerCase()) && !artistsMap.has(track.artist)) {
          artistsMap.set(track.artist, {
            id: track.artist.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: track.artist,
            followers: `${Math.floor(Math.random() * 900) + 100}K`,
            coverUrl: track.thumbnail
          });
        }
      });

      // Create playlists matching the query
      const matchedPlaylists = genres
        .filter(genre => genre.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(genre => ({
          id: genre.id,
          title: `${genre.name} Mix`,
          creator: 'RhythmBond',
          trackCount: genre.tracks.length,
          coverUrl: genre.tracks[0]?.thumbnail || '/images/logo.png'
        }));

      // Search for users matching the query
      try {
        const searchUsers = async () => {
          const matchedUsers = await socialService.searchUsers(searchQuery);

          setSearchResults(prev => ({
            ...prev,
            users: matchedUsers.slice(0, 5)
          }));
        };

        searchUsers();
      } catch (error) {
        console.error('Error searching for users:', error);
      }

      setSearchResults({
        tracks: matchedTracks,
        artists: Array.from(artistsMap.values()),
        albums: [],
        playlists: matchedPlaylists,
        users: [] // Will be updated by the async call
      });
      setIsLoading(false);
    }
  }, [searchQuery, allTracks, genres]);

  return (
    <div className="pb-8">
      {/* Search Header */}
      <div className="mb-6">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search for songs, artists, albums, or playlists"
            className="w-full bg-dark-lighter dark:bg-dark-lighter rounded-full py-3 px-4 pl-12 text-white text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-3.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filter:</span>
            <div className="flex bg-dark-lighter dark:bg-dark-lighter rounded-full overflow-hidden">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    activeFilter === option.id
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-dark-lightest'
                  }`}
                  onClick={() => setActiveFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              className="bg-dark-lighter dark:bg-dark-lighter rounded-full px-4 py-1.5 text-sm text-gray-300 focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Time range:</span>
            <select
              className="bg-dark-lighter dark:bg-dark-lighter rounded-full px-4 py-1.5 text-sm text-gray-300 focus:outline-none"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {timeRangeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="large" />
          </div>
        ) : searchQuery.trim() === '' && activeFilter === 'all' ? (
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4">Enter a search term to find tracks, artists, playlists, and users</p>
          </div>
        ) : (
          <>
            {/* Tracks Section */}
            {(activeFilter === 'all' || activeFilter === 'tracks') && (
          <div>
            <h2 className="text-xl font-bold mb-4">Tracks</h2>
            <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-dark-lightest">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="py-3 px-4 font-medium w-8">#</th>
                    <th className="py-3 px-4 font-medium">Title</th>
                    <th className="py-3 px-4 font-medium hidden md:table-cell">Album</th>
                    <th className="py-3 px-4 font-medium text-right">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.tracks.map((track, index) => (
                    <tr
                      key={track.id}
                      className="border-b border-dark-lightest hover:bg-dark-lightest transition-colors cursor-pointer"
                      onClick={() => playTrack(track)}
                    >
                      <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={track.thumbnail}
                              alt={track.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-white">{track.title}</p>
                            <p className="text-sm text-gray-400">{track.artist}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 hidden md:table-cell">{track.genre || 'Unknown'}</td>
                      <td className="py-3 px-4 text-gray-400 text-right">3:30</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Artists Section */}
        {(activeFilter === 'all' || activeFilter === 'artists') && (
          <div>
            <h2 className="text-xl font-bold mb-4">Artists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {searchResults.artists.map((artist) => (
                <div
                  key={artist.id}
                  className="bg-dark-lighter dark:bg-dark-lighter rounded-lg p-4 hover:bg-dark-lightest transition-colors cursor-pointer text-center"
                  onClick={() => {
                    // Find tracks by this artist and play the first one
                    const artistTracks = allTracks.filter(track =>
                      track.artist.toLowerCase() === artist.name.toLowerCase()
                    );
                    if (artistTracks.length > 0) {
                      playTrack(artistTracks[0]);
                    }
                  }}
                >
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-3">
                    <Image
                      src={artist.coverUrl}
                      alt={artist.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-primary rounded-full p-2 transform hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-white">{artist.name}</h3>
                  <p className="text-sm text-gray-400">{artist.followers} followers</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Albums Section */}
        {(activeFilter === 'all' || activeFilter === 'albums') && (
          <div>
            <h2 className="text-xl font-bold mb-4">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResults.albums.map((album) => (
                <div
                  key={album.id}
                  className="bg-dark-lighter dark:bg-dark-lighter rounded-lg p-3 hover:bg-dark-lightest transition-colors cursor-pointer"
                  onClick={() => {
                    // Find tracks by this artist and play the first one
                    const artistTracks = allTracks.filter(track =>
                      track.artist.toLowerCase() === album.artist.toLowerCase()
                    );
                    if (artistTracks.length > 0) {
                      playTrack(artistTracks[0]);
                    }
                  }}
                >
                  <div className="relative aspect-square rounded-md overflow-hidden mb-3">
                    <Image
                      src={album.coverUrl}
                      alt={album.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-primary rounded-full p-3 transform hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-white">{album.title}</h3>
                  <p className="text-sm text-gray-400">{album.artist} • {album.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playlists Section */}
        {(activeFilter === 'all' || activeFilter === 'playlists') && (
          <div>
            <h2 className="text-xl font-bold mb-4">Playlists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResults.playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-dark-lighter dark:bg-dark-lighter rounded-lg p-3 hover:bg-dark-lightest transition-colors cursor-pointer"
                  onClick={() => {
                    // Find the genre and play the first track
                    const genre = genres.find(g => g.id === playlist.id);
                    if (genre && genre.tracks.length > 0) {
                      playTrack(genre.tracks[0]);
                    }
                  }}
                >
                  <div className="relative aspect-square rounded-md overflow-hidden mb-3">
                    <Image
                      src={playlist.coverUrl}
                      alt={playlist.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-primary rounded-full p-3 transform hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-white">{playlist.title}</h3>
                  <p className="text-sm text-gray-400">By {playlist.creator} • {playlist.trackCount} tracks</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Section */}
        {(activeFilter === 'all' || activeFilter === 'users') && searchResults.users.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Users</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {searchResults.users.map((user: UserProfile) => (
                <Link
                  key={user.id}
                  href={`/user/${user.username}`}
                  className="bg-dark-lighter dark:bg-dark-lighter rounded-lg p-4 hover:bg-dark-lightest transition-colors text-center"
                >
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-3">
                    <Image
                      src={user.avatarUrl || '/images/logo.png'}
                      alt={user.displayName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-white">{user.displayName}</h3>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                  <p className="text-xs text-gray-400 mt-1">{user.followers.length} followers</p>
                </Link>
              ))}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
