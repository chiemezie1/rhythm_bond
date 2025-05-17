'use client';

import { useState } from 'react';

const moods = [
  { id: 'all', name: 'All', emoji: '🎵' },
  { id: 'chill', name: 'Chill', emoji: '😌' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡' },
  { id: 'sad', name: 'Sad', emoji: '😢' },
  { id: 'romantic', name: 'Romantic', emoji: '❤️' },
  { id: 'focus', name: 'Focus', emoji: '🧠' },
  { id: 'party', name: 'Party', emoji: '🎉' },
  { id: 'custom', name: 'Custom', emoji: '✨' }
];

export default function MoodFilter() {
  const [selectedMood, setSelectedMood] = useState('all');

  return (
    <div className="mb-8 sticky top-0 z-10 bg-dark pt-4 pb-2 -mx-4 px-4 shadow-md">
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-3 min-w-max">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                selectedMood === mood.id
                  ? 'bg-primary text-white'
                  : 'bg-dark-lighter hover:bg-dark-lightest text-gray-300'
              }`}
              onClick={() => setSelectedMood(mood.id)}
            >
              <span className="text-xl">{mood.emoji}</span>
              <span className="text-sm font-medium">{mood.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
