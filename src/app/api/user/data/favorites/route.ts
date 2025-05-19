import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET user favorites
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access your favorites' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get favorites from the database
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { track: true }
    });

    // Transform to our interface
    const transformedFavorites = favorites.map(fav => ({
      id: fav.track.youtubeId,
      title: fav.track.title,
      artist: fav.track.artist,
      genre: fav.track.genre || 'Unknown',
      youtubeUrl: `https://www.youtube.com/watch?v=${fav.track.youtubeId}`,
      youtubeId: fav.track.youtubeId,
      thumbnail: fav.track.thumbnail
    }));

    return NextResponse.json({ favorites: transformedFavorites });
  } catch (error) {
    console.error('Error getting favorites:', error);
    return NextResponse.json(
      { error: 'Failed to get favorites' },
      { status: 500 }
    );
  }
}

// POST to toggle a favorite
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to manage favorites' },
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

    // Check if the track exists in the database
    let dbTrack = await prisma.track.findUnique({
      where: { youtubeId: track.id }
    });

    // If the track doesn't exist, create it
    if (!dbTrack) {
      dbTrack = await prisma.track.create({
        data: {
          youtubeId: track.id,
          title: track.title,
          artist: track.artist,
          genre: track.genre || 'Unknown',
          thumbnail: track.thumbnail,
          youtubeUrl: `https://www.youtube.com/watch?v=${track.id}` // Add the required youtubeUrl field
        }
      });
    }

    // Check if the track is already a favorite
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        trackId: dbTrack.id
      }
    });

    let isNowFavorite = false;

    if (existingFavorite) {
      // If it's already a favorite, remove it
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });
    } else {
      // If it's not a favorite, add it
      await prisma.favorite.create({
        data: {
          userId,
          trackId: dbTrack.id
        }
      });
      isNowFavorite = true;
    }

    return NextResponse.json({ success: true, isNowFavorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}
