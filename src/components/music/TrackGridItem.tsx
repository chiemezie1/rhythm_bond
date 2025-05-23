"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Music } from "lucide-react"
import type { Track } from "@/services/musicService"
import TrackMenuButton from "@/components/ui/TrackMenuButton"

interface TrackGridItemProps {
  track: Track
  onPlay?: (track: Track) => void
  showArtist?: boolean
  showTimestamp?: boolean
  timestamp?: string
  linkUrl?: string
}

export default function TrackGridItem({
  track,
  onPlay,
  showArtist = true,
  showTimestamp = false,
  timestamp,
  linkUrl,
}: TrackGridItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onPlay) {
      onPlay(track)
    }
  }

  const content = (
    <div
      className="relative bg-dark-lighter rounded-lg p-3 hover:bg-dark-lightest transition-colors cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-dark-lightest">
        {track.thumbnail ? (
          <Image
            src={track.thumbnail.replace('mqdefault.jpg', 'hqdefault.jpg')}
            alt={track.title}
            fill
            className="object-cover"
            unoptimized
            onError={(e) => {
              // Replace with music icon on error
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const icon = document.createElement('div');
                icon.className = 'flex items-center justify-center w-full h-full';
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
                parent.appendChild(icon);
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Music size={40} className="text-gray-400" />
          </div>
        )}

        {/* Play button overlay */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            className="bg-primary rounded-full p-2 transform hover:scale-110 transition-transform"
            onClick={handlePlay}
            aria-label="Play track"
          >
            <Play className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Menu button - always visible */}
        <TrackMenuButton
          track={track}
          position="absolute"
          top="2"
          right="2"
          iconSize={18}
          menuPosition="left"
          showBackground={true}
        />
      </div>

      <h3 className="font-medium text-sm truncate">{track.title}</h3>
      {showArtist && <p className="text-xs text-gray-400 truncate">{track.artist}</p>}
      {showTimestamp && timestamp && <p className="text-xs text-gray-500 mt-1">{timestamp}</p>}
    </div>
  )

  if (linkUrl) {
    return <Link href={linkUrl}>{content}</Link>
  }

  return content
}
