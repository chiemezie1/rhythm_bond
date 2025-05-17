const fs = require('fs');
const path = require('path');

// Function to extract YouTube ID from URL
function getYoutubeIdFromUrl(url) {
  try {
    // Handle both standard YouTube URLs and shortened youtu.be URLs
    if (url.includes('youtu.be/')) {
      // Handle youtu.be URLs
      const urlParts = url.split('youtu.be/');
      if (urlParts.length > 1) {
        // Remove any query parameters
        return urlParts[1].split('?')[0].split('&')[0];
      }
    } else if (url.includes('youtube.com/watch')) {
      // Handle standard youtube.com URLs
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v') || '';
    } else if (url.includes('youtube.com/embed/')) {
      // Handle embed URLs
      const urlParts = url.split('youtube.com/embed/');
      if (urlParts.length > 1) {
        return urlParts[1].split('?')[0].split('&')[0];
      }
    }
    
    // If we can't parse the URL, return an empty string
    return '';
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return '';
  }
}

// Read the music.json file
const musicFilePath = path.join(__dirname, '..', 'public', 'music.json');
const musicData = JSON.parse(fs.readFileSync(musicFilePath, 'utf8'));

// Update each track with missing fields
musicData.genres.forEach(genre => {
  genre.tracks.forEach(track => {
    // Extract YouTube ID if not present
    if (!track.youtubeId) {
      track.youtubeId = getYoutubeIdFromUrl(track.youtubeUrl);
    }
    
    // Add thumbnail if not present
    if (!track.thumbnail) {
      track.thumbnail = `https://img.youtube.com/vi/${track.youtubeId}/mqdefault.jpg`;
    }
    
    // Add genre if not present
    if (!track.genre) {
      track.genre = genre.name;
    }
    
    // Add release year if not present (random year between 2015 and 2023)
    if (!track.releaseYear) {
      track.releaseYear = Math.floor(Math.random() * (2023 - 2015 + 1)) + 2015;
    }
    
    // Add duration if not present (random duration between 2:30 and 4:30)
    if (!track.duration) {
      const minutes = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
      const seconds = Math.floor(Math.random() * 60);
      track.duration = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }
  });
});

// Write the updated data back to the file
fs.writeFileSync(musicFilePath, JSON.stringify(musicData, null, 2), 'utf8');

console.log('Music data updated successfully!');
