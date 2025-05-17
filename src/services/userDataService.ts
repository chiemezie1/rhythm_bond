/**
 * User Data Service
 *
 * This service manages user data including:
 * - Recently played tracks
 * - Favorite tracks
 * - User playlists
 * - Custom tags
 *
 * Data is stored in both localStorage (for quick access) and the database (for persistence)
 * using API endpoints instead of direct Prisma calls.
 */

import { Track } from './musicService';

// Define types for user data
export interface UserPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
  isPublic?: boolean;
}

export interface CustomTag {
  id: string;
  name: string;
  color: string;
  trackIds: string[];
  userId?: string;
}

export interface UserData {
  recentlyPlayed: {
    tracks: Track[];
    timestamp: number;
  }[];
  favorites: Track[];
  playlists: UserPlaylist[];
  customTags: CustomTag[];
  mostPlayed: {
    trackId: string;
    count: number;
  }[];
}

// Default user data
const defaultUserData: UserData = {
  recentlyPlayed: [],
  favorites: [],
  playlists: [],
  customTags: [],
  mostPlayed: []
};

// Maximum number of recently played tracks to store
const MAX_RECENTLY_PLAYED = 50;
// Maximum number of most played tracks to track
const MAX_MOST_PLAYED = 100;

// Helper function to check if we're on the client side
const isClient = typeof window !== 'undefined';

/**
 * Get recently played tracks
 */
const getRecentlyPlayed = async (userId?: string): Promise<{tracks: Track[], timestamp: number}[]> => {
  if (!userId || !isClient) {
    return [];
  }

  try {
    const response = await fetch('/api/user/data/recently-played');
    if (!response.ok) {
      throw new Error(`Failed to get recently played: ${response.statusText}`);
    }
    const data = await response.json();
    return data.recentlyPlayed || [];
  } catch (error) {
    console.error('Error getting recently played tracks:', error);
    return [];
  }
};

/**
 * Add a track to recently played
 */
const addToRecentlyPlayed = async (track: Track, userId?: string): Promise<void> => {
  if (!userId || !isClient) {
    return;
  }

  try {
    const response = await fetch('/api/user/data/recently-played', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ track })
    });

    if (!response.ok) {
      throw new Error(`Failed to add to recently played: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error adding track to recently played:', error);
  }
};

/**
 * Get favorite tracks
 */
const getFavorites = async (userId?: string): Promise<Track[]> => {
  if (!userId || !isClient) {
    return [];
  }

  try {
    const response = await fetch('/api/user/data/favorites');
    if (!response.ok) {
      throw new Error(`Failed to get favorites: ${response.statusText}`);
    }
    const data = await response.json();
    return data.favorites || [];
  } catch (error) {
    console.error('Error getting favorite tracks:', error);
    return [];
  }
};

/**
 * Toggle a track as favorite
 */
const toggleFavorite = async (track: Track, userId?: string): Promise<boolean> => {
  if (!userId || !isClient) {
    return false;
  }

  try {
    const response = await fetch('/api/user/data/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ track })
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle favorite: ${response.statusText}`);
    }

    const data = await response.json();
    return data.isFavorite || false;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
};

/**
 * Get most played tracks
 */
const getMostPlayed = async (allTracks: Track[], limit: number = 10, userId?: string): Promise<Track[]> => {
  if (!userId || !isClient) {
    return [];
  }

  try {
    const response = await fetch(`/api/user/data/most-played?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to get most played: ${response.statusText}`);
    }
    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error('Error getting most played tracks:', error);
    return [];
  }
};

/**
 * Get user playlists
 */
const getPlaylists = async (userId?: string): Promise<UserPlaylist[]> => {
  if (!userId || !isClient) {
    return [];
  }

  try {
    const response = await fetch('/api/user/data/playlists');
    if (!response.ok) {
      throw new Error(`Failed to get playlists: ${response.statusText}`);
    }
    const data = await response.json();
    return data.playlists || [];
  } catch (error) {
    console.error('Error getting playlists:', error);
    return [];
  }
};

/**
 * Create a new playlist
 */
const createPlaylist = async (name: string, description: string = '', userId?: string): Promise<UserPlaylist> => {
  if (!userId || !isClient) {
    return {
      id: `temp-${Date.now()}`,
      name,
      description,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false
    };
  }

  try {
    const response = await fetch('/api/user/data/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description })
    });

    if (!response.ok) {
      throw new Error(`Failed to create playlist: ${response.statusText}`);
    }

    const data = await response.json();
    return data.playlist;
  } catch (error) {
    console.error('Error creating playlist:', error);
    return {
      id: `temp-${Date.now()}`,
      name,
      description,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false
    };
  }
};

/**
 * Add a track to a playlist
 */
const addTrackToPlaylist = async (playlistId: string, track: Track, userId?: string): Promise<boolean> => {
  if (!userId || !isClient) {
    return false;
  }

  try {
    const response = await fetch(`/api/user/data/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ track })
    });

    if (!response.ok) {
      throw new Error(`Failed to add track to playlist: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    return false;
  }
};

/**
 * Remove a track from a playlist
 */
const removeTrackFromPlaylist = async (playlistId: string, trackId: string, userId?: string): Promise<boolean> => {
  if (!userId || !isClient) {
    return false;
  }

  try {
    const response = await fetch(`/api/user/data/playlists/${playlistId}/tracks`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ trackId })
    });

    if (!response.ok) {
      throw new Error(`Failed to remove track from playlist: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error removing track from playlist:', error);
    return false;
  }
};

/**
 * Delete a playlist
 */
const deletePlaylist = async (playlistId: string, userId?: string): Promise<boolean> => {
  if (!userId || !isClient) {
    return false;
  }

  try {
    const response = await fetch(`/api/user/data/playlists/${playlistId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete playlist: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return false;
  }
};

/**
 * Get custom tags
 */
const getCustomTags = async (userId?: string): Promise<CustomTag[]> => {
  if (!userId || !isClient) {
    return [];
  }

  try {
    const response = await fetch('/api/user/data/tags');
    if (!response.ok) {
      throw new Error(`Failed to get custom tags: ${response.statusText}`);
    }
    const data = await response.json();
    return data.tags || [];
  } catch (error) {
    console.error('Error getting custom tags:', error);
    return [];
  }
};

/**
 * Create a new custom tag
 */
const createCustomTag = async (name: string, color: string = '#3b82f6', userId?: string): Promise<CustomTag> => {
  if (!userId || !isClient) {
    return {
      id: `temp-${Date.now()}`,
      name,
      color,
      trackIds: []
    };
  }

  try {
    const response = await fetch('/api/user/data/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, color })
    });

    if (!response.ok) {
      throw new Error(`Failed to create custom tag: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tag;
  } catch (error) {
    console.error('Error creating custom tag:', error);
    return {
      id: `temp-${Date.now()}`,
      name,
      color,
      trackIds: []
    };
  }
};

/**
 * Add a tag to a track
 */
const addTagToTrack = async (tagId: string, trackId: string, userId?: string): Promise<boolean> => {
  if (!userId || !isClient) {
    return false;
  }

  try {
    const response = await fetch(`/api/user/data/tags/${tagId}/tracks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ trackId })
    });

    if (!response.ok) {
      throw new Error(`Failed to add tag to track: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error adding tag to track:', error);
    return false;
  }
};

/**
 * Remove a tag from a track
 */
const removeTagFromTrack = async (tagId: string, trackId: string, userId?: string): Promise<boolean> => {
  if (!userId || !isClient) {
    return false;
  }

  try {
    const response = await fetch(`/api/user/data/tags/${tagId}/tracks`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ trackId })
    });

    if (!response.ok) {
      throw new Error(`Failed to remove tag from track: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error removing tag from track:', error);
    return false;
  }
};

// Export all functions
export default {
  getRecentlyPlayed,
  addToRecentlyPlayed,
  getFavorites,
  toggleFavorite,
  getMostPlayed,
  getPlaylists,
  createPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
  getCustomTags,
  createCustomTag,
  addTagToTrack,
  removeTagFromTrack
};
