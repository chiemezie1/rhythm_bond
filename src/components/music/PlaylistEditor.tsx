'use client';

import { useState } from 'react';
import Image from 'next/image';

// Mock data for available tracks
const availableTracks = [
  {
    id: 1,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:20',
    coverUrl: '/images/man_with_headse.png',
  },
  {
    id: 2,
    title: 'As It Was',
    artist: 'Harry Styles',
    album: 'Harry\'s House',
    duration: '2:47',
    coverUrl: '/images/two_people_enjoying_music.png',
  },
  {
    id: 3,
    title: 'Heat Waves',
    artist: 'Glass Animals',
    album: 'Dreamland',
    duration: '3:59',
    coverUrl: '/images/logo_bg_white.png',
  },
  {
    id: 4,
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    album: 'F*CK LOVE 3: OVER YOU',
    duration: '2:21',
    coverUrl: '/images/logo.png',
  },
  {
    id: 5,
    title: 'Easy On Me',
    artist: 'Adele',
    album: '30',
    duration: '3:44',
    coverUrl: '/images/man_with_headse.png',
  },
  {
    id: 6,
    title: 'Shivers',
    artist: 'Ed Sheeran',
    album: '=',
    duration: '3:27',
    coverUrl: '/images/two_people_enjoying_music.png',
  },
  {
    id: 7,
    title: 'Bad Habits',
    artist: 'Ed Sheeran',
    album: '=',
    duration: '3:51',
    coverUrl: '/images/logo_bg_white.png',
  },
  {
    id: 8,
    title: 'good 4 u',
    artist: 'Olivia Rodrigo',
    album: 'SOUR',
    duration: '2:58',
    coverUrl: '/images/logo.png',
  },
];

export default function PlaylistEditor() {
  const [playlistName, setPlaylistName] = useState('My New Playlist');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [coverImage, setCoverImage] = useState('/images/logo.png');
  const [selectedTracks, setSelectedTracks] = useState<number[]>([1, 3, 5]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTracks = availableTracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const toggleTrackSelection = (trackId: number) => {
    if (selectedTracks.includes(trackId)) {
      setSelectedTracks(selectedTracks.filter(id => id !== trackId));
    } else {
      setSelectedTracks([...selectedTracks, trackId]);
    }
  };
  
  const handleSavePlaylist = () => {
    // In a real app, this would save the playlist to the backend
    alert('Playlist saved!');
  };
  
  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold mb-6">Create New Playlist</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Playlist Details */}
        <div className="md:col-span-1">
          <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-6">
            {/* Cover Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4 group">
              <Image 
                src={coverImage} 
                alt="Playlist Cover" 
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-primary rounded-full p-2 transform hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Playlist Name */}
            <div className="mb-4">
              <label htmlFor="playlist-name" className="block text-sm font-medium text-gray-400 mb-1">
                Playlist Name
              </label>
              <input
                type="text"
                id="playlist-name"
                className="w-full bg-dark-lightest dark:bg-dark-lightest rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
            </div>
            
            {/* Playlist Description */}
            <div className="mb-4">
              <label htmlFor="playlist-description" className="block text-sm font-medium text-gray-400 mb-1">
                Description (optional)
              </label>
              <textarea
                id="playlist-description"
                rows={3}
                className="w-full bg-dark-lightest dark:bg-dark-lightest rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                placeholder="Add an optional description"
              />
            </div>
            
            {/* Privacy Settings */}
            <div className="mb-6">
              <p className="block text-sm font-medium text-gray-400 mb-2">
                Privacy Settings
              </p>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="public-playlist"
                  className="mr-2"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                />
                <label htmlFor="public-playlist" className="text-sm">
                  Public playlist
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="collaborative-playlist"
                  className="mr-2"
                  checked={isCollaborative}
                  onChange={() => setIsCollaborative(!isCollaborative)}
                />
                <label htmlFor="collaborative-playlist" className="text-sm">
                  Collaborative playlist
                </label>
              </div>
            </div>
            
            {/* Save Button */}
            <button 
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={handleSavePlaylist}
            >
              Save Playlist
            </button>
          </div>
        </div>
        
        {/* Track Selection */}
        <div className="md:col-span-2">
          <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Add Tracks</h2>
            
            {/* Search */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search for songs, artists, or albums"
                className="w-full bg-dark-lightest dark:bg-dark-lightest rounded-full py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Track List */}
            <div className="max-h-[500px] overflow-y-auto">
              {filteredTracks.map((track) => (
                <div 
                  key={track.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors cursor-pointer ${
                    selectedTracks.includes(track.id) 
                      ? 'bg-dark-lightest' 
                      : 'hover:bg-dark-lightest'
                  }`}
                  onClick={() => toggleTrackSelection(track.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedTracks.includes(track.id)}
                    onChange={() => {}}
                    className="h-5 w-5 accent-primary"
                  />
                  <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                    <Image 
                      src={track.coverUrl} 
                      alt={track.title} 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-gray-400 truncate">{track.artist} • {track.album}</p>
                  </div>
                  <span className="text-sm text-gray-400">{track.duration}</span>
                </div>
              ))}
            </div>
            
            {/* Selected Count */}
            <div className="mt-4 text-sm text-gray-400">
              {selectedTracks.length} tracks selected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
