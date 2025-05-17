import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to share content' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { type, content, mediaId, mediaType, visibility } = body;
    
    // Validate required fields
    if (!type || !content || !visibility) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create the post in the database
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        type,
        content,
        mediaId,
        mediaType,
        visibility,
        shareCount: 0
      }
    });
    
    // If sharing a playlist, create a shared playlist record
    if (type === 'playlist' && mediaId) {
      await prisma.sharedPlaylist.create({
        data: {
          playlistId: mediaId,
          userId: session.user.id,
          sharedAt: new Date()
        }
      });
    }
    
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Error sharing content:', error);
    return NextResponse.json(
      { error: 'Failed to share content' },
      { status: 500 }
    );
  }
}
