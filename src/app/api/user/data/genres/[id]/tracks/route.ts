import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// POST /api/user/data/genres/[id]/tracks
// Add a track to a genre
export async function POST(
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
    const { trackId } = await req.json();

    if (!trackId) {
      return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
    }

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

    // Check if the track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId }
    });

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Check if the track is already in the genre
    const existingGenreTrack = await prisma.genreTrack.findUnique({
      where: {
        genreId_trackId: {
          genreId,
          trackId
        }
      }
    });

    if (existingGenreTrack) {
      return NextResponse.json({ error: 'Track is already in this genre' }, { status: 400 });
    }

    // Get the highest order value for tracks in this genre
    const highestOrderTrack = await prisma.genreTrack.findFirst({
      where: { genreId },
      orderBy: { order: 'desc' }
    });

    const newOrder = highestOrderTrack ? highestOrderTrack.order + 1 : 0;

    // Add the track to the genre
    const genreTrack = await prisma.genreTrack.create({
      data: {
        genreId,
        trackId,
        order: newOrder
      },
      include: {
        track: true
      }
    });

    return NextResponse.json({
      id: genreTrack.track.id,
      title: genreTrack.track.title,
      artist: genreTrack.track.artist,
      genre: genreTrack.track.genre,
      youtubeId: genreTrack.track.youtubeId,
      youtubeUrl: genreTrack.track.youtubeUrl,
      thumbnail: genreTrack.track.thumbnail,
      duration: genreTrack.track.duration,
      order: genreTrack.order
    });
  } catch (error) {
    console.error('Error adding track to genre:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/data/genres/[id]/tracks
// Update track order in a genre
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
    const { tracks } = await req.json();

    if (!tracks || !Array.isArray(tracks)) {
      return NextResponse.json({ error: 'Invalid tracks data' }, { status: 400 });
    }

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

    // Update the order of each track in the genre
    const updates = tracks.map((track, index) =>
      prisma.genreTrack.update({
        where: {
          genreId_trackId: {
            genreId,
            trackId: track.id
          }
        },
        data: { order: index }
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating track order in genre:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
