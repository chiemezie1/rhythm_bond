# Components

This directory contains all the React components for the RhythmBond application, organized by functionality.

## Directory Structure

- `common/` - Common components used throughout the application
- `layout/` - Layout components (header, footer, sidebar)
- `music/` - Music-related components (tracks, playlists, etc.)
- `player/` - Music player components
- `social/` - Social features components
- `user/` - User-related components (profile, settings, etc.)

## Common Components

- `LoadingSpinner.tsx` - Loading spinner component for asynchronous operations
- `ProtectedRoute.tsx` - Route protection for authenticated users
- `SearchBar.tsx` - Basic search bar component for quick searches

## Layout Components

- `Footer.tsx` - Footer component
- `Layout.tsx` - Main layout component
- `Sidebar.tsx` - Sidebar navigation component
- `TopBar.tsx` - Top navigation bar component

## Music Components

- `AdvancedSearch.tsx` - Advanced search component with filters
- `CustomTags.tsx` - Custom tags for tracks
- `FavoriteTracks.tsx` - User's favorite tracks
- `GenreMenu.tsx` - Menu for genre options
- `MostPlayedTracks.tsx` - User's most played tracks
- `MusicCategories.tsx` - Music categories/genres display
- `PlaylistEditor.tsx` - Playlist creation and editing
- `PlaylistsSection.tsx` - Display user playlists
- `RecentlyPlayed.tsx` - Recently played tracks
- `RecommendedSection.tsx` - Recommended tracks
- `TrackCard.tsx` - Card display for a track
- `TrackCardWithMenu.tsx` - Track card with context menu
- `TrackMenu.tsx` - Context menu for tracks
- `TrendingTracks.tsx` - Trending tracks display
- `UserPlaylists.tsx` - User's playlists

## Player Components

- `MiniPlayer.tsx` - Mini player component
- `YouTubePlayer.tsx` - YouTube player component

## Social Components

- `CreatePost.tsx` - Component for creating new social posts
- `PlaylistComments.tsx` - Component for displaying and adding comments to playlists
- `SharePlaylist.tsx` - Modal component for sharing playlists with others
- `SharedPlaylist.tsx` - Component for displaying shared playlists in the feed
- `SimplifiedSocialFeed.tsx` - Modern social feed with CreatePost and SocialPost components
- `SocialFeed.tsx` - Social feed component used in user profiles
- `SocialPost.tsx` - Reusable component for displaying individual social posts
- `SocialTabs.tsx` - Navigation tabs for the social section

## User Components

- `UserPreferences.tsx` - User preferences component
- `UserProfile.tsx` - User profile component
- `WelcomePage.tsx` - Welcome page component
- `ProfileSettings.tsx` - Profile settings component
