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
        { error: 'You must be logged in to comment' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { postId, content, parentId } = body;
    
    // Validate required fields
    if (!postId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content,
        parentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true
          }
        }
      }
    });
    
    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get the post ID from the query parameters
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Missing post ID' },
        { status: 400 }
      );
    }
    
    // Get all comments for the post
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true
              }
            },
            likes: {
              select: {
                userId: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
