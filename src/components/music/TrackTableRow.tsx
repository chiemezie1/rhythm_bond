"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Heart } from "lucide-react"
import type { Track } from "@/services/musicService"
import TrackMenuButton from "@/components/ui/TrackMenuButton"

interface TrackTableRowProps {
  track: Track
  index: number
  onPlay?: (track: Track) => void
  onToggleFavorite?: (track: Track) => void
  isFavorite?: boolean
  onRemove?: () => void
}

export default function TrackTableRow({
  track,
  index,
  onPlay,
  onToggleFavorite,
  isFavorite = false,
  onRemove,
}: TrackTableRowProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handlePlay = () => {
    if (onPlay) {
      onPlay(track)
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleFavorite) {
      onToggleFavorite(track)
    }
  }

  return (
    <tr
      className="border-b border-dark-lightest hover:bg-dark-lightest/50 cursor-pointer"
      onClick={handlePlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td className="py-3 px-4 text-gray-400">{index + 1}</td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          <div className="w-10 h-10 relative mr-3 flex-shrink-0">
            <Image src={track.thumbnail || "/placeholder.svg"} alt={track.title} fill className="object-cover" />
          </div>
          <div>
            <div className="font-medium">{track.title}</div>
            <div className="text-sm text-gray-400 md:hidden">{track.artist}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-gray-400 hidden md:table-cell">{track.artist}</td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {onToggleFavorite && (
            <button
              className={`p-1 rounded-full ${isFavorite ? "text-red-500" : "text-gray-400"} hover:text-red-400`}
              onClick={handleToggleFavorite}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          )}

          <TrackMenuButton
            track={track}
            onRemove={onRemove}
            menuPosition="left"
            showBackground={false}
            iconSize={18}
            className="text-gray-400 hover:text-white"
          />
        </div>
      </td>
    </tr>
  )
}
