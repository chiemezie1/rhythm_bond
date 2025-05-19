"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMusic } from "@/contexts/MusicContext"
import { useAuth } from "@/hooks/useAuth"

// Define navigation items
const mainNavItems = [
  { name: "Home", icon: "home", path: "/" },
  { name: "Library", icon: "library", path: "/library" },
  { name: "Search", icon: "search", path: "/search" }
]

const libraryItems = [
  { name: "Recently Played", icon: "history", path: "/history" },
  { name: "Favorites", icon: "favorite", path: "/favorites" },
  { name: "Your Playlists", icon: "playlist", path: "/playlist" },
  { name: "Most Played", icon: "trending", path: "/most-played" }
]

// Default genre items for non-authenticated users
const defaultGenreItems = [
  { name: "Afrobeats & Global Pop", path: "/genre/afrobeats" },
  { name: "Pop", path: "/genre/pop" },
  { name: "Hip-Hop & Trap", path: "/genre/hiphop" },
  { name: "R&B", path: "/genre/rnb" },
  { name: "Blues", path: "/genre/blues" }
]

const socialItems = [
  { name: "Social Feed", icon: "share", path: "/social" },
  { name: "Profile", icon: "profile", path: "/profile" }
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const { getGenres } = useMusic()
  const [userGenres, setUserGenres] = useState(defaultGenreItems)
  const [expandedSections, setExpandedSections] = useState({
    library: true,
    genres: false,
    social: false,
  })

  // Load user genres
  useEffect(() => {
    const loadUserGenres = async () => {
      if (isAuthenticated) {
        try {
          const genres = await getGenres()
          if (genres && genres.length > 0) {
            // Format genres for sidebar
            const formattedGenres = genres.map((genre: any) => ({
              id: genre.id,
              name: genre.name,
              path: `/genre/${genre.id}`
            }))
            setUserGenres(formattedGenres)
          }
        } catch (error) {
          console.error('Error loading user genres:', error)
          setUserGenres(defaultGenreItems)
        }
      } else {
        setUserGenres(defaultGenreItems)
      }
    }

    loadUserGenres()
  }, [isAuthenticated, getGenres])

  // Set expanded sections based on current path
  useEffect(() => {
    // Check library items
    const libraryMatch = libraryItems.find((item) => pathname === item.path || pathname.startsWith(item.path + "/"))

    if (libraryMatch) {
      setExpandedSections((prev) => ({ ...prev, library: true }))
      return
    }

    // Check genre items
    const genreMatch = userGenres.find((item) => pathname === item.path || pathname.startsWith(item.path + "/"))

    if (genreMatch) {
      setExpandedSections((prev) => ({ ...prev, genres: true }))
      return
    }

    // Check social items
    const socialMatch = socialItems.find((item) => pathname === item.path || pathname.startsWith(item.path + "/"))

    if (socialMatch || pathname === '/social' || pathname.startsWith('/social/') || pathname.startsWith('/user/')) {
      setExpandedSections((prev) => ({ ...prev, social: true }))
      return
    }
  }, [pathname])

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections],
    })
  }

  // Icon component to render different icons based on name
  const Icon = ({ name }: { name: string }) => {
    switch (name) {
      case "home":
        return (
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        )
      case "explore":
        return (
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
              d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
            />
          </svg>
        )
      case "search":
        return (
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )
      case "library":
        return (
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
              d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
            />
          </svg>
        )
      case "history":
        return (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case "favorite":
        return (
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
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )
      case "playlist":
        return (
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
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        )
      case "album":
        return (
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )
      case "artist":
        return (
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )

      case "tag":
        return (
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        )
      case "trending":
        return (
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
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        )
      case "profile":
        return (
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )
      case "following":
        return (
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )
      case "followers":
        return (
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
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        )
      case "share":
        return (
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
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        )
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )
    }
  }

  // Check if a path is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  return (
    <div className="h-screen bg-dark-lighter dark:bg-dark-lighter overflow-y-auto flex flex-col p-4">
      {/* Main Navigation */}
      <div className="px-3 mb-4">
        {mainNavItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
              isActive(item.path) ? "bg-primary text-white" : "text-gray-300 hover:bg-dark-lightest"
            }`}
          >
            <Icon name={item.icon} />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>

      {/* Library Section */}
      <div className="px-3 mb-4">
        <button
          className="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white"
          onClick={() => toggleSection("library")}
        >
          <span className="font-semibold">YOUR LIBRARY</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${expandedSections.library ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.library && (
          <div className="mt-1 ml-2">
            {libraryItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.path) ? "bg-dark-lightest text-white" : "text-gray-300 hover:bg-dark-lightest"
                }`}
              >
                <Icon name={item.icon} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Social Section */}
      <div className="px-3 mb-4">
        <button
          className="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white"
          onClick={() => toggleSection("social")}
        >
          <span className="font-semibold">SOCIAL</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${expandedSections.social ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.social && (
          <div className="mt-1 ml-2">
            {socialItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.path) ? "bg-dark-lightest text-white" : "text-gray-300 hover:bg-dark-lightest"
                }`}
              >
                <Icon name={item.icon} />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Genres Section */}
      <div className="px-3 mb-4">
        <button
          className="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white"
          onClick={() => toggleSection("genres")}
        >
          <span className="font-semibold">GENRES</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${expandedSections.genres ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.genres && (
          <div className="mt-1 ml-2 flex flex-col gap-1">
            {userGenres.map((item) => (
              <Link
                key={item.id || item.name}
                href={item.path}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isActive(item.path) ? "bg-dark-lightest text-white" : "text-gray-300 hover:bg-dark-lightest"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {isAuthenticated && (
              <Link
                href="/categories"
                className="px-3 py-1.5 rounded-lg text-xs text-primary hover:bg-dark-lightest transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Manage Genres
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Create Playlist Button */}
      <div className="mt-auto px-6 flex flex-col gap-4">
        <Link
          href="/playlist/create"
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Playlist
        </Link>

        {/* Enjoy Music Message */}
        <div className="text-center py-4 text-gray-400">
          <div className="flex justify-center mb-2">
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
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <p className="text-sm font-medium">Enjoy the Music</p>
          <p className="text-xs mt-1">Discover your rhythm</p>
        </div>
      </div>
    </div>
  )
}
