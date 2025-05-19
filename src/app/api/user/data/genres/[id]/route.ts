import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/user/data/genres/[id]
// Get a specific genre by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const { id: genreId } = await params;

    // Get the genre with its tracks
    const genre = await prisma.genre.findUnique({
      where: {
        id: genreId,
        userId: user.id // Ensure the user owns the genre
      },
      include: {
        tracks: {
          include: {
            track: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }

    // Format the response
    const formattedGenre = {
      id: genre.id,
      name: genre.name,
      description: genre.description,
      coverImage: genre.coverImage,
      color: genre.color,
      isPublic: genre.isPublic,
      order: genre.order,
      tracks: genre.tracks.map(genreTrack => ({
        id: genreTrack.track.id,
        title: genreTrack.track.title,
        artist: genreTrack.track.artist,
        genre: genreTrack.track.genre,
        youtubeId: genreTrack.track.youtubeId,
        youtubeUrl: genreTrack.track.youtubeUrl,
        thumbnail: genreTrack.track.thumbnail,
        duration: genreTrack.track.duration,
        order: genreTrack.order
      }))
    };

    return NextResponse.json(formattedGenre);
  } catch (error) {
    console.error('Error fetching genre:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/data/genres/[id]
// Update a genre
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const { id: genreId } = await params;
    const { name, description, coverImage, color, isPublic } = await req.json();

    // Check if the genre exists and belongs to the user
    const existingGenre = await prisma.genre.findUnique({
      where: {
        id: genreId,
        userId: user.id
      }
    });

    if (!existingGenre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }

    // Update the genre
    const updatedGenre = await prisma.genre.update({
      where: { id: genreId },
      data: {
        name: name !== undefined ? name : existingGenre.name,
        description: description !== undefined ? description : existingGenre.description,
        coverImage: coverImage !== undefined ? coverImage : existingGenre.coverImage,
        color: color !== undefined ? color : existingGenre.color,
        isPublic: isPublic !== undefined ? isPublic : existingGenre.isPublic
      }
    });

    return NextResponse.json(updatedGenre);
  } catch (error) {
    console.error('Error updating genre:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/data/genres/[id]
// Delete a genre
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const { id: genreId } = await params;

    // Check if the genre exists and belongs to the user
    const existingGenre = await prisma.genre.findUnique({
      where: {
        id: genreId,
        userId: user.id
      }
    });

    if (!existingGenre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }

    // Delete the genre (this will cascade delete all genre-track relationships)
    await prisma.genre.delete({
      where: { id: genreId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting genre:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
