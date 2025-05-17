/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'img.youtube.com',            // YouTube thumbnails
      'i.ytimg.com',                // YouTube alternative CDN
    ],
  },
}

module.exports = nextConfig
