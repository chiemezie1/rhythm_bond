# Music Database Documentation

## Overview

This document provides comprehensive information about the music database used in the Music Streaming Platform, including the structure of the `music.json` file and the sources of the music data.

## File Location

**Primary Music Database**: `public/music.json`

## Database Structure

The music database is structured as a JSON file containing an array of genres, each with their associated tracks.

### Root Structure

```json
{
  "genres": [
    {
      "id": "string",
      "name": "string", 
      "tracks": [...]
    }
  ]
}
```

### Genre Object Structure

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the genre (e.g., "afrobeats", "pop", "hip", "rnb") |
| `name` | string | Display name of the genre |
| `tracks` | array | Array of track objects belonging to this genre |

### Track Object Structure

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique track identifier | "afro_001" |
| `title` | string | Song title | "Money" |
| `artist` | string | Artist name(s) | "Teni" |
| `youtubeUrl` | string | Full YouTube URL | "https://www.youtube.com/watch?v=e-3Awv-wuzs" |
| `youtubeId` | string | YouTube video ID | "e-3Awv-wuzs" |
| `thumbnail` | string | YouTube thumbnail URL | "https://img.youtube.com/vi/e-3Awv-wuzs/mqdefault.jpg" |
| `genre` | string | Genre name (matches parent genre) | "Afrobeats & Global Pop" |
| `releaseYear` | number | Year of release | 2019 |
| `duration` | string | Track duration in MM:SS format | "2:43" |

## Available Genres

The database currently contains **5 main genres**:

### 1. Afrobeats & Global Pop (`afrobeats`)
- **Track Count**: 29 tracks
- **Artists Include**: Teni, Shallipopi, Olamide, Wizkid, Davido, Omah Lay, Burna Boy, Asake, Rema, Ayra Starr
- **ID Range**: afro_001 to afro_029

### 2. Pop (Mainstream & Electro-Pop) (`pop`)
- **Track Count**: 25+ tracks
- **Artists Include**: Dua Lipa, The Weeknd, Ariana Grande, Taylor Swift, Doja Cat, Harry Styles, Billie Eilish, BTS
- **ID Range**: pop_001 to pop_025+

### 3. Hip-Hop & Trap (`hip`)
- **Track Count**: 32+ tracks
- **Artists Include**: Drake, Kendrick Lamar, Travis Scott, Juice WRLD, Cardi B, Megan Thee Stallion, J. Cole, Gunna
- **ID Range**: hip_001 to hip_032+

### 4. R&B (`rnb`)
- **Track Count**: 25+ tracks
- **Artists Include**: Frank Ocean, H.E.R., Daniel Caesar, Brent Faiyaz, Summer Walker, Miguel, Ne-Yo, John Legend
- **ID Range**: rnb_001 to rnb_025+

### 5. Other Tracks (`other`)
- **Track Count**: 5+ tracks
- **Mixed Artists**: Various artists not fitting into main categories
- **ID Range**: oth_001 to oth_005+

## Data Sources

### Primary Source: YouTube
All tracks in the database are sourced from **YouTube**, with the following data points:

- **Video URLs**: Direct links to official music videos or audio uploads
- **Thumbnails**: YouTube's medium quality thumbnails (mqdefault.jpg)
- **Video IDs**: Extracted from YouTube URLs for API integration

### Content Types
The database includes:
- ✅ **Official Music Videos**
- ✅ **Official Audio Uploads**
- ✅ **Artist Channel Uploads**
- ✅ **Label Channel Uploads**

### Data Curation Process
1. **Manual Curation**: Tracks are manually selected and verified
2. **Quality Control**: Only high-quality, official uploads are included
4. **Genre Classification**: Tracks are categorized based on musical style and artist genre

## Technical Implementation

### API Integration
The music database integrates with the application through:

- **Static File Serving**: Served from `public/music.json`
- **API Endpoint**: Accessible via `/api/music` routes
- **Client-Side Access**: Direct fetch from `/music.json`

### YouTube Integration
- **Thumbnail URLs**: Automatically generated using YouTube video IDs
- **Playback**: Integrated with YouTube Player API
- **Metadata**: Synced with YouTube video information

### Search and Filtering
The database supports:
- **Genre-based filtering**
- **Artist search**
- **Title search**
- **Release year filtering**
- **Duration-based sorting**

## Database Statistics

| Metric | Value |
|--------|-------|
| Total Genres | 5 |
| Total Tracks | ~116+ |
| File Size | ~1.7MB |
| Average Tracks per Genre | ~23 |
| Date Range | 2015-2023 |
| Primary Language | English |
| Secondary Languages | Various (Afrobeats includes local languages) |

## Usage in Application

### Frontend Integration
```javascript
// Fetch all music data
const response = await fetch('/music.json');
const musicData = await response.json();

// Access specific genre
const afrobeats = musicData.genres.find(g => g.id === 'afrobeats');

// Get all tracks
const allTracks = musicData.genres.flatMap(g => g.tracks);
```

### API Integration
```javascript
// Via API endpoint
const response = await fetch('/api/music?genre=afrobeats');
const genreData = await response.json();
```

## Maintenance and Updates

### Adding New Tracks
1. Obtain YouTube URL and video ID
2. Verify track metadata (title, artist, duration)
3. Generate thumbnail URL
4. Assign unique track ID following pattern: `{genre}_{number}`
5. Add to appropriate genre array in `music.json`

### Quality Assurance
- ✅ Verify YouTube links are active
- ✅ Check thumbnail URLs load correctly
- ✅ Validate JSON structure
- ✅ Test API endpoints after updates
- ✅ Ensure unique track IDs

### Backup and Versioning
- Database changes should be version controlled
- Regular backups of `music.json` recommended
- Test changes in development environment first

## Future Enhancements

### Planned Additions
- [ ] More genre categories (Jazz, Classical, Electronic, etc.)
- [ ] Extended metadata (album information, lyrics)
- [ ] Multi-language support
- [ ] Playlist recommendations
- [ ] User-generated content integration

### Technical Improvements
- [ ] Database migration to PostgreSQL/MongoDB
- [ ] Real-time sync with music APIs
- [ ] Automated metadata enrichment
- [ ] Content delivery network (CDN) integration

## Legal and Compliance

### Copyright Notice
All music content is sourced from YouTube and remains the property of respective artists, labels, and copyright holders. This database serves as a reference index and does not host any audio content directly.

### Fair Use
The application operates under fair use principles:
- Educational and non-commercial use
- Metadata indexing only
- No direct audio hosting
- Links to official sources only

---

**Last Updated**: May 2025 
**Database Version**: 1.0  
**Total Tracks**: 116+  
**Maintainer**: Music Platform Development Team
