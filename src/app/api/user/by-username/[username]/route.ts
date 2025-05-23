import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Find user by exact username match
    let user = await prisma.user.findFirst({
      where: {
        username: username
      },
      include: {
        followers: true,
        following: true
      }
    });

    // If not found and username starts with "user_", try to find by ID
    if (!user && username.startsWith('user_')) {
      const possibleId = username.replace('user_', '');
      user = await prisma.user.findFirst({
        where: {
          id: possibleId
        },
        include: {
          followers: true,
          following: true
        }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Transform to our interface
    const userProfile = {
      id: user.id,
      username: user.username || '',
      displayName: user.name || '',
      bio: user.bio || '',
      avatarUrl: user.image || '',
      coverUrl: user.coverImage || '',
      isVerified: user.isVerified || false,
      joinDate: user.createdAt.toISOString(),
      followers: user.followers.map(f => f.followerId),
      following: user.following.map(f => f.followingId)
    };

    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error('Error looking up user by username:', error);
    return NextResponse.json(
      { error: 'Failed to lookup user' },
      { status: 500 }
    );
  }
}
