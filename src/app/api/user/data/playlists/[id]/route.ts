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
    const { id: playlistId } = await params;

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
    const tracks = playlist.tracks.map(pt => ({
      id: pt.track.id, // Use the actual track ID from database
      title: pt.track.title,
      artist: pt.track.artist,
      genre: pt.track.genre || 'Unknown',
      youtubeUrl: `https://www.youtube.com/watch?v=${pt.track.youtubeId}`,
      youtubeId: pt.track.youtubeId,
      thumbnail: pt.track.thumbnail,
      duration: pt.track.duration
    }));

    const transformedPlaylist = {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || '',
      coverUrl: tracks.length > 0 ? tracks[0].thumbnail : '/images/logo.png',
      tracks: tracks,
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

// PATCH to partially update a playlist
export async function PATCH(
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
    const { id: playlistId } = await params;
    const body = await req.json();

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

    // Build update data object with only provided fields
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;

    // Update the playlist
    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: updateData,
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
        id: pt.track.id, // Use the actual track ID from database
        title: pt.track.title,
        artist: pt.track.artist,
        genre: pt.track.genre || 'Unknown',
        youtubeUrl: `https://www.youtube.com/watch?v=${pt.track.youtubeId}`,
        youtubeId: pt.track.youtubeId,
        thumbnail: pt.track.thumbnail,
        duration: pt.track.duration
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
    const { id: playlistId } = await params;
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
        id: pt.track.id, // Use the actual track ID from database
        title: pt.track.title,
        artist: pt.track.artist,
        genre: pt.track.genre || 'Unknown',
        youtubeUrl: `https://www.youtube.com/watch?v=${pt.track.youtubeId}`,
        youtubeId: pt.track.youtubeId,
        thumbnail: pt.track.thumbnail,
        duration: pt.track.duration
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
    const { id: playlistId } = await params;

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
