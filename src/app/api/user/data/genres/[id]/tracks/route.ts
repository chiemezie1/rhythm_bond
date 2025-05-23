import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// POST /api/user/data/genres/[id]/tracks
// Add a track to a genre
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: genreId } = await params;
    const { trackId, track: trackData } = await req.json();

    if (!trackId) {
      return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
    }

    // Check if the genre exists and belongs to the user
    const genre = await prisma.genre.findUnique({
      where: {
        id: genreId,
        userId: user.id
      }
    });

    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }

    // Check if the track exists
    let track = await prisma.track.findUnique({
      where: { id: trackId }
    });

    // If not found by ID, try to find by youtubeId
    if (!track) {
      track = await prisma.track.findUnique({
        where: { youtubeId: trackId }
      });
    }

    // If still not found, create a new track record
    if (!track) {
      try {
        // Use track data if provided, otherwise try to get details from the music API
        let youtubeId = trackId;
        let title = "Unknown Track";
        let artist = "Unknown Artist";
        let duration = "0:00";
        let thumbnail = `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`;

        // If track data is provided, use it
        if (trackData) {
          title = trackData.title || title;
          artist = trackData.artist || artist;
          duration = trackData.duration || duration;
          youtubeId = trackData.youtubeId || trackData.id || trackId;
          thumbnail = trackData.thumbnail || thumbnail;
        } else {
          // If it's a custom ID (like afro_001), extract genre and track number
          if (trackId.includes('_')) {
            const parts = trackId.split('_');
            const genre = parts[0];
            const trackNum = parts[1];

            // Try to fetch the track from the music API
            const response = await fetch(`/api/music?genre=${genre}`);
            if (response.ok) {
              const data = await response.json();
              if (data.genre && data.genre.tracks) {
                // Find the track by its number in the genre
                const trackIndex = parseInt(trackNum) - 1;
                if (data.genre.tracks[trackIndex]) {
                  const apiTrack = data.genre.tracks[trackIndex];
                  title = apiTrack.title;
                  artist = apiTrack.artist;
                  youtubeId = apiTrack.youtubeId;
                  duration = apiTrack.duration || duration;
                  thumbnail = apiTrack.thumbnail || thumbnail;
                }
              }
            }
          }
        }

        // Create the track with the best information we have
        try {
          track = await prisma.track.create({
            data: {
              youtubeId: youtubeId,
              title: title,
              artist: artist,
              duration: duration,
              youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
              thumbnail: thumbnail
            }
          });
        } catch (createError) {
          // If creation fails due to unique constraint, try to find the track again
          if ((createError as any).code === 'P2002') {
            track = await prisma.track.findUnique({
              where: { youtubeId: youtubeId }
            });

            if (!track) {
              throw new Error('Failed to create or find track');
            }
          } else {
            throw createError;
          }
        }
      } catch (error) {
        console.error('Error creating track:', error);
        // Create a minimal track record as fallback
        try {
          track = await prisma.track.create({
            data: {
              youtubeId: trackId,
              title: trackData?.title || "Unknown Track",
              artist: trackData?.artist || "Unknown Artist",
              duration: trackData?.duration || "0:00",
              youtubeUrl: `https://www.youtube.com/watch?v=${trackId}`,
              thumbnail: trackData?.thumbnail || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`
            }
          });
        } catch (fallbackError) {
          // If even the fallback fails due to unique constraint, find the existing track
          if ((fallbackError as any).code === 'P2002') {
            track = await prisma.track.findUnique({
              where: { youtubeId: trackId }
            });

            if (!track) {
              throw new Error('Failed to create or find track');
            }
          } else {
            throw fallbackError;
          }
        }
      }
    }

    // Check if the track is already in the genre
    const existingGenreTrack = await prisma.genreTrack.findUnique({
      where: {
        genreId_trackId: {
          genreId,
          trackId: track.id // Use track.id instead of trackId
        }
      }
    });

    if (existingGenreTrack) {
      return NextResponse.json({ error: 'Track is already in this genre' }, { status: 400 });
    }

    // Get the highest order value for tracks in this genre
    const highestOrderTrack = await prisma.genreTrack.findFirst({
      where: { genreId },
      orderBy: { order: 'desc' }
    });

    const newOrder = highestOrderTrack ? highestOrderTrack.order + 1 : 0;

    // Add the track to the genre
    const genreTrack = await prisma.genreTrack.create({
      data: {
        genreId,
        trackId: track.id, // Use track.id instead of trackId
        order: newOrder
      },
      include: {
        track: true
      }
    });

    return NextResponse.json({
      id: genreTrack.track.id,
      title: genreTrack.track.title,
      artist: genreTrack.track.artist,
      genre: genreTrack.track.genre,
      youtubeId: genreTrack.track.youtubeId,
      youtubeUrl: genreTrack.track.youtubeUrl,
      thumbnail: genreTrack.track.thumbnail,
      duration: genreTrack.track.duration,
      order: genreTrack.order
    });
  } catch (error) {
    console.error('Error adding track to genre:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/data/genres/[id]/tracks
// Update track order in a genre
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: genreId } = await params;
    const { tracks } = await req.json();

    if (!tracks || !Array.isArray(tracks)) {
      return NextResponse.json({ error: 'Invalid tracks data' }, { status: 400 });
    }

    // Check if the genre exists and belongs to the user
    const genre = await prisma.genre.findUnique({
      where: {
        id: genreId,
        userId: user.id
      }
    });

    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }

    // Update the order of each track in the genre
    const updates = tracks.map((track, index) =>
      prisma.genreTrack.update({
        where: {
          genreId_trackId: {
            genreId,
            trackId: track.id
          }
        },
        data: { order: index }
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating track order in genre:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
