# RhythmBond – Project Specification

## Product Vision

RhythmBond is a modern web-based music player that enhances the music listening experience through rich metadata, AI-powered recommendations, and social sharing features.

### Why (Mission)
We believe music is a social magnet that builds empathy, trust, and a sense of belonging. RhythmBond aims to amplify that feeling by bringing people together around music and conversation. Our mission is to transform passive music consumption into an active, enriched experience where discovery and sharing are seamlessly integrated.

### How (Principles)
We build on principles of inclusivity, user-centric design, and innovation. The platform is user-centric and consistent – focusing on intuitive workflows and accessibility. We leverage AI thoughtfully to enhance discovery through personalized recommendations based on listening habits and preferences. Security and privacy are respected; user data (like preferences and playlists) are kept private. The interface is designed to make music metadata exploration engaging and rewarding.

### What (Offerings)
RhythmBond is a feature-rich music player offering:
- **Core Music Player**: A sleek, responsive player with standard controls and visualizations
- **Metadata Management**: Comprehensive tagging system for genres, moods, eras, and other relevant attributes
- **Music Discovery**: Integration with music APIs to access vast libraries of content
- **AI Recommendations**: Smart suggestions based on listening history and preferences
- **Social Features**: Playlist sharing, commenting, and liking functionality
- **User Collections**: Personalized libraries, playlists, and listening history

In sum, RhythmBond is a music platform where users discover, organize, and share music in a socially connected environment.

## Brand Identity & UX Design Principles

RhythmBond's brand is warm, creative, and community-driven. Our tone is friendly, supportive and inspiring, encouraging users to explore music fearlessly. The personality is imaginative and inclusive – like a trusted friend suggesting a great new song. Emotionally, we aim to evoke excitement, curiosity and comfort. In imagery and copy, we use friendly language and lively illustrations to invite users in and make even complex features feel accessible.

The visual style should mirror this spirit: energetic yet modern. UX design follows core principles – user-centricity, consistency and simplicity – so layouts are intuitive (clear hierarchy, predictable navigation) and interactions respond promptly.

### Color
Use a vibrant palette to spark creativity and community. For instance, a warm accent color (like deep orange or coral) combined with a trustworthy mid-tone (like teal or blue) and neutral backgrounds. Orange conveys enthusiasm and friendliness; teal or blue conveys trust and calm. These colors energize while remaining easy on the eyes. Accent colors highlight actions (e.g. play buttons, chat notifications).

### Layout
Employ a clean, responsive grid layout with clear sections. Key areas (player controls, chat windows, exploration panels) are prominent. Use cards or list layouts for tracks and playlists to surface album art and metadata. Animations (like subtle button hovers or transitions) can encourage exploration (curiosity), but overall design remains minimalist so users focus on content. Consistent spacing and iconography ensure a cohesive feel.

### Typography
Choose a modern, rounded sans-serif (e.g. Inter, Montserrat, or Open Sans) for readability and approachability. Headlines can be bold and playful; body text legible and light. Ensure sufficient color contrast for accessibility. Use consistent font sizes and weights to maintain hierarchy (titles > track info > descriptions).

### User Feeling Goals
Every aspect of RhythmBond is meant to make the user feel curious, creative, and part of a community. We want users to feel curious by surfacing new music and interactive features (like lyric search) that invite exploration. We want them to feel creative by making it easy to share and remix content (tagging, personal playlists, AI suggestions). And most importantly, we want them to feel connected – as if they're at a listening party with friends. By blending social cues (friend icons, live chat) and responsive design (e.g. avatars lighting up when someone joins), RhythmBond will reinforce the warmth and belonging of real-life music gatherings.

## Roles and Permissions

RhythmBond uses role-based access to manage capabilities:

### Standard User
The basic role. Can sign up/login, search and play any track from the integrated music API, create and manage personal playlists, add custom tags and metadata to tracks, and share playlists with others. Standard users can like/comment on other users' playlists, view lyrics and album info, and see their listening history. They can also receive AI-powered music recommendations based on their listening habits.

### Premium User
Inherits all Standard User permissions plus additional features. Premium users get access to higher quality audio streams, advanced playlist management tools, enhanced AI recommendations, and the ability to download playlists for offline listening (where permitted by the music API). They can also create collaborative playlists that multiple users can contribute to.

### Moderator
Inherits all Premium User permissions plus community moderation powers. Moderators can review and remove inappropriate comments, manage user-generated tags for accuracy and appropriateness, and handle reports of misuse. They help maintain community standards but cannot access system settings.

### Admin
Full access to everything. Admins can manage user accounts (promote or demote Moderators, suspend accounts), configure site-wide settings, and access the Admin Dashboard. They can view analytics, manage API integrations, and oversee the entire platform.

## User Flow & Page Map

### Home
Landing page featuring a sleek music player interface. For logged-out users, it shows trending tracks, popular playlists, and sign-up/login prompts. Logged-in users see their recently played tracks, personalized recommendations, and quick access to their playlists. The music player is always accessible at the bottom of the screen.

### Discover
Main discovery page with multiple sections: New Releases, Trending, Recommended for You, and Genre Explorations. Users can search for tracks, artists, or albums via the integrated music API. Advanced filters allow sorting by genre, mood, release date, and popularity. Featured playlists curated by both the platform and popular users are highlighted.

### Track Details & Player
Detailed view for a single track showing cover art, title, artist, album, release date, and user-generated tags. The embedded player offers standard controls (play/pause, seek, volume) plus options to add to playlists, like, or share. Below the player, tabs provide access to:
- Lyrics with time-synced highlighting
- Similar tracks recommended by the AI
- User comments and ratings
- Detailed metadata including production credits, BPM, key, etc.

### Playlist Management
Interface for creating and managing playlists. Users can create new playlists, add/remove tracks, reorder songs, and customize playlist covers. Premium users can create collaborative playlists and access advanced organization tools. Each playlist has sharing options and a comment section.

### Metadata Explorer
Interactive tool for exploring and adding metadata to tracks. Users can view existing tags (genre, mood, era, instruments, themes) and add their own. The system aggregates user-generated tags to create a rich, community-driven metadata layer on top of the basic API information.

### Profile
User's personal hub showing their information, created playlists, listening statistics, and activity feed. Users can customize their profile picture and username, manage account settings, and see their listening history visualized through charts and trends. Premium status and benefits are displayed here.

### Social Hub
Center for social interactions where users can find friends, see what others are listening to, and discover popular playlists. Activity feed shows recent likes, comments, and shares from followed users. Recommendation engine suggests users with similar taste.

### Admin Dashboard
(Admins only) Backend interface for platform management: user administration, content moderation, analytics dashboard, API integration settings, and system configuration. Includes tools for managing the tag system and monitoring platform health.

### User Flow Example
1. A new user signs up via Home (email or Google).
2. After logging in, they land on Home and see personalized recommendations.
3. They search for "Indie Rock" in the Discover section and browse matching tracks.
4. Selecting a track, they view details, play it, and explore similar music through the AI recommendations.
5. They create a new playlist, add the track, and share it with friends.
6. They explore the Metadata Explorer to add custom tags to tracks they've enjoyed.
7. They visit their Profile to view listening statistics and manage their playlists.
8. Premium users can download playlists for offline listening and access enhanced features.

## Feature Set

### Core Features

#### Music Player
A modern, responsive HTML5 audio player with standard controls (play/pause, skip, seek, volume) and visualizations. The player supports continuous playback while navigating the site and displays current track information. Mini-player mode remains visible when scrolling or browsing other sections.

#### Music API Integration
Integration with a music streaming API (such as Spotify, Apple Music, or Deezer) to provide access to a vast library of tracks. The API provides basic track information (title, artist, album, cover art) which is enhanced with user-generated metadata. Authentication and playback are handled according to the API's requirements.

#### Metadata Management
Comprehensive tagging system allowing users to add and edit metadata beyond what's provided by the API. Tags include:
- Genres and subgenres
- Moods and emotions
- Eras and decades
- Instruments featured
- Themes and topics
- Tempo and energy level
- Occasions (workout, study, party, etc.)

The system aggregates user contributions to create consensus tags while preserving individual preferences.

#### Search & Discovery
Advanced search functionality with filters for all metadata categories. The Discover page features curated collections, trending tracks, and personalized recommendations. Users can browse by any tag category or combination of filters.

#### Playlists & Collections
Users can create, edit, and share playlists. Features include:
- Adding/removing tracks
- Reordering songs
- Custom playlist covers
- Public/private visibility settings
- Collaborative playlists (Premium)
- Playlist statistics and activity feed

### Advanced Features

#### AI-Powered Recommendations
Machine learning system that analyzes listening habits, liked tracks, and user-generated tags to provide personalized recommendations. The AI suggests:
- New tracks based on listening history
- "If you like X, you might enjoy Y" recommendations
- Mood-based suggestions
- Genre exploration paths
- Playlist enhancement recommendations

#### Social Features
Social layer allowing users to:
- Share playlists with friends or publicly
- Comment on and like playlists
- Follow other users to see their activity
- View what friends are listening to
- Receive notifications about social interactions

#### Enhanced Metadata Explorer
Interactive tool for exploring music through metadata. Visual representations of connections between genres, artists, and moods. Users can navigate through a web of related music, discovering new connections and similarities.

#### Lyric Integration
Synchronized lyrics display that highlights the current line during playback. Users can:
- Search within lyrics
- Jump to specific parts of a song by clicking lyrics
- View translations (where available)
- See explanations and annotations

#### Listening Statistics & Insights
Detailed analytics of personal listening habits, including:
- Most played tracks, artists, and genres
- Listening trends over time
- Discovery rate of new music
- Mood and genre distribution
- Personalized year-in-review summaries

## Technical Stack

### Frontend
Built with Next.js (React framework). Next.js allows both server-side rendering and static generation for fast, SEO-friendly pages. We style using Tailwind CSS, a utility-first CSS framework ideal for building modern UIs quickly. The responsive design ensures a seamless experience across devices. For the audio player, we use Howler.js or Wavesurfer.js to provide robust playback capabilities and visualizations.

### Backend
Node.js runtime with Express.js framework for a scalable, modular architecture. The backend serves as an API gateway and middleware between the frontend and the music streaming API. It handles user authentication, playlist management, metadata storage, and recommendation processing.

### Music API Integration
Integration with a music streaming API (options include Spotify Web API, Apple Music API, Deezer API, or Last.fm API) to provide the music catalog and streaming capabilities. The chosen API will determine:
- Authentication flow (OAuth for most services)
- Available metadata
- Playback restrictions
- Rate limits and quotas

Our backend will cache API responses to minimize requests and enhance performance.

### AI Recommendation Engine
A machine learning system built on TensorFlow.js or similar technology that processes user listening data and preferences to generate personalized recommendations. The system combines collaborative filtering (what similar users enjoy) with content-based filtering (based on track attributes and metadata).

### Database
MySQL installed locally on Ubuntu for development, with potential migration to a cloud database service for production. The database stores:
- User profiles and authentication data
- User-generated metadata and tags
- Playlists and collections
- Listening history and statistics
- Social interactions (comments, likes)
- Cached API responses where appropriate

### Real-time Features
Socket.IO for real-time updates to the user interface, including:
- Live playlist collaboration
- Activity feed updates
- Notification delivery
- Social presence indicators

### Authentication
Multi-layered authentication system:
1. User authentication via OAuth 2.0 (Google, Facebook) and JWT for session management
2. Music API authentication using the appropriate OAuth flow for the selected service
3. Secure handling of API tokens and refreshing when needed

User roles (Standard/Premium/Moderator/Admin) are encoded in the user profile and enforced through middleware.

## API Specification

We define a RESTful JSON API that serves as both an interface for our frontend and a middleware for the music streaming API. Key endpoints include:

### Authentication & Users
- `POST /api/auth/signup` – Create new user
- `POST /api/auth/login` – Log in existing user
- `GET /api/auth/music-service` – Authenticate with the music streaming service
- `GET /api/users/:id` – Get user profile by ID
- `PUT /api/users/:id` – Update user settings
- `GET /api/users/:id/stats` – Get user listening statistics
- `PUT /api/users/premium` – Upgrade to premium account

### Music API Proxy
- `GET /api/music/search` – Search tracks, artists, albums (proxies to music API)
- `GET /api/music/tracks/:id` – Get track details from music API
- `GET /api/music/artists/:id` – Get artist details from music API
- `GET /api/music/albums/:id` – Get album details from music API
- `GET /api/music/genres` – Get available genres from music API
- `GET /api/music/new-releases` – Get new releases from music API
- `GET /api/music/trending` – Get trending tracks from music API

### Metadata & Tags
- `GET /api/metadata/tracks/:id` – Get user-generated metadata for a track
- `POST /api/metadata/tracks/:id` – Add metadata to a track
- `PUT /api/metadata/tracks/:id` – Update metadata for a track
- `GET /api/tags` – List all tags by category
- `POST /api/tags` – Create a new tag
- `GET /api/tags/popular` – Get most popular tags
- `GET /api/tags/:category` – Get tags by category (genre, mood, etc.)

### Playlists
- `GET /api/playlists` – List user's playlists
- `GET /api/playlists/:id` – Get playlist details
- `POST /api/playlists` – Create a new playlist
- `PUT /api/playlists/:id` – Update playlist details
- `POST /api/playlists/:id/tracks` – Add track to playlist
- `DELETE /api/playlists/:id/tracks/:trackId` – Remove track from playlist
- `PUT /api/playlists/:id/reorder` – Reorder tracks in playlist
- `GET /api/playlists/featured` – Get featured playlists
- `POST /api/playlists/:id/collaborate` – Invite user to collaborate (Premium)

### Social Features
- `POST /api/social/playlists/:id/like` – Like a playlist
- `POST /api/social/playlists/:id/comment` – Comment on a playlist
- `GET /api/social/playlists/:id/comments` – Get comments on a playlist
- `GET /api/social/feed` – Get activity feed
- `POST /api/social/follow/:userId` – Follow a user
- `DELETE /api/social/follow/:userId` – Unfollow a user
- `GET /api/social/followers` – Get user's followers
- `GET /api/social/following` – Get users being followed

### Recommendations
- `GET /api/recommendations/tracks` – Get recommended tracks
- `GET /api/recommendations/similar/:trackId` – Get tracks similar to a given track
- `GET /api/recommendations/based-on-playlist/:playlistId` – Get recommendations based on a playlist
- `GET /api/recommendations/mood/:mood` – Get recommendations by mood
- `GET /api/recommendations/discover-weekly` – Get personalized weekly recommendations

## Database Schema

### Users
(id PK, username, email, passwordHash, googleId, profilePicUrl, role, isPremium, createdAt, lastLoginAt)
User accounts with authentication information. Role is enum ("Standard"/"Premium"/"Moderator"/"Admin").

### MusicServiceTokens
(id PK, userId FK→Users, service, accessToken, refreshToken, expiresAt, scope)
Stores authentication tokens for music streaming services (Spotify, Apple Music, etc.).

### ExternalTracks
(id PK, externalId, service, cacheExpiresAt, cachedData JSON)
Caches track information from external music APIs to reduce API calls. The externalId is the unique identifier from the music service.

### UserTrackMetadata
(id PK, userId FK→Users, externalTrackId, service, createdAt, updatedAt)
Stores user-specific metadata for tracks from external services.

### Tags
(id PK, name, category, createdBy FK→Users, isOfficial)
Tags organized by category (genre, mood, era, instrument, theme, etc.). Official tags are system-defined; user tags can be contributed by anyone.

### TrackTags
(id PK, externalTrackId, service, tagId FK→Tags, userId FK→Users, createdAt)
Associates external tracks with tags. Includes the user who added the tag to track user contributions.

### Playlists
(id PK, name, description, coverImageUrl, userId FK→Users, isPublic, isCollaborative, createdAt, updatedAt)
User-created playlists. Collaborative playlists can be edited by multiple users (Premium feature).

### PlaylistTracks
(id PK, playlistId FK→Playlists, externalTrackId, service, addedBy FK→Users, position, addedAt)
Tracks in playlists with position for ordering. Includes who added the track for collaborative playlists.

### PlaylistCollaborators
(playlistId FK→Playlists, userId FK→Users, addedAt, addedBy FK→Users)
Users who can collaborate on a playlist (Premium feature).

### PlaylistLikes
(playlistId FK→Playlists, userId FK→Users, createdAt)
Tracks which users have liked which playlists.

### PlaylistComments
(id PK, playlistId FK→Playlists, userId FK→Users, comment TEXT, createdAt)
User comments on playlists.

### UserFollows
(followerId FK→Users, followedId FK→Users, createdAt)
Tracks which users follow which other users.

### ListeningHistory
(id PK, userId FK→Users, externalTrackId, service, playedAt, playDuration)
Records user listening history for generating statistics and recommendations.

### UserRecommendations
(id PK, userId FK→Users, externalTrackId, service, score, reason, createdAt)
Stores AI-generated recommendations for quick retrieval. The reason field explains why this track was recommended.

### UserStatistics
(userId FK→Users, statisticType, value, period, updatedAt)
Aggregated listening statistics (e.g., most played genre, average daily listening time) for different time periods.

## Local Development Setup

### Environment
Use any modern OS (Windows, macOS, or Linux). Install Node.js (v18+ LTS) via the official installer or nvm. Install MySQL server:

For Ubuntu:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

For macOS (using Homebrew):
```bash
brew install mysql
brew services start mysql
```

For Windows, download and install MySQL from the official website.

Secure MySQL and create a local database and user for RhythmBond.

### Music API Registration
1. Choose a music streaming API to integrate with (Spotify, Apple Music, Deezer, etc.)
2. Register as a developer on the chosen platform
3. Create an application to obtain API keys/credentials
4. Note the authentication flow requirements and API limitations

For example, with Spotify:
- Register at Spotify Developer Dashboard
- Create an app and configure redirect URIs
- Note your Client ID and Client Secret
- Review API documentation for endpoints and rate limits

### Project Structure
Set up a monorepo structure:
```
rhythmbond/
  backend/    # Node.js API (Express)
    src/
      controllers/
      models/
      routes/
      services/
      utils/
    .env.example
    package.json
  frontend/   # Next.js app
    components/
    contexts/
    hooks/
    pages/
    public/
    styles/
    tailwind.config.js
    package.json
  .gitignore
  README.md
```

### Environment Variables
Create a .env (backend) with:
```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mysql://dbuser:dbpass@localhost:3306/rhythmbond

# Authentication
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Music API (example for Spotify)
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback

# Optional Services
REDIS_URL=... # For caching if implemented
```

### Installation & Setup
1. Clone the repository
2. Install dependencies in both frontend and backend directories:
   ```bash
   cd rhythmbond/backend && npm install
   cd ../frontend && npm install
   ```
3. Set up the database:
   ```bash
   cd ../backend
   npx prisma migrate dev # If using Prisma ORM
   ```
4. Configure environment variables by copying .env.example to .env and filling in your values
5. Start the development servers:
   ```bash
   # In backend directory
   npm run dev

   # In frontend directory (separate terminal)
   npm run dev
   ```
6. Access the application at http://localhost:3000

### Testing & Development Tools
- API testing: Use Postman or Insomnia to test your backend endpoints
- Database inspection: MySQL Workbench or Prisma Studio (`npx prisma studio`)
- Browser DevTools: For frontend debugging and network monitoring
- React DevTools: For component inspection and state management
- Redux DevTools: If using Redux for state management
- Multiple browser profiles: To test social features with different accounts
