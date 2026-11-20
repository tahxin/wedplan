"use client";

import Link from "next/link";
import { Sparkles, Heart, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border/60 bg-[#1a1514] text-stone-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(225,29,72,0.18),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(251,191,36,0.12),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-5 md:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-serif text-2xl font-semibold tracking-tight text-white">
                WedPlan
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-stone-400">
              A curated marketplace for venues, artists, and planners who turn wedding visions into effortless, unforgettable celebrations.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a href="#" aria-label="Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-white">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-white">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.889C10.5 0 9 1.5 9 4.667V8z" />
                </svg>
              </a>
              <a href="#" aria-label="X / Twitter" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-white">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">
              Explore Services
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li><Link href="/services?category=Photography%20%26%20Videography" className="transition-colors hover:text-white">Photography & Videography</Link></li>
              <li><Link href="/services?category=Wedding%20Venues" className="transition-colors hover:text-white">Wedding Venues</Link></li>
              <li><Link href="/services?category=Decoration%20%26%20Florist" className="transition-colors hover:text-white">Decoration & Florist</Link></li>
              <li><Link href="/services?category=Catering%20Services" className="transition-colors hover:text-white">Catering Services</Link></li>
              <li><Link href="/services?category=Makeup%20%26%20Styling" className="transition-colors hover:text-white">Makeup & Styling</Link></li>
              <li><Link href="/services?category=Wedding%20Fashion" className="transition-colors hover:text-white">Wedding Fashion</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li><Link href="/services" className="transition-colors hover:text-white">All Wedding Services</Link></li>
              <li><Link href="/sign-up" className="transition-colors hover:text-white">Become a Vendor</Link></li>
              <li><Link href="/sign-in" className="transition-colors hover:text-white">Customer Sign In</Link></li>
              <li><Link href="/services" className="transition-colors hover:text-white">How Booking Works</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>concierge@wedplan.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>+1 (800) 933-PLAN</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>742 Evergreen Terrace, Wedding District, NY</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-stone-500 sm:flex-row">
          <p>© 2026 WedPlan Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-stone-400">
            Crafted with <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> for unforgettable weddings.
          </p>
        </div>
      </div>
    </footer>
  );
}
