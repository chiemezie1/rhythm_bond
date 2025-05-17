import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./output.css";
import AuthProvider from "@/providers/AuthProvider";
import { MusicProvider } from "@/contexts/MusicContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RhythmBond - Your Music, Your Vibe",
  description: "Discover, share, and enjoy music with friends on RhythmBond - the social music platform",
  keywords: "music, playlists, social, streaming, recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-light dark:bg-dark text-dark dark:text-light`}>
        <AuthProvider>
          <MusicProvider>
            {children}
          </MusicProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
