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
        { error: 'You must be logged in to update preferences' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { trackId, preference } = body;
    
    // Validate required fields
    if (!trackId || !preference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find the track in the database
    const track = await prisma.track.findFirst({
      where: { youtubeId: trackId }
    });
    
    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }
    
    // Update or create the user preference
    const userPreference = await prisma.userPreference.upsert({
      where: {
        userId_trackId: {
          userId: session.user.id,
          trackId: track.id
        }
      },
      update: {
        preference
      },
      create: {
        userId: session.user.id,
        trackId: track.id,
        preference
      }
    });
    
    return NextResponse.json({ success: true, userPreference });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
