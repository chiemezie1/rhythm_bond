import Layout from "@/components/layout/Layout";
import TrendingTracks from "@/components/music/TrendingTracks";
import Link from "next/link";

export default function LikedSongsPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 pt-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Liked Songs</span>
          </nav>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <div className="w-48 h-48 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>

          <div className="flex-1">
            <h6 className="text-sm text-gray-400 uppercase">Playlist</h6>
            <h1 className="text-5xl font-bold mb-2">Liked Songs</h1>
            <p className="text-gray-400">
              <span className="font-medium text-white">John Doe</span> • 42 songs
            </p>
          </div>

          <Link
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 self-start"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <TrendingTracks />
        </div>
      </div>
    </Layout>
  );
}
