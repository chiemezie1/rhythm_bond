# Social Features

This directory contains the social features of the RhythmBond application, allowing users to connect, share music, and interact with each other.

## Overview

The social features in RhythmBond enable users to:
- Share tracks and playlists with others
- Create posts with text content
- Like and comment on posts
- Follow other users
- View a personalized social feed

## Components

### SimplifiedSocialFeed

The main component used in the social page, providing a modern feed experience with:
- Post creation through the CreatePost component
- Post display through the SocialPost component
- Filtering options (all, following, trending)
- Loading, empty, and error states



### CreatePost

A reusable component for creating new posts:
- Text input for post content
- Options to attach media (tracks, playlists)
- Visibility settings

### SocialPost

A reusable component for displaying individual posts:
- User information and timestamp
- Post content
- Media attachments (tracks, playlists)
- Like, comment, and share functionality
- Comment display and input

### SharePlaylist

A modal component for sharing playlists:
- Playlist preview
- Message input
- Visibility settings

### SharedPlaylist

A component for displaying shared playlists in the feed:
- Playlist information
- Track listing
- Play and add to library options



## API Endpoints

### Feed

- `GET /api/social/feed` - Get social feed
  - Query parameters:
    - `filter` - Filter type (all, following, trending)
    - `userId` - Optional user ID to filter posts by a specific user

### Posts

- `GET /api/social/posts` - Get all posts or posts by a specific user
- `POST /api/social/posts` - Create a new post
  - Body parameters:
    - `content` - Post content
    - `mediaType` - Optional media type (track, playlist, etc.)
    - `mediaId` - Optional media ID
    - `visibility` - Post visibility (public, followers, private)

### Post-specific Actions

- `POST /api/social/posts/[id]/like` - Like/unlike a specific post
- `GET /api/social/posts/[id]/comments` - Get comments for a specific post
- `POST /api/social/posts/[id]/comments` - Add a comment to a specific post

## Database Schema

The social features use the following database tables:

- **User**: User accounts
- **Follow**: Social connections between users
- **Post**: Social posts shared by users
- **Comment**: Comments on posts
- **Like**: Likes on posts
- **CommentLike**: Likes on comments

## Usage

The social features are accessible through the `/social` route in the application. Users can:
1. View their social feed with simplified interface
2. Create new posts with text and media attachments
3. Interact with posts (like, comment, share)
4. Share playlists and tracks with the community
5. View posts from all users or filter by following

## Implementation Details

- The social feed is implemented using React components with Next.js
- Data is fetched from the API endpoints
- Real-time updates are simulated with optimistic UI updates
- The feed supports infinite scrolling for pagination
- Posts can include various types of media (tracks, playlists)
