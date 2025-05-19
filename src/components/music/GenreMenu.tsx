'use client';

import { useState, useRef, useEffect } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';

interface GenreMenuProps {
  genre: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    coverUrl?: string;
  };
  onClose: () => void;
  position: { x: number; y: number };
  onGenreUpdated: (genre: any) => void;
  onGenreRemoved: (genreId: string) => void;
}

export default function GenreMenu({ genre, onClose, position, onGenreUpdated, onGenreRemoved }: GenreMenuProps) {
  const { updateGenre, deleteGenre } = useMusic();
  const { isAuthenticated } = useAuth();
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [name, setName] = useState(genre.name);
  const [description, setDescription] = useState(genre.description || '');
  const [color, setColor] = useState(genre.color || '#3b82f6');
  
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Set menu position
  const menuStyle = position ? {
    position: 'fixed' as const,
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: 50
  } : {};
  
  // Handle clicking outside of menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Handle edit genre
  const handleEditGenre = async () => {
    if (!isAuthenticated) return;
    
    try {
      const updatedGenre = await updateGenre(genre.id, {
        name,
        description,
        color
      });
      
      if (updatedGenre) {
        onGenreUpdated(updatedGenre);
        setShowEditForm(false);
      }
    } catch (error) {
      console.error('Error updating genre:', error);
    }
  };
  
  // Handle delete genre
  const handleDeleteGenre = async () => {
    if (!isAuthenticated) return;
    
    if (window.confirm(`Are you sure you want to delete the "${genre.name}" genre?`)) {
      try {
        const success = await deleteGenre(genre.id);
        
        if (success) {
          onGenreRemoved(genre.id);
          onClose();
        }
      } catch (error) {
        console.error('Error deleting genre:', error);
      }
    }
  };
  
  return (
    <div
      ref={menuRef}
      className="bg-dark-lighter rounded-lg shadow-lg overflow-hidden w-64"
      style={menuStyle}
    >
      <div className="p-3 border-b border-dark-lightest">
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded flex-shrink-0 overflow-hidden"
            style={{ backgroundColor: genre.color || '#3b82f6' }}
          ></div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{genre.name}</p>
            {genre.description && (
              <p className="text-sm text-gray-400 truncate">{genre.description}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="py-1">
        {!showEditForm ? (
          <>
            <button
              className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
              onClick={() => setShowEditForm(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Genre</span>
            </button>
            
            <button
              className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
              onClick={handleDeleteGenre}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-red-500">Delete Genre</span>
            </button>
            
            <button
              className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </button>
          </>
        ) : (
          <div className="p-3">
            <div className="mb-3">
              <label htmlFor="genreName" className="block text-sm font-medium text-gray-400 mb-1">
                Name
              </label>
              <input
                type="text"
                id="genreName"
                className="w-full bg-dark-lightest border border-dark-lightest rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="genreDescription" className="block text-sm font-medium text-gray-400 mb-1">
                Description
              </label>
              <input
                type="text"
                id="genreDescription"
                className="w-full bg-dark-lightest border border-dark-lightest rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="genreColor" className="block text-sm font-medium text-gray-400 mb-1">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="genreColor"
                  className="w-8 h-8 rounded cursor-pointer"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <input
                  type="text"
                  className="flex-1 bg-dark-lightest border border-dark-lightest rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 text-gray-400 hover:text-white"
                onClick={() => setShowEditForm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded"
                onClick={handleEditGenre}
                disabled={!name.trim()}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
