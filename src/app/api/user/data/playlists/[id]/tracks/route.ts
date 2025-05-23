import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST to add a track to a playlist
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to add tracks to playlists' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id: playlistId } = await params;
    const { track } = await req.json();

    if (!track || !track.id) {
      return NextResponse.json(
        { error: 'Track information is required' },
        { status: 400 }
      );
    }

    // Get the playlist from the database
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this playlist
    if (playlist.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this playlist' },
        { status: 403 }
      );
    }

    // Check if the track exists in the database by ID first, then by youtubeId
    let dbTrack = await prisma.track.findUnique({
      where: { id: track.id }
    });

    // If not found by ID, try by youtubeId
    if (!dbTrack && track.youtubeId) {
      dbTrack = await prisma.track.findUnique({
        where: { youtubeId: track.youtubeId }
      });
    }

    // If still not found, try by youtubeId using track.id as fallback
    if (!dbTrack) {
      dbTrack = await prisma.track.findUnique({
        where: { youtubeId: track.id }
      });
    }

    // If the track doesn't exist, create it
    if (!dbTrack) {
      try {
        dbTrack = await prisma.track.create({
          data: {
            youtubeId: track.youtubeId || track.id,
            title: track.title,
            artist: track.artist,
            genre: track.genre || 'Unknown',
            thumbnail: track.thumbnail,
            youtubeUrl: track.youtubeUrl || `https://www.youtube.com/watch?v=${track.youtubeId || track.id}`,
            duration: track.duration || "0:00"
          }
        });
      } catch (createError) {
        // If creation fails due to unique constraint, try to find the track again
        if ((createError as any).code === 'P2002') {
          dbTrack = await prisma.track.findUnique({
            where: { youtubeId: track.youtubeId || track.id }
          });

          if (!dbTrack) {
            throw new Error('Failed to create or find track');
          }
        } else {
          throw createError;
        }
      }
    }

    // Check if the track is already in the playlist
    const existingTrack = await prisma.playlistTrack.findFirst({
      where: {
        playlistId,
        trackId: dbTrack.id
      }
    });

    if (existingTrack) {
      return NextResponse.json(
        { error: 'Track is already in the playlist' },
        { status: 400 }
      );
    }

    // Get the highest order value for tracks in this playlist
    const highestOrderTrack = await prisma.playlistTrack.findFirst({
      where: { playlistId },
      orderBy: { order: 'desc' }
    });

    const newOrder = highestOrderTrack ? highestOrderTrack.order + 1 : 0;

    // Add the track to the playlist
    await prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId: dbTrack.id,
        order: newOrder
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    return NextResponse.json(
      { error: 'Failed to add track to playlist' },
      { status: 500 }
    );
  }
}

// DELETE to remove a track from a playlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to remove tracks from playlists' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id: playlistId } = await params;
    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get('trackId');

    console.log('DELETE request - trackId:', trackId);
    console.log('DELETE request - playlistId:', playlistId);

    if (!trackId) {
      return NextResponse.json(
        { error: 'Track ID is required' },
        { status: 400 }
      );
    }

    // Get the playlist from the database
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this playlist
    if (playlist.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this playlist' },
        { status: 403 }
      );
    }

    // Get the track from the database by ID first, then by youtubeId
    let dbTrack = await prisma.track.findUnique({
      where: { id: trackId }
    });

    console.log('Track found by ID:', dbTrack ? 'Yes' : 'No');

    // If not found by ID, try by youtubeId
    if (!dbTrack) {
      dbTrack = await prisma.track.findUnique({
        where: { youtubeId: trackId }
      });
      console.log('Track found by youtubeId:', dbTrack ? 'Yes' : 'No');
    }

    if (!dbTrack) {
      console.log('Track not found in database');
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    console.log('Found track:', dbTrack.id, dbTrack.title);

    // Remove the track from the playlist
    await prisma.playlistTrack.deleteMany({
      where: {
        playlistId,
        trackId: dbTrack.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing track from playlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove track from playlist' },
      { status: 500 }
    );
  }
}
