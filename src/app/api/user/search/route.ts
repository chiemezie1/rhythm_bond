import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get the query from the query parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Missing search query' },
        { status: 400 }
      );
    }

    // Search for users (MySQL doesn't support mode: 'insensitive', but contains is case-insensitive by default in MySQL)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { name: { contains: query } }
        ]
      },
      include: {
        followers: true,
        following: true
      },
      take: 10 // Limit to 10 results
    });

    // Transform to our interface
    const userProfiles = users.map(user => ({
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
    }));

    return NextResponse.json({ users: userProfiles });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
