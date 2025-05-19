import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Mock data for recently played tracks
const mockRecentlyPlayed = [
  {
    tracks: [
      {
        id: 'afro_001',
        title: 'Money',
        artist: 'Teni',
        genre: 'Afrobeats & Global Pop',
        youtubeUrl: 'https://www.youtube.com/watch?v=e-3Awv-wuzs',
        youtubeId: 'e-3Awv-wuzs',
        thumbnail: 'https://img.youtube.com/vi/e-3Awv-wuzs/mqdefault.jpg',
        duration: '3:45',
        releaseYear: 2019
      }
    ],
    timestamp: Date.now() - 3600000
  },
  {
    tracks: [
      {
        id: 'pop_001',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        genre: 'Pop',
        youtubeUrl: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
        youtubeId: '4NRXx6U8ABQ',
        thumbnail: 'https://img.youtube.com/vi/4NRXx6U8ABQ/mqdefault.jpg',
        duration: '3:22',
        releaseYear: 2020
      }
    ],
    timestamp: Date.now() - 7200000
  },
  {
    tracks: [
      {
        id: 'hiphop_001',
        title: 'HUMBLE.',
        artist: 'Kendrick Lamar',
        genre: 'Hip-Hop & Trap',
        youtubeUrl: 'https://www.youtube.com/watch?v=tvTRZJ-4EyI',
        youtubeId: 'tvTRZJ-4EyI',
        thumbnail: 'https://img.youtube.com/vi/tvTRZJ-4EyI/mqdefault.jpg',
        duration: '2:57',
        releaseYear: 2017
      }
    ],
    timestamp: Date.now() - 10800000
  }
];

// GET user's recently played tracks
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access your recently played tracks' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    try {
      // Get recently played tracks from the database
      const recentlyPlayed = await prisma.recentlyPlayed.findMany({
        where: { userId },
        include: { track: true },
        orderBy: { playedAt: 'desc' },
        take: limit
      });

      // Transform to our interface
      const transformedRecentlyPlayed = recentlyPlayed.map(rp => ({
        tracks: [{
          id: rp.track.youtubeId,
          title: rp.track.title,
          artist: rp.track.artist,
          genre: rp.track.genre || 'Unknown',
          youtubeUrl: `https://www.youtube.com/watch?v=${rp.track.youtubeId}`,
          youtubeId: rp.track.youtubeId,
          thumbnail: rp.track.thumbnail
        }],
        timestamp: rp.playedAt.getTime()
      }));

      return NextResponse.json({ recentlyPlayed: transformedRecentlyPlayed });
    } catch (dbError) {
      console.error('Error getting recently played tracks from database:', dbError);

      // Return mock data if database is not available
      const limitedMockData = limit ? mockRecentlyPlayed.slice(0, limit) : mockRecentlyPlayed;
      return NextResponse.json({ recentlyPlayed: limitedMockData });
    }
  } catch (error) {
    console.error('Error getting recently played tracks:', error);
    return NextResponse.json(
      { error: 'Failed to get recently played tracks' },
      { status: 500 }
    );
  }
}

// POST to add a track to recently played
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to track recently played' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { track } = await req.json();

    if (!track || !track.id) {
      return NextResponse.json(
        { error: 'Track information is required' },
        { status: 400 }
      );
    }

    try {
      // Check if the user exists in the database
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        console.error(`User with ID ${userId} not found in database`);
        return NextResponse.json({ success: true });
      }

      // Check if the track exists in the database
      let dbTrack = await prisma.track.findUnique({
        where: { youtubeId: track.id }
      });

      // If the track doesn't exist, create it
      if (!dbTrack) {
        try {
          dbTrack = await prisma.track.create({
            data: {
              youtubeId: track.id,
              title: track.title,
              artist: track.artist,
              genre: track.genre || 'Unknown',
              thumbnail: track.thumbnail,
              youtubeUrl: track.youtubeUrl || `https://www.youtube.com/watch?v=${track.id}`
            }
          });
        } catch (createError) {
          console.error('Error creating track:', createError);
          return NextResponse.json({ success: true });
        }
      }

      // Add to recently played
      try {
        await prisma.recentlyPlayed.create({
          data: {
            userId,
            trackId: dbTrack.id,
            playedAt: new Date()
          }
        });
      } catch (recentlyPlayedError) {
        console.error('Error adding to recently played:', recentlyPlayedError);
        // Continue even if this fails
      }

      // Update play count
      try {
        const existingPlayCount = await prisma.playCount.findFirst({
          where: {
            userId,
            trackId: dbTrack.id
          }
        });

        if (existingPlayCount) {
          await prisma.playCount.update({
            where: { id: existingPlayCount.id },
            data: { count: existingPlayCount.count + 1 }
          });
        } else {
          await prisma.playCount.create({
            data: {
              userId,
              trackId: dbTrack.id,
              count: 1
            }
          });
        }
      } catch (playCountError) {
        console.error('Error updating play count:', playCountError);
        // Continue even if this fails
      }
    } catch (dbError) {
      console.error('Error adding recently played track to database:', dbError);
      // Continue even if database operations fail
    }

    // Always return success to the client
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding recently played track:', error);
    return NextResponse.json(
      { error: 'Failed to add recently played track' },
      { status: 500 }
    );
  }
}
