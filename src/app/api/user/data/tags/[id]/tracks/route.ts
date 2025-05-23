import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET tracks for a specific tag
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view tag tracks' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id: tagId } = await params;

    // Get the tag from the database
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        tracks: {
          include: {
            track: true
          }
        }
      }
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this tag
    if (tag.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to view this tag' },
        { status: 403 }
      );
    }

    // Transform tracks to the expected format
    const tracks = tag.tracks.map(tagTrack => ({
      id: tagTrack.track.id,
      title: tagTrack.track.title,
      artist: tagTrack.track.artist,
      genre: tagTrack.track.genre || 'Unknown',
      youtubeUrl: tagTrack.track.youtubeUrl,
      youtubeId: tagTrack.track.youtubeId,
      thumbnail: tagTrack.track.thumbnail,
      duration: tagTrack.track.duration
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Error getting tracks for tag:', error);
    return NextResponse.json(
      { error: 'Failed to get tracks for tag' },
      { status: 500 }
    );
  }
}

// POST to add a track to a tag
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to add tracks to tags' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id: tagId } = await params;
    const { trackId } = await req.json();

    if (!trackId) {
      return NextResponse.json(
        { error: 'Track ID is required' },
        { status: 400 }
      );
    }

    // Get the tag from the database
    const tag = await prisma.tag.findUnique({
      where: { id: tagId }
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this tag
    if (tag.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this tag' },
        { status: 403 }
      );
    }

    // Check if the track exists in the database
    let dbTrack = await prisma.track.findUnique({
      where: { id: trackId }
    });

    // If not found by ID, try to find by youtubeId
    if (!dbTrack) {
      dbTrack = await prisma.track.findUnique({
        where: { youtubeId: trackId }
      });
    }

    // If still not found, create a new track entry
    if (!dbTrack) {
      // Create a minimal track record
      dbTrack = await prisma.track.create({
        data: {
          youtubeId: trackId,
          title: "Unknown Track",
          artist: "Unknown Artist",
          duration: "0",
          youtubeUrl: `https://www.youtube.com/watch?v=${trackId}`, // Required field
          thumbnail: "https://via.placeholder.com/120x90", // Default thumbnail
        }
      });
    }

    // Check if the track is already tagged
    const existingTagTrack = await prisma.tagTrack.findFirst({
      where: {
        tagId,
        trackId: dbTrack.id
      }
    });

    if (existingTagTrack) {
      return NextResponse.json(
        { error: 'Track is already tagged' },
        { status: 400 }
      );
    }

    // Add the track to the tag
    await prisma.tagTrack.create({
      data: {
        tagId,
        trackId: dbTrack.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding track to tag:', error);
    return NextResponse.json(
      { error: 'Failed to add track to tag' },
      { status: 500 }
    );
  }
}

// DELETE to remove a track from a tag
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to remove tracks from tags' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id: tagId } = await params;

    // Try to get trackId from request body first
    let trackId;
    try {
      const body = await req.json();
      trackId = body.trackId;
    } catch (e) {
      // If parsing the body fails, try to get trackId from URL params
      const { searchParams } = new URL(req.url);
      trackId = searchParams.get('trackId');
    }

    if (!trackId) {
      return NextResponse.json(
        { error: 'Track ID is required' },
        { status: 400 }
      );
    }

    // Get the tag from the database
    const tag = await prisma.tag.findUnique({
      where: { id: tagId }
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this tag
    if (tag.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this tag' },
        { status: 403 }
      );
    }

    // Get the track from the database
    let dbTrack = await prisma.track.findUnique({
      where: { id: trackId }
    });

    // If not found by ID, try to find by youtubeId
    if (!dbTrack) {
      dbTrack = await prisma.track.findUnique({
        where: { youtubeId: trackId }
      });
    }

    if (!dbTrack) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Remove the track from the tag
    await prisma.tagTrack.deleteMany({
      where: {
        tagId,
        trackId: dbTrack.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing track from tag:', error);
    return NextResponse.json(
      { error: 'Failed to remove track from tag' },
      { status: 500 }
    );
  }
}
