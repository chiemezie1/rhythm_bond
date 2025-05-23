# RhythmBond Architecture

This document provides a comprehensive overview of RhythmBond's architecture, including system design, technology stack, database schema, and deployment considerations.

## System Overview

RhythmBond is a modern web application built with Next.js that combines music streaming capabilities with social networking features. The application leverages YouTube as its music source and provides users with tools to organize, discover, and share music.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **UI Components**: Custom components with Tailwind CSS
- **Music Player**: YouTube IFrame API

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js with JWT
- **File Storage**: Local file system (public directory)

### External Services
- **Music Source**: YouTube (embedded player)
- **Authentication Providers**: Credentials (email/password)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # Backend API endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── social/        # Social features endpoints
│   │   └── user/          # User data endpoints
│   ├── auth/              # Authentication pages
│   ├── favorites/         # Favorites page
│   ├── genres/            # Genres management page
│   ├── most-played/       # Most played tracks page
│   ├── playlist/          # Playlist pages
│   ├── social/            # Social features pages
│   ├── tags/              # Tags management page
│   └── track/             # Track detail pages
├── components/            # React components
│   ├── common/            # Shared components
│   ├── layout/            # Layout components
│   ├── music/             # Music-related components
│   ├── player/            # Music player components
│   ├── social/            # Social features components
│   ├── ui/                # UI components
│   └── user/              # User-related components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── services/              # Service modules
└── utils/                 # Utility functions
```

## Database Schema

### Core Tables

#### Users & Authentication
- **User**: User accounts with profile information
- **Account**: OAuth accounts (for future providers)
- **Session**: User sessions for authentication

#### Music Management
- **Track**: YouTube tracks with metadata
- **Playlist**: User-created playlists
- **PlaylistTrack**: Many-to-many relationship between playlists and tracks
- **Favorite**: User's favorite tracks
- **RecentlyPlayed**: User's listening history
- **PlayCount**: Track play statistics per user

#### Organization
- **Tag**: User-created tags for organizing music
- **TagTrack**: Many-to-many relationship between tags and tracks
- **Genre**: User-created genres
- **GenreTrack**: Many-to-many relationship between genres and tracks

#### Social Features
- **Post**: Social posts shared by users
- **Comment**: Comments on posts
- **Like**: Likes on posts
- **CommentLike**: Likes on comments
- **Follow**: Social connections between users

#### User Preferences
- **HomeLayout**: User's home page layout preferences

## API Architecture

### Authentication
- JWT-based authentication with NextAuth.js
- Session management with secure HTTP-only cookies
- Role-based access control (future implementation)

### API Endpoints

#### Authentication (`/api/auth/`)
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout

#### User Data (`/api/user/`)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/data/playlists` - Get user playlists
- `POST /api/user/data/playlists` - Create playlist
- `GET /api/user/data/genres` - Get user genres
- `POST /api/user/data/genres` - Create genre
- `GET /api/user/data/tags` - Get user tags
- `POST /api/user/data/tags` - Create tag

#### Social Features (`/api/social/`)
- `GET /api/social/posts` - Get social posts
- `POST /api/social/posts` - Create post
- `POST /api/social/posts/[id]/like` - Like/unlike post
- `POST /api/social/posts/[id]/comments` - Add comment

## State Management

### React Context
- **MusicContext**: Manages music playback, playlists, and library
- **AuthContext**: Handles user authentication state
- **TrackMenuContext**: Manages track menu interactions

### Data Flow
1. User interactions trigger context actions
2. Context providers update state and make API calls
3. Components re-render based on state changes
4. Database updates persist changes

## Security Considerations

### Authentication
- Secure password hashing with bcrypt
- JWT tokens with expiration
- CSRF protection with NextAuth.js
- Secure session management

### Data Protection
- Input validation and sanitization
- SQL injection prevention with Prisma
- XSS protection with React's built-in escaping
- Environment variable protection

## Performance Optimizations

### Frontend
- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading of components
- Efficient re-rendering with React Context

### Backend
- Database query optimization with Prisma
- Connection pooling
- Efficient API endpoint design
- Caching strategies (future implementation)

## Deployment

### Environment Variables
```env
DATABASE_URL=mysql://username:password@localhost:3306/rhythm_bond
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Database Setup
1. Install MySQL server
2. Create database: `rhythm_bond`
3. Run Prisma migrations: `npx prisma db push`
4. Seed database: `npx prisma db seed`

### Production Deployment
- Vercel (recommended for Next.js)
- Docker containerization support
- Environment-specific configurations
- Database migration strategies

## Future Enhancements

### Planned Features
- AI-powered music recommendations
- Real-time notifications
- Advanced search with Elasticsearch
- Mobile app development
- Offline capabilities
- Advanced analytics

### Scalability Considerations
- Microservices architecture
- CDN integration for static assets
- Database sharding strategies
- Caching layer implementation
- Load balancing

## Monitoring and Logging

### Development
- Console logging for debugging
- Error boundaries for React components
- Database query logging with Prisma

### Production (Future)
- Application performance monitoring
- Error tracking and reporting
- User analytics
- Database performance monitoring

## Testing Strategy

### Current
- Manual testing across browsers
- Database testing with Prisma Studio

### Future Implementation
- Unit tests with Jest and React Testing Library
- Integration tests for API endpoints
- End-to-end tests with Cypress
- Performance testing
- Security testing

## Contributing

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Support

For technical support and questions, please refer to the project's GitHub issues or contact the maintainers.
