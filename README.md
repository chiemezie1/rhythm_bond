<div align="center">
  <img src="public/images/logo_with_name.png" alt="RhythmBond Logo" width="500"/>
</div>

# RhythmBond
We believe music is a social magnet that builds empathy, trust, and a sense of belonging. RhythmBond aims to amplify that feeling by bringing people together around music and conversation, making every listener feel valued, curious, and connected.

### How (Principles)
RhythmBond is a modern web-based music player that enhances the music listening experience through YouTube integration, AI-powered recommendations, and social sharing features. Our mission is to transform passive music consumption into an active, enriched experience where discovery and sharing are seamlessly integrated. RhythmBond leverages YouTube as the music source to provide a vast catalog of music content organized by genres.

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
- **State Management**: React Context API
- **Audio Player**: YouTube Embedded Player
- **Data Fetching**: Fetch API

### Backend
- **Runtime**: Next.js API Routes
- **Framework**: Next.js
- **API Integration**: YouTube for music content
- **AI**: Future implementation for recommendation engine

### Database & Storage
- **Database**: MySQL
- **ORM**: Prisma

### Authentication
- **User Auth**: NextAuth.js, JWT
- **Security**: Password hashing, role-based access control

## 📂 Project Structure

- `src/app`: Next.js app directory with pages and API routes
- `src/components`: React components organized by functionality
  - `common`: Common components used throughout the application
  - `layout`: Layout components (header, footer, sidebar)
  - `music`: Music-related components (tracks, playlists, etc.)
  - `player`: Music player components
  - `social`: Social features components
  - `user`: User-related components (profile, settings, etc.)
- `src/contexts`: React context providers
- `src/hooks`: Custom React hooks
- `src/lib`: Utility libraries
- `src/providers`: Provider components
- `src/services`: Service modules for data fetching and manipulation
- `src/styles`: Global styles
- `src/types`: TypeScript type definitions
- `prisma`: Prisma ORM schema and migrations
- `public`: Static assets

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
- Google OAuth credentials (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rhythmbond.git
cd rhythmbond
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following:
```
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=mysql://username:password@localhost:3306/rhythmbond
```

4. Set up the database:
```bash
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📝 Database Schema

The database includes tables for:
- Users (with roles and preferences)
- Tracks (YouTube tracks with metadata)
- Playlists and PlaylistTracks
- Custom Tags and TrackTags
- Social connections (follows, likes, comments)
- Posts and shared content
- User preferences and listening history

## 🧪 Testing

For testing the application:
- API testing: Use Postman or Insomnia to test backend endpoints
- Database inspection: Prisma Studio or MySQL Workbench
- Frontend testing: React Testing Library and Jest
- E2E testing: Cypress for critical user flows
- Multiple browser profiles: To test social features with different accounts

## 🔌 Music Integration

RhythmBond uses YouTube as its exclusive music source:

### YouTube Integration
- Documentation: [YouTube Embedded Player](https://developers.google.com/youtube/iframe_api_reference)
- Vast catalog of music content
- Embedded player for seamless integration
- Organized by genres:
  - Afrobeats & Global Pop
  - Pop
  - Hip-Hop & Trap
  - R&B
  - Blues
- Custom metadata and tagging system
- User-created playlists and favorites
- Recently played tracking
- No API key required for basic embedded playback

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)

## 📁 API Documentation

See the [API documentation](src/app/api/README.md) for details on available endpoints.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.




Here are the user accounts that can be used to log in:

Name	Email	Password
John Doe	john@example.com	password123
Jane Smith	jane@example.com	password123
Alex Johnson	alex@example.com	password123
Maria Garcia	maria@example.com	password123
David Kim	david@example.com	password123