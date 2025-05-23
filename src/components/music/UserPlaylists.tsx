"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useMusic } from "@/contexts/MusicContext"
import type { UserPlaylist } from "@/services/userDataService"
import PlaylistCard from "./PlaylistCard"

export default function UserPlaylists() {
  const { getPlaylists, createPlaylist, playTrack, deletePlaylist } = useMusic()
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("")
  const formRef = useRef<HTMLDivElement>(null)

  // Get user playlists
  useEffect(() => {
    try {
      const userPlaylists = getPlaylists()
      setPlaylists(userPlaylists)
      setIsLoading(false)
    } catch (err) {
      console.error("Failed to load playlists:", err)
      setError("Failed to load playlists. Please try again later.")
      setIsLoading(false)
    }
  }, [getPlaylists])

  // Handle clicks outside the form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowCreateForm(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle creating a new playlist
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPlaylistName.trim()) {
      return
    }

    try {
      // Use a mock playlist for now since createPlaylist is async and might fail
      const mockPlaylist: UserPlaylist = {
        id: `temp-${Date.now()}`,
        name: newPlaylistName,
        description: newPlaylistDescription,
        tracks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "",
        isPublic: false,
      }

      setPlaylists((prev) => [...prev, mockPlaylist])
      setNewPlaylistName("")
      setNewPlaylistDescription("")
      setShowCreateForm(false)

      // Try to create the playlist in the background
      try {
        await createPlaylist(newPlaylistName, newPlaylistDescription)
        // If successful, we could refresh the playlists, but we'll skip for now
      } catch (innerErr) {
        console.error("Failed to create playlist in the background:", innerErr)
      }
    } catch (err) {
      console.error("Failed to create playlist:", err)
    }
  }

  // Handle deleting a playlist
  const handleDeletePlaylist = (playlist: UserPlaylist) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      deletePlaylist(playlist.id)
      setPlaylists((prev) => prev.filter((p) => p.id !== playlist.id))
    }
  }

  // Handle playing a playlist
  const handlePlayPlaylist = (playlist: UserPlaylist) => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0])
    }
  }

  // Handle opening the playlist menu
  const handleOpenPlaylistMenu = (playlist: UserPlaylist, position: { x: number; y: number }) => {
    // In a real implementation, you would open a menu with options like "Edit Playlist", "Share Playlist", etc.
    window.location.href = `/playlist/${playlist.id}`
  }

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Playlists</h2>
        </div>
        <div className="bg-dark-lighter rounded-xl p-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Playlists</h2>
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
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Your Playlists</h2>
        <div className="flex items-center gap-2">
          <button className="text-primary hover:text-primary-light" onClick={() => setShowCreateForm(true)}>
            Create New
          </button>
          <Link href="/playlists" className="text-primary hover:text-primary-light">
            View All
          </Link>
        </div>
      </div>

      {/* Create Playlist Form */}
      {showCreateForm && (
        <div className="bg-dark-lighter rounded-xl p-4 mb-4" ref={formRef}>
          <form onSubmit={handleCreatePlaylist}>
            <h3 className="text-lg font-medium mb-3">Create New Playlist</h3>
            <div className="mb-3">
              <label htmlFor="playlistName" className="block text-sm font-medium text-gray-400 mb-1">
                Name
              </label>
              <input
                type="text"
                id="playlistName"
                className="w-full bg-dark border border-dark-lightest rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="My Awesome Playlist"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="playlistDescription" className="block text-sm font-medium text-gray-400 mb-1">
                Description (optional)
              </label>
              <textarea
                id="playlistDescription"
                className="w-full bg-dark border border-dark-lightest rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                placeholder="A collection of my favorite tracks"
                rows={2}
              />
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
                disabled={!newPlaylistName.trim()}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {playlists.length === 0 && !showCreateForm ? (
        <div className="bg-dark-lighter rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-4">You haven't created any playlists yet.</p>
          <button
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
            onClick={() => setShowCreateForm(true)}
          >
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.slice(0, 5).map((playlist, index) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              index={index}
              onPlay={handlePlayPlaylist}
              onDelete={handleDeletePlaylist}
              onMenuOpen={handleOpenPlaylistMenu}
            />
          ))}
        </div>
      )}
    </div>
  )
}
