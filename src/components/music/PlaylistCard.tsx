"use client"

import type React from "react"

import { useRef } from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Trash2, Share2 } from "lucide-react"
import type { UserPlaylist } from "@/services/userDataService"

interface PlaylistCardProps {
  playlist: UserPlaylist
  index: number
  onPlay?: (playlist: UserPlaylist) => void
  onDelete?: (playlist: UserPlaylist) => void
  onMenuOpen?: (playlist: UserPlaylist, position: { x: number; y: number }) => void
}

export default function PlaylistCard({ playlist, index, onPlay, onDelete, onMenuOpen }: PlaylistCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Get a default cover image for empty playlists
  const getDefaultCoverImage = () => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-purple-600",
      "bg-gradient-to-br from-green-500 to-teal-600",
      "bg-gradient-to-br from-orange-500 to-red-600",
      "bg-gradient-to-br from-purple-500 to-pink-600",
      "bg-gradient-to-br from-yellow-500 to-amber-600",
    ]

    return (
      <div className={`w-full h-full flex items-center justify-center ${colors[index % colors.length]}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>
    )
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onPlay && playlist.tracks.length > 0) {
      onPlay(playlist)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(playlist)
    }
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!menuButtonRef.current || !onMenuOpen) return

    // Calculate position for the menu
    const rect = menuButtonRef.current.getBoundingClientRect()
    onMenuOpen(playlist, {
      x: rect.right,
      y: rect.top,
    })
  }

  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="bg-dark-lighter rounded-lg p-3 hover:bg-dark-lightest transition-colors block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square rounded-md overflow-hidden mb-3">
        {playlist.tracks.length > 0 && playlist.tracks[0].thumbnail ? (
          <Image
            src={playlist.tracks[0].thumbnail || "/placeholder.svg"}
            alt={playlist.name}
            fill
            className="object-cover"
          />
        ) : (
          getDefaultCoverImage()
        )}
        <div
          className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex gap-2">
            <button
              className="bg-primary rounded-full p-2 transform hover:scale-110 transition-transform"
              onClick={handlePlay}
              disabled={playlist.tracks.length === 0}
              aria-label="Play playlist"
            >
              <Play className="h-6 w-6 text-white" />
            </button>
            {onDelete && (
              <button
                className="bg-red-500 rounded-full p-2 transform hover:scale-110 transition-transform"
                onClick={handleDelete}
                aria-label="Delete playlist"
              >
                <Trash2 className="h-6 w-6 text-white" />
              </button>
            )}
            {onMenuOpen && (
              <button
                ref={menuButtonRef}
                className="bg-gray-700 rounded-full p-2 transform hover:scale-110 transition-transform"
                onClick={handleMenuClick}
                aria-label="Share playlist"
              >
                <Share2 className="h-6 w-6 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
      <h3 className="font-medium truncate">{playlist.name}</h3>
      <p className="text-sm text-gray-400">{playlist.tracks.length} tracks</p>
    </Link>
  )
}
