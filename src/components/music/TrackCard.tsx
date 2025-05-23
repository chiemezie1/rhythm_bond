"use client"

import { useState } from "react"
import Image from "next/image"
import type { Track } from "@/services/musicService"
import { Play, Music } from "lucide-react"
import TrackMenuButton from "@/components/ui/TrackMenuButton"

interface TrackCardProps {
  track: Track
  index?: number
  showIndex?: boolean
  showArtist?: boolean
  showListeners?: boolean
  showDuration?: boolean
  onPlay?: (track: Track) => void
  onRemove?: () => void
  compact?: boolean
}

export default function TrackCard({
  track,
  index = 0,
  showIndex = true,
  showArtist = true,
  showListeners = false,
  showDuration = true,
  onPlay,
  onRemove,
  compact = false,
}: TrackCardProps) {
  const [hoveredTrack, setHoveredTrack] = useState(false)

  // Handle play track
  const handlePlayTrack = () => {
    if (onPlay) {
      onPlay(track)
    }
  }

  return (
    <div
      className={`relative border-b border-dark-lightest hover:bg-dark-lightest transition-colors ${
        hoveredTrack ? "bg-dark-lightest" : ""
      } ${compact ? "p-2" : "py-3 px-4"}`}
      onMouseEnter={() => setHoveredTrack(true)}
      onMouseLeave={() => setHoveredTrack(false)}
    >
      <div className="flex items-center gap-3">
        {/* Play/Index Column */}
        {showIndex && (
          <div className="flex-shrink-0 w-8 text-center text-gray-400">
            {hoveredTrack ? (
              <button className="text-white" onClick={handlePlayTrack} aria-label="Play track">
                <Play size={18} />
              </button>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
        )}

        {/* Track Info */}
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0 bg-dark-lightest">
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
                    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
                    parent.appendChild(icon);
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Music size={20} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-white hover:underline truncate">{track.title}</div>
            {showArtist && <div className="text-sm text-gray-400 truncate">{track.artist}</div>}
          </div>
        </div>

        {/* Artist Column (on larger screens) */}
        {showArtist && (
          <div className="hidden md:block text-gray-400 flex-shrink-0 min-w-[120px] max-w-[200px]">
            <span className="hover:underline truncate">{track.artist}</span>
          </div>
        )}

        {/* Listeners Column (optional) */}
        {showListeners && (
          <div className="hidden sm:block text-gray-400 text-right flex-shrink-0 w-20">
            <span>{Math.floor(Math.random() * 100) + 1}K</span>
          </div>
        )}

        {/* Duration & Menu */}
        <div className="text-gray-400 text-right flex items-center gap-3 flex-shrink-0">
          {/* Menu button - always visible but more prominent on hover */}
          <TrackMenuButton
            track={track}
            onRemove={onRemove}
            className={hoveredTrack ? "" : "opacity-60"}
            menuPosition="left"
            showBackground={false}
            iconSize={18}
          />

          {showDuration && <span>{track.duration || "3:45"}</span>}
        </div>
      </div>
    </div>
  )
}
