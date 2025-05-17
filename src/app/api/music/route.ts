import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

// Define types for our music database
interface Track {
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

interface Genre {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
}

interface MusicDatabase {
  genres: Genre[];
}

// Function to read the music data from the JSON file
const getMusicData = (): MusicDatabase => {
  try {
    const filePath = path.join(process.cwd(), 'public', 'music.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading music data:', error);
    return { genres: [] };
  }
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const genreId = searchParams.get('genre');
    const query = searchParams.get('query');
    const trending = searchParams.get('trending');
    const similar = searchParams.get('similar');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    const musicData = getMusicData();

    // If a specific genre is requested
    if (genreId) {
      const genre = musicData.genres.find((g) => g.id === genreId);
      if (!genre) {
        return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
      }
      return NextResponse.json({ genre });
    }

    // If a search query is provided
    if (query) {
      const searchResults = [];

      for (const genre of musicData.genres) {
        const matchingTracks = genre.tracks.filter((track) => {
          const lowerQuery = query.toLowerCase();
          return (
            track.title.toLowerCase().includes(lowerQuery) ||
            track.artist.toLowerCase().includes(lowerQuery) ||
            (track.tags && track.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)))
          );
        });

        if (matchingTracks.length > 0) {
          searchResults.push(...matchingTracks);
        }
      }

      // Apply limit if specified
      const limitedResults = limit ? searchResults.slice(0, limit) : searchResults;

      return NextResponse.json({ tracks: limitedResults });
    }

    // If trending is specified, return trending tracks
    if (trending) {
      // In a real app, this would be based on play counts or other metrics
      // For now, we'll just return random tracks as trending
      const allTracks = musicData.genres.flatMap(genre => genre.tracks);
      const shuffled = [...allTracks].sort(() => 0.5 - Math.random());
      const trendingTracks = shuffled.slice(0, limit);

      return NextResponse.json({ tracks: trendingTracks });
    }

    // If similar is specified, return similar tracks
    if (similar) {
      // Find the track
      const allTracks = musicData.genres.flatMap(genre => genre.tracks);
      const track = allTracks.find(t => t.id === similar);

      if (!track) {
        return NextResponse.json({ error: 'Track not found' }, { status: 404 });
      }

      // Find tracks with the same genre
      const similarTracks = allTracks
        .filter(t => t.id !== track.id && t.genre === track.genre)
        .slice(0, limit);

      return NextResponse.json({ tracks: similarTracks });
    }

    // Return all genres with their tracks
    return NextResponse.json(musicData);
  } catch (error) {
    console.error('Error processing music request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// POST handler to add a track to the database
export async function POST(req: NextRequest) {
  try {
    const { track } = await req.json();

    if (!track || !track.youtubeId || !track.title || !track.artist) {
      return NextResponse.json({ error: 'Missing required track information' }, { status: 400 });
    }

    // Check if the track already exists in the database
    const existingTrack = await prisma.track.findUnique({
      where: { youtubeId: track.youtubeId }
    });

    if (existingTrack) {
      return NextResponse.json({ track: existingTrack, message: 'Track already exists' });
    }

    // Create the track in the database
    const newTrack = await prisma.track.create({
      data: {
        title: track.title,
        artist: track.artist,
        genre: track.genre || 'Unknown',
        youtubeId: track.youtubeId,
        youtubeUrl: track.youtubeUrl || `https://www.youtube.com/watch?v=${track.youtubeId}`,
        thumbnail: track.thumbnail || `https://img.youtube.com/vi/${track.youtubeId}/mqdefault.jpg`,
        duration: track.duration,
        releaseYear: track.releaseYear
      }
    });

    return NextResponse.json({ track: newTrack, message: 'Track added successfully' });
  } catch (error) {
    console.error('Error adding track:', error);
    return NextResponse.json({ error: 'Failed to add track' }, { status: 500 });
  }
}
