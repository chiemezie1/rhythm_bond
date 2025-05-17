'use client';

import { useState } from 'react';
import Image from 'next/image';

// Mock data for genres
const genreOptions = [
  { id: 'pop', name: 'Pop', selected: true },
  { id: 'rock', name: 'Rock', selected: true },
  { id: 'hip-hop', name: 'Hip Hop', selected: false },
  { id: 'r-and-b', name: 'R&B', selected: true },
  { id: 'electronic', name: 'Electronic', selected: false },
  { id: 'jazz', name: 'Jazz', selected: false },
  { id: 'classical', name: 'Classical', selected: false },
  { id: 'country', name: 'Country', selected: false },
  { id: 'folk', name: 'Folk', selected: false },
  { id: 'indie', name: 'Indie', selected: true },
  { id: 'metal', name: 'Metal', selected: false },
  { id: 'blues', name: 'Blues', selected: false },
  { id: 'reggae', name: 'Reggae', selected: false },
  { id: 'punk', name: 'Punk', selected: false },
  { id: 'soul', name: 'Soul', selected: true },
  { id: 'funk', name: 'Funk', selected: false },
];

// Mock data for moods
const moodOptions = [
  { id: 'happy', name: 'Happy', selected: true },
  { id: 'sad', name: 'Sad', selected: false },
  { id: 'energetic', name: 'Energetic', selected: true },
  { id: 'calm', name: 'Calm', selected: true },
  { id: 'romantic', name: 'Romantic', selected: false },
  { id: 'angry', name: 'Angry', selected: false },
  { id: 'nostalgic', name: 'Nostalgic', selected: true },
  { id: 'focused', name: 'Focused', selected: false },
  { id: 'relaxed', name: 'Relaxed', selected: true },
  { id: 'party', name: 'Party', selected: false },
  { id: 'workout', name: 'Workout', selected: true },
  { id: 'sleep', name: 'Sleep', selected: false },
];

// Mock data for favorite artists
const favoriteArtists = [
  { id: 1, name: 'The Weeknd', imageUrl: '/images/man_with_headse.png' },
  { id: 2, name: 'Dua Lipa', imageUrl: '/images/logo_bg_white.png' },
  { id: 3, name: 'Arctic Monkeys', imageUrl: '/images/logo.png' },
  { id: 4, name: 'Billie Eilish', imageUrl: '/images/two_people_enjoying_music.png' },
  { id: 5, name: 'Kendrick Lamar', imageUrl: '/images/man_with_headse.png' },
];

export default function UserPreferences() {
  const [genres, setGenres] = useState(genreOptions);
  const [moods, setMoods] = useState(moodOptions);
  const [artists, setArtists] = useState(favoriteArtists);
  const [discoveryLevel, setDiscoveryLevel] = useState(70);
  const [explicitContent, setExplicitContent] = useState(true);
  const [listeningActivity, setListeningActivity] = useState(true);
  
  // Toggle genre selection
  const toggleGenre = (id: string) => {
    setGenres(genres.map(genre => 
      genre.id === id ? { ...genre, selected: !genre.selected } : genre
    ));
  };
  
  // Toggle mood selection
  const toggleMood = (id: string) => {
    setMoods(moods.map(mood => 
      mood.id === id ? { ...mood, selected: !mood.selected } : mood
    ));
  };
  
  // Remove artist from favorites
  const removeArtist = (id: number) => {
    setArtists(artists.filter(artist => artist.id !== id));
  };
  
  // Save preferences
  const savePreferences = () => {
    // In a real app, this would send the preferences to the backend
    alert('Preferences saved! AI recommendations will be updated.');
  };
  
  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold mb-6">Your Music Preferences</h1>
      <p className="text-gray-400 mb-8 max-w-3xl">
        Customize your music preferences to help our AI make better recommendations for you. 
        The more information you provide, the more personalized your experience will be.
      </p>
      
      {/* Favorite Genres */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Favorite Genres</h2>
        <p className="text-gray-400 mb-4">Select the genres you enjoy listening to.</p>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre.id}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                genre.selected
                  ? 'bg-primary text-white'
                  : 'bg-dark-lighter text-gray-300 hover:bg-dark-lightest'
              }`}
              onClick={() => toggleGenre(genre.id)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Preferred Moods */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Preferred Moods</h2>
        <p className="text-gray-400 mb-4">Select the moods you typically enjoy.</p>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                mood.selected
                  ? 'bg-secondary text-white'
                  : 'bg-dark-lighter text-gray-300 hover:bg-dark-lightest'
              }`}
              onClick={() => toggleMood(mood.id)}
            >
              {mood.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Favorite Artists */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Favorite Artists</h2>
        <p className="text-gray-400 mb-4">Artists you follow will influence your recommendations.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {artists.map((artist) => (
            <div 
              key={artist.id} 
              className="bg-dark-lighter rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image 
                    src={artist.imageUrl} 
                    alt={artist.name} 
                    fill
                    className="object-cover"
                  />
                </div>
                <span>{artist.name}</span>
              </div>
              <button 
                className="text-gray-400 hover:text-red-500"
                onClick={() => removeArtist(artist.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <div className="bg-dark-lighter rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-dark-lightest hover:border-primary transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Artist</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Discovery Level */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Discovery Level</h2>
        <p className="text-gray-400 mb-4">
          Adjust how much new music you want to discover versus familiar favorites.
        </p>
        <div className="flex items-center gap-4">
          <span className="text-sm">Familiar</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="100"
              value={discoveryLevel}
              onChange={(e) => setDiscoveryLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-dark-lighter rounded-lg appearance-none cursor-pointer"
            />
            <div className="absolute -top-6 text-xs text-gray-400" style={{ left: `${discoveryLevel}%`, transform: 'translateX(-50%)' }}>
              {discoveryLevel}%
            </div>
          </div>
          <span className="text-sm">Discover</span>
        </div>
      </div>
      
      {/* Additional Settings */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Additional Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-dark-lighter p-4 rounded-lg">
            <div>
              <h3 className="font-medium">Explicit Content</h3>
              <p className="text-sm text-gray-400">Allow explicit content in recommendations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={explicitContent}
                onChange={() => setExplicitContent(!explicitContent)}
              />
              <div className="w-11 h-6 bg-dark-lightest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between bg-dark-lighter p-4 rounded-lg">
            <div>
              <h3 className="font-medium">Listening Activity</h3>
              <p className="text-sm text-gray-400">Share your listening activity with friends</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={listeningActivity}
                onChange={() => setListeningActivity(!listeningActivity)}
              />
              <div className="w-11 h-6 bg-dark-lightest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-full transition-colors"
          onClick={savePreferences}
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
