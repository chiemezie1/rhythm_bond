import Layout from "@/components/layout/Layout";
import RecentlyPlayed from "@/components/music/RecentlyPlayed";

export default function HistoryPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Recently Played</h1>
        
        <div className="mb-8">
          <RecentlyPlayed />
        </div>
      </div>
    </Layout>
  );
}
