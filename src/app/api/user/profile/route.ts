import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get the user ID from the query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    
    if (!userId && !username) {
      return NextResponse.json(
        { error: 'Missing user ID or username' },
        { status: 400 }
      );
    }
    
    let user;
    
    if (userId) {
      // Get user by ID
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          followers: true,
          following: true
        }
      });
    } else if (username) {
      // Get user by username
      user = await prisma.user.findFirst({
        where: { username },
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
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update your profile' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { displayName, username, bio } = body;
    
    // Validate required fields
    if (!displayName || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if username is already taken by another user
    if (username !== session.user.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: { not: session.user.id }
        }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }
    }
    
    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: displayName,
        username,
        bio
      },
      include: {
        followers: true,
        following: true
      }
    });
    
    // Transform to our interface
    const userProfile = {
      id: updatedUser.id,
      username: updatedUser.username || '',
      displayName: updatedUser.name || '',
      bio: updatedUser.bio || '',
      avatarUrl: updatedUser.image || '',
      coverUrl: updatedUser.coverImage || '',
      isVerified: updatedUser.isVerified || false,
      joinDate: updatedUser.createdAt.toISOString(),
      followers: updatedUser.followers.map(f => f.followerId),
      following: updatedUser.following.map(f => f.followingId)
    };
    
    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
