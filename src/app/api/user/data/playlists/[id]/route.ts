import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET a specific playlist
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access playlists' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const playlistId = params.id;
    
    // Get the playlist from the database
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        tracks: {
          include: { track: true }
        }
      }
    });
    
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }
    
    // Check if the user has access to this playlist
    if (playlist.userId !== userId && !playlist.isPublic) {
      return NextResponse.json(
        { error: 'You do not have access to this playlist' },
        { status: 403 }
      );
    }
    
    // Transform to our interface
    const transformedPlaylist = {
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
    };
    
    return NextResponse.json({ playlist: transformedPlaylist });
  } catch (error) {
    console.error('Error getting playlist:', error);
    return NextResponse.json(
      { error: 'Failed to get playlist' },
      { status: 500 }
    );
  }
}

// PUT to update a playlist
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update playlists' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const playlistId = params.id;
    const { name, description, isPublic } = await req.json();
    
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
        { error: 'You do not have permission to update this playlist' },
        { status: 403 }
      );
    }
    
    // Update the playlist
    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        name: name || playlist.name,
        description: description !== undefined ? description : playlist.description,
        isPublic: isPublic !== undefined ? isPublic : playlist.isPublic
      },
      include: {
        tracks: {
          include: { track: true }
        }
      }
    });
    
    // Transform to our interface
    const transformedPlaylist = {
      id: updatedPlaylist.id,
      name: updatedPlaylist.name,
      description: updatedPlaylist.description || '',
      tracks: updatedPlaylist.tracks.map(pt => ({
        id: pt.track.youtubeId,
        title: pt.track.title,
        artist: pt.track.artist,
        genre: pt.track.genre || 'Unknown',
        youtubeUrl: `https://www.youtube.com/watch?v=${pt.track.youtubeId}`,
        youtubeId: pt.track.youtubeId,
        thumbnail: pt.track.thumbnail
      })),
      createdAt: updatedPlaylist.createdAt.toISOString(),
      updatedAt: updatedPlaylist.updatedAt.toISOString(),
      userId: updatedPlaylist.userId,
      isPublic: updatedPlaylist.isPublic
    };
    
    return NextResponse.json({ playlist: transformedPlaylist });
  } catch (error) {
    console.error('Error updating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    );
  }
}

// DELETE a playlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete playlists' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const playlistId = params.id;
    
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
        { error: 'You do not have permission to delete this playlist' },
        { status: 403 }
      );
    }
    
    // Delete the playlist
    await prisma.playlist.delete({
      where: { id: playlistId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}
