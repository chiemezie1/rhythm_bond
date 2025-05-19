/**
 * Music Service
 *
 * This service manages the music database using YouTube links.
 * It provides functions to get tracks by genre, search for tracks, and get track details.
 */

// Define types for our music database
export interface Track {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnail: string;
  duration?: string;
  releaseYear?: number;
  tags?: string[];
}

export interface Genre {
  id: string;
  name: string;
  description: string;
  color?: string;
  tracks: Track[];
}

export interface MusicDatabase {
  genres: Genre[];
}

// Parse YouTube URL to get the video ID
export const getYoutubeIdFromUrl = (url: string): string => {
  try {
    // Handle both standard YouTube URLs and shortened youtu.be URLs
    if (url.includes('youtu.be/')) {
      // Handle youtu.be URLs
      const urlParts = url.split('youtu.be/');
      if (urlParts.length > 1) {
        // Remove any query parameters
        return urlParts[1].split('?')[0].split('&')[0];
      }
    } else if (url.includes('youtube.com/watch')) {
      // Handle standard youtube.com URLs
      const urlParams = new URL(url).searchParams;
      return urlParams.get('v') || '';
    } else if (url.includes('youtube.com/embed/')) {
      // Handle embed URLs
      const urlParts = url.split('youtube.com/embed/');
      if (urlParts.length > 1) {
        return urlParts[1].split('?')[0].split('&')[0];
      }
    }

    // If we can't parse the URL, return an empty string
    return '';
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return '';
  }
};

// Get thumbnail URL from YouTube video ID
export const getYoutubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

// Function to fetch all music data from API
const fetchMusicData = async (): Promise<MusicDatabase> => {
  try {
    const response = await fetch('/api/music');

    if (!response.ok) {
      throw new Error(`Failed to fetch music data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching music data:', error);
    return { genres: [] };
  }
};

// Function to search tracks
const searchTracks = async (query: string, limit: number = 10): Promise<Track[]> => {
  try {
    // If query is empty, return an empty array to prevent unnecessary API calls
    if (!query || query.trim() === '') {
      return [];
    }

    // Normalize the query (trim and lowercase)
    const normalizedQuery = query.trim().toLowerCase();

    const response = await fetch(`/api/music?query=${encodeURIComponent(normalizedQuery)}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to search tracks: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

// Function to get tracks by genre
const getTracksByGenre = async (genreId: string): Promise<Track[]> => {
  try {
    const response = await fetch(`/api/music?genre=${encodeURIComponent(genreId)}`);

    if (!response.ok) {
      throw new Error(`Failed to get tracks by genre: ${response.statusText}`);
    }

    const data = await response.json();
    return data.genre?.tracks || [];
  } catch (error) {
    console.error('Error getting tracks by genre:', error);
    return [];
  }
};

// Function to get trending tracks
const getTrendingTracks = async (limit: number = 10): Promise<Track[]> => {
  try {
    const response = await fetch(`/api/music?trending=true&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to get trending tracks: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error('Error getting trending tracks:', error);
    return [];
  }
};

// Function to get similar tracks
const getSimilarTracks = async (track: Track, limit: number = 5): Promise<Track[]> => {
  try {
    const response = await fetch(`/api/music?similar=${track.id}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to get similar tracks: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error('Error getting similar tracks:', error);
    return [];
  }
};

// Export the service functions
const musicService = {
  fetchMusicData,
  searchTracks,
  getTracksByGenre,
  getTrendingTracks,
  getSimilarTracks,
  getYoutubeIdFromUrl,
  getYoutubeThumbnail
};

export default musicService;
