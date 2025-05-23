import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET user playlists
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access playlists' },
        { status: 401 }
      );
    }

    // Check if we're fetching for a specific user or the current user
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');
    const userId = targetUserId || session.user.id;

    // Get playlists from the database
    // If fetching for another user, only get public playlists
    const whereClause = targetUserId && targetUserId !== session.user.id
      ? { userId: targetUserId, isPublic: true }
      : { userId };

    const playlists = await prisma.playlist.findMany({
      where: whereClause,
      include: {
        tracks: {
          include: { track: true }
        }
      }
    });

    // Transform to our interface
    const transformedPlaylists = playlists.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || '',
      tracks: playlist.tracks.map(pt => ({
        id: pt.track.youtubeId,
        title: pt.track.title,
        artist: pt.track.artist,
        genre: pt.track.genre || 'Unknown',
        youtubeUrl: `https://www.youtube.com/watch?v=${pt.track.youtubeId}`,
        youtubeId: pt.track.youtubeId,
        thumbnail: pt.track.thumbnail
      })),
      createdAt: playlist.createdAt.toISOString(),
      updatedAt: playlist.updatedAt.toISOString(),
      userId: playlist.userId,
      isPublic: playlist.isPublic
    }));

    return NextResponse.json({ playlists: transformedPlaylists });
  } catch (error) {
    console.error('Error getting playlists:', error);
    return NextResponse.json(
      { error: 'Failed to get playlists' },
      { status: 500 }
    );
  }
}

// POST to create a new playlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create playlists' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { name, description = '', isPublic = false } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Playlist name is required' },
        { status: 400 }
      );
    }

    // Create the playlist
    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        isPublic,
        userId
      }
    });

    return NextResponse.json({
      success: true,
      playlist: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        tracks: [],
        createdAt: playlist.createdAt.toISOString(),
        updatedAt: playlist.updatedAt.toISOString(),
        userId: playlist.userId,
        isPublic: playlist.isPublic
      }
    });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}
