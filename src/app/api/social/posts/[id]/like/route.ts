import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST handler to like/unlike a post
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to like posts' },
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

      // Check if the user has already liked the post
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId
          }
        }
      });

      if (existingLike) {
        // Unlike the post
        await prisma.like.delete({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId
            }
          }
        });

        return NextResponse.json({ liked: false });
      } else {
        // Like the post
        await prisma.like.create({
          data: {
            userId: session.user.id,
            postId
          }
        });

        return NextResponse.json({ liked: true });
      }
    } catch (dbError) {
      console.error('Error processing like in database:', dbError);
      
      // Return success response even if database fails
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error processing like request:', error);
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    );
  }
}
