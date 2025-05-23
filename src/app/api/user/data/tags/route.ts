import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET user tags
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access your tags' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get tags from the database
    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        tracks: {
          include: { track: true }
        }
      }
    });

    // Transform to our interface
    const transformedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      trackIds: tag.tracks.map(t => t.track.youtubeId),
      userId: tag.userId
    }));

    return NextResponse.json({ tags: transformedTags });
  } catch (error) {
    console.error('Error getting tags:', error);
    return NextResponse.json(
      { error: 'Failed to get tags' },
      { status: 500 }
    );
  }
}

// POST to create a new tag
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create tags' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { name, color = '#3b82f6' } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // Check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      // Create a mock tag with a generated ID
      const mockTag = {
        id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        color,
        userId
      };

      return NextResponse.json({
        success: true,
        tag: {
          id: mockTag.id,
          name: mockTag.name,
          color: mockTag.color,
          trackIds: [],
          userId: mockTag.userId
        }
      });
    }

    // Check if tag already exists for this user
    const existingTag = await prisma.tag.findUnique({
      where: {
        userId_name: {
          userId,
          name
        }
      }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 400 }
      );
    }

    // Create the tag
    const tag = await prisma.tag.create({
      data: {
        name,
        color,
        userId
      }
    });

    return NextResponse.json({
      success: true,
      tag: {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        trackIds: [],
        userId: tag.userId
      }
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
