import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET a specific tag
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access tags' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const tagId = params.id;
    
    // Get the tag from the database
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        tracks: {
          include: { track: true }
        }
      }
    });
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    // Check if the user has access to this tag
    if (tag.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have access to this tag' },
        { status: 403 }
      );
    }
    
    // Transform to our interface
    const transformedTag = {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      trackIds: tag.tracks.map(t => t.track.youtubeId),
      userId: tag.userId
    };
    
    return NextResponse.json({ tag: transformedTag });
  } catch (error) {
    console.error('Error getting tag:', error);
    return NextResponse.json(
      { error: 'Failed to get tag' },
      { status: 500 }
    );
  }
}

// PUT to update a tag
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update tags' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const tagId = params.id;
    const { name, color } = await req.json();
    
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
        { error: 'You do not have permission to update this tag' },
        { status: 403 }
      );
    }
    
    // Update the tag
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name: name || tag.name,
        color: color || tag.color
      },
      include: {
        tracks: {
          include: { track: true }
        }
      }
    });
    
    // Transform to our interface
    const transformedTag = {
      id: updatedTag.id,
      name: updatedTag.name,
      color: updatedTag.color,
      trackIds: updatedTag.tracks.map(t => t.track.youtubeId),
      userId: updatedTag.userId
    };
    
    return NextResponse.json({ tag: transformedTag });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

// DELETE a tag
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete tags' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const tagId = params.id;
    
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
        { error: 'You do not have permission to delete this tag' },
        { status: 403 }
      );
    }
    
    // Delete the tag
    await prisma.tag.delete({
      where: { id: tagId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
