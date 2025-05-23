'use client';

import { useState, useRef, useEffect } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import { Track } from '@/services/musicService';
import { UserPlaylist, CustomTag } from '@/services/userDataService';

interface TrackMenuProps {
  track: Track;
  onClose: () => void;
  position?: { x: number; y: number };
  onRemove?: () => void;
}

export default function TrackMenu({ track, onClose, position, onRemove }: TrackMenuProps) {
  const {
    toggleFavorite,
    isFavorite,
    getPlaylists,
    addTrackToPlaylist,
    getCustomTags,
    addTagToTrack,
    createCustomTag,
    removeTagFromTrack,
    getTagsForTrack,
    getGenres,
    createGenre,
    addTrackToGenre,
    removeTrackFromGenre,
    createPlaylist
  } = useMusic();
  const { isAuthenticated, user } = useAuth();

  const [liked, setLiked] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [showGenresMenu, setShowGenresMenu] = useState(false);
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [tags, setTags] = useState<CustomTag[]>([]);
  const [trackTags, setTrackTags] = useState<CustomTag[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [trackGenres, setTrackGenres] = useState<any[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreColor, setNewGenreColor] = useState('#3b82f6');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [shareVisibility, setShareVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const playlistMenuRef = useRef<HTMLDivElement>(null);
  const tagsMenuRef = useRef<HTMLDivElement>(null);
  const genresMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Set menu position
  const menuStyle = position ? {
    position: 'fixed' as const,
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: 50
  } : {};

  // Check if track is in favorites
  useEffect(() => {
    if (isAuthenticated) {
      setLiked(isFavorite(track.id));
    }
  }, [isAuthenticated, isFavorite, track.id]);

  // Load playlists once when component mounts
  useEffect(() => {
    if (isAuthenticated && playlists.length === 0) {
      setPlaylists(getPlaylists());
    }
  }, [isAuthenticated, getPlaylists, playlists.length]);

  // Load tags once when component mounts
  useEffect(() => {
    if (isAuthenticated && tags.length === 0) {
      setTags(getCustomTags());
    }
  }, [isAuthenticated, getCustomTags, tags.length]);

  // Load genres once when component mounts
  useEffect(() => {
    if (isAuthenticated && genres.length === 0) {
      getGenres().then(setGenres);
    }
  }, [isAuthenticated, getGenres, genres.length]);

  // Handle clicking outside of menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
      if (playlistMenuRef.current && !playlistMenuRef.current.contains(event.target as Node)) {
        setShowPlaylistMenu(false);
      }
      if (tagsMenuRef.current && !tagsMenuRef.current.contains(event.target as Node)) {
        setShowTagsMenu(false);
      }
      if (genresMenuRef.current && !genresMenuRef.current.contains(event.target as Node)) {
        setShowGenresMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Toggle like status
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      alert('Please log in to add tracks to your favorites');
      window.location.href = '/login';
      return;
    }

    const isNowLiked = await toggleFavorite(track);
    setLiked(isNowLiked);
  };

  // Load playlists when menu is opened
  const handleOpenPlaylistMenu = () => {
    if (!isAuthenticated) {
      alert('Please log in to add tracks to playlists');
      window.location.href = '/login';
      return;
    }

    // Always get the latest playlists
    setPlaylists(getPlaylists());

    // Toggle the playlist menu
    setShowPlaylistMenu(!showPlaylistMenu);
    setShowTagsMenu(false);
    setShowGenresMenu(false);
    setShowShareMenu(false);
  };

  // Load tags when menu is opened
  const handleOpenTagsMenu = () => {
    if (!isAuthenticated) {
      alert('Please log in to add tags to tracks');
      window.location.href = '/login';
      return;
    }

    // Always get the latest tags and track tags
    setTags(getCustomTags());
    setTrackTags(getTagsForTrack(track.id));

    // Toggle the tags menu
    setShowTagsMenu(!showTagsMenu);
    setShowPlaylistMenu(false);
    setShowGenresMenu(false);
    setShowShareMenu(false);
  };

  // Load genres when menu is opened
  const handleOpenGenresMenu = () => {
    if (!isAuthenticated) {
      alert('Please log in to add genres to tracks');
      window.location.href = '/login';
      return;
    }

    // Always get the latest genres
    getGenres().then(setGenres);

    // In a real implementation, we would get the track's genres
    // For now, we'll just use an empty array if we don't have any
    if (trackGenres.length === 0) {
      setTrackGenres([]);
    }

    // Toggle the genres menu
    setShowGenresMenu(!showGenresMenu);
    setShowPlaylistMenu(false);
    setShowTagsMenu(false);
    setShowShareMenu(false);
  };

  // Add track to playlist
  const handleAddToPlaylist = async (playlistId: string) => {
    if (!isAuthenticated) return;

    try {
      const success = await addTrackToPlaylist(playlistId, track);
      if (success) {
        // Find the playlist name for better feedback
        const playlist = playlists.find(p => p.id === playlistId);
        const playlistName = playlist ? playlist.name : 'playlist';

        alert(`Added "${track.title}" to ${playlistName}`);
        setShowPlaylistMenu(false);
        onClose(); // Close the main menu after successful action
      }
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      alert('Failed to add track to playlist. Please try again.');
    }
  };

  // Create a new playlist and add the track to it
  const handleCreatePlaylist = async () => {
    if (!isAuthenticated || !newPlaylistName.trim()) return;

    try {
      const newPlaylist = await createPlaylist(newPlaylistName, newPlaylistDescription);
      if (newPlaylist) {
        const success = await addTrackToPlaylist(newPlaylist.id, track);
        if (success) {
          alert(`Created playlist "${newPlaylistName}" and added "${track.title}"`);
          setNewPlaylistName('');
          setNewPlaylistDescription('');
          setShowPlaylistMenu(false);
          onClose(); // Close the main menu after successful action

          // Refresh playlists
          setPlaylists(getPlaylists());
        }
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist. Please try again.');
    }
  };

  // Add tag to track
  const handleAddTag = (tagId: string) => {
    if (!isAuthenticated) return;

    addTagToTrack(tagId, track.id).then(success => {
      if (success) {
        // Find the tag name for better feedback
        const tag = tags.find(t => t.id === tagId);
        const tagName = tag ? tag.name : 'tag';

        alert(`Added tag "${tagName}" to "${track.title}"`);
        setTrackTags(getTagsForTrack(track.id));
        setShowTagsMenu(false);
        onClose(); // Close the main menu after successful action
      }
    });
  };

  // Remove tag from track
  const handleRemoveTag = (tagId: string) => {
    if (!isAuthenticated) return;

    removeTagFromTrack(tagId, track.id).then(success => {
      if (success) {
        // Find the tag name for better feedback
        const tag = tags.find(t => t.id === tagId);
        const tagName = tag ? tag.name : 'tag';

        alert(`Removed tag "${tagName}" from "${track.title}"`);
        setTrackTags(getTagsForTrack(track.id));
      }
    });
  };

  // Create new tag
  const handleCreateTag = () => {
    if (!newTagName.trim() || !isAuthenticated) return;

    createCustomTag(newTagName).then(newTag => {
      setTags([...tags, newTag]);
      addTagToTrack(newTag.id, track.id).then(success => {
        if (success) {
          alert(`Created tag "${newTagName}" and added to "${track.title}"`);
          setTrackTags(getTagsForTrack(track.id));
          setShowTagsMenu(false);
          onClose(); // Close the main menu after successful action
        }
      });
      setNewTagName('');
    });
  };

  // Add genre to track
  const handleAddGenre = async (genreId: string) => {
    if (!isAuthenticated) return;

    const success = await addTrackToGenre(genreId, track.id);
    if (success) {
      // Find the genre name for better feedback
      const genre = genres.find(g => g.id === genreId);
      if (genre) {
        alert(`Added "${track.title}" to ${genre.name} genre`);
        setTrackGenres([...trackGenres, genre]);
        setShowGenresMenu(false);
        onClose(); // Close the main menu after successful action
      }
    }
  };

  // Remove genre from track
  const handleRemoveGenre = async (genreId: string) => {
    if (!isAuthenticated) return;

    const success = await removeTrackFromGenre(genreId, track.id);
    if (success) {
      // Find the genre name for better feedback
      const genre = genres.find(g => g.id === genreId);
      const genreName = genre ? genre.name : 'genre';

      alert(`Removed "${track.title}" from ${genreName} genre`);
      setTrackGenres(trackGenres.filter(g => g.id !== genreId));
    }
  };

  // Create new genre
  const handleCreateGenre = async () => {
    if (!newGenreName.trim() || !isAuthenticated) return;

    const newGenre = await createGenre(newGenreName, newGenreColor);
    if (newGenre) {
      setGenres([...genres, newGenre]);
      const success = await addTrackToGenre(newGenre.id, track.id);

      if (success) {
        alert(`Created genre "${newGenreName}" and added "${track.title}" to it`);
        setTrackGenres([...trackGenres, newGenre]);
        setNewGenreName('');
        setShowGenresMenu(false);
        onClose(); // Close the main menu after successful action
      }
    }
  };

  // Don't play this track
  const handleDontPlayThis = () => {
    // In a real implementation, this would add the track to a "don't play" list
    alert(`"${track.title}" will not be played in your recommendations`);
    onClose();
  };

  // Handle opening the share menu
  const handleOpenShareMenu = () => {
    if (!isAuthenticated) {
      alert('Please log in to share tracks');
      window.location.href = '/login';
      return;
    }

    // Set default share message
    setShareMessage(`Check out "${track.title}" by ${track.artist}`);

    // Toggle the share menu
    setShowShareMenu(!showShareMenu);
    setShowPlaylistMenu(false);
    setShowTagsMenu(false);
    setShowGenresMenu(false);
  };

  // Handle sharing the track to social
  const handleShareTrack = async () => {
    if (!isAuthenticated || !user) return;

    try {
      // Create a post with the track
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: shareMessage,
          mediaType: 'track',
          mediaId: track.id,
          visibility: shareVisibility
        })
      });

      if (!response.ok) {
        throw new Error('Failed to share track');
      }

      // Provide feedback based on visibility
      let visibilityText = '';
      switch (shareVisibility) {
        case 'public':
          visibilityText = 'publicly';
          break;
        case 'followers':
          visibilityText = 'with your followers';
          break;
        case 'private':
          visibilityText = 'privately';
          break;
      }

      alert(`Shared "${track.title}" ${visibilityText} to your social feed`);
      setShowShareMenu(false);
      onClose(); // Close the main menu after successful action

      // Redirect to social page to see the shared post
      window.location.href = '/social';
    } catch (error) {
      console.error('Error sharing track:', error);
      alert('Failed to share track. Please try again.');
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
          <div className="w-10 h-10 rounded bg-dark-lightest flex-shrink-0 overflow-hidden">
            <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{track.title}</p>
            <p className="text-sm text-gray-400 truncate">{track.artist}</p>
          </div>
        </div>
      </div>

      <div className="py-1">
        <button
          className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
          onClick={handleToggleLike}
        >
          {liked ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
          <span>{liked ? 'Remove from Favorites' : 'Add to Favorites'}</span>
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
            onClick={handleOpenPlaylistMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Add to Playlist</span>
          </button>

          {showPlaylistMenu && (
            <div
              ref={playlistMenuRef}
              className="absolute left-full top-0 bg-dark-lighter rounded-lg shadow-lg w-64 z-50 ml-2"
            >
              <div className="p-3 border-b border-dark-lightest">
                <h3 className="font-medium text-white">Add to Playlist</h3>
              </div>

              {/* Create new playlist form */}
              <div className="p-3 border-b border-dark-lightest">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    className="w-full bg-dark-lightest border border-dark-lightest rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="New playlist name..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-full bg-dark-lightest border border-dark-lightest rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Description (optional)"
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  />
                  <button
                    className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm"
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim()}
                  >
                    Create & Add Track
                  </button>
                </div>
              </div>

              {/* Existing playlists */}
              <div className="max-h-60 overflow-y-auto">
                {playlists.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <p>You don't have any playlists yet.</p>
                    <p className="text-sm mt-1">Create one above to get started.</p>
                  </div>
                ) : (
                  <div>
                    <div className="px-3 py-2 text-xs text-gray-400">Your Playlists</div>
                    {playlists.map(playlist => (
                      <button
                        key={playlist.id}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
                        onClick={() => handleAddToPlaylist(playlist.id)}
                      >
                        <span className="truncate">{playlist.name}</span>
                        <span className="text-xs text-gray-400">({playlist.tracks.length})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
            onClick={handleOpenTagsMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Manage Tags</span>
          </button>

          {showTagsMenu && (
            <div
              ref={tagsMenuRef}
              className="absolute left-full top-0 bg-dark-lighter rounded-lg shadow-lg w-64 z-50 ml-2"
            >
              <div className="p-3 border-b border-dark-lightest">
                <h3 className="font-medium text-white">Manage Tags</h3>
              </div>
              <div className="p-3 border-b border-dark-lightest">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-dark-lightest border border-dark-lightest rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Create new tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateTag();
                      }
                    }}
                  />
                  <button
                    className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {tags.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <p>You don't have any tags yet.</p>
                    <p className="text-sm mt-1">Create a tag above to get started.</p>
                  </div>
                ) : (
                  tags.map(tag => {
                    const isTagged = trackTags.some(t => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
                        onClick={() => isTagged ? handleRemoveTag(tag.id) : handleAddTag(tag.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></div>
                          <span className="truncate">{tag.name}</span>
                        </div>
                        {isTagged && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
            onClick={handleOpenGenresMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span>Add to Genre</span>
          </button>

          {showGenresMenu && (
            <div
              ref={genresMenuRef}
              className="absolute left-full top-0 bg-dark-lighter rounded-lg shadow-lg w-64 z-50 ml-2"
            >
              <div className="p-3 border-b border-dark-lightest">
                <h3 className="font-medium text-white">Add to Genre</h3>
              </div>
              <div className="p-3 border-b border-dark-lightest">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-dark-lightest border border-dark-lightest rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Create new genre..."
                    value={newGenreName}
                    onChange={(e) => setNewGenreName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateGenre();
                      }
                    }}
                  />
                  <input
                    type="color"
                    className="w-8 h-8 rounded cursor-pointer"
                    value={newGenreColor}
                    onChange={(e) => setNewGenreColor(e.target.value)}
                  />
                  <button
                    className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm"
                    onClick={handleCreateGenre}
                    disabled={!newGenreName.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {genres.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <p>No genres available.</p>
                    <p className="text-sm mt-1">Create a genre above to get started.</p>
                  </div>
                ) : (
                  genres.map(genre => {
                    const isInGenre = trackGenres.some(g => g.id === genre.id);
                    return (
                      <button
                        key={genre.id}
                        className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
                        onClick={() => isInGenre ? handleRemoveGenre(genre.id) : handleAddGenre(genre.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: genre.color }}></div>
                          <span className="truncate">{genre.name}</span>
                        </div>
                        {isInGenre && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
            onClick={handleOpenShareMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share to Social</span>
          </button>

          {showShareMenu && (
            <div
              ref={shareMenuRef}
              className="absolute left-full top-0 bg-dark-lighter rounded-lg shadow-lg w-64 z-50 ml-2"
            >
              <div className="p-3 border-b border-dark-lightest">
                <h3 className="font-medium text-white">Share to Social</h3>
              </div>
              <div className="p-3 border-b border-dark-lightest">
                <div className="flex flex-col gap-2">
                  <textarea
                    className="w-full bg-dark-lightest border border-dark-lightest rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Add a message..."
                    rows={3}
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Visibility:</label>
                    <select
                      className="bg-dark-lightest border border-dark-lightest rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      value={shareVisibility}
                      onChange={(e) => setShareVisibility(e.target.value as any)}
                    >
                      <option value="public">Public</option>
                      <option value="followers">Followers</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <button
                    className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm"
                    onClick={handleShareTrack}
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
          onClick={handleDontPlayThis}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <span>Don't Play This</span>
        </button>

        {onRemove && (
          <button
            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
            onClick={() => {
              onRemove();
              onClose();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-red-500">Remove from Collection</span>
          </button>
        )}
      </div>
    </div>
  );
}
