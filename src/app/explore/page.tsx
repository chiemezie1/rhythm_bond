import Layout from "@/components/layout/Layout";
import MusicCategories from "@/components/music/MusicCategories";
import TrendingTracks from "@/components/music/TrendingTracks";

export default function ExplorePage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Explore</h1>
        
        <div className="mb-8">
          <MusicCategories />
        </div>
        
        <div className="mb-8">
          <TrendingTracks />
        </div>
      </div>
    </Layout>
  );
}
