import { prisma } from '@/lib/prisma';

interface TrackData {
  id?: string;
  youtubeId?: string;
  title: string;
  artist: string;
  genre?: string;
  thumbnail?: string;
  youtubeUrl?: string;
  duration?: string;
}

/**
 * Find or create a track in the database
 * Handles unique constraint violations gracefully
 */
export async function findOrCreateTrack(trackData: TrackData) {
  // First, try to find the track by ID
  if (trackData.id) {
    const existingTrack = await prisma.track.findUnique({
      where: { id: trackData.id }
    });
    if (existingTrack) return existingTrack;
  }

  // Then try to find by youtubeId
  const youtubeId = trackData.youtubeId || trackData.id;
  if (youtubeId) {
    const existingTrack = await prisma.track.findUnique({
      where: { youtubeId }
    });
    if (existingTrack) return existingTrack;
  }

  // If not found, create a new track
  try {
    return await prisma.track.create({
      data: {
        youtubeId: youtubeId || `track_${Date.now()}`,
        title: trackData.title || "Unknown Track",
        artist: trackData.artist || "Unknown Artist",
        genre: trackData.genre || 'Unknown',
        thumbnail: trackData.thumbnail || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        youtubeUrl: trackData.youtubeUrl || `https://www.youtube.com/watch?v=${youtubeId}`,
        duration: trackData.duration || "0:00"
      }
    });
  } catch (createError: any) {
    // If creation fails due to unique constraint, try to find the track again
    if (createError.code === 'P2002') {
      const existingTrack = await prisma.track.findUnique({
        where: { youtubeId }
      });
      
      if (existingTrack) return existingTrack;
      
      throw new Error('Failed to create or find track after unique constraint violation');
    }
    
    throw createError;
  }
}
