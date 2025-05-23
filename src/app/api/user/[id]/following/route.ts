import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await params;

    // Get following with full user details
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
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
    const followingProfiles = following.map(follow => ({
      id: follow.following.id,
      username: follow.following.username || '',
      displayName: follow.following.name || '',
      bio: follow.following.bio || '',
      avatarUrl: follow.following.image || '/images/default-avatar.png',
      isVerified: follow.following.isVerified || false,
      joinDate: follow.following.createdAt.toISOString()
    }));

    return NextResponse.json({ following: followingProfiles });
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json(
      { error: 'Failed to fetch following' },
      { status: 500 }
    );
  }
}
