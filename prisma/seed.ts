const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Read music data from JSON file
  const musicDataPath = path.join(process.cwd(), 'public', 'music.json');
  const musicDataRaw = fs.readFileSync(musicDataPath, 'utf8');
  const musicData = JSON.parse(musicDataRaw);

  console.log(`Loaded music data with ${musicData.genres.length} genres`);

  // Create tracks from the music data
  for (const genre of musicData.genres) {
    console.log(`Processing genre: ${genre.name}`);

    for (const track of genre.tracks) {
      // Check if track already exists
      const existingTrack = await prisma.track.findUnique({
        where: { youtubeId: track.youtubeId }
      });

      if (!existingTrack) {
        await prisma.track.create({
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
      } else {
        console.log(`Track already exists: ${track.title} by ${track.artist}`);
      }
    }
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
