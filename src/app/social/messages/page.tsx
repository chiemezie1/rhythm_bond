'use client';

import Layout from "@/components/layout/Layout";
import SocialTabs from "@/components/music/SocialTabs";
import Image from "next/image";
import { useState } from "react";

// Mock data for messages
const conversations = [
  {
    id: 1,
    user: {
      name: 'Sarah Johnson',
      avatar: '/images/man_with_headse.png',
      isOnline: true
    },
    lastMessage: {
      text: 'Have you listened to the new album?',
      time: '2:45 PM',
      isRead: true,
      isFromMe: false
    }
  },
  {
    id: 2,
    user: {
      name: 'Mike Chen',
      avatar: '/images/logo.png',
      isOnline: false
    },
    lastMessage: {
      text: 'Thanks for sharing that playlist!',
      time: 'Yesterday',
      isRead: true,
      isFromMe: true
    }
  },
  {
    id: 3,
    user: {
      name: 'Emma Wilson',
      avatar: '/images/two_people_enjoying_music.png',
      isOnline: true
    },
    lastMessage: {
      text: 'Are you going to the concert next week?',
      time: 'Yesterday',
      isRead: false,
      isFromMe: false
    }
  },
  {
    id: 4,
    user: {
      name: 'Alex Thompson',
      avatar: '/images/logo_bg_white.png',
      isOnline: false
    },
    lastMessage: {
      text: 'I just released a new track, check it out!',
      time: 'Monday',
      isRead: true,
      isFromMe: false
    }
  },
];

export default function MessagesPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Social</h1>

        <SocialTabs />

        <div className="mt-6">
          <div className="bg-dark-lighter rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Conversations List */}
              <div className="border-r border-dark-lightest">
                <div className="p-4 border-b border-dark-lightest">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      className="w-full bg-dark rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="absolute left-3 top-2.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[600px]">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-dark-lightest hover:bg-dark-lightest cursor-pointer ${
                        conversation.id === 1 ? 'bg-dark-lightest' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <Image
                              src={conversation.user.avatar}
                              alt={conversation.user.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          </div>
                          {conversation.user.isOnline && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-dark-lighter"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">{conversation.user.name}</h3>
                            <span className="text-xs text-gray-400">{conversation.lastMessage.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {conversation.lastMessage.isFromMe && (
                              <span className="text-xs text-gray-400">You: </span>
                            )}
                            <p className={`text-sm truncate ${
                              !conversation.lastMessage.isRead && !conversation.lastMessage.isFromMe
                                ? 'font-medium text-white'
                                : 'text-gray-400'
                            }`}>
                              {conversation.lastMessage.text}
                            </p>
                            {!conversation.lastMessage.isRead && !conversation.lastMessage.isFromMe && (
                              <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="col-span-2 flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-dark-lightest flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src="/images/man_with_headse.png"
                          alt="Sarah Johnson"
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-dark-lighter"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">Sarah Johnson</h3>
                      <p className="text-xs text-green-500">Online</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-dark text-gray-400 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-full hover:bg-dark text-gray-400 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-full hover:bg-dark text-gray-400 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Date Separator */}
                    <div className="flex items-center justify-center">
                      <div className="bg-dark-lightest text-gray-400 text-xs px-3 py-1 rounded-full">
                        Today
                      </div>
                    </div>

                    {/* Received Message */}
                    <div className="flex items-end gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src="/images/man_with_headse.png"
                          alt="Sarah Johnson"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="bg-dark-lightest rounded-lg rounded-bl-none p-3 max-w-[80%]">
                        <p className="text-sm">Hey! Have you listened to the new album by Arctic Monkeys?</p>
                        <span className="text-xs text-gray-400 mt-1 block">2:30 PM</span>
                      </div>
                    </div>

                    {/* Sent Message */}
                    <div className="flex items-end justify-end gap-2">
                      <div className="bg-primary rounded-lg rounded-br-none p-3 max-w-[80%]">
                        <p className="text-sm">Not yet! Is it good?</p>
                        <span className="text-xs text-white/70 mt-1 block">2:32 PM</span>
                      </div>
                    </div>

                    {/* Received Message */}
                    <div className="flex items-end gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src="/images/man_with_headse.png"
                          alt="Sarah Johnson"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="bg-dark-lightest rounded-lg rounded-bl-none p-3 max-w-[80%]">
                        <p className="text-sm">It's amazing! I think you'll love it. Let me share a track with you.</p>
                        <span className="text-xs text-gray-400 mt-1 block">2:40 PM</span>
                      </div>
                    </div>

                    {/* Received Message with Media */}
                    <div className="flex items-end gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src="/images/man_with_headse.png"
                          alt="Sarah Johnson"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="bg-dark-lightest rounded-lg rounded-bl-none p-3 max-w-[80%]">
                        <div className="bg-dark rounded-lg p-2 flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src="/images/logo.png"
                              alt="Track Cover"
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">There'd Better Be A Mirrorball</p>
                            <p className="text-xs text-gray-400 truncate">Arctic Monkeys</p>
                          </div>
                          <button className="bg-primary rounded-full p-1.5 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm">Have you listened to the new album?</p>
                        <span className="text-xs text-gray-400 mt-1 block">2:45 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-dark-lightest">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-dark-lightest text-gray-400 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-full hover:bg-dark-lightest text-gray-400 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full bg-dark rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button className="p-2 rounded-full bg-primary hover:bg-primary-dark text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
