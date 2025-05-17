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
    const playlistId = params.id;
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
          thumbnail: track.thumbnail
        }
      });
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
    
    // Add the track to the playlist
    await prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId: dbTrack.id
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
    const playlistId = params.id;
    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get('trackId');
    
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
    
    // Get the track from the database
    const dbTrack = await prisma.track.findUnique({
      where: { youtubeId: trackId }
    });
    
    if (!dbTrack) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }
    
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
