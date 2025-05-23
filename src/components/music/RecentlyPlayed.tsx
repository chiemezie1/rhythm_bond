"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useMusic } from "@/contexts/MusicContext"
import type { Track } from "@/services/musicService"
import TrackGridItem from "./TrackGridItem"

// Define a type for our processed track data
interface RecentTrack extends Track {
  playedAt: string
}

export default function RecentlyPlayed() {
  const { getUserRecentlyPlayed, playTrack } = useMusic()
  const [tracks, setTracks] = useState<RecentTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get recently played tracks from the Music Context
  useEffect(() => {
    // Create an async function inside useEffect
    const loadRecentlyPlayed = async () => {
      try {
        // Get user's recently played tracks
        const recentTracks = getUserRecentlyPlayed(6)

        if (!recentTracks || recentTracks.length === 0) {
          setTracks([])
          setIsLoading(false)
          return
        }

        // Generate relative time strings
        const getRelativeTimeString = (timestamp: number): string => {
          const now = Date.now()
          const diff = now - timestamp

          // Convert to minutes, hours, days
          const minutes = Math.floor(diff / (1000 * 60))
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))

          if (minutes < 1) return "Just now"
          if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
          if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
          if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`

          // Format date for older items
          const date = new Date(timestamp)
          return date.toLocaleDateString()
        }

        // Process the tracks to add played at times (without relying on userDataService)
        const processedTracks = recentTracks.map((track, index) => {
          // Just use current time as timestamp for now
          const timestamp = Date.now() - index * 3600000 // Each track is 1 hour older
          return {
            ...track,
            playedAt: getRelativeTimeString(timestamp),
          }
        })

        setTracks(processedTracks)
        setIsLoading(false)
      } catch (err) {
        console.error("Failed to process recent tracks:", err)
        setError("Failed to load recent tracks. Please try again later.")
        setIsLoading(false)
      }
    }

    // Call the async function
    loadRecentlyPlayed()
  }, [getUserRecentlyPlayed])

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recently Played</h2>
        <Link href="/history" className="text-sm text-primary hover:underline">
          See All
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-8 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-6 text-center">
          <p className="text-red-400 mb-3">{error}</p>
          <button
            className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tracks.map((track) => (
            <TrackGridItem
              key={track.id}
              track={track}
              onPlay={playTrack}
              showTimestamp={true}
              timestamp={track.playedAt}
              linkUrl={track.youtubeUrl}
            />
          ))}
        </div>
      )}

      {/* YouTube Attribution */}
      <div className="mt-4 text-right">
        <Link
          href="https://www.youtube.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-400"
        >
          Powered by YouTube
        </Link>
      </div>
    </div>
  )
}
