'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import musicService, { Genre, Track } from '@/services/musicService';
import userDataService, { UserPlaylist, CustomTag } from '@/services/userDataService';
import { useSession } from 'next-auth/react';

// Define the context type
interface MusicContextType {
  // Music database
  genres: Genre[];
  allTracks: Track[];
  isLoading: boolean;
  error: string | null;

  // Playback controls
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;

  // Track discovery
  searchTracks: (query: string) => Promise<Track[]>;
  getTracksByGenre: (genreId: string) => Promise<Track[]>;
  getTrendingTracks: (limit?: number) => Promise<Track[]>;
  getRecentlyPlayedTracks: (limit?: number) => Promise<Track[]>;
  getSimilarTracks: (track: Track, limit?: number) => Promise<Track[]>;
  getTrackById: (trackId: string) => Track | null;
  getAllTracks: () => Promise<Track[]>;

  // User data - Recently played
  addToRecentlyPlayed: (track: Track) => Promise<void>;
  getUserRecentlyPlayed: (limit?: number) => Track[];

  // User data - Favorites
  toggleFavorite: (track: Track) => Promise<boolean>;
  isFavorite: (trackId: string) => boolean;
  getFavorites: () => Track[];

  // User data - Playlists
  createPlaylist: (name: string, description?: string) => Promise<UserPlaylist>;
  getPlaylists: () => UserPlaylist[];
  getPlaylistById: (playlistId: string) => UserPlaylist | null;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<boolean>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<boolean>;
  deletePlaylist: (playlistId: string) => Promise<boolean>;

  // User data - Custom tags
  createCustomTag: (name: string, color?: string) => Promise<CustomTag>;
  createTag: (name: string, color?: string) => Promise<CustomTag>; // Alias for createCustomTag
  getCustomTags: () => CustomTag[];
  addTagToTrack: (tagId: string, trackId: string) => Promise<boolean>;
  removeTagFromTrack: (tagId: string, trackId: string) => Promise<boolean>;
  getTracksWithTag: (tagId: string) => Track[];
  getTagsForTrack: (trackId: string) => CustomTag[];

  // User data - Most played
  getMostPlayedTracks: (limit?: number) => Track[];

  // Genre-related functions
  getGenres: () => Promise<any[]>;
  createGenre: (name: string, color: string, description?: string) => Promise<any>;
  addTrackToGenre: (genreId: string, trackId: string, track?: Track) => Promise<boolean>;
  removeTrackFromGenre: (genreId: string, trackId: string) => Promise<boolean>;
  getGenreById: (genreId: string) => Promise<any>;
  updateGenre: (genreId: string, data: any) => Promise<any>;
  deleteGenre: (genreId: string) => Promise<boolean>;
  updateGenreOrder: (genres: any[]) => Promise<boolean>;

  // Home layout functions
  getHomeLayout: () => Promise<any>;
  updateHomeLayout: (layoutConfig: any) => Promise<any>;
}

// Create the context
const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Create a provider component
export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [genres, setGenres] = useState<Genre[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  // User data state
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<{tracks: Track[], timestamp: number}[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Track[]>([]);

  // Load music data from the API
  useEffect(() => {
    const loadMusicData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch music data from API
        const musicData = await musicService.fetchMusicData();

        if (musicData.genres) {
          setGenres(musicData.genres);

          // Get all tracks
          const allTracks = musicData.genres.flatMap(genre => genre.tracks);
          setAllTracks(allTracks);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading music data:', err);
        setError('Failed to load music data. Please try again later.');
        setIsLoading(false);
      }
    };

    loadMusicData();
  }, []);



  // Load user data when session changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        // Reset user data if not logged in
        setFavorites([]);
        setPlaylists([]);
        setCustomTags([]);

        // Try to load recently played from localStorage
        try {
          const localRecentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
          if (localRecentlyPlayed.length > 0) {
            // Transform the data to match our expected format
            const formattedRecentlyPlayed = [{
              tracks: localRecentlyPlayed.map((item: any) => item.track),
              timestamp: Date.now()
            }];
            setRecentlyPlayed(formattedRecentlyPlayed);
          } else {
            setRecentlyPlayed([]);
          }
        } catch (error) {
          console.error('Error loading recently played from localStorage:', error);
          setRecentlyPlayed([]);
        }

        // Set default most played tracks from all tracks
        const defaultMostPlayed = allTracks.slice(0, 10).map(track => ({
          ...track,
          playCount: Math.floor(Math.random() * 10) + 1
        }));
        setMostPlayed(defaultMostPlayed);
        return;
      }

      try {
        // Load user data from services - handle each service separately to prevent one failure from affecting others
        try {
          const userFavorites = await userDataService.getFavorites(userId);
          setFavorites(userFavorites);
        } catch (error) {
          console.error('Error loading favorites:', error);
          setFavorites([]);
        }

        try {
          const userPlaylists = await userDataService.getPlaylists(userId);
          setPlaylists(userPlaylists);
        } catch (error) {
          console.error('Error loading playlists:', error);
          setPlaylists([]);
        }

        try {
          const userTags = await userDataService.getCustomTags(userId);
          setCustomTags(userTags);
        } catch (error) {
          console.error('Error loading custom tags:', error);
          setCustomTags([]);
        }

        try {
          const userRecentlyPlayed = await userDataService.getRecentlyPlayed(userId);
          setRecentlyPlayed(userRecentlyPlayed);
        } catch (error) {
          console.error('Error loading recently played tracks:', error);
          setRecentlyPlayed([]);
        }

        try {
          const userMostPlayed = await userDataService.getMostPlayed(allTracks, 10, userId);
          setMostPlayed(userMostPlayed);
        } catch (error) {
          console.error('Error loading most played tracks:', error);
          // Set default most played tracks from all tracks
          const defaultMostPlayed = allTracks.slice(0, 10).map(track => ({
            ...track,
            playCount: Math.floor(Math.random() * 10) + 1
          }));
          setMostPlayed(defaultMostPlayed);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [userId, allTracks]);

  // Play a track
  const playTrack = async (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);

    // Add the track to the queue if it's not already there
    if (!queue.some(t => t.id === track.id)) {
      // Update the queue first, then set the queue index in a separate effect
      setQueue(prevQueue => {
        const newQueue = [...prevQueue, track];
        // Set the queue index after the queue is updated
        setTimeout(() => {
          setQueueIndex(newQueue.length - 1);
        }, 0);
        return newQueue;
      });
    } else {
      // If the track is already in the queue, set the queue index to that track
      const index = queue.findIndex(t => t.id === track.id);
      setQueueIndex(index);
    }

    // Add to recently played if user is logged in
    if (userId) {
      try {
        // Call the API to add to recently played
        const response = await fetch('/api/user/data/recently-played', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ track })
        });

        if (response.ok) {
          // Update recently played state
          const recentlyPlayedResponse = await fetch('/api/user/data/recently-played');
          if (recentlyPlayedResponse.ok) {
            const data = await recentlyPlayedResponse.json();
            setRecentlyPlayed(data.recentlyPlayed || []);
          }
        }
      } catch (error) {
        console.error('Error updating recently played:', error);
      }

      // Also call the userDataService directly as a backup
      try {
        await userDataService.addToRecentlyPlayed(track, userId);
      } catch (error) {
        console.error('Error calling userDataService.addToRecentlyPlayed:', error);
      }
    } else {
      // If user is not logged in, store in localStorage for now
      try {
        const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
        const updatedRecentlyPlayed = [
          { track, timestamp: new Date().toISOString() },
          ...recentlyPlayed.filter((item: any) => item.track.id !== track.id)
        ].slice(0, 20); // Keep only the 20 most recent
        localStorage.setItem('recentlyPlayed', JSON.stringify(updatedRecentlyPlayed));
      } catch (error) {
        console.error('Error storing recently played in localStorage:', error);
      }
    }

    // Make the playTrack function available globally
    if (typeof window !== 'undefined') {
      (window as any).playTrack = playTrack;
    }
  };

  // Pause the current track
  const pauseTrack = () => {
    setIsPlaying(false);
  };

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Play the next track in the queue
  const nextTrack = () => {
    if (queue.length === 0 || queueIndex === queue.length - 1) {
      // If we're at the end of the queue, do nothing
      return;
    }

    const nextIndex = queueIndex + 1;
    setQueueIndex(nextIndex);
    setCurrentTrack(queue[nextIndex]);
    setIsPlaying(true);
  };

  // Play the previous track in the queue
  const previousTrack = () => {
    if (queue.length === 0 || queueIndex === 0) {
      // If we're at the beginning of the queue, do nothing
      return;
    }

    const prevIndex = queueIndex - 1;
    setQueueIndex(prevIndex);
    setCurrentTrack(queue[prevIndex]);
    setIsPlaying(true);
  };

  // Search for tracks
  const searchTracksFunc = async (query: string): Promise<Track[]> => {
    // If query is empty, return an empty array to prevent unnecessary API calls
    if (!query || query.trim() === '') {
      return [];
    }
    return await musicService.searchTracks(query);
  };

  // Get tracks by genre
  const getTracksByGenreFunc = async (genreId: string): Promise<Track[]> => {
    return await musicService.getTracksByGenre(genreId);
  };

  // Get trending tracks
  const getTrendingTracksFunc = async (limit: number = 10): Promise<Track[]> => {
    return await musicService.getTrendingTracks(limit);
  };

  // Get recently played tracks
  const getRecentlyPlayedTracksFunc = async (limit: number = 6): Promise<Track[]> => {
    // If user is not logged in, try to get from localStorage
    if (!userId) {
      try {
        const localRecentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
        return localRecentlyPlayed.slice(0, limit).map((item: any) => item.track);
      } catch (error) {
        console.error('Error getting recently played tracks from localStorage:', error);
        return [];
      }
    }

    // Use the API to get recently played tracks
    try {
      const response = await fetch(`/api/user/data/recently-played?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        return data.recentlyPlayed?.flatMap((item: any) => item.tracks) || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting recently played tracks:', error);
      return [];
    }
  };

  // Get similar tracks
  const getSimilarTracksFunc = async (track: Track, limit: number = 5): Promise<Track[]> => {
    return await musicService.getSimilarTracks(track, limit);
  };

  // Get all tracks
  const getAllTracksFunc = async (): Promise<Track[]> => {
    return allTracks;
  };

  // User data functions
  const addToRecentlyPlayed = async (track: Track) => {
    await userDataService.addToRecentlyPlayed(track, userId);
  };

  const getUserRecentlyPlayed = (limit: number = 10): Track[] => {
    // Use the state that's already loaded
    return recentlyPlayed
      .slice(0, limit)
      .flatMap(item => item.tracks)
      .filter((track: Track, index: number, self: Track[]) =>
        index === self.findIndex((t: Track) => t.id === track.id)
      );
  };

  const toggleFavorite = async (track: Track): Promise<boolean> => {
    try {
      const isNowFavorite = await userDataService.toggleFavorite(track, userId);

      // Update favorites state
      if (userId) {
        const userFavorites = await userDataService.getFavorites(userId);
        setFavorites(userFavorites);
      }

      return isNowFavorite;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  const isFavorite = (trackId: string): boolean => {
    // Use the state that's already loaded
    return favorites.some(track => track.id === trackId);
  };

  const getFavorites = (): Track[] => {
    // Use the state that's already loaded
    return favorites;
  };

  const createPlaylist = async (name: string, description: string = ''): Promise<UserPlaylist> => {
    try {
      // Create a mock playlist for immediate UI feedback
      const mockPlaylist: UserPlaylist = {
        id: `temp-${Date.now()}`,
        name,
        description,
        tracks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: userId || '',
        isPublic: false
      };

      // Add to state immediately
      setPlaylists(prev => [...prev, mockPlaylist]);

      try {
        // Try to create in the database
        const newPlaylist = await userDataService.createPlaylist(name, description, userId);

        // Update playlists state with the real data
        if (userId) {
          const userPlaylists = await userDataService.getPlaylists(userId);
          setPlaylists(userPlaylists);
        }

        return newPlaylist;
      } catch (dbError) {
        console.error('Error creating playlist in database:', dbError);
        // Return the mock playlist if database operation fails
        return mockPlaylist;
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      // Create a fallback playlist
      const fallbackPlaylist: UserPlaylist = {
        id: `fallback-${Date.now()}`,
        name,
        description,
        tracks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: userId || '',
        isPublic: false
      };
      return fallbackPlaylist;
    }
  };

  const getPlaylists = (): UserPlaylist[] => {
    // Use the state that's already loaded
    return playlists;
  };

  const getPlaylistById = (playlistId: string): UserPlaylist | null => {
    // Use the state that's already loaded
    return playlists.find(playlist => playlist.id === playlistId) || null;
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track): Promise<boolean> => {
    try {
      const success = await userDataService.addTrackToPlaylist(playlistId, track, userId);

      // Update playlists state
      if (userId && success) {
        const userPlaylists = await userDataService.getPlaylists(userId);
        setPlaylists(userPlaylists);
      }

      return success;
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      return false;
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string): Promise<boolean> => {
    try {
      const success = await userDataService.removeTrackFromPlaylist(playlistId, trackId, userId);

      // Update playlists state
      if (userId && success) {
        const userPlaylists = await userDataService.getPlaylists(userId);
        setPlaylists(userPlaylists);
      }

      return success;
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      return false;
    }
  };

  const deletePlaylist = async (playlistId: string): Promise<boolean> => {
    try {
      const success = await userDataService.deletePlaylist(playlistId, userId);

      // Update playlists state
      if (userId && success) {
        const userPlaylists = await userDataService.getPlaylists(userId);
        setPlaylists(userPlaylists);
      }

      return success;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      return false;
    }
  };

  const createCustomTag = async (name: string, color: string = '#3b82f6'): Promise<CustomTag> => {
    try {
      // Create a mock tag for immediate UI feedback
      const mockTag: CustomTag = {
        id: `temp-${Date.now()}`,
        name,
        color,
        trackIds: [],
        userId: userId || ''
      };

      // Add to state immediately
      setCustomTags(prev => [...prev, mockTag]);

      try {
        // Try to create in the database
        const newTag = await userDataService.createCustomTag(name, color, userId);

        // Update tags state with the real data
        if (userId) {
          const userTags = await userDataService.getCustomTags(userId);
          setCustomTags(userTags);
        }

        return newTag;
      } catch (dbError) {
        console.error('Error creating tag in database:', dbError);
        // Return the mock tag if database operation fails
        return mockTag;
      }
    } catch (error) {
      console.error('Error creating custom tag:', error);
      // Create a fallback tag
      const fallbackTag: CustomTag = {
        id: `fallback-${Date.now()}`,
        name,
        color,
        trackIds: [],
        userId: userId || ''
      };
      return fallbackTag;
    }
  };

  const getCustomTags = (): CustomTag[] => {
    // Use the state that's already loaded
    return customTags;
  };

  const addTagToTrack = async (tagId: string, trackId: string): Promise<boolean> => {
    try {
      const success = await userDataService.addTagToTrack(tagId, trackId, userId);

      // Update tags state
      if (userId && success) {
        const userTags = await userDataService.getCustomTags(userId);
        setCustomTags(userTags);
      }

      return success;
    } catch (error) {
      console.error('Error adding tag to track:', error);
      return false;
    }
  };

  const removeTagFromTrack = async (tagId: string, trackId: string): Promise<boolean> => {
    try {
      const success = await userDataService.removeTagFromTrack(tagId, trackId, userId);

      // Update tags state
      if (userId && success) {
        const userTags = await userDataService.getCustomTags(userId);
        setCustomTags(userTags);
      }

      return success;
    } catch (error) {
      console.error('Error removing tag from track:', error);
      return false;
    }
  };

  const getTracksWithTag = (tagId: string): Track[] => {
    // Find the tag in the state
    const tag = customTags.find(tag => tag.id === tagId);
    if (!tag) return [];

    // Return tracks that have this tag
    return allTracks.filter(track => tag.trackIds.includes(track.id));
  };

  const getTagsForTrack = (trackId: string): CustomTag[] => {
    // Use the state that's already loaded
    return customTags.filter(tag => tag.trackIds.includes(trackId));
  };

  const getMostPlayedTracks = (limit: number = 10): Track[] => {
    // Use the state that's already loaded
    return mostPlayed.slice(0, limit);
  };

  // Genre-related functions (old implementation removed)

  // Genre-related functions
  const getGenres = async () => {
    if (!userId) {
      return [];
    }

    try {
      const response = await fetch('/api/user/data/genres');
      if (response.ok) {
        const data = await response.json();
        return data.genres || []; // Return the genres array from the response
      }
      return [];
    } catch (error) {
      console.error('Error getting genres:', error);
      return [];
    }
  };

  const getGenreById = async (genreId: string) => {
    if (!userId) {
      return null;
    }

    try {
      const response = await fetch(`/api/user/data/genres/${genreId}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error(`Error getting genre ${genreId}:`, error);
      return null;
    }
  };

  const createGenre = async (name: string, color: string, description?: string) => {
    if (!userId) {
      return null;
    }

    try {
      const response = await fetch('/api/user/data/genres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, color, description })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error creating genre:', error);
      return null;
    }
  };

  const updateGenre = async (genreId: string, data: any) => {
    if (!userId) {
      return null;
    }

    try {
      const response = await fetch(`/api/user/data/genres/${genreId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedGenre = await response.json();
        return updatedGenre;
      }
      return null;
    } catch (error) {
      console.error(`Error updating genre ${genreId}:`, error);
      return null;
    }
  };

  const deleteGenre = async (genreId: string) => {
    if (!userId) {
      return false;
    }

    try {
      const response = await fetch(`/api/user/data/genres/${genreId}`, {
        method: 'DELETE'
      });

      return response.ok;
    } catch (error) {
      console.error(`Error deleting genre ${genreId}:`, error);
      return false;
    }
  };

  const updateGenreOrder = async (genres: any[]) => {
    if (!userId) {
      return false;
    }

    try {
      const response = await fetch('/api/user/data/genres', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ genres })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating genre order:', error);
      return false;
    }
  };

  const addTrackToGenre = async (genreId: string, trackId: string, track?: Track) => {
    if (!userId) {
      return false;
    }

    try {
      const response = await fetch(`/api/user/data/genres/${genreId}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trackId, track })
      });

      return response.ok;
    } catch (error) {
      console.error(`Error adding track ${trackId} to genre ${genreId}:`, error);
      return false;
    }
  };

  const removeTrackFromGenre = async (genreId: string, trackId: string) => {
    if (!userId) {
      return false;
    }

    try {
      const response = await fetch(`/api/user/data/genres/${genreId}/tracks/${trackId}`, {
        method: 'DELETE'
      });

      return response.ok;
    } catch (error) {
      console.error(`Error removing track ${trackId} from genre ${genreId}:`, error);
      return false;
    }
  };

  // Home layout functions
  const getHomeLayout = async () => {
    if (!userId) {
      return null;
    }

    try {
      const response = await fetch('/api/user/data/home-layout');
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error getting home layout:', error);
      return null;
    }
  };

  const updateHomeLayout = async (layoutConfig: any) => {
    if (!userId) {
      return null;
    }

    try {
      const response = await fetch('/api/user/data/home-layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ layoutConfig: JSON.stringify(layoutConfig) })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error updating home layout:', error);
      return null;
    }
  };

  // Get track by ID
  const getTrackById = (trackId: string): Track | null => {
    return allTracks.find(track => track.id === trackId) || null;
  };

  // Create the context value
  const contextValue: MusicContextType = {
    // Music database
    genres,
    allTracks,
    isLoading,
    error,

    // Playback controls
    currentTrack,
    isPlaying,
    playTrack,
    pauseTrack,
    togglePlay,
    nextTrack,
    previousTrack,

    // Track discovery
    searchTracks: searchTracksFunc,
    getTracksByGenre: getTracksByGenreFunc,
    getTrendingTracks: getTrendingTracksFunc,
    getRecentlyPlayedTracks: getRecentlyPlayedTracksFunc,
    getSimilarTracks: getSimilarTracksFunc,
    getTrackById,
    getAllTracks: getAllTracksFunc,

    // User data - Recently played
    addToRecentlyPlayed,
    getUserRecentlyPlayed,

    // User data - Favorites
    toggleFavorite,
    isFavorite,
    getFavorites,

    // User data - Playlists
    createPlaylist,
    getPlaylists,
    getPlaylistById,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    deletePlaylist,

    // User data - Custom tags
    createCustomTag,
    createTag: createCustomTag, // Alias for createCustomTag
    getCustomTags,
    addTagToTrack,
    removeTagFromTrack,
    getTracksWithTag,
    getTagsForTrack,

    // User data - Most played
    getMostPlayedTracks,

    // Genre-related functions
    getGenres,
    createGenre,
    addTrackToGenre,
    removeTrackFromGenre,
    getGenreById,
    updateGenre,
    deleteGenre,
    updateGenreOrder,

    // Home layout functions
    getHomeLayout,
    updateHomeLayout
  };

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
};

// Create a hook to use the music context
export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export default MusicContext;
