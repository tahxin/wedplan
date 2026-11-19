"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Camera,
  Building2,
  Flower2,
  UtensilsCrossed,
  Palette,
  Shirt,
  ShieldCheck,
  Star,
  CalendarCheck,
  ArrowRight,
  MapPin,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { Service } from "@/types";

const CATEGORIES_DATA = [
  {
    name: "Photography & Videography",
    icon: Camera,
    desc: "Capture every timeless glance & tear",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Wedding Venues",
    icon: Building2,
    desc: "Castles, vineyards & grand ballrooms",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Decoration & Florist",
    icon: Flower2,
    desc: "Breathtaking arches & floral elegance",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Catering Services",
    icon: UtensilsCrossed,
    desc: "Gourmet culinary experiences for your guests",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Makeup & Styling",
    icon: Palette,
    desc: "Radiant bridal beauty & hair artistry",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Wedding Fashion",
    icon: Shirt,
    desc: "Boutique bridal gowns & bespoke tuxedos",
    image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80",
  },
];

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      try {
        const res = await fetch(`${apiUrl}/services/featured`);
        if (res.ok) {
          const data = await res.json();
          setFeaturedServices(data.services || []);
        }
      } catch {
        // Fallback
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/60 via-pink-50/30 to-white py-20 lg:py-32">
          <div className="absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="lg:col-span-7 space-y-6 text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs font-semibold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Wedding, Perfectly Planned
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.15]">
                  Discover & Book Trusted Wedding Vendors in{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500">
                    One Elegant Place
                  </span>
                </h1>

                <p className="text-lg text-neutral-600 max-w-2xl leading-relaxed">
                  From fairytale venues and exquisite photography to bespoke floral designs,
                  WedPlan connects couples with vetted professionals to craft memories that last a lifetime.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                  <Link href="/services">
                    <Button size="lg" className="h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 text-base font-medium">
                      Explore Wedding Services
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="lg" variant="outline" className="h-12 px-8 border-neutral-300 hover:bg-rose-50/60 text-neutral-800 text-base font-medium">
                      Become a Vendor
                    </Button>
                  </Link>
                </div>

                <div className="pt-6 flex items-center justify-center lg:justify-start gap-8 text-neutral-500 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                    <span>Verified Vendors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-rose-500" />
                    <span>Direct Booking Requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Top-Rated Quality</span>
                  </div>
                </div>
              </motion.div>

              {/* Hero Image Collage */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                className="lg:col-span-5 relative"
              >
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-rose-200/50 border-4 border-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                      alt="Wedding Celebration"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Floating badge 1 */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-rose-100 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white">
                      <Heart className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">Happy Couples</p>
                      <p className="text-sm font-bold text-neutral-900">2,400+ Weddings Planned</p>
                    </div>
                  </motion.div>

                  {/* Floating badge 2 */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-rose-100 hidden sm:flex items-center gap-2.5"
                  >
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-neutral-800">4.9/5 Rating</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50/50 px-3 py-1">
                Categories
              </Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
                Explore by Wedding Service
              </h2>
              <p className="text-neutral-500 text-sm sm:text-base">
                Discover exceptional artisans specializing in every facet of your special day.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES_DATA.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    whileHover={{ y: -6 }}
                  >
                    <Link
                      href={`/services?category=${encodeURIComponent(cat.name)}`}
                      className="group block rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 bg-white"
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <h3 className="font-semibold text-neutral-900 group-hover:text-rose-600 transition-colors">
                            {cat.name}
                          </h3>
                        </div>
                        <p className="text-xs text-neutral-500">{cat.desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Services Section */}
        <section className="py-20 bg-neutral-50/60 border-t border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
              <div>
                <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50/50 px-3 py-1 mb-2">
                  Featured
                </Badge>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
                  Popular Wedding Packages
                </h2>
                <p className="text-neutral-500 text-sm mt-1">
                  Hand-selected verified wedding offerings curated by top artisans.
                </p>
              </div>
              <Link href="/services">
                <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
                  View All Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {featuredServices.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-neutral-200 p-8">
                <Sparkles className="w-10 h-10 text-rose-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-neutral-800">New Services Coming Soon</h3>
                <p className="text-sm text-neutral-500 mt-1 max-w-md mx-auto">
                  Our premier wedding vendors are curating their offerings. Browse our full catalog or sign up as a vendor to list your services.
                </p>
                <Link href="/services" className="inline-block mt-4">
                  <Button className="bg-rose-600 hover:bg-rose-700 text-white">Browse Catalog</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredServices.map((service, idx) => (
                  <motion.div
                    key={service._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                    whileHover={{ y: -6 }}
                    className="group bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          service.images?.[0] ||
                          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={service.serviceName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-neutral-800 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        {service.category}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{service.location}</span>
                        </div>
                        <h3 className="font-semibold text-base text-neutral-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                          {service.serviceName}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-neutral-400 block">Starting at</span>
                          <span className="text-lg font-bold text-neutral-900">
                            ${service.price.toLocaleString()}
                          </span>
                        </div>

                        <Link href={`/services/${service._id}`}>
                          <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why Choose WedPlan */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50/50 px-3 py-1">
                Why Us
              </Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
                Crafted for Effortless Wedding Planning
              </h2>
              <p className="text-neutral-500 text-sm sm:text-base">
                Everything you need to discover, connect, and celebrate with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl bg-neutral-50/60 border border-neutral-100 hover:border-rose-200 transition-all shadow-xs hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">Vetted Professionals</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Every vendor is carefully reviewed to ensure exceptional quality, reliability, and professionalism on your most important day.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl bg-neutral-50/60 border border-neutral-100 hover:border-rose-200 transition-all shadow-xs hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">Seamless Booking Requests</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Submit date-specific requests, communicate your vision, and receive official confirmations directly through your dashboard.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-2xl bg-neutral-50/60 border border-neutral-100 hover:border-rose-200 transition-all shadow-xs hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">Transparent Pricing</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Clear pricing, verified portfolios, and genuine customer reviews so you can budget with total clarity and zero surprises.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gradient-to-b from-rose-50/40 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50/50 px-3 py-1">
                How It Works
              </Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
                Three Simple Steps to Your Dream Wedding
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white font-serif text-xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-rose-200">
                  1
                </div>
                <h3 className="font-semibold text-lg text-neutral-900">Discover & Filter</h3>
                <p className="text-sm text-neutral-500">
                  Search through thousands of wedding packages by category, location, and budget.
                </p>
              </div>

              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white font-serif text-xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-rose-200">
                  2
                </div>
                <h3 className="font-semibold text-lg text-neutral-900">Send Booking Request</h3>
                <p className="text-sm text-neutral-500">
                  Select your celebration date and venue details to send a direct reservation inquiry.
                </p>
              </div>

              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white font-serif text-xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-rose-200">
                  3
                </div>
                <h3 className="font-semibold text-lg text-neutral-900">Connect & Celebrate</h3>
                <p className="text-sm text-neutral-500">
                  Collaborate directly with your vendor to bring your dream celebration to fruition.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
