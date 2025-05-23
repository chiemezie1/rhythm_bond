import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Helper function to generate username from name
function generateUsername(name: string): string {
  // Remove spaces and special characters, convert to lowercase
  const baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15); // Limit length
  
  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseUsername}${randomSuffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to fix your username' },
        { status: 401 }
      );
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if username needs fixing (if it looks like an ID or is null)
    const needsFix = !currentUser.username || 
                     currentUser.username.startsWith('user_') ||
                     currentUser.username.length > 20;

    if (!needsFix) {
      return NextResponse.json({
        message: 'Username is already valid',
        username: currentUser.username
      });
    }

    // Generate a new username based on the user's name
    let newUsername = generateUsername(currentUser.name || 'user');
    
    // Ensure it's unique
    let usernameExists = await prisma.user.findUnique({
      where: { username: newUsername },
    });

    while (usernameExists) {
      newUsername = generateUsername(currentUser.name || 'user');
      usernameExists = await prisma.user.findUnique({
        where: { username: newUsername },
      });
    }

    // Update the user's username
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { username: newUsername }
    });

    return NextResponse.json({
      message: 'Username updated successfully',
      oldUsername: currentUser.username,
      newUsername: updatedUser.username
    });

  } catch (error) {
    console.error('Error fixing username:', error);
    return NextResponse.json(
      { error: 'Failed to fix username' },
      { status: 500 }
    );
  }
}
