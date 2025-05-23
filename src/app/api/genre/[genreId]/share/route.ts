import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ genreId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { genreId } = await params;
    const { shareToUserId, shareType = 'copy', message } = await req.json();

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the genre to share
    const genre = await prisma.genre.findUnique({
      where: { id: genreId },
      include: {
        tracks: {
          include: {
            track: true
          }
        },
        user: true
      }
    });

    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }

    // Check if user can share this genre (must be public or owned by user)
    if (!genre.isPublic && genre.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Cannot share private genre' }, { status: 403 });
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
    const genreShare = await prisma.genreShare.create({
      data: {
        genreId: genre.id,
        sharedById: currentUser.id,
        sharedToId: shareToUserId || null,
        shareType,
        message
      }
    });

    // If shareType is 'copy', create a copy of the genre for the target user
    if (shareType === 'copy' && targetUser) {
      // Check if target user already has a genre with this name
      const existingGenre = await prisma.genre.findFirst({
        where: {
          userId: targetUser.id,
          name: genre.name
        }
      });

      if (existingGenre) {
        return NextResponse.json({
          error: 'User already has a genre with this name',
          shareId: genreShare.id
        }, { status: 409 });
      }

      // Create copy of the genre
      const copiedGenre = await prisma.genre.create({
        data: {
          name: genre.name,
          description: `${genre.description || ''} (Shared by ${genre.user.name || genre.user.username})`,
          coverImage: genre.coverImage,
          color: genre.color,
          isPublic: false, // Copied genres start as private
          userId: targetUser.id,
          sourceGenreId: genre.id,
          tags: genre.tags
        }
      });

      // Copy all tracks from the original genre
      for (const genreTrack of genre.tracks) {
        await prisma.genreTrack.create({
          data: {
            genreId: copiedGenre.id,
            trackId: genreTrack.trackId,
            order: genreTrack.order
          }
        });
      }

      // Update share count on original genre
      await prisma.genre.update({
        where: { id: genre.id },
        data: {
          shareCount: { increment: 1 }
        }
      });

      return NextResponse.json({
        success: true,
        shareId: genreShare.id,
        copiedGenreId: copiedGenre.id,
        message: 'Genre successfully copied to user'
      });
    }

    // For other share types, just record the share
    await prisma.genre.update({
      where: { id: genre.id },
      data: {
        shareCount: { increment: 1 }
      }
    });

    return NextResponse.json({
      success: true,
      shareId: genreShare.id,
      message: 'Genre shared successfully'
    });

  } catch (error) {
    console.error('Error sharing genre:', error);
    return NextResponse.json(
      { error: 'Failed to share genre' },
      { status: 500 }
    );
  }
}

// Get sharing history for a genre
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ genreId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { genreId } = await params;

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the genre
    const genre = await prisma.genre.findUnique({
      where: { id: genreId }
    });

    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }

    // Check if user can view sharing history (must own the genre)
    if (genre.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get sharing history
    const shares = await prisma.genreShare.findMany({
      where: { genreId },
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
    console.error('Error getting genre sharing history:', error);
    return NextResponse.json(
      { error: 'Failed to get sharing history' },
      { status: 500 }
    );
  }
}
