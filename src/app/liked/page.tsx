import Layout from "@/components/layout/Layout";
import TrendingTracks from "@/components/music/TrendingTracks";

export default function LikedSongsPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-48 h-48 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>

          <div>
            <h6 className="text-sm text-gray-400 uppercase">Playlist</h6>
            <h1 className="text-5xl font-bold mb-2">Liked Songs</h1>
            <p className="text-gray-400">
              <span className="font-medium text-white">John Doe</span> • 42 songs
            </p>
          </div>
        </div>

        <div className="mb-8">
          <TrendingTracks />
        </div>
      </div>
    </Layout>
  );
}
