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
        { error: 'You must be logged in to like content' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    const { postId, commentId } = body;
    
    // Validate that at least one ID is provided
    if (!postId && !commentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    let like;
    
    if (postId) {
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
      const existingLike = await prisma.postLike.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId
          }
        }
      });
      
      if (existingLike) {
        // Unlike the post
        await prisma.postLike.delete({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId
            }
          }
        });
        
        return NextResponse.json({ success: true, liked: false });
      } else {
        // Like the post
        like = await prisma.postLike.create({
          data: {
            userId: session.user.id,
            postId
          }
        });
        
        return NextResponse.json({ success: true, liked: true, like });
      }
    } else if (commentId) {
      // Check if the comment exists
      const comment = await prisma.comment.findUnique({
        where: { id: commentId }
      });
      
      if (!comment) {
        return NextResponse.json(
          { error: 'Comment not found' },
          { status: 404 }
        );
      }
      
      // Check if the user has already liked the comment
      const existingLike = await prisma.commentLike.findUnique({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId
          }
        }
      });
      
      if (existingLike) {
        // Unlike the comment
        await prisma.commentLike.delete({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId
            }
          }
        });
        
        return NextResponse.json({ success: true, liked: false });
      } else {
        // Like the comment
        like = await prisma.commentLike.create({
          data: {
            userId: session.user.id,
            commentId
          }
        });
        
        return NextResponse.json({ success: true, liked: true, like });
      }
    }
  } catch (error) {
    console.error('Error liking content:', error);
    return NextResponse.json(
      { error: 'Failed to like content' },
      { status: 500 }
    );
  }
}
