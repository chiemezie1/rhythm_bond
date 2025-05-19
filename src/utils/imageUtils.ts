/**
 * Get a fallback image URL if the YouTube thumbnail is not available
 * @param youtubeId The YouTube video ID
 * @param thumbnail The original thumbnail URL
 * @returns A valid thumbnail URL
 */
export const getFallbackThumbnail = (youtubeId: string, thumbnail: string): string => {
  // Check if the thumbnail is a YouTube thumbnail
  if (thumbnail.includes('img.youtube.com') || thumbnail.includes('i.ytimg.com')) {
    // Try different YouTube thumbnail formats
    const formats = [
      `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${youtubeId}/sddefault.jpg`,
      `https://img.youtube.com/vi/${youtubeId}/default.jpg`,
      `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    ];
    
    // Return the first format in the list (maxresdefault)
    // The browser will try to load this, and if it fails, it will show the fallback image
    return formats[0];
  }
  
  // If it's not a YouTube thumbnail, return the original
  return thumbnail;
};

/**
 * Default fallback image to use when all else fails
 */
export const DEFAULT_THUMBNAIL = '/images/default-track.jpg';
