import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const sortBy = searchParams.get('sortBy') || 'shareCount'; // shareCount, createdAt, name
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build where clause for discovering genres
    const whereClause: any = {
      isPublic: true,
      userId: { not: currentUser.id }, // Don't show user's own genres
      OR: []
    };

    // Add search filters
    if (search) {
      whereClause.OR.push(
        { name: { contains: search } },
        { description: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { username: { contains: search } } }
      );
    }

    // Add tag filters
    if (tags.length > 0) {
      for (const tag of tags) {
        whereClause.OR.push({
          tags: { contains: tag }
        });
      }
    }

    // If no search or tags, remove OR clause
    if (whereClause.OR.length === 0) {
      delete whereClause.OR;
    }

    // Build order by clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'shareCount':
        orderBy = { shareCount: 'desc' };
        break;
      case 'createdAt':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      default:
        orderBy = { shareCount: 'desc' };
    }

    // Get discoverable genres
    const genres = await prisma.genre.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        tracks: {
          include: {
            track: {
              select: {
                id: true,
                title: true,
                artist: true,
                thumbnail: true
              }
            }
          },
          take: 3 // Just show first 3 tracks as preview
        },
        _count: {
          select: {
            tracks: true,
            shares: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    });

    // Transform the data for frontend
    const transformedGenres = genres.map(genre => ({
      id: genre.id,
      name: genre.name,
      description: genre.description,
      coverImage: genre.coverImage,
      color: genre.color,
      shareCount: genre.shareCount,
      trackCount: genre._count.tracks,
      totalShares: genre._count.shares,
      tags: genre.tags ? JSON.parse(genre.tags) : [],
      createdAt: genre.createdAt,
      creator: {
        id: genre.user.id,
        name: genre.user.name,
        username: genre.user.username,
        image: genre.user.image
      },
      previewTracks: genre.tracks.map(gt => ({
        id: gt.track.id,
        title: gt.track.title,
        artist: gt.track.artist,
        thumbnail: gt.track.thumbnail
      }))
    }));

    // Get total count for pagination
    const totalCount = await prisma.genre.count({
      where: whereClause
    });

    return NextResponse.json({
      genres: transformedGenres,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error discovering genres:', error);
    return NextResponse.json(
      { error: 'Failed to discover genres' },
      { status: 500 }
    );
  }
}

// Get popular tags for filtering
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all public genres and extract tags
    const genres = await prisma.genre.findMany({
      where: {
        isPublic: true,
        tags: { not: null }
      },
      select: {
        tags: true
      }
    });

    // Count tag frequency
    const tagCounts: { [key: string]: number } = {};

    for (const genre of genres) {
      if (genre.tags) {
        try {
          const tags = JSON.parse(genre.tags);
          for (const tag of tags) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    // Sort tags by frequency and return top 20
    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    return NextResponse.json({ popularTags });

  } catch (error) {
    console.error('Error getting popular tags:', error);
    return NextResponse.json(
      { error: 'Failed to get popular tags' },
      { status: 500 }
    );
  }
}
