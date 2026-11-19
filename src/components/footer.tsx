import Link from "next/link";
import { Sparkles, Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & mission */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Wed<span className="text-rose-400 font-sans font-medium">Plan</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Your premier destination for planning the perfect celebration. Discover venues, stylists, and artisans dedicated to bringing your dream wedding to life.
            </p>
            <div className="flex items-center gap-3 pt-2 text-neutral-400">
              <a href="#" className="p-2 rounded-full bg-neutral-800 hover:text-rose-400 hover:bg-neutral-700 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-neutral-800 hover:text-rose-400 hover:bg-neutral-700 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-neutral-800 hover:text-rose-400 hover:bg-neutral-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Explore Services
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/services?category=Photography%20%26%20Videography" className="hover:text-rose-400 transition-colors">
                  Photography & Videography
                </Link>
              </li>
              <li>
                <Link href="/services?category=Wedding%20Venues" className="hover:text-rose-400 transition-colors">
                  Wedding Venues
                </Link>
              </li>
              <li>
                <Link href="/services?category=Decoration%20%26%20Florist" className="hover:text-rose-400 transition-colors">
                  Decoration & Florist
                </Link>
              </li>
              <li>
                <Link href="/services?category=Catering%20Services" className="hover:text-rose-400 transition-colors">
                  Catering Services
                </Link>
              </li>
              <li>
                <Link href="/services?category=Makeup%20%26%20Styling" className="hover:text-rose-400 transition-colors">
                  Makeup & Styling
                </Link>
              </li>
              <li>
                <Link href="/services?category=Wedding%20Fashion" className="hover:text-rose-400 transition-colors">
                  Wedding Fashion
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/services" className="hover:text-rose-400 transition-colors">
                  All Wedding Services
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-rose-400 transition-colors">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-rose-400 transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-rose-400 transition-colors">
                  How Booking Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <span>concierge@wedplan.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>+1 (800) 933-PLAN</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>742 Evergreen Terrace, Wedding District, NY</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} WedPlan Inc. All rights reserved.</p>
          <p className="flex items-center gap-1 text-neutral-400">
            Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for unforgettable weddings.
          </p>
        </div>
      </div>
    </footer>
  );
}
