import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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
    const tagId = params.id;
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
      where: { youtubeId: trackId }
    });
    
    if (!dbTrack) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
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
    const tagId = params.id;
    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get('trackId');
    
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
    const dbTrack = await prisma.track.findUnique({
      where: { youtubeId: trackId }
    });
    
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
