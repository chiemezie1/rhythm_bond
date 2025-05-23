const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Read music data from JSON file
  const musicDataPath = path.join(process.cwd(), 'public', 'music.json');
  const musicDataRaw = fs.readFileSync(musicDataPath, 'utf8');
  const musicData = JSON.parse(musicDataRaw);

  console.log(`Loaded music data with ${musicData.genres.length} genres`);

  // Create tracks from the music data
  const tracks = [];
  for (const genre of musicData.genres) {
    console.log(`Processing genre: ${genre.name}`);

    for (const track of genre.tracks) {
      // Check if track already exists
      const existingTrack = await prisma.track.findUnique({
        where: { youtubeId: track.youtubeId }
      });

      if (!existingTrack) {
        const createdTrack = await prisma.track.create({
          data: {
            title: track.title,
            artist: track.artist,
            genre: genre.id,
            youtubeId: track.youtubeId,
            youtubeUrl: track.youtubeUrl,
            thumbnail: track.thumbnail,
            duration: track.duration,
            releaseYear: track.releaseYear
          }
        });
        console.log(`Created track: ${track.title} by ${track.artist}`);
        tracks.push(createdTrack);
      } else {
        console.log(`Track already exists: ${track.title} by ${track.artist}`);
        tracks.push(existingTrack);
      }
    }
  }

  // Create users
  const users = await createUsers();
  console.log(`Created ${users.length} users`);

  // Create playlists
  const playlists = await createPlaylists(users, tracks);
  console.log(`Created ${playlists.length} playlists`);

  // Create posts
  const posts = await createPosts(users, tracks, playlists);
  console.log(`Created ${posts.length} posts`);

  // Create likes, comments, follows
  await createInteractions(users, posts);
  console.log('Created interactions (likes, comments, follows)');

  // Create user data (recently played, favorites, etc.)
  await createUserData(users, tracks);
  console.log('Created user data (recently played, favorites, etc.)');

  console.log('Database seeding completed successfully!');
  console.log('Example Users');
  console.log('👨 Email: john@example.com');
  console.log('Password: password123');
  console.log('👩 Email: jane@example.com');
  console.log('Password: password123');
}

async function createUsers() {
  // Check if users already exist
  const existingUserCount = await prisma.user.count();
  if (existingUserCount > 0) {
    console.log(`Found ${existingUserCount} existing users, skipping user creation`);
    return await prisma.user.findMany();
  }

  // Create demo users
  const demoUsers = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      username: 'johndoe',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      password: await bcrypt.hash('password123', 10),
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      username: 'janesmith',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
      password: await bcrypt.hash('password123', 10),
    },
    {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      username: 'alexj',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
      password: await bcrypt.hash('password123', 10),
    },
    {
      name: 'Maria Garcia',
      email: 'maria@example.com',
      username: 'mariag',
      image: 'https://randomuser.me/api/portraits/women/4.jpg',
      password: await bcrypt.hash('password123', 10),
    },
    {
      name: 'David Kim',
      email: 'david@example.com',
      username: 'davidk',
      image: 'https://randomuser.me/api/portraits/men/5.jpg',
      password: await bcrypt.hash('password123', 10),
    },
  ];

  const users = [];
  for (const user of demoUsers) {
    const createdUser = await prisma.user.create({
      data: user,
    });
    users.push(createdUser);
  }

  return users;
}

async function createPlaylists(users: any[], tracks: any[]) {
  // Check if playlists already exist
  const existingPlaylistCount = await prisma.playlist.count();
  if (existingPlaylistCount > 0) {
    console.log(`Found ${existingPlaylistCount} existing playlists, skipping playlist creation`);
    return await prisma.playlist.findMany();
  }

  const playlists = [];

  // Create playlists for each user
  for (const user of users) {
    const playlistsToCreate = [
      {
        name: 'My Favorites',
        description: 'A collection of my favorite tracks',
        userId: user.id,
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
        isPublic: true,
        tracks: getRandomSubarray(tracks, Math.floor(Math.random() * 5) + 3),
      },
      {
        name: 'Workout Mix',
        description: 'Perfect for hitting the gym',
        userId: user.id,
        coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
        isPublic: true,
        tracks: getRandomSubarray(tracks, Math.floor(Math.random() * 4) + 2),
      },
      {
        name: 'Chill Vibes',
        description: 'Relaxing music for downtime',
        userId: user.id,
        coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500',
        isPublic: Math.random() > 0.3, // Some playlists are private
        tracks: getRandomSubarray(tracks, Math.floor(Math.random() * 6) + 2),
      },
    ];

    for (const playlistData of playlistsToCreate) {
      const { tracks: playlistTracks, ...playlistInfo } = playlistData;

      const playlist = await prisma.playlist.create({
        data: {
          ...playlistInfo,
          isTemplate: playlistInfo.isPublic, // Public playlists can be templates
          shareCount: Math.floor(Math.random() * 10), // Random share count for demo
          tags: JSON.stringify(['music', 'curated', playlistInfo.name.toLowerCase().replace(/\s+/g, '-')])
        },
      });

      // Add tracks to playlist
      for (let i = 0; i < playlistTracks.length; i++) {
        await prisma.playlistTrack.create({
          data: {
            playlistId: playlist.id,
            trackId: playlistTracks[i].id,
            order: i,
          },
        });
      }

      playlists.push(playlist);
    }
  }

  return playlists;
}

async function createPosts(users: any[], tracks: any[], playlists: any[]) {
  // Check if posts already exist
  const existingPostCount = await prisma.post.count();
  if (existingPostCount > 0) {
    console.log(`Found ${existingPostCount} existing posts, skipping post creation`);
    return await prisma.post.findMany();
  }

  const posts = [];
  const postContents = [
    'Just discovered this amazing track! 🎵',
    'Can\'t stop listening to this on repeat! 🔥',
    'This song brings back so many memories...',
    'Perfect addition to my workout playlist',
    'Who else is loving this artist\'s new album?',
    'This beat is everything! 💯',
    'Sharing this gem with everyone',
    'Current mood: this song on repeat',
    'My new obsession! What do you think?',
    'This track is underrated. More people need to hear it!',
  ];

  // Create posts for each user
  for (const user of users) {
    // Create 2-4 posts per user
    const numPosts = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < numPosts; i++) {
      const content = postContents[Math.floor(Math.random() * postContents.length)];
      const isTrackPost = Math.random() > 0.3; // 70% chance of being a track post

      let mediaType = null;
      let mediaId = null;

      if (isTrackPost) {
        mediaType = 'track';
        mediaId = tracks[Math.floor(Math.random() * tracks.length)].id;
      } else {
        // Find a public playlist from this user
        const userPlaylists = playlists.filter((p: any) => p.userId === user.id && p.isPublic);
        if (userPlaylists.length > 0) {
          mediaType = 'playlist';
          mediaId = userPlaylists[Math.floor(Math.random() * userPlaylists.length)].id;
        }
      }

      const post = await prisma.post.create({
        data: {
          content,
          userId: user.id,
          mediaType,
          mediaId,
          visibility: 'public',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random date within the last week
        },
      });

      posts.push(post);
    }
  }

  return posts;
}

async function createInteractions(users: any[], posts: any[]) {
  // Check if interactions already exist
  const existingLikeCount = await prisma.like.count();
  const existingCommentCount = await prisma.comment.count();

  if (existingLikeCount > 0 || existingCommentCount > 0) {
    console.log(`Found existing interactions (${existingLikeCount} likes, ${existingCommentCount} comments), skipping interaction creation`);
    return;
  }

  // Create likes
  for (const post of posts) {
    // Each post gets 0-4 likes
    const numLikes = Math.floor(Math.random() * 5);
    const likers = getRandomSubarray(users.filter((u: any) => u.id !== post.userId), numLikes);

    for (const liker of likers) {
      await prisma.like.create({
        data: {
          userId: liker.id,
          postId: post.id,
        },
      });
    }

    // Each post gets 0-3 comments
    const numComments = Math.floor(Math.random() * 4);
    const commenters = getRandomSubarray(users, numComments);
    const commentContents = [
      'Great find! I love this artist.',
      'Thanks for sharing! Added to my playlist.',
      'This is my jam! 🔥',
      'Been listening to this all week!',
      'Underrated track for sure',
      'The beat on this is insane',
      'Perfect vibe for today',
      'I needed this in my life, thank you!',
    ];

    for (const commenter of commenters) {
      const commentContent = commentContents[Math.floor(Math.random() * commentContents.length)];

      await prisma.comment.create({
        data: {
          content: commentContent,
          userId: commenter.id,
          postId: post.id,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)), // Random date within the last 3 days
        },
      });
    }
  }

  // Create follows
  for (const user of users) {
    // Each user follows 1-3 other users
    const numFollowing = Math.floor(Math.random() * 3) + 1;
    const followees = getRandomSubarray(users.filter((u: any) => u.id !== user.id), numFollowing);

    for (const followee of followees) {
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: followee.id,
        },
      });
    }
  }
}

// Default genres with their colors
const defaultGenres = [
  {
    name: 'Afrobeats & Global Pop',
    description: 'Vibrant rhythms and melodies from Africa and around the world',
    color: '#6366f1', // Indigo
    coverImage: '/images/man_with_headse.png',
    order: 0
  },
  {
    name: 'Pop',
    description: 'Catchy, popular music with wide appeal',
    color: '#ec4899', // Pink
    coverImage: '/images/two_people_enjoying_music.png',
    order: 1
  },
  {
    name: 'Hip-Hop & Trap',
    description: 'Urban beats with powerful lyrics and bass',
    color: '#f59e0b', // Amber
    coverImage: '/images/logo_bg_white.png',
    order: 2
  },
  {
    name: 'R&B',
    description: 'Smooth, soulful sounds with emotional depth',
    color: '#8b5cf6', // Violet
    coverImage: '/images/logo.png',
    order: 3
  },
  {
    name: 'Blues',
    description: 'Soulful expressions rooted in African-American history',
    color: '#3b82f6', // Blue
    coverImage: '/images/man_with_headse.png',
    order: 4
  },
  {
    name: 'Trending',
    description: 'Find your next favorite track',
    color: '#10b981', // Emerald
    coverImage: '/images/two_people_enjoying_music.png',
    order: 5
  }
];

// Default home layout configuration
const defaultHomeLayout = {
  sections: [
    { type: 'musicCategories', visible: true, order: 0 },
    { type: 'recentlyPlayed', visible: true, order: 1 },
    { type: 'favorites', visible: true, order: 2 },
    { type: 'mostPlayed', visible: true, order: 3 },
    { type: 'playlists', visible: true, order: 4 },
    { type: 'recommended', visible: true, order: 5 }
  ],
  genreIds: [] // Will be populated with the IDs of the created genres
};

async function createUserData(users: any[], tracks: any[]) {
  // Check if user data already exists
  const existingRecentlyPlayedCount = await prisma.recentlyPlayed.count();
  const existingFavoriteCount = await prisma.favorite.count();
  const existingPlayCountCount = await prisma.playCount.count();
  const existingGenreCount = await prisma.genre.count();

  if (existingRecentlyPlayedCount > 0 || existingFavoriteCount > 0 || existingPlayCountCount > 0) {
    console.log(`Found existing user data (${existingRecentlyPlayedCount} recently played, ${existingFavoriteCount} favorites, ${existingPlayCountCount} play counts), skipping basic user data creation`);
  }

  for (const user of users) {
    // Create default genres for each user
    const createdGenreIds: string[] = [];

    // Check if the user already has genres
    const userGenreCount = await prisma.genre.count({
      where: { userId: user.id }
    });

    if (userGenreCount === 0) {
      console.log(`Creating default genres for user ${user.name}`);

      for (const genre of defaultGenres) {
        const newGenre = await prisma.genre.create({
          data: {
            name: genre.name,
            description: genre.description,
            color: genre.color,
            coverImage: genre.coverImage,
            order: genre.order,
            userId: user.id,
            isTemplate: true, // Mark default genres as templates
            isPublic: true,
            shareCount: 0,
            tags: JSON.stringify(['default', 'template', genre.name.toLowerCase().replace(/\s+/g, '-')])
          }
        });
        createdGenreIds.push(newGenre.id);
      }

      // Create or update home layout for the user
      const homeLayoutConfig = {
        ...defaultHomeLayout,
        genreIds: createdGenreIds.slice(0, 6) // Use the first 6 genres
      };

      const existingHomeLayout = await prisma.homeLayout.findUnique({
        where: { userId: user.id }
      });

      if (!existingHomeLayout) {
        await prisma.homeLayout.create({
          data: {
            userId: user.id,
            layoutConfig: JSON.stringify(homeLayoutConfig)
          }
        });
        console.log(`Created default home layout for user ${user.name}`);
      } else {
        await prisma.homeLayout.update({
          where: { userId: user.id },
          data: {
            layoutConfig: JSON.stringify(homeLayoutConfig)
          }
        });
        console.log(`Updated existing home layout for user ${user.name}`);
      }
    } else {
      console.log(`User ${user.name} already has genres, skipping default genre creation`);
    }

    // Skip basic user data creation if it already exists
    if (existingRecentlyPlayedCount > 0 || existingFavoriteCount > 0 || existingPlayCountCount > 0) {
      continue;
    }

    // Create recently played
    const recentTracks = getRandomSubarray(tracks, 5);
    for (let i = 0; i < recentTracks.length; i++) {
      await prisma.recentlyPlayed.create({
        data: {
          userId: user.id,
          trackId: recentTracks[i].id,
          playedAt: new Date(Date.now() - (i * 3600000)), // Each track played 1 hour apart
        },
      });
    }

    // Create favorites
    const favoriteTracks = getRandomSubarray(tracks, Math.floor(Math.random() * 4) + 3);
    for (const track of favoriteTracks) {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          trackId: track.id,
        },
      });
    }

    // Create play counts
    const playedTracks = getRandomSubarray(tracks, Math.floor(Math.random() * 6) + 4);
    for (const track of playedTracks) {
      await prisma.playCount.create({
        data: {
          userId: user.id,
          trackId: track.id,
          count: Math.floor(Math.random() * 10) + 1, // 1-10 plays
        },
      });
    }

    // Create tags
    const tagNames = ['Favorite', 'Workout', 'Chill', 'Party', 'Focus', 'Driving', 'Morning', 'Evening'];
    const userTags = getRandomSubarray(tagNames, Math.floor(Math.random() * 4) + 2);

    for (const tagName of userTags) {
      const tag = await prisma.tag.create({
        data: {
          name: tagName,
          userId: user.id,
        },
      });

      // Add 1-3 tracks to each tag
      const taggedTracks = getRandomSubarray(tracks, Math.floor(Math.random() * 3) + 1);
      for (const track of taggedTracks) {
        await prisma.tagTrack.create({
          data: {
            tagId: tag.id,
            trackId: track.id,
          },
        });
      }
    }
  }
}

// Helper function to get random subset of array
function getRandomSubarray(arr: any[], size: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
