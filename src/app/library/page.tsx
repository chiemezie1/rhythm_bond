import Layout from "@/components/layout/Layout";
import RecentlyPlayed from "@/components/music/RecentlyPlayed";
import PlaylistsSection from "@/components/music/PlaylistsSection";

export default function LibraryPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Library</h1>
        
        <div className="mb-8">
          <RecentlyPlayed />
        </div>
        
        <div className="mb-8">
          <PlaylistsSection />
        </div>
      </div>
    </Layout>
  );
}
