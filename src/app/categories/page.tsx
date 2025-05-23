'use client';

import { useState, useEffect } from 'react';
import Layout from "@/components/layout/Layout";
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoriesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { getGenres, createGenre, updateGenre, deleteGenre } = useMusic();

  const [genres, setGenres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGenre, setEditingGenre] = useState<any>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');

  // Load genres
  useEffect(() => {
    const loadGenres = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
      }

      try {
        setIsLoading(true);
        const userGenres = await getGenres();
        setGenres(userGenres);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading genres:', error);
        setIsLoading(false);
      }
    };

    loadGenres();
  }, [isAuthenticated, authLoading, getGenres]);

  // Handle create genre
  const handleCreateGenre = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      const newGenre = await createGenre(name, color, description);

      if (newGenre) {
        setGenres([...genres, newGenre]);
        setName('');
        setDescription('');
        setColor('#3b82f6');
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating genre:', error);
    }
  };

  // Handle update genre
  const handleUpdateGenre = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingGenre || !name.trim()) return;

    try {
      const updatedGenre = await updateGenre(editingGenre.id, {
        name,
        description,
        color
      });

      if (updatedGenre) {
        setGenres(genres.map(g => g.id === updatedGenre.id ? updatedGenre : g));
        setEditingGenre(null);
      }
    } catch (error) {
      console.error('Error updating genre:', error);
    }
  };

  // Handle delete genre
  const handleDeleteGenre = async (genreId: string) => {
    if (window.confirm('Are you sure you want to delete this genre?')) {
      try {
        const success = await deleteGenre(genreId);

        if (success) {
          setGenres(genres.filter(g => g.id !== genreId));
        }
      } catch (error) {
        console.error('Error deleting genre:', error);
      }
    }
  };

  // Start editing a genre
  const startEditing = (genre: any) => {
    setEditingGenre(genre);
    setName(genre.name);
    setDescription(genre.description || '');
    setColor(genre.color || '#3b82f6');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingGenre(null);
    setName('');
    setDescription('');
    setColor('#3b82f6');
  };

  // Get a default cover image for genres without one
  const getDefaultCoverImage = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-teal-600',
      'bg-gradient-to-br from-orange-500 to-red-600',
      'bg-gradient-to-br from-purple-500 to-pink-600',
      'bg-gradient-to-br from-yellow-500 to-amber-600',
    ];

    return (
      <div className={`w-full h-full flex items-center justify-center ${colors[index % colors.length]}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Categories</span>
          </nav>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Manage Categories</h1>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>

            {!showCreateForm && !editingGenre && (
              <button
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center gap-2"
                onClick={() => setShowCreateForm(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Genre
              </button>
            )}
          </div>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingGenre) && (
          <div className="bg-dark-lighter rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingGenre ? 'Edit Genre' : 'Create New Genre'}
            </h2>

            <form onSubmit={editingGenre ? handleUpdateGenre : handleCreateGenre}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full bg-dark-lightest border border-dark-lightest rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      className="w-full bg-dark-lightest border border-dark-lightest rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <label htmlFor="color" className="block text-sm font-medium text-gray-400 mb-1">
                      Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        id="color"
                        className="h-10 w-10 rounded cursor-pointer"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      />
                      <input
                        type="text"
                        className="flex-1 bg-dark-lightest border border-dark-lightest rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Preview
                    </label>
                    <div
                      className="h-24 rounded-md flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: color }}
                    >
                      {name || 'Genre Name'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-400 hover:text-white"
                  onClick={() => {
                    if (editingGenre) {
                      cancelEditing();
                    } else {
                      setShowCreateForm(false);
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
                  disabled={!name.trim()}
                >
                  {editingGenre ? 'Update Genre' : 'Create Genre'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Genres Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : genres.length === 0 ? (
          <div className="bg-dark-lighter rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">You haven't created any genres yet.</p>
            <button
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Genre
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {genres.map((genre, index) => (
              <div key={genre.id} className="bg-dark-lighter rounded-xl overflow-hidden">
                <div className="relative aspect-video">
                  {genre.coverImage ? (
                    <Image
                      src={genre.coverImage}
                      alt={genre.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: genre.color || '#3b82f6' }}
                    >
                      <h3 className="text-white font-bold text-2xl">{genre.name}</h3>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{genre.name}</h3>
                  {genre.description && (
                    <p className="text-gray-400 text-sm mb-3">{genre.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <Link
                      href={`/genre/${genre.id}`}
                      className="text-primary hover:text-primary-light"
                    >
                      View Tracks
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        className="text-gray-400 hover:text-white p-1"
                        onClick={() => startEditing(genre)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="text-red-500 hover:text-red-400 p-1"
                        onClick={() => handleDeleteGenre(genre.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
