<div align="center">
  <img src="public/images/logo_with_name.png" alt="RhythmBond Logo" width="500"/>
</div>

# RhythmBond

`RhythmBond` is a modern music streaming and social platform that transforms how you discover, organize, and share music. Built with Next.js and powered by YouTube's vast music library, RhythmBond offers a seamless music experience with powerful social features.

## 🎵 Why RhythmBond?
We believe music is a social magnet that builds empathy, trust, and a sense of belonging. RhythmBond aims to amplify that feeling by bringing people together around music and conversation, creating a platform where they can arrange and organize music to their taste, making every listener feel valued, curious, and connected.

### How RhythmBond is sharing this dream?

**Discover Music Like Never Before**: Access millions of tracks through YouTube integration with intelligent search and discovery features that help you find exactly what you're looking for.

**Organize Your Way**: Create unlimited playlists, add custom tags, and organize music by genres. Your music library adapts to your unique taste and listening habits.

**Connect Through Music**: Share your favorite discoveries, collaborate on playlists, and connect with fellow music enthusiasts in a vibrant social community.

**Seamless Experience**: Enjoy a responsive, modern interface that works perfectly across all devices with persistent playback and intuitive controls.

## ✨ Key Features

### Music Management
- **YouTube Integration**: Stream high-quality music from YouTube's extensive library
- **Smart Playlists**: Create, organize, and manage unlimited playlists
- **Custom Tags & Genres**: Personalize your music organization system
- **Advanced Search**: Find tracks by title, artist, genre, duration, and more
- **Listening History**: Track recently played and most played songs

### Social Platform
- **Social Feed**: Share music discoveries and engage with the community
- **Playlist Collaboration**: Share playlists and let others add them to their collection
- **User Profiles**: Customize profiles and follow other music lovers
- **Interactive Features**: Comment, like, and engage with shared content

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Modern interface designed for comfortable music listening
- **Real-time Player**: Persistent music player with queue management
- **Intuitive Navigation**: Easy-to-use interface with powerful functionality

## 🎬 Demo Video

[![Video](https://img.youtube.com/vi/M3xYfDrXIMQ/maxresdefault.jpg)](https://youtu.be/M3xYfDrXIMQ)

## 🛠️ Installation Instructions

### Prerequisites
- **Node.js**: Version 18.x or higher
- **Package Manager**: npm or yarn
- **Database**: MySQL (Refer to [MYSQL_SETUP.md](MYSQL_SETUP.md) for setup instructions)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/chiemezie1/rhythm_bond.git
   cd rhythm_bond
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   ```env
   DATABASE_URL=mysql://username:password@localhost:3306/rhythm_bond
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   
   `or`

   ```bash
   cp .env.example .env.local
   ```
   And update the Database URL
   
4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open `http://localhost:3000` in your browser



## Contributing
We welcome contributions! - See [CONTRIBUTING.md](CONTRIBUTING.md).

## ARCHITECTURE
Complete project details – See [ARCHITECTURE.md](ARCHITECTURE.md).

## Music
Music Database - See [MUSIC_DATABASE.md`](MUSIC_DATABASE.md).

## Author
Authors and Contributors – See [AUTHORS.md](AUTHORS.md).

## License
Licensed under the MIT License – see [LICENSE](LICENSE).

