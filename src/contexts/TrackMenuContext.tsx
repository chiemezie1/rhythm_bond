"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import type { Track } from "@/services/musicService"
import TrackMenu from "@/components/ui/TrackMenu"

// Menu opening options
interface MenuOptions {
  buttonElement: HTMLElement
  preferredPosition?: "left" | "right" | "auto"
  onRemove?: () => void
}

// Context type definition
interface TrackMenuContextType {
  openMenu: (track: Track, options: MenuOptions) => void
  closeMenu: () => void
  isMenuOpen: boolean
  currentTrack: Track | null
}

// Create the context with a default value
const TrackMenuContext = createContext<TrackMenuContextType | null>(null)

// Provider component
export function TrackMenuProvider({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [menuOptions, setMenuOptions] = useState<MenuOptions | null>(null)
  const [removeCallback, setRemoveCallback] = useState<(() => void) | undefined>(undefined)

  // Open menu function
  const openMenu = useCallback((track: Track, options: MenuOptions) => {
    // Use setTimeout to avoid React state update during render warnings
    setTimeout(() => {
      setCurrentTrack(track)
      setMenuOptions(options)
      setRemoveCallback(options.onRemove)
      setIsMenuOpen(true)
    }, 0)
  }, [])

  // Close menu function
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    
    // Use setTimeout to avoid React state update during render warnings
    setTimeout(() => {
      setCurrentTrack(null)
      setMenuOptions(null)
      setRemoveCallback(undefined)
    }, 100) // Small delay to allow for exit animations
  }, [])

  // Context value
  const contextValue = {
    openMenu,
    closeMenu,
    isMenuOpen,
    currentTrack
  }

  return (
    <TrackMenuContext.Provider value={contextValue}>
      {children}
      
      {/* Render the menu if it's open */}
      {isMenuOpen && currentTrack && menuOptions && (
        <TrackMenu
          track={currentTrack}
          buttonElement={menuOptions.buttonElement}
          preferredPosition={menuOptions.preferredPosition || "auto"}
          onClose={closeMenu}
          onRemove={removeCallback}
        />
      )}
    </TrackMenuContext.Provider>
  )
}

// Custom hook to use the context
export function useTrackMenu() {
  const context = useContext(TrackMenuContext)
  
  if (!context) {
    throw new Error("useTrackMenu must be used within a TrackMenuProvider")
  }
  
  return context
}
