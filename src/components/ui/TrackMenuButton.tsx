"use client"

import React, { useRef } from "react"
import { MoreHorizontal } from "lucide-react"
import type { Track } from "@/services/musicService"
import { useTrackMenu } from "@/contexts/TrackMenuContext"

interface TrackMenuButtonProps {
  track: Track
  onRemove?: () => void
  className?: string
  position?: "absolute" | "relative" | "static"
  top?: string
  right?: string
  left?: string
  iconSize?: number
  iconColor?: string
  menuPosition?: "left" | "right" | "auto"
  showBackground?: boolean
}

/**
 * A reusable button component that opens a track menu
 *
 * @example
 * // Basic usage
 * <TrackMenuButton track={track} />
 *
 * @example
 * // Positioned absolutely in a container
 * <TrackMenuButton
 *   track={track}
 *   position="absolute"
 *   top="2"
 *   right="2"
 * />
 *
 * @example
 * // Custom styling
 * <TrackMenuButton
 *   track={track}
 *   className="text-white"
 *   iconSize={20}
 *   showBackground={false}
 * />
 */
export default function TrackMenuButton({
  track,
  onRemove,
  className = "",
  position = "relative",
  top = "3",
  right = "3",
  left,
  iconSize = 16,
  iconColor = "text-gray-400",
  menuPosition = "auto",
  showBackground = true,
}: TrackMenuButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Get the track menu context
  let trackMenuContext = useTrackMenu()

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!buttonRef.current) return

    // Open the menu with a reference to the button element and preferred position
    trackMenuContext.openMenu(track, {
      buttonElement: buttonRef.current,
      preferredPosition: menuPosition,
      onRemove
    })
  }

  // Generate position classes based on props
  let positionClasses = ""
  if (position === "absolute") {
    positionClasses = `absolute ${top ? `top-${top}` : ''} ${right ? `right-${right}` : ''} ${left ? `left-${left}` : ''}`
  } else if (position === "relative") {
    positionClasses = "relative"
  }

  // Generate background classes
  const bgClasses = showBackground
    ? "bg-dark-lighter hover:bg-dark-lightest"
    : "hover:bg-dark-lighter/50"

  return (
    <button
      ref={buttonRef}
      className={`p-1 rounded-full ${bgClasses} z-20 ${positionClasses} ${className}`}
      onClick={handleMenuClick}
      aria-label="Track options"
      style={{ position: position }}
    >
      <MoreHorizontal size={iconSize} className={iconColor} />
    </button>
  )
}
