"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Facebook, Instagram, Twitter, Youtube, Globe } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Thank you for subscribing with ${email}!`)
    setEmail("")
  }

  return (
    <footer className="bg-dark-lighter border-t border-dark-lightest py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Top Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Logo + Newsletter */}
            <div className="md:w-1/3 lg:w-2/5">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <Image
                  src="/images/logo.png"
                  alt="RhythmBond Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="font-bold text-2xl text-white">RhythmBond</span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-md">
                Discover, share, and enjoy music with friends on RhythmBond — the social music platform that connects
                people through the universal language of music.
              </p>

              <div>
                <h3 className="text-white font-medium mb-4">Subscribe to our newsletter</h3>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="bg-dark-lightest text-sm text-white px-4 py-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                  >
                    <span>Subscribe</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col sm:flex-row gap-8 w-full md:w-2/3 lg:w-3/5">
            {[
                {
                  title: "Company",
                  links: [
                    ["About", "/about"],
                    ["Careers", "/jobs"],
                    ["Blog", "/blog"],
                    ["Press", "/press"],
                    ["Contact", "/contact"],
                  ],
                },
                {
                  title: "Communities",
                  links: [
                    ["For Artists", "/artists"],
                    ["Developers", "/developers"],
                    ["Advertising", "/advertising"],
                    ["Investors", "/investors"],
                    ["Partners", "/partners"],
                  ],
                },
                {
                  title: "Legal",
                  links: [
                    ["Terms & Conditions", "/terms"],
                    ["Privacy Policy", "/privacy"],
                    ["Cookie Policy", "/cookies"],
                    ["Copyright", "/copyright"],
                    ["Accessibility", "/accessibility"],
                  ],
                },
              ].map((section) => (
                <div key={section.title}>
                  <h3 className="text-white font-bold mb-4 text-lg">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map(([label, href]) => (
                      <li key={href}>
                        <Link href={href} className="text-gray-400 hover:text-white transition-colors">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dark-lightest my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Socials */}
          <div className="flex items-center gap-6">
            {[
              ["https://twitter.com", Twitter, "Twitter"],
              ["https://facebook.com", Facebook, "Facebook"],
              ["https://instagram.com", Instagram, "Instagram"],
              ["https://youtube.com", Youtube, "YouTube"],
            ].map(([url, Icon, label]) => (
              <Link
                key={label as string}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label as string}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Icon size={20} />
              </Link>
            ))}
          </div>

          {/* Language and Premium */}
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
              <Globe size={16} />
              <span>English (US)</span>
            </button>
            <Link
              href="/premium"
              className="text-primary hover:text-primary-dark font-medium transition-colors"
            >
              Premium
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center md:text-left">
          <p className="text-sm text-gray-500">© {currentYear} RhythmBond. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
