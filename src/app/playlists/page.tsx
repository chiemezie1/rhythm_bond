import Layout from "@/components/layout/Layout";
import UserPlaylists from "@/components/music/UserPlaylists";
import Link from "next/link";

export default function PlaylistsPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Playlists</h1>
          <Link
            href="/playlist/create"
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Playlist
          </Link>
        </div>

        <div className="mb-8">
          <UserPlaylists />
        </div>
      </div>
    </Layout>
  );
}
