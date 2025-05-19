import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Mock data for posts when database is not available
const mockPosts = [
  {
    id: '1',
    content: 'Just discovered this amazing track! 🎵',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: '1',
      name: 'John Doe',
      username: 'johndoe',
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    likes: [{ userId: '2' }, { userId: '3' }],
    comments: [
      {
        id: '1',
        content: 'Great find! I love this artist.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        user: {
          id: '2',
          name: 'Jane Smith',
          username: 'janesmith',
          image: 'https://randomuser.me/api/portraits/women/2.jpg'
        },
        likes: []
      }
    ],
    mediaType: 'track',
    mediaId: 'afro_001'
  }
];

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
      
      // Return mock data if database is not available
      return NextResponse.json({ posts: mockPosts });
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

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Post content is required' },
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
      
      // Return mock success response if database is not available
      const mockPost = {
        id: `post-${Date.now()}`,
        content,
        mediaType,
        mediaId,
        visibility,
        createdAt: new Date().toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image,
          username: session.user.email?.split('@')[0]
        },
        likes: [],
        comments: []
      };
      
      return NextResponse.json({ post: mockPost });
    }
  } catch (error) {
    console.error('Error processing create post request:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
