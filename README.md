<div align="center">
  <img src="public/images/logo_with_name.png" alt="RhythmBond Logo" width="500"/>
</div>

# RhythmBond
We believe music is a social magnet that builds empathy, trust, and a sense of belonging. RhythmBond aims to amplify that feeling by bringing people together around music and conversation, making every listener feel valued, curious, and connected.

### How (Principles)
RhythmBond is a modern web-based music player that enhances the music listening experience through rich metadata, AI-powered recommendations, and social sharing features. Our mission is to transform passive music consumption into an active, enriched experience where discovery and sharing are seamlessly integrated.

- **Intuitive Experience**: Creating a sleek, user-friendly music player interface
- **Rich Metadata**: Enabling deep music exploration through comprehensive tagging
- **Smart Discovery**: Leveraging AI to provide personalized recommendations
- **Social Connection**: Facilitating sharing and discussion around music
- **User Control**: Giving listeners powerful tools to organize and customize their experience

#### Core Features
RhythmBond offers a range of features to enhance the music listening experience:
- Sleek, responsive music player with visualizations
- Integration with music streaming APIs for vast content access
- Comprehensive metadata management and tagging system
- Advanced search and discovery tools
- Personalized playlists and listening history

#### Advanced Features
- AI-powered music recommendations based on listening habits
- Social sharing of playlists with comments and likes
- Collaborative playlist creation (Premium)
- Interactive metadata explorer for music discovery
- Detailed listening statistics and insights

## 🚀 Technical Stack

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **State Management**: React Context API / Redux
- **Audio Player**: Howler.js or Wavesurfer.js
- **Data Fetching**: SWR or React Query

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.IO for social features and notifications
- **API Integration**: Music streaming API (Spotify, Apple Music, etc.)
- **AI**: TensorFlow.js for recommendation engine

### Database & Storage
- **Database**: MySQL
- **ORM**: Prisma
- **Caching**: Redis (optional)

### Authentication
- **User Auth**: JWT, OAuth 2.0 (Google, Facebook)
- **Music Service Auth**: OAuth integration with chosen music API
- **Security**: Password hashing, role-based access control

## 👥 User Roles

- **Standard User**: Can play music, create playlists, add custom tags, and share content
- **Premium User**: Gets higher quality audio, advanced playlist tools, and offline listening
- **Moderator**: Can moderate user content, manage tags, and handle reports
- **Admin**: Full access to manage the platform, users, and API integrations

## 🔄 API Specification

RhythmBond uses a RESTful JSON API with endpoints for:
- Authentication & User Management
- Music API Integration & Proxy
- Metadata & Tagging
- Playlist Management
- Social Features (sharing, comments, likes)
- AI-Powered Recommendations

## 🎨 Brand Identity

RhythmBond's brand is warm, creative, and modern with a friendly, supportive tone. The visual style is sleek yet approachable, using:

- **Colors**: Vibrant palette with warm accent colors and trustworthy mid-tones
- **Layout**: Clean, responsive grid with persistent music player and intuitive navigation
- **Typography**: Modern, rounded sans-serif fonts for readability and approachability
- **Imagery**: Album art-focused design with subtle animations and visualizations

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ LTS)
- MySQL Server
- Music API credentials (Spotify, Apple Music, etc.)
- Google OAuth credentials (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rhythmbond.git
cd rhythmbond
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following:
```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mysql://username:password@localhost:3306/rhythmbond

# Authentication
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Music API (example for Spotify)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
```

4. Set up the database:
```bash
cd ../backend
npx prisma migrate dev
```

5. Run the development servers:
```bash
# Start the backend server
cd backend
npm run dev

# In a new terminal, start the frontend
cd frontend
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📝 Database Schema

The database includes tables for:
- Users (with roles and preferences)
- MusicServiceTokens (for API authentication)
- ExternalTracks (cached data from music APIs)
- UserTrackMetadata (user-specific track information)
- Tags (organized by category)
- TrackTags (connecting tracks to tags)
- Playlists and PlaylistTracks
- PlaylistCollaborators, Likes, and Comments
- UserFollows (social connections)
- ListeningHistory and UserStatistics
- UserRecommendations (AI-generated suggestions)

## 🧪 Testing

For testing the application:
- API testing: Use Postman or Insomnia to test backend endpoints
- Database inspection: Prisma Studio or MySQL Workbench
- Frontend testing: React Testing Library and Jest
- E2E testing: Cypress for critical user flows
- Multiple browser profiles: To test social features with different accounts

## 🔌 Music API Integration

RhythmBond can integrate with various music streaming APIs:

### Spotify Web API
- Comprehensive documentation: [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- Rich metadata and recommendation features
- OAuth 2.0 authentication flow
- Playback through Spotify Web Playback SDK

### Apple Music API
- Documentation: [Apple Music API](https://developer.apple.com/documentation/applemusicapi/)
- High-quality audio streams
- MusicKit JS for web integration
- Requires Apple Developer account

### Deezer API
- Documentation: [Deezer API](https://developers.deezer.com/api)
- Simple REST API structure
- Good catalog coverage in certain regions
- JavaScript SDK available

### Last.fm API
- Documentation: [Last.fm API](https://www.last.fm/api)
- Rich tagging and social features
- Limited to metadata (no streaming)
- Good for supplementing other APIs with social data

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.IO Documentation](https://socket.io/docs)
- [Howler.js Documentation](https://github.com/goldfire/howler.js#documentation)
- [TensorFlow.js Documentation](https://www.tensorflow.org/js/guide)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
