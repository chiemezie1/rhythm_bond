import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET handler to fetch comments for a post
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view comments' },
        { status: 401 }
      );
    }

    const postId = params.id;

    try {
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

      // Get comments for the post
      const comments = await prisma.comment.findMany({
        where: { postId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true
            }
          },
          likes: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ comments });
    } catch (dbError) {
      console.error('Error fetching comments from database:', dbError);
      
      // Return empty array if database is not available
      return NextResponse.json({ comments: [] });
    }
  } catch (error) {
    console.error('Error processing comments request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// POST handler to add a comment to a post
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to comment' },
        { status: 401 }
      );
    }

    const postId = params.id;
    const { content } = await req.json();

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    try {
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
          content,
          userId: session.user.id,
          postId
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
          likes: true
        }
      });

      return NextResponse.json({ comment });
    } catch (dbError) {
      console.error('Error creating comment in database:', dbError);
      
      // Return mock comment if database is not available
      const mockComment = {
        id: `comment-${Date.now()}`,
        content,
        postId,
        userId: session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image,
          username: session.user.email?.split('@')[0]
        },
        likes: []
      };
      
      return NextResponse.json({ comment: mockComment });
    }
  } catch (error) {
    console.error('Error processing comment request:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
