'use client';

import { useState, useEffect, useRef } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { CustomTag } from '@/services/userDataService';
import Link from 'next/link';

export default function CustomTags() {
  const { getCustomTags, createCustomTag } = useMusic();
  const [tags, setTags] = useState<CustomTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6'); // Default blue color
  const formRef = useRef<HTMLDivElement>(null);

  // Predefined colors for tags
  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Teal', value: '#14b8a6' }
  ];

  // Get user tags
  useEffect(() => {
    try {
      const userTags = getCustomTags();
      setTags(userTags);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load tags:', err);
      setError('Failed to load tags. Please try again later.');
      setIsLoading(false);
    }
  }, [getCustomTags]);

  // Handle clicks outside the form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowCreateForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle creating a new tag
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTagName.trim()) {
      return;
    }

    try {
      // Create a mock tag for immediate UI feedback
      const mockTag: CustomTag = {
        id: `temp-${Date.now()}`,
        name: newTagName,
        color: newTagColor,
        trackIds: [],
        userId: ''
      };

      setTags(prev => [...prev, mockTag]);
      setNewTagName('');
      setNewTagColor('#3b82f6');
      setShowCreateForm(false);

      // Try to create the tag in the background
      try {
        await createCustomTag(newTagName, newTagColor);
        // If successful, we could refresh the tags, but we'll skip for now
      } catch (innerErr) {
        console.error('Failed to create tag in the background:', innerErr);
      }
    } catch (err) {
      console.error('Failed to create tag:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Tags</h2>
        </div>
        <div className="bg-dark-lighter rounded-xl p-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Tags</h2>
        </div>
        <div className="bg-dark-lighter rounded-xl p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Your Tags</h2>
        <div className="flex items-center gap-2">
          <button
            className="text-primary hover:text-primary-light"
            onClick={() => setShowCreateForm(true)}
          >
            Create New
          </button>
          <Link href="/tags" className="text-primary hover:text-primary-light">
            View All
          </Link>
        </div>
      </div>

      {/* Create Tag Form */}
      {showCreateForm && (
        <div className="bg-dark-lighter rounded-xl p-4 mb-4" ref={formRef}>
          <form onSubmit={handleCreateTag}>
            <h3 className="text-lg font-medium mb-3">Create New Tag</h3>
            <div className="mb-3">
              <label htmlFor="tagName" className="block text-sm font-medium text-gray-400 mb-1">
                Name
              </label>
              <input
                type="text"
                id="tagName"
                className="w-full bg-dark border border-dark-lightest rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Workout, Chill, Party, etc."
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full ${newTagColor === color.value ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewTagColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-gray-400 hover:text-white"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
                disabled={!newTagName.trim()}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {tags.length === 0 && !showCreateForm ? (
        <div className="bg-dark-lighter rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-4">You haven't created any tags yet.</p>
          <button
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
            onClick={() => setShowCreateForm(true)}
          >
            Create Your First Tag
          </button>
        </div>
      ) : (
        <div className="bg-dark-lighter rounded-xl p-4">
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link
                key={tag.id}
                href={`/tag/${tag.id}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: `${tag.color}20`, // Add transparency
                  color: tag.color,
                  borderWidth: '1px',
                  borderColor: tag.color
                }}
              >
                <span>{tag.name}</span>
                <span className="ml-2 text-xs">{tag.trackIds.length}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
