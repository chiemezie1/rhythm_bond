"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronRight, ListPlus, Tag, Music, Share2 } from "lucide-react"
import type { Track } from "@/services/musicService"
import { useMusic } from "@/contexts/MusicContext"
import { useAuth } from "@/hooks/useAuth"

interface TrackMenuProps {
  track: Track
  buttonElement: HTMLElement
  preferredPosition?: "left" | "right" | "auto"
  onClose: () => void
  onRemove?: () => void
}

export default function TrackMenu({
  track,
  buttonElement,
  preferredPosition = "auto",
  onClose,
  onRemove
}: TrackMenuProps) {
  const { isAuthenticated } = useAuth()
  const music = useMusic()

  // Extract functions from music context
  const {
    getPlaylists,
    getCustomTags,
    getTagsForTrack,
    getGenres,
    addTrackToPlaylist: addTrackToPlaylistOriginal,
    createPlaylist: createPlaylistOriginal,
    addTagToTrack: addTagToTrackOriginal,
    removeTagFromTrack: removeTagFromTrackOriginal,
    createTag: createTagOriginal,
    addTrackToGenre: addTrackToGenreOriginal,
    createGenre: createGenreOriginal
  } = music

  // Functions with proper type handling
  const addTrackToPlaylist = async (playlistId: string, trackId: string) => {
    // Find the track by ID
    const trackToAdd = music.getTrackById(trackId)
    if (!trackToAdd) return false

    return await addTrackToPlaylistOriginal(playlistId, trackToAdd)
  }

  const createPlaylist = async (name: string, description: string) => {
    return await createPlaylistOriginal(name, description)
  }

  const addTagToTrack = async (tagId: string, trackId: string) => {
    return await addTagToTrackOriginal(tagId, trackId)
  }

  const removeTagFromTrack = async (tagId: string, trackId: string) => {
    return await removeTagFromTrackOriginal(tagId, trackId)
  }

  const createTag = async (name: string) => {
    return await createTagOriginal(name)
  }

  const addTrackToGenre = async (genreId: string, trackId: string) => {
    return await addTrackToGenreOriginal(genreId, trackId)
  }

  const createGenre = async (name: string, color: string) => {
    return await createGenreOriginal(name, color)
  }

  // Refs for menu elements
  const menuRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)

  // State for submenu
  const [activeSubmenu, setActiveSubmenu] = useState<"playlists" | "tags" | "genres" | "share" | null>(null)
  const [playlists, setPlaylists] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [trackTags, setTrackTags] = useState<any[]>([])
  const [genres, setGenres] = useState<any[]>([])
  const [trackGenres, setTrackGenres] = useState<any[]>([])
  const [shareMessage, setShareMessage] = useState("")
  const [newItemName, setNewItemName] = useState("")
  const [newItemColor, setNewItemColor] = useState("#3b82f6") // Default color for new genres

  // Center the menu in the screen
  const menuStyle = {
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 100,
    maxHeight: "80vh",
    overflowY: "auto" as const,
    width: "320px", // Slightly wider for better readability
    maxWidth: "90vw",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", // Stronger shadow for depth
    border: "1px solid rgba(255, 255, 255, 0.1)" // Subtle border for definition
  }

  // Position submenu more down and to the right from the main menu
  const getSubmenuStyle = () => {
    return {
      position: "fixed" as const,
      top: "calc(50% + 80px)", // More down from center
      left: "calc(50% + 80px)", // More to the right from center
      transform: "translate(-50%, -50%)",
      zIndex: 200, // Much higher z-index to ensure it's on top
      maxHeight: "80vh",
      overflowY: "auto" as const,
      width: "320px",
      maxWidth: "90vw",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", // Stronger shadow for depth
      border: "1px solid rgba(255, 255, 255, 0.1)", // Subtle border for definition
      backgroundColor: "rgba(32, 32, 36, 0.95)" // Slightly transparent background
    }
  }

  // Load data for submenu
  const loadSubmenuData = async (submenu: "playlists" | "tags" | "genres" | "share") => {
    if (!isAuthenticated) {
      alert(
        `Please log in to ${
          submenu === "playlists"
            ? "add tracks to playlists"
            : submenu === "tags"
              ? "manage tags"
              : submenu === "genres"
                ? "add to genres"
                : "share tracks"
        }`
      )
      return
    }

    // Close current submenu if clicking the same one
    if (activeSubmenu === submenu) {
      setActiveSubmenu(null)
      return
    }

    // Load data based on submenu type
    switch (submenu) {
      case "playlists":
        setPlaylists(getPlaylists())
        break
      case "tags":
        setTags(getCustomTags())
        setTrackTags(getTagsForTrack(track.id))
        break
      case "genres":
        try {
          const genresData = await getGenres()
          setGenres(Array.isArray(genresData) ? genresData : [])

          // Get the track's genres - in a real implementation, this would be a separate API call
          // For now, we'll simulate it by checking if the track is in each genre's tracks
          const trackGenresData = genresData.filter((genre: any) =>
            genre.trackIds && genre.trackIds.includes(track.id)
          )
          setTrackGenres(trackGenresData)
        } catch (error) {
          console.error("Error loading genres:", error)
          setGenres([])
          setTrackGenres([])
        }
        break
      case "share":
        setShareMessage(`Check out "${track.title}" by ${track.artist}`)
        break
    }

    setActiveSubmenu(submenu)
  }

  // Handle clicking outside of menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Don't close if clicking the button that opened the menu
      if (buttonElement.contains(event.target as Node)) {
        return
      }

      // Don't close if clicking inside the menu or submenu
      if (
        (menuRef.current && menuRef.current.contains(event.target as Node)) ||
        (submenuRef.current && submenuRef.current.contains(event.target as Node))
      ) {
        return
      }

      // Close the menu if clicking outside
      onClose()
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose, buttonElement])

  // Handle creating a new item
  const handleCreateItem = async () => {
    if (!newItemName.trim()) return

    try {
      switch (activeSubmenu) {
        case "playlists":
          const newPlaylist = await createPlaylist(newItemName, "")
          if (newPlaylist && newPlaylist.id) {
            await addTrackToPlaylist(newPlaylist.id, track.id)
            setPlaylists([...playlists, newPlaylist])
          } else {
            throw new Error("Failed to create playlist")
          }
          break
        case "tags":
          const newTag = await createTag(newItemName)
          if (newTag && newTag.id) {
            await addTagToTrack(newTag.id, track.id)
            setTags([...tags, newTag])
            setTrackTags([...trackTags, newTag])
          } else {
            throw new Error("Failed to create tag")
          }
          break
        case "genres":
          const newGenre = await createGenre(newItemName, newItemColor)
          if (newGenre && newGenre.id) {
            await addTrackToGenre(newGenre.id, track.id)
            setGenres([...genres, newGenre])
            setTrackGenres([...trackGenres, newGenre])
            setNewItemColor("#3b82f6") // Reset color to default
          } else {
            throw new Error("Failed to create genre")
          }
          break
      }
      setNewItemName("")
    } catch (error) {
      console.error(`Error creating ${activeSubmenu}:`, error)
      alert(`Failed to create ${activeSubmenu}. Please try again.`)
    }
  }

  return (
    <>
      {/* Transparent background overlay */}
      <div
        className="fixed inset-0 z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Main Menu */}
      <div
        ref={menuRef}
        className="bg-dark-lighter rounded-lg shadow-xl overflow-hidden animate-fadeIn"
        style={menuStyle}
      >
        <div className="py-2">
          {/* Track Info */}
          <div className="px-4 py-2 border-b border-dark-lightest">
            <div className="font-medium text-white truncate">{track.title}</div>
            <div className="text-sm text-gray-400 truncate">{track.artist}</div>
          </div>

          {/* Menu Options */}
          <div className="mt-1">
            {/* Add to Playlist */}
            <button
              className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
              onClick={() => {
                void loadSubmenuData("playlists");
              }}
            >
              <div className="flex items-center gap-3">
                <ListPlus size={18} className="text-gray-400" />
                <span>Add to Playlist</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            {/* Manage Tags */}
            <button
              className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
              onClick={() => {
                void loadSubmenuData("tags");
              }}
            >
              <div className="flex items-center gap-3">
                <Tag size={18} className="text-gray-400" />
                <span>Manage Tags</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            {/* Add to Genre */}
            <button
              className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
              onClick={() => {
                void loadSubmenuData("genres");
              }}
            >
              <div className="flex items-center gap-3">
                <Music size={18} className="text-gray-400" />
                <span>Add to Genre</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            {/* Share to Social */}
            <button
              className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
              onClick={() => {
                void loadSubmenuData("share");
              }}
            >
              <div className="flex items-center gap-3">
                <Share2 size={18} className="text-gray-400" />
                <span>Share to Social</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            {/* Remove option if provided */}
            {onRemove && (
              <button
                className="flex items-center w-full px-4 py-2 text-left text-red-500 hover:bg-dark-lightest transition-colors"
                onClick={() => {
                  onRemove()
                  onClose()
                }}
              >
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Remove</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submenu (Playlists, Tags, Genres, Share) */}
      {activeSubmenu && (
        <div
          ref={submenuRef}
          className="fixed bg-dark-lighter rounded-lg shadow-xl"
          style={{
            ...getSubmenuStyle(),
            animation: "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          <div className="py-2">
            {/* Submenu Header */}
            <div className="px-4 py-2 border-b border-dark-lightest">
              <h3 className="font-medium text-white">
                {activeSubmenu === "playlists"
                  ? "Add to Playlist"
                  : activeSubmenu === "tags"
                    ? "Manage Tags"
                    : activeSubmenu === "genres"
                      ? "Add to Genre"
                      : "Share to Social"}
              </h3>
            </div>

            {/* Submenu Content */}
            <div className="max-h-64 overflow-y-auto">
              {/* Playlists Submenu */}
              {activeSubmenu === "playlists" && (
                <div className="py-1">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      className="flex items-center w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
                      onClick={async () => {
                        try {
                          await addTrackToPlaylist(playlist.id, track.id)
                          setActiveSubmenu(null)
                        } catch (error) {
                          console.error("Error adding track to playlist:", error)
                          alert("Failed to add track to playlist. Please try again.")
                        }
                      }}
                    >
                      <span className="truncate">{playlist.name}</span>
                    </button>
                  ))}

                  {/* Create new playlist */}
                  <div className="px-4 py-2 border-t border-dark-lightest mt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 bg-dark-lightest text-white px-2 py-1 rounded"
                        placeholder="New playlist name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            void handleCreateItem()
                          }
                        }}
                      />
                      <button
                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        onClick={() => void handleCreateItem()}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Submenu */}
              {activeSubmenu === "tags" && (
                <div className="py-1">
                  {tags.map((tag) => {
                    const isTagged = trackTags.some((t) => t.id === tag.id)
                    return (
                      <button
                        key={tag.id}
                        className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
                        onClick={async () => {
                          try {
                            if (isTagged) {
                              await removeTagFromTrack(tag.id, track.id)
                              setTrackTags(trackTags.filter((t) => t.id !== tag.id))
                            } else {
                              await addTagToTrack(tag.id, track.id)
                              setTrackTags([...trackTags, tag])
                            }
                          } catch (error) {
                            console.error("Error managing tag:", error)
                            alert("Failed to manage tag. Please try again.")
                          }
                        }}
                      >
                        <span className="truncate">{tag.name}</span>
                        {isTagged && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-green-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    )
                  })}

                  {/* Create new tag */}
                  <div className="px-4 py-2 border-t border-dark-lightest mt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 bg-dark-lightest text-white px-2 py-1 rounded"
                        placeholder="New tag name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            void handleCreateItem()
                          }
                        }}
                      />
                      <button
                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        onClick={() => void handleCreateItem()}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Genres Submenu */}
              {activeSubmenu === "genres" && (
                <div className="py-1">
                  {genres.map((genre) => {
                    const isInGenre = trackGenres.some((g) => g.id === genre.id)
                    return (
                      <button
                        key={genre.id}
                        className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-dark-lightest transition-colors"
                        onClick={async () => {
                          try {
                            if (isInGenre) {
                              // Remove track from genre (not implemented in this example)
                              // await removeTrackFromGenre(genre.id, track.id)
                              // setTrackGenres(trackGenres.filter((g) => g.id !== genre.id))
                              alert("Removing tracks from genres is not implemented yet")
                            } else {
                              await addTrackToGenre(genre.id, track.id)
                              setTrackGenres([...trackGenres, genre])
                            }
                          } catch (error) {
                            console.error("Error managing genre:", error)
                            alert("Failed to manage genre. Please try again.")
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: genre.color || "#3b82f6" }}
                          />
                          <span className="truncate">{genre.name}</span>
                        </div>
                        {isInGenre && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-green-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    )
                  })}

                  {/* Create new genre */}
                  <div className="px-4 py-2 border-t border-dark-lightest mt-1">
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        className="w-full bg-dark-lightest text-white px-2 py-1 rounded"
                        placeholder="New genre name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            void handleCreateItem()
                          }
                        }}
                      />

                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2">
                          <label htmlFor="genreColor" className="text-sm text-gray-400">Color:</label>
                          <input
                            id="genreColor"
                            type="color"
                            className="w-8 h-8 rounded cursor-pointer"
                            value={newItemColor}
                            onChange={(e) => setNewItemColor(e.target.value)}
                          />
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: newItemColor }}
                          />
                        </div>

                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          onClick={() => void handleCreateItem()}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Share Submenu */}
              {activeSubmenu === "share" && (
                <div className="py-1">
                  <div className="px-4 py-2">
                    <textarea
                      className="w-full bg-dark-lightest text-white px-2 py-1 rounded"
                      rows={3}
                      value={shareMessage}
                      onChange={(e) => setShareMessage(e.target.value)}
                    />
                    <button
                      className="mt-2 w-full bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      onClick={() => {
                        alert("Shared to social: " + shareMessage)
                        setActiveSubmenu(null)
                      }}
                    >
                      Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
