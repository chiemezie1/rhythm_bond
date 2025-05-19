import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view the social feed' },
        { status: 401 }
      );
    }

    // Get the filter from the query parameters
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';

    // No mock data - we'll use the database

    try {
      let posts;

      if (filter === 'all') {
        // Get all public posts and posts from users the current user follows
        posts = await prisma.post.findMany({
          where: {
            OR: [
              { visibility: 'public' },
              {
                visibility: 'followers',
                user: {
                  followers: {
                    some: {
                      followerId: session.user.id
                    }
                  }
                }
              },
              { userId: session.user.id }
            ]
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
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      } else if (filter === 'following') {
        // Get posts only from users the current user follows
        posts = await prisma.post.findMany({
          where: {
            user: {
              followers: {
                some: {
                  followerId: session.user.id
                }
              }
            },
            visibility: {
              in: ['public', 'followers']
            }
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
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      } else if (filter === 'trending') {
        // Get posts sorted by engagement (likes + comments)
        posts = await prisma.post.findMany({
          where: {
            visibility: 'public'
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

        // Sort by engagement
        posts.sort((a, b) => {
          const aEngagement = a.likes.length + a.comments.length;
          const bEngagement = b.likes.length + b.comments.length;
          return bEngagement - aEngagement;
        });
      }

      return NextResponse.json({ posts });
    } catch (dbError) {
      console.error('Error fetching social feed from database:', dbError);
      return NextResponse.json({ posts: [] });
    }
  } catch (error) {
    console.error('Error fetching social feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social feed' },
      { status: 500 }
    );
  }
}
