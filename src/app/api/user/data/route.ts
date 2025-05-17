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
        { error: 'You must be logged in to access your data' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const dataType = searchParams.get('type') || 'all';
    
    let response: any = {};
    
    // Get favorites
    if (dataType === 'all' || dataType === 'favorites') {
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: { track: true }
      });
      
      response.favorites = favorites.map(fav => ({
        id: fav.track.youtubeId,
        title: fav.track.title,
        artist: fav.track.artist,
        genre: fav.track.genre || 'Unknown',
        youtubeUrl: `https://www.youtube.com/watch?v=${fav.track.youtubeId}`,
        youtubeId: fav.track.youtubeId,
        thumbnail: fav.track.thumbnail
      }));
    }
    
    // Get playlists
    if (dataType === 'all' || dataType === 'playlists') {
      const playlists = await prisma.playlist.findMany({
        where: { userId },
        include: {
          tracks: {
            include: { track: true }
          }
        }
      });
      
      response.playlists = playlists.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || '',
        tracks: playlist.tracks.map(pt => ({
          id: pt.track.youtubeId,
          title: pt.track.title,
          artist: pt.track.artist,
          genre: pt.track.genre || 'Unknown',
          youtubeUrl: `https://www.youtube.com/watch?v=${pt.track.youtubeId}`,
          youtubeId: pt.track.youtubeId,
          thumbnail: pt.track.thumbnail
        })),
        createdAt: playlist.createdAt.toISOString(),
        updatedAt: playlist.updatedAt.toISOString(),
        userId: playlist.userId,
        isPublic: playlist.isPublic
      }));
    }
    
    // Get custom tags
    if (dataType === 'all' || dataType === 'tags') {
      const tags = await prisma.tag.findMany({
        where: { userId },
        include: {
          tracks: true
        }
      });
      
      response.customTags = tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        trackIds: tag.tracks.map(t => t.trackId),
        userId: tag.userId
      }));
    }
    
    // Get recently played
    if (dataType === 'all' || dataType === 'recentlyPlayed') {
      const recentlyPlayed = await prisma.recentlyPlayed.findMany({
        where: { userId },
        include: { track: true },
        orderBy: { playedAt: 'desc' },
        take: 50
      });
      
      response.recentlyPlayed = recentlyPlayed.map(rp => ({
        tracks: [{
          id: rp.track.youtubeId,
          title: rp.track.title,
          artist: rp.track.artist,
          genre: rp.track.genre || 'Unknown',
          youtubeUrl: `https://www.youtube.com/watch?v=${rp.track.youtubeId}`,
          youtubeId: rp.track.youtubeId,
          thumbnail: rp.track.thumbnail
        }],
        timestamp: rp.playedAt.getTime()
      }));
    }
    
    // Get most played
    if (dataType === 'all' || dataType === 'mostPlayed') {
      const mostPlayed = await prisma.playCount.findMany({
        where: { userId },
        include: { track: true },
        orderBy: { count: 'desc' },
        take: 100
      });
      
      response.mostPlayed = mostPlayed.map(mp => ({
        id: mp.track.youtubeId,
        title: mp.track.title,
        artist: mp.track.artist,
        genre: mp.track.genre || 'Unknown',
        youtubeUrl: `https://www.youtube.com/watch?v=${mp.track.youtubeId}`,
        youtubeId: mp.track.youtubeId,
        thumbnail: mp.track.thumbnail,
        count: mp.count
      }));
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
