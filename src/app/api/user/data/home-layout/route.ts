import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/user/data/home-layout
// Get the user's home layout configuration
export async function GET(req: NextRequest) {
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

    // Get the user's home layout
    const homeLayout = await prisma.homeLayout.findUnique({
      where: { userId: user.id }
    });

    if (!homeLayout) {
      // Return default layout if none exists
      return NextResponse.json({
        layoutConfig: JSON.stringify({
          sections: [
            { type: 'musicCategories', visible: true, order: 0 },
            { type: 'recentlyPlayed', visible: true, order: 1 },
            { type: 'favorites', visible: true, order: 2 },
            { type: 'mostPlayed', visible: true, order: 3 },
            { type: 'playlists', visible: true, order: 4 },
            { type: 'recommended', visible: true, order: 5 },
            { type: 'trending', visible: true, order: 6 }
          ],
          genreIds: [] // User's selected genres for the home page
        })
      });
    }

    return NextResponse.json(homeLayout);
  } catch (error) {
    console.error('Error fetching home layout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/data/home-layout
// Create or update the user's home layout configuration
export async function POST(req: NextRequest) {
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

    const { layoutConfig } = await req.json();

    if (!layoutConfig) {
      return NextResponse.json({ error: 'Layout configuration is required' }, { status: 400 });
    }

    // Validate the layout config
    try {
      const config = JSON.parse(layoutConfig);
      if (!config.sections || !Array.isArray(config.sections)) {
        return NextResponse.json({ error: 'Invalid layout configuration' }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON in layout configuration' }, { status: 400 });
    }

    // Create or update the home layout
    const homeLayout = await prisma.homeLayout.upsert({
      where: { userId: user.id },
      update: { layoutConfig },
      create: {
        userId: user.id,
        layoutConfig
      }
    });

    return NextResponse.json(homeLayout);
  } catch (error) {
    console.error('Error updating home layout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
