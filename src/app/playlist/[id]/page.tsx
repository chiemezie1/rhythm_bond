"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Layout from "@/components/layout/Layout"
import { useMusic } from "@/contexts/MusicContext"
import { useAuth } from "@/hooks/useAuth"
import type { UserPlaylist } from "@/services/userDataService"
import type { Track } from "@/services/musicService"
import TrackMenuButton from "@/components/ui/TrackMenuButton"

export default function PlaylistPage({ params: serverParams }: { params: { id: string } }) {
  const params = useParams()
  const playlistId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""

  const { playTrack, getAllTracks } = useMusic()
  const { isAuthenticated, user } = useAuth()
  const [playlist, setPlaylist] = useState<UserPlaylist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [showAddTracks, setShowAddTracks] = useState(false)
  const [allTracks, setAllTracks] = useState<Track[]>([])
  const [sortOption, setSortOption] = useState<'default' | 'title' | 'artist'>('default')
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState('')

  // Fetch playlist data
  useEffect(() => {
    // Create a flag to track if the component is mounted
    let isMounted = true
    let controller = new AbortController();

    const fetchPlaylist = async () => {
      if (!playlistId) return

      // Only fetch if we're loading or don't have a playlist yet
      if (!isLoading && playlist) return

      try {
        setIsLoading(true)

        // Fetch playlist directly from the API with abort controller
        const response = await fetch(`/api/user/data/playlists/${playlistId}`, {
          signal: controller.signal
        })

        if (!isMounted) return // Don't proceed if component unmounted

        if (!response.ok) {
          if (response.status === 404) {
            setError("Playlist not found")
          } else {
            throw new Error(`Failed to fetch playlist: ${response.statusText}`)
          }
          setIsLoading(false)
          return
        }

        const data = await response.json()

        if (!isMounted) return // Don't proceed if component unmounted

        setPlaylist(data.playlist)

        // Check if the current user is the owner of the playlist
        if (user && data.playlist.userId === user.id) {
          setIsOwner(true)

          // Fetch all tracks for adding to playlist
          try {
            const tracks = await getAllTracks()
            setAllTracks(tracks)
          } catch (error) {
            console.error('Error fetching all tracks:', error)
          }
        } else {
          setIsOwner(false)
        }

        setIsLoading(false)
      } catch (err) {
        // Ignore abort errors
        if ((err as any).name === 'AbortError') return;

        console.error("Failed to load playlist:", err)
        if (isMounted) {
          setError("Failed to load playlist. Please try again later.")
          setIsLoading(false)
        }
      }
    }

    fetchPlaylist()

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false
      controller.abort();
    }
  }, [playlistId])

  // Handle playing the entire playlist
  const handlePlayPlaylist = () => {
    if (playlist && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0])
    }
  }

  // Handle updating playlist name
  const handleUpdateName = async () => {
    if (!isAuthenticated || !user || !playlist || !isOwner || !editedName.trim()) return

    try {
      const response = await fetch(`/api/user/data/playlists/${playlist.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editedName.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to update playlist name')
      }

      // Update the playlist in state
      setPlaylist((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          name: editedName.trim(),
        }
      })

      setIsEditingName(false)
      console.log('Playlist name updated successfully')
    } catch (error) {
      console.error('Error updating playlist name:', error)
      alert('Failed to update playlist name. Please try again.')
    }
  }

  // Handle updating playlist description
  const handleUpdateDescription = async () => {
    if (!isAuthenticated || !user || !playlist || !isOwner) return

    try {
      const response = await fetch(`/api/user/data/playlists/${playlist.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: editedDescription.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to update playlist description')
      }

      // Update the playlist in state
      setPlaylist((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          description: editedDescription.trim(),
        }
      })

      setIsEditingDescription(false)
      console.log('Playlist description updated successfully')
    } catch (error) {
      console.error('Error updating playlist description:', error)
      alert('Failed to update playlist description. Please try again.')
    }
  }

  // Handle starting to edit name
  const handleStartEditingName = () => {
    if (playlist) {
      setEditedName(playlist.name)
      setIsEditingName(true)
    }
  }

  // Handle starting to edit description
  const handleStartEditingDescription = () => {
    if (playlist) {
      setEditedDescription(playlist.description || '')
      setIsEditingDescription(true)
    }
  }

  // Handle canceling name edit
  const handleCancelEditName = () => {
    setIsEditingName(false)
    setEditedName('')
  }

  // Handle canceling description edit
  const handleCancelEditDescription = () => {
    setIsEditingDescription(false)
    setEditedDescription('')
  }

  // Handle adding a track to the playlist
  const handleAddTrack = async (track: Track) => {
    if (!isAuthenticated || !user || !playlist || !isOwner) return

    try {
      // Add the track to the playlist
      const response = await fetch(`/api/user/data/playlists/${playlist.id}/tracks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ track }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add track to playlist")
      }

      // Update the playlist in state
      setPlaylist((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          tracks: [...prev.tracks, track],
        }
      })

      console.log(`Track "${track.title}" added to playlist`)
    } catch (error) {
      console.error("Error adding track to playlist:", error)
      alert((error as any).message || "Failed to add track to playlist. Please try again.")
    }
  }

  // Handle removing a track from the playlist
  const handleRemoveTrack = async (track: Track) => {
    if (!isAuthenticated || !user || !playlist || !isOwner) return

    try {
      // Remove the track from the playlist
      const response = await fetch(`/api/user/data/playlists/${playlist.id}/tracks?trackId=${track.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove track from playlist")
      }

      // Update the playlist in state
      setPlaylist((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          tracks: prev.tracks.filter((t) => t.id !== track.id),
        }
      })

      console.log(`Track "${track.title}" removed from playlist`)
    } catch (error) {
      console.error("Error removing track from playlist:", error)
      alert("Failed to remove track from playlist. Please try again.")
    }
  }

  // Get sorted tracks based on the selected sort option
  const getSortedTracks = (tracksToSort: Track[]) => {
    switch (sortOption) {
      case 'title':
        return [...tracksToSort].sort((a, b) => a.title.localeCompare(b.title));
      case 'artist':
        return [...tracksToSort].sort((a, b) => a.artist.localeCompare(b.artist));
      default:
        return tracksToSort;
    }
  };

  // Filter all tracks to exclude those already in the playlist
  const getAvailableTracks = () => {
    return allTracks.filter(
      (track) => !playlist?.tracks.some((t) => t.id === track.id)
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-64 bg-background-elevated rounded-lg mb-6"></div>
            <div className="h-8 bg-background-elevated rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-background-elevated rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-background-elevated rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !playlist) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="bg-background-card rounded-lg p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Playlist Not Found</h1>
            <p className="text-text-secondary mb-6">{error || "The playlist you're looking for doesn't exist."}</p>
            <Link href="/library" className="btn btn-primary">
              Go to Library
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Playlist Header */}
        <div className="relative mb-8">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-2xl"></div>

          <div className="relative bg-dark-lighter/80 backdrop-blur-sm rounded-2xl p-8 border border-dark-lightest/50">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Playlist Cover */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-2xl overflow-hidden shadow-2xl mx-auto lg:mx-0">
                  {playlist.tracks.length > 0 ? (
                    <div className="relative w-full h-full bg-dark-lightest">
                      <Image
                        src={playlist.tracks[0].thumbnail?.replace('mqdefault.jpg', 'hqdefault.jpg') || "/placeholder.svg"}
                        alt={playlist.name}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const icon = document.createElement('div');
                            icon.className = 'flex items-center justify-center w-full h-full bg-dark-lightest';
                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
                            parent.appendChild(icon);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-dark-lightest flex items-center justify-center rounded-2xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-20 w-20 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Playlist Info */}
              <div className="flex-1 text-center lg:text-left">
                {/* Type and Owner Badge */}
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Playlist</span>
                  {isOwner && (
                    <span className="bg-primary/20 text-primary text-xs font-medium px-3 py-1 rounded-full border border-primary/30">
                      Your Playlist
                    </span>
                  )}
                </div>

                {/* Playlist Name */}
                {isEditingName ? (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-4xl lg:text-5xl font-bold bg-transparent border-b-2 border-primary text-white leading-tight focus:outline-none w-full max-w-2xl"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateName()
                        if (e.key === 'Escape') handleCancelEditName()
                      }}
                      autoFocus
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={handleUpdateName}
                        className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditName}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group mb-4">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight inline-block">
                      {playlist.name}
                      {isOwner && (
                        <button
                          onClick={handleStartEditingName}
                          className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-dark-lightest/50 rounded-lg"
                          title="Edit playlist name"
                        >
                          <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                      )}
                    </h1>
                  </div>
                )}

                {/* Description */}
                {isEditingDescription ? (
                  <div className="mb-6">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="text-gray-300 text-lg bg-transparent border border-primary rounded-lg p-3 focus:outline-none w-full max-w-2xl resize-none"
                      placeholder="Add a description for your playlist..."
                      rows={3}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) handleUpdateDescription()
                        if (e.key === 'Escape') handleCancelEditDescription()
                      }}
                      autoFocus
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={handleUpdateDescription}
                        className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditDescription}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group mb-6">
                    {playlist.description ? (
                      <p className="text-gray-300 text-lg max-w-2xl inline-block">
                        {playlist.description}
                        {isOwner && (
                          <button
                            onClick={handleStartEditingDescription}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-dark-lightest/50 rounded"
                            title="Edit description"
                          >
                            <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                        )}
                      </p>
                    ) : isOwner ? (
                      <button
                        onClick={handleStartEditingDescription}
                        className="text-gray-400 hover:text-gray-300 text-lg italic transition-colors"
                      >
                        + Add a description
                      </button>
                    ) : null}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-400 mb-8">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="font-medium">{playlist.tracks.length} tracks</span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <span>Created {formatDate(playlist.createdAt)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <button
                    className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePlayPlaylist}
                    disabled={playlist.tracks.length === 0}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                    </svg>
                    Play All
                  </button>

                  {isOwner && (
                    <button
                      className="bg-dark-lightest hover:bg-dark-lighter text-white font-medium px-6 py-3 rounded-full transition-all duration-200 flex items-center gap-2 border border-dark-lightest hover:border-gray-600"
                      onClick={() => setShowAddTracks(!showAddTracks)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      {showAddTracks ? 'Hide Add Tracks' : 'Add Tracks'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Tracks Section (only for owners) */}
        {isOwner && showAddTracks && (
          <div className="bg-dark-lighter/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-dark-lightest/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Add Tracks</h2>
                <p className="text-gray-400 text-sm">Browse your music library and add tracks to this playlist</p>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="sortOption" className="text-sm font-medium text-gray-400">Sort by:</label>
                <select
                  id="sortOption"
                  className="bg-dark-lightest/80 text-white px-4 py-2 rounded-lg border border-dark-lightest/50 focus:border-primary/50 focus:outline-none transition-colors"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                >
                  <option value="default">Default</option>
                  <option value="title">Title A-Z</option>
                  <option value="artist">Artist A-Z</option>
                </select>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
              {getAvailableTracks().length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-gray-400 text-lg font-medium">All tracks added!</p>
                  <p className="text-gray-500 text-sm mt-1">All available tracks are already in this playlist</p>
                </div>
              ) : (
                getSortedTracks(getAvailableTracks()).map((track) => (
                  <div key={track.id} className="group flex items-center justify-between bg-dark-lightest/50 hover:bg-dark-lightest/80 p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-dark-lightest/50">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={track.thumbnail || '/images/logo.png'}
                          alt={track.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate group-hover:text-primary transition-colors">{track.title}</p>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                    </div>
                    <button
                      className="bg-primary/20 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-primary/30 hover:border-primary"
                      onClick={() => handleAddTrack(track)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Playlist Tracks */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Tracks</h2>
              <p className="text-gray-400 text-sm mt-1">
                {playlist.tracks.length > 0
                  ? `${playlist.tracks.length} ${playlist.tracks.length === 1 ? 'track' : 'tracks'} in this playlist`
                  : 'No tracks in this playlist yet'
                }
              </p>
            </div>

            {playlist.tracks.length > 0 && (
              <div className="flex items-center gap-3">
                <label htmlFor="playlistTracksSortOption" className="text-sm font-medium text-gray-400">Sort by:</label>
                <select
                  id="playlistTracksSortOption"
                  className="bg-dark-lightest/80 text-white px-4 py-2 rounded-lg border border-dark-lightest/50 focus:border-primary/50 focus:outline-none transition-colors"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                >
                  <option value="default">Default</option>
                  <option value="title">Title A-Z</option>
                  <option value="artist">Artist A-Z</option>
                </select>
              </div>
            )}
          </div>

          {playlist.tracks.length === 0 ? (
            <div className="bg-dark-lighter/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-dark-lightest/30">
              <svg className="w-20 h-20 text-gray-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">This playlist is empty</h3>
              <p className="text-gray-400 mb-6">Start building your playlist by adding some tracks</p>
              {isOwner && (
                <button
                  className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-full transition-all duration-200 flex items-center gap-2 mx-auto"
                  onClick={() => setShowAddTracks(true)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Add Your First Track
                </button>
              )}
            </div>
          ) : (
            <div className="bg-dark-lighter/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-dark-lightest/30">
              <div className="space-y-1">
                {getSortedTracks(playlist.tracks).map((track, index) => (
                  <div
                    key={track.id}
                    className="group flex items-center gap-4 p-4 hover:bg-dark-lightest/50 transition-all duration-200 cursor-pointer border-b border-dark-lightest/20 last:border-b-0"
                    onClick={() => playTrack(track)}
                  >
                    {/* Track Number */}
                    <div className="w-8 text-center">
                      <span className="text-gray-400 text-sm font-medium group-hover:hidden">{index + 1}</span>
                      <svg className="w-4 h-4 text-primary mx-auto hidden group-hover:block" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                      </svg>
                    </div>

                    {/* Track Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={track.thumbnail || "/placeholder.svg"}
                          alt={track.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate group-hover:text-primary transition-colors">{track.title}</p>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    {/* Duration (if available) */}
                    {track.duration && (
                      <div className="hidden sm:block text-sm text-gray-400 font-mono">
                        {track.duration}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isOwner && (
                        <button
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveTrack(track)
                          }}
                          title="Remove from playlist"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      )}
                      <TrackMenuButton
                        track={track}
                        onRemove={isOwner ? () => handleRemoveTrack(track) : undefined}
                        menuPosition="left"
                        showBackground={false}
                        iconSize={16}
                        className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-dark-lightest/50"

                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
