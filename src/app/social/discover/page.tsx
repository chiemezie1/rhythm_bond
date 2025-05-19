'use client';

import Layout from "@/components/layout/Layout";
import SocialTabs from "@/components/social/SocialTabs";
import Image from "next/image";

// Mock data for discover page
const trendingArtists = [
  { id: 1, name: 'Taylor Swift', genre: 'Pop', followers: '85.2M', avatar: '/images/man_with_headse.png' },
  { id: 2, name: 'The Weeknd', genre: 'R&B', followers: '52.7M', avatar: '/images/logo.png' },
  { id: 3, name: 'Bad Bunny', genre: 'Reggaeton', followers: '48.3M', avatar: '/images/two_people_enjoying_music.png' },
  { id: 4, name: 'Billie Eilish', genre: 'Alternative', followers: '42.1M', avatar: '/images/logo_bg_white.png' },
];

const popularCommunities = [
  { id: 1, name: 'Indie Music Lovers', members: '245K', avatar: '/images/logo.png' },
  { id: 2, name: 'Hip Hop Heads', members: '189K', avatar: '/images/man_with_headse.png' },
  { id: 3, name: 'Electronic Music', members: '156K', avatar: '/images/two_people_enjoying_music.png' },
  { id: 4, name: 'Rock Classics', members: '132K', avatar: '/images/logo_bg_white.png' },
];

const upcomingEvents = [
  {
    id: 1,
    name: 'Summer Music Festival',
    date: 'July 15-17, 2023',
    location: 'Los Angeles, CA',
    image: '/images/two_people_enjoying_music.png',
    attendees: '12.5K'
  },
  {
    id: 2,
    name: 'Electronic Dance Weekend',
    date: 'August 5-7, 2023',
    location: 'Miami, FL',
    image: '/images/man_with_headse.png',
    attendees: '8.2K'
  },
  {
    id: 3,
    name: 'Indie Rock Showcase',
    date: 'September 10, 2023',
    location: 'Austin, TX',
    image: '/images/logo_bg_white.png',
    attendees: '5.7K'
  },
];

export default function DiscoverPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Social</h1>

        <SocialTabs />

        <div className="mt-6 space-y-8">
          {/* Trending Artists */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Trending Artists</h2>
              <button className="text-primary hover:underline text-sm">See All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trendingArtists.map((artist) => (
                <div key={artist.id} className="bg-dark-lighter rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={artist.avatar}
                      alt={artist.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{artist.name}</h3>
                    <p className="text-xs text-gray-400">{artist.genre} • {artist.followers} followers</p>
                  </div>
                  <button className="ml-auto bg-dark-lightest hover:bg-dark text-white p-2 rounded-full flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Communities */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Popular Communities</h2>
              <button className="text-primary hover:underline text-sm">See All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {popularCommunities.map((community) => (
                <div key={community.id} className="bg-dark-lighter rounded-xl p-4 text-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
                    <Image
                      src={community.avatar}
                      alt={community.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-medium mb-1">{community.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{community.members} members</p>
                  <button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-1.5 rounded-lg text-sm transition-colors">
                    Join
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Events */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upcoming Events</h2>
              <button className="text-primary hover:underline text-sm">See All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-dark-lighter rounded-xl overflow-hidden">
                  <div className="relative h-40">
                    <Image
                      src={event.image}
                      alt={event.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-medium text-lg">{event.name}</h3>
                      <p className="text-xs text-gray-300">{event.date}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs text-gray-400">{event.location}</span>
                      </div>
                      <div className="text-xs text-gray-400">{event.attendees} attending</div>
                    </div>
                    <button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-1.5 rounded-lg text-sm transition-colors">
                      Interested
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
