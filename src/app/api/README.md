# API Endpoints

This directory contains all the API endpoints for the RhythmBond application.

## Authentication

- `GET /api/auth/[...nextauth]` - NextAuth.js authentication endpoints
- `POST /api/auth/register` - Register a new user

## Music

- `GET /api/music` - Get all music data or search for tracks
  - Query parameters:
    - `query` - Search for tracks by title or artist
    - `genre` - Get tracks by genre
    - `trending` - Get trending tracks
    - `limit` - Limit the number of results

## User Data

### General User Data

- `GET /api/user/data` - Get all user data
  - Query parameters:
    - `type` - Type of data to get (all, favorites, playlists, tags, recentlyPlayed, mostPlayed)

### Favorites

- `GET /api/user/data/favorites` - Get user favorites
- `POST /api/user/data/favorites` - Toggle a track as favorite

### Playlists

- `GET /api/user/data/playlists` - Get user playlists
- `POST /api/user/data/playlists` - Create a new playlist
- `GET /api/user/data/playlists/[id]` - Get a specific playlist
- `PUT /api/user/data/playlists/[id]` - Update a playlist
- `DELETE /api/user/data/playlists/[id]` - Delete a playlist
- `POST /api/user/data/playlists/[id]/tracks` - Add a track to a playlist
- `DELETE /api/user/data/playlists/[id]/tracks` - Remove a track from a playlist

### Tags

- `GET /api/user/data/tags` - Get user tags
- `POST /api/user/data/tags` - Create a new tag
- `GET /api/user/data/tags/[id]` - Get a specific tag
- `PUT /api/user/data/tags/[id]` - Update a tag
- `DELETE /api/user/data/tags/[id]` - Delete a tag
- `POST /api/user/data/tags/[id]/tracks` - Add a track to a tag
- `DELETE /api/user/data/tags/[id]/tracks` - Remove a track from a tag

### Recently Played

- `GET /api/user/data/recently-played` - Get user recently played tracks
- `POST /api/user/data/recently-played` - Add a track to recently played

### User Profile

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### User Preferences

- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update user preferences

### User Search

- `GET /api/user/search` - Search for users

## Social

### Feed

- `GET /api/social/feed` - Get social feed
  - Query parameters:
    - `filter` - Filter type (all, following, trending)

### Comments

- `GET /api/social/comments` - Get comments for a post
- `POST /api/social/comments` - Add a comment to a post
- `DELETE /api/social/comments` - Delete a comment

### Likes

- `POST /api/social/likes` - Like/unlike a post or comment

### Share

- `POST /api/social/share` - Share a track or playlist

## Utilities

- `GET /api/image-proxy` - Proxy for loading images from external sources
