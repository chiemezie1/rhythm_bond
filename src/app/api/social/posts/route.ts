import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// No mock data - we'll use the database

// GET handler to fetch posts
export async function GET(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view posts' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    try {
      // Fetch posts from database
      const posts = await prisma.post.findMany({
        where: userId ? { userId } : undefined,
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
          comments: {
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return NextResponse.json({ posts });
    } catch (dbError) {
      console.error('Error fetching posts from database:', dbError);
      return NextResponse.json({ posts: [] });
    }
  } catch (error) {
    console.error('Error processing posts request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// POST handler to create a new post
export async function POST(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a post' },
        { status: 401 }
      );
    }

    // Get the post data from the request body
    const { content, mediaType, mediaId, visibility = 'public' } = await req.json();

    // Validate that either content or media is provided
    if ((!content || content.trim() === '') && (!mediaType || !mediaId)) {
      return NextResponse.json(
        { error: 'Post must have either content or media' },
        { status: 400 }
      );
    }

    try {
      // Create the post in the database
      const post = await prisma.post.create({
        data: {
          content,
          userId: session.user.id,
          mediaType,
          mediaId,
          visibility
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
          comments: {
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
          }
        }
      });

      return NextResponse.json({ post });
    } catch (dbError) {
      console.error('Error creating post in database:', dbError);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing create post request:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
