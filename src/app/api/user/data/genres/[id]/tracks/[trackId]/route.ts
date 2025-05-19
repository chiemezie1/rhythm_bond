import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// DELETE /api/user/data/genres/[id]/tracks/[trackId]
// Remove a track from a genre
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; trackId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: genreId, trackId } = await params;

    // Check if the genre exists and belongs to the user
    const genre = await prisma.genre.findUnique({
      where: {
        id: genreId,
        userId: user.id
      }
    });

    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }

    // Check if the track is in the genre
    const genreTrack = await prisma.genreTrack.findUnique({
      where: {
        genreId_trackId: {
          genreId,
          trackId
        }
      }
    });

    if (!genreTrack) {
      return NextResponse.json({ error: 'Track is not in this genre' }, { status: 404 });
    }

    // Remove the track from the genre
    await prisma.genreTrack.delete({
      where: {
        genreId_trackId: {
          genreId,
          trackId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing track from genre:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
