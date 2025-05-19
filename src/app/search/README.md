# Search Functionality

This directory contains the search functionality of the RhythmBond application, allowing users to find tracks, artists, and playlists.

## Overview

The search functionality in RhythmBond enables users to:
- Search for tracks by title, artist, or any text
- Filter results by artist, genre, and duration
- Sort results by relevance, title, artist, or duration
- View search results in a responsive two-column layout

## Components

### AdvancedSearch

The main component used in the search page, providing a comprehensive search experience with:
- Keyword search input
- Filter options (artist, genre, duration)
- Sorting options
- Results display in a table format
- Loading, empty, and error states

## Features

### Keyword Search
- Search for tracks by title, artist, or any text
- Results update when you click the Search button
- Case-insensitive search for better results

### Filters
- **Artist**: Filter results by artist name
- **Genre**: Filter results by music genre
- **Duration**: Filter by track length (min/max in minutes)

### Sorting Options
- Relevance (default)
- Title (A-Z or Z-A)
- Artist (A-Z or Z-A)
- Duration (shortest or longest first)

### Results Display
- Table format with columns for:
  - Track number
  - Title
  - Artist
  - Genre
  - Duration
  - Actions (play, add to playlist, etc.)
- Responsive layout that adapts to different screen sizes
- Thumbnail images with fallback handling

## API Endpoints

### Search

- `GET /api/music` - Search for tracks
  - Query parameters:
    - `query` - Search query
    - `limit` - Maximum number of results to return

## Implementation Details

- The search functionality is implemented using React components with Next.js
- The AdvancedSearch component is located in `src/components/music/AdvancedSearch.tsx`
- Search results are fetched from the API endpoint
- Client-side filtering and sorting for better performance
- Debounced search to prevent excessive API calls
- Responsive two-column layout with filters on the left and results on the right

## Usage Examples

### Basic Keyword Search
1. Enter "love" in the keyword field
2. Click Search
3. Results will show all tracks with "love" in the title or artist name

### Search with Artist Filter
1. Enter "dance" in the keyword field
2. Enter "Drake" in the Artist filter
3. Click Search
4. Results will show only tracks with "dance" that are by Drake

### Genre-specific Search
1. Leave the keyword field empty
2. Enter "Hip-Hop" in the Genre filter
3. Click Search
4. Results will show all Hip-Hop tracks

### Duration Filter
1. Enter "rock" in the keyword field
2. Set Duration Min to 3 and Max to 5
3. Click Search
4. Results will show rock songs between 3-5 minutes long

### Sorting Results
1. Enter "pop" in the keyword field
2. Select "Artist (A-Z)" from the Sort by dropdown
3. Click Search
4. Results will show pop songs sorted alphabetically by artist name

## Tips for Effective Searching

1. **Start broad, then narrow down**: Begin with a general keyword search, then apply filters to refine results
2. **Use partial words**: Searching for "beat" will find "Beatles", "beatbox", etc.
3. **Combine filters**: Use multiple filters together for more specific results
4. **Sort strategically**: Use sorting to find the shortest songs for a quick playlist or alphabetical sorting to find specific artists
5. **Empty keyword search**: You can search with just filters (e.g., only Genre = "Blues") to browse all tracks in a category
