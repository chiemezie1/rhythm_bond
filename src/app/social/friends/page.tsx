'use client';

import Layout from "@/components/layout/Layout";
import SocialTabs from "@/components/music/SocialTabs";
import Image from "next/image";

// Mock data for friends
const friends = [
  { id: 1, name: 'Sarah Johnson', username: '@sarahj', avatar: '/images/man_with_headse.png', mutualFriends: 12, isOnline: true },
  { id: 2, name: 'Mike Chen', username: '@mikechen', avatar: '/images/logo.png', mutualFriends: 8, isOnline: false },
  { id: 3, name: 'Emma Wilson', username: '@emmaw', avatar: '/images/two_people_enjoying_music.png', mutualFriends: 5, isOnline: true },
  { id: 4, name: 'Alex Thompson', username: '@alext', avatar: '/images/logo_bg_white.png', mutualFriends: 3, isOnline: false },
  { id: 5, name: 'Jessica Lee', username: '@jesslee', avatar: '/images/man_with_headse.png', mutualFriends: 7, isOnline: true },
  { id: 6, name: 'David Kim', username: '@davidk', avatar: '/images/logo.png', mutualFriends: 4, isOnline: false },
  { id: 7, name: 'Olivia Martinez', username: '@oliviam', avatar: '/images/two_people_enjoying_music.png', mutualFriends: 9, isOnline: true },
  { id: 8, name: 'James Wilson', username: '@jamesw', avatar: '/images/logo_bg_white.png', mutualFriends: 2, isOnline: false },
];

export default function FriendsPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Social</h1>

        <SocialTabs />

        <div className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Your Friends</h2>
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search friends..."
                  className="bg-dark-lighter rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="absolute left-3 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-full text-sm transition-colors">
                Add Friends
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FriendCard({ friend }: { friend: any }) {
  return (
    <div className="bg-dark-lighter rounded-xl p-4 flex flex-col items-center">
      <div className="relative mb-3">
        <div className="w-20 h-20 rounded-full overflow-hidden">
          <Image
            src={friend.avatar}
            alt={friend.name}
            width={80}
            height={80}
            className="object-cover"
          />
        </div>
        {friend.isOnline && (
          <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-dark-lighter"></div>
        )}
      </div>
      <h3 className="font-medium text-center">{friend.name}</h3>
      <p className="text-sm text-gray-400 mb-3">{friend.username}</p>
      <p className="text-xs text-gray-500 mb-4">{friend.mutualFriends} mutual friends</p>
      <div className="flex gap-2 w-full">
        <button className="flex-1 bg-dark-lightest hover:bg-dark text-gray-300 font-medium py-1.5 rounded-lg text-sm transition-colors">
          Message
        </button>
        <button className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-1.5 rounded-lg text-sm transition-colors">
          View Profile
        </button>
      </div>
    </div>
  );
}
