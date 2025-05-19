import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Mock data for most played tracks
const mockMostPlayed = [
  {
    id: 'afro_001',
    title: 'Money',
    artist: 'Teni',
    genre: 'Afrobeats & Global Pop',
    youtubeUrl: 'https://www.youtube.com/watch?v=e-3Awv-wuzs',
    youtubeId: 'e-3Awv-wuzs',
    thumbnail: 'https://img.youtube.com/vi/e-3Awv-wuzs/mqdefault.jpg',
    duration: '3:45',
    releaseYear: 2019,
    playCount: 15
  },
  {
    id: 'pop_001',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    genre: 'Pop',
    youtubeUrl: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
    youtubeId: '4NRXx6U8ABQ',
    thumbnail: 'https://img.youtube.com/vi/4NRXx6U8ABQ/mqdefault.jpg',
    duration: '3:22',
    releaseYear: 2020,
    playCount: 12
  },
  {
    id: 'hiphop_001',
    title: 'HUMBLE.',
    artist: 'Kendrick Lamar',
    genre: 'Hip-Hop & Trap',
    youtubeUrl: 'https://www.youtube.com/watch?v=tvTRZJ-4EyI',
    youtubeId: 'tvTRZJ-4EyI',
    thumbnail: 'https://img.youtube.com/vi/tvTRZJ-4EyI/mqdefault.jpg',
    duration: '2:57',
    releaseYear: 2017,
    playCount: 10
  }
];

export async function GET(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access your most played tracks' },
        { status: 401 }
      );
    }

    // Get the limit from the query parameters
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    try {
      // Try to get most played tracks from the database
      const playCountData = await prisma.playCount.findMany({
        where: { userId: session.user.id },
        include: { track: true },
        orderBy: { count: 'desc' },
        take: limit
      });

      // Transform the data to match our interface
      const tracks = playCountData.map(pc => ({
        id: pc.track.youtubeId,
        title: pc.track.title,
        artist: pc.track.artist,
        genre: pc.track.genre,
        youtubeUrl: pc.track.youtubeUrl,
        youtubeId: pc.track.youtubeId,
        thumbnail: pc.track.thumbnail,
        duration: pc.track.duration,
        releaseYear: pc.track.releaseYear,
        playCount: pc.count
      }));

      return NextResponse.json({ tracks });
    } catch (dbError) {
      console.error('Error fetching most played from database:', dbError);
      
      // Return mock data if database is not available
      const limitedMockData = limit ? mockMostPlayed.slice(0, limit) : mockMostPlayed;
      return NextResponse.json({ tracks: limitedMockData });
    }
  } catch (error) {
    console.error('Error processing most played request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
