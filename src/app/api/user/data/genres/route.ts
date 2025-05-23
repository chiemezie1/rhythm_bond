import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/user/data/genres
// Get all genres for the current user or specified user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we're fetching for a specific user or the current user
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    let userId: string;

    if (targetUserId) {
      userId = targetUserId;
    } else {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      userId = user.id;
    }

    // Get all genres for the user
    // If fetching for another user, only get public genres
    let isOtherUser = false;
    if (targetUserId) {
      // Get current user's ID to compare
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      isOtherUser = currentUser ? targetUserId !== currentUser.id : true;
    }

    const whereClause = isOtherUser
      ? { userId, isPublic: true }
      : { userId };

    const genres = await prisma.genre.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
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

    // Format the response
    const formattedGenres = genres.map(genre => ({
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
    }));

    return NextResponse.json({ genres: formattedGenres });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/data/genres
// Create a new genre
export async function POST(req: NextRequest) {
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

    const { name, description, coverImage, color, isPublic } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Genre name is required' }, { status: 400 });
    }

    // Check if the user already has a genre with this name
    const existingGenre = await prisma.genre.findFirst({
      where: {
        userId: user.id,
        name
      }
    });

    if (existingGenre) {
      return NextResponse.json({ error: 'You already have a genre with this name' }, { status: 400 });
    }

    // Get the highest order value for the user's genres
    const highestOrderGenre = await prisma.genre.findFirst({
      where: { userId: user.id },
      orderBy: { order: 'desc' }
    });

    const newOrder = highestOrderGenre ? highestOrderGenre.order + 1 : 0;

    // Create the new genre
    const newGenre = await prisma.genre.create({
      data: {
        name,
        description,
        coverImage,
        color: color || '#3b82f6',
        isPublic: isPublic !== undefined ? isPublic : true,
        userId: user.id,
        order: newOrder
      }
    });

    return NextResponse.json(newGenre);
  } catch (error) {
    console.error('Error creating genre:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/data/genres
// Update genre order
export async function PUT(req: NextRequest) {
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

    const { genres } = await req.json();

    if (!genres || !Array.isArray(genres)) {
      return NextResponse.json({ error: 'Invalid genres data' }, { status: 400 });
    }

    // Update the order of each genre
    const updates = genres.map((genre, index) =>
      prisma.genre.update({
        where: {
          id: genre.id,
          userId: user.id // Ensure the user owns the genre
        },
        data: { order: index }
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating genre order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
