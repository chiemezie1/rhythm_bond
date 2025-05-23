import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { playlistId } = await params;
    const { shareToUserId, shareType = 'copy', message } = await req.json();

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the playlist to share
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        tracks: {
          include: {
            track: true
          },
          orderBy: { order: 'asc' }
        },
        user: true
      }
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Check if user can share this playlist (must be public or owned by user)
    if (!playlist.isPublic && playlist.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Cannot share private playlist' }, { status: 403 });
    }

    // If sharing to specific user, verify they exist
    let targetUser = null;
    if (shareToUserId) {
      targetUser = await prisma.user.findUnique({
        where: { id: shareToUserId }
      });
      if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
      }
    }

    // Create the share record
    const playlistShare = await prisma.playlistShare.create({
      data: {
        playlistId: playlist.id,
        sharedById: currentUser.id,
        sharedToId: shareToUserId || null,
        shareType,
        message
      }
    });

    // If shareType is 'copy', create a copy of the playlist for the target user
    if (shareType === 'copy' && targetUser) {
      // Check if target user already has a playlist with this name
      const existingPlaylist = await prisma.playlist.findFirst({
        where: {
          userId: targetUser.id,
          name: playlist.name
        }
      });

      if (existingPlaylist) {
        return NextResponse.json({
          error: 'User already has a playlist with this name',
          shareId: playlistShare.id
        }, { status: 409 });
      }

      // Create copy of the playlist
      const copiedPlaylist = await prisma.playlist.create({
        data: {
          name: playlist.name,
          description: `${playlist.description || ''} (Shared by ${playlist.user.name || playlist.user.username})`,
          coverImage: playlist.coverImage,
          isPublic: false, // Copied playlists start as private
          userId: targetUser.id,
          sourcePlaylistId: playlist.id,
          tags: playlist.tags
        }
      });

      // Copy all tracks from the original playlist
      for (const playlistTrack of playlist.tracks) {
        await prisma.playlistTrack.create({
          data: {
            playlistId: copiedPlaylist.id,
            trackId: playlistTrack.trackId,
            order: playlistTrack.order
          }
        });
      }

      // Update share count on original playlist
      await prisma.playlist.update({
        where: { id: playlist.id },
        data: {
          shareCount: { increment: 1 }
        }
      });

      return NextResponse.json({
        success: true,
        shareId: playlistShare.id,
        copiedPlaylistId: copiedPlaylist.id,
        message: 'Playlist successfully copied to user'
      });
    }

    // For other share types, just record the share
    await prisma.playlist.update({
      where: { id: playlist.id },
      data: {
        shareCount: { increment: 1 }
      }
    });

    return NextResponse.json({
      success: true,
      shareId: playlistShare.id,
      message: 'Playlist shared successfully'
    });

  } catch (error) {
    console.error('Error sharing playlist:', error);
    return NextResponse.json(
      { error: 'Failed to share playlist' },
      { status: 500 }
    );
  }
}

// Get sharing history for a playlist
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { playlistId } = await params;

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the playlist
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Check if user can view sharing history (must own the playlist)
    if (playlist.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get sharing history
    const shares = await prisma.playlistShare.findMany({
      where: { playlistId },
      include: {
        sharedBy: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        sharedTo: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ shares });

  } catch (error) {
    console.error('Error getting playlist sharing history:', error);
    return NextResponse.json(
      { error: 'Failed to get sharing history' },
      { status: 500 }
    );
  }
}
