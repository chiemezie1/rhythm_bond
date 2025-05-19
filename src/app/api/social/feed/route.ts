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

    // Mock data for social feed when database is not available
    const mockPosts = [
      {
        id: '1',
        content: 'Just discovered this amazing track! 🎵',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        user: {
          id: '1',
          name: 'John Doe',
          username: 'johndoe',
          image: '/images/logo.png'
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
              image: '/images/logo_bg_white.png'
            },
            likes: []
          }
        ],
        mediaType: 'track',
        mediaId: 'afro_001'
      },
      {
        id: '2',
        content: 'My current playlist is fire! Check it out.',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        user: {
          id: '3',
          name: 'Alex Johnson',
          username: 'alexj',
          image: '/images/man_with_headse.png'
        },
        likes: [{ userId: '1' }],
        comments: [],
        mediaType: 'playlist',
        mediaId: 'playlist_001'
      },
      {
        id: '3',
        content: 'Who else is loving the new album by this artist?',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        user: {
          id: '4',
          name: 'Sarah Williams',
          username: 'sarahw',
          image: '/images/two_people_enjoying_music.png'
        },
        likes: [{ userId: '1' }, { userId: '2' }, { userId: '3' }],
        comments: [
          {
            id: '2',
            content: 'It\'s their best work yet!',
            createdAt: new Date(Date.now() - 9000000).toISOString(),
            user: {
              id: '1',
              name: 'John Doe',
              username: 'johndoe',
              image: '/images/logo.png'
            },
            likes: [{ userId: '4' }]
          }
        ],
        mediaType: 'album',
        mediaId: 'album_001'
      }
    ];

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

      // Filter mock posts based on the filter
      let filteredPosts = mockPosts;

      if (filter === 'following') {
        // Only return posts from users 1 and 2 (mock following)
        filteredPosts = mockPosts.filter(post =>
          post.user.id === '1' || post.user.id === '2'
        );
      } else if (filter === 'trending') {
        // Sort by engagement (likes + comments)
        filteredPosts = [...mockPosts].sort((a, b) => {
          const aEngagement = a.likes.length + a.comments.length;
          const bEngagement = b.likes.length + b.comments.length;
          return bEngagement - aEngagement;
        });
      }

      return NextResponse.json({ posts: filteredPosts });
    }
  } catch (error) {
    console.error('Error fetching social feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social feed' },
      { status: 500 }
    );
  }
}
