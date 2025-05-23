import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await params;

    // Get followers with full user details
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            bio: true,
            isVerified: true,
            createdAt: true
          }
        }
      }
    });

    // Transform to our interface
    const followerProfiles = followers.map(follow => ({
      id: follow.follower.id,
      username: follow.follower.username || '',
      displayName: follow.follower.name || '',
      bio: follow.follower.bio || '',
      avatarUrl: follow.follower.image || '/images/default-avatar.png',
      isVerified: follow.follower.isVerified || false,
      joinDate: follow.follower.createdAt.toISOString()
    }));

    return NextResponse.json({ followers: followerProfiles });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followers' },
      { status: 500 }
    );
  }
}
