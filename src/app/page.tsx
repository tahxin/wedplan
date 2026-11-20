"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getApiBaseUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Star,
  CalendarCheck,
  ArrowRight,
  MapPin,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import {
  PhotographyIcon,
  VenueIcon,
  FloristIcon,
  CateringIcon,
  MakeupIcon,
  FashionIcon,
} from "@/components/brand/category-icons";
import { Service } from "@/types";

const CATEGORIES_DATA = [
  {
    name: "Photography & Videography",
    icon: PhotographyIcon,
    desc: "Capture every timeless glance & tear",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Wedding Venues",
    icon: VenueIcon,
    desc: "Castles, vineyards & grand ballrooms",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Decoration & Florist",
    icon: FloristIcon,
    desc: "Breathtaking arches & floral elegance",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Catering Services",
    icon: CateringIcon,
    desc: "Gourmet culinary experiences for your guests",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Makeup & Styling",
    icon: MakeupIcon,
    desc: "Radiant bridal beauty & hair artistry",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Wedding Fashion",
    icon: FashionIcon,
    desc: "Boutique bridal gowns & bespoke tuxedos",
    image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80",
  },
];

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      const apiUrl = getApiBaseUrl();
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Banner / Hero Section */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,247,242,0.9),rgba(255,255,255,1))]" />
            <div className="absolute right-[-8rem] top-[-6rem] h-[22rem] w-[22rem] rounded-full border border-primary/10" />
            <div className="absolute left-[35%] top-24 hidden h-px w-40 bg-primary/20 lg:block" />
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:items-end lg:gap-16 lg:px-8 lg:pb-20 lg:pt-16">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
                  <LogoMark className="h-4 w-4" />
                </span>
                WedPlan Wedding Marketplace
              </p>

              <h1 className="max-w-3xl font-serif text-[2.9rem] leading-[0.9] font-semibold tracking-tight text-foreground sm:text-6xl lg:text-[4.6rem]">
                Plan the day
                <span className="block text-foreground/90">with vendors you can</span>
                <span className="block italic text-primary">truly trust.</span>
              </h1>

              <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Discover wedding venues, photographers, florists, caterers, stylists, and fashion ateliers in one place.
                  Compare services, send booking requests, and shape a celebration that feels personal from the first detail.
                </p>
                <div className="hidden h-full w-px bg-border/70 lg:block" aria-hidden="true" />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/services" className="w-full sm:w-auto">
                  <Button size="lg" className="h-12 w-full rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto">
                    Explore Wedding Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <Button size="lg" variant="ghost" className="h-12 w-full rounded-full px-6 text-base font-semibold text-foreground hover:bg-primary/5 sm:w-auto">
                    Become a Vendor
                  </Button>
                </Link>
              </div>

              <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-border/60 pt-6 text-sm sm:grid-cols-3">
                <div>
                  <dt className="flex items-center gap-2 font-medium text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Verified vendors
                  </dt>
                  <dd className="mt-1 leading-relaxed text-muted-foreground">Approved services and clear profiles.</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-medium text-foreground">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    Direct requests
                  </dt>
                  <dd className="mt-1 leading-relaxed text-muted-foreground">Book by date, location, and vision.</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 font-medium text-foreground">
                    <Star className="h-4 w-4 text-amber-500" />
                    Curated choices
                  </dt>
                  <dd className="mt-1 leading-relaxed text-muted-foreground">Venues, florals, fashion, and more.</dd>
                </div>
              </dl>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative">
                <div className="relative overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-xl rounded-bl-xl border border-border/60 bg-muted shadow-[0_30px_80px_-40px_rgba(28,25,23,0.45)]">
                  <div className="aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80"
                      alt="Couple celebrating an elegant wedding ceremony"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="absolute -left-3 top-8 hidden w-36 border-l-2 border-primary/50 bg-background/90 px-4 py-3 shadow-sm backdrop-blur sm:block lg:-left-6">
                  <p className="font-serif text-2xl font-semibold leading-none text-foreground">2,400+</p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">weddings planned with WedPlan vendors</p>
                </div>

                <div className="mt-4 grid grid-cols-[1.15fr_0.85fr] gap-4 sm:mt-5">
                  <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted">
                    <div className="aspect-[16/10]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80"
                        alt="Wedding floral styling details"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/70 p-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Services</p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">Venues, photography, décor, catering, styling, and fashion.</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                      <span className="ml-1 text-xs font-medium text-muted-foreground">4.9/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Wedding Services */}
        <section className="border-y border-border/50 bg-card/30 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl space-y-3">
                <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 px-3 py-1 text-primary">
                  Featured Wedding Services
                </Badge>
                <h2 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  Popular packages curated for every celebration
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Explore approved and active offerings from trusted vendors — each listing includes imagery, pricing, location, and vendor details.
                </p>
              </div>
              <Link href="/services">
                <Button variant="outline" className="rounded-full border-border/70 bg-background/70 hover:bg-background">
                  View All Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {featuredServices.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/70 bg-background/60 p-10 text-center sm:p-14">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary/70 ring-1 ring-primary/15">
                  <LogoMark className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">New services coming soon</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Our premier wedding vendors are curating their offerings. Browse the full catalog or join as a vendor to publish your services.
                </p>
                <Link href="/services" className="mt-6 inline-block">
                  <Button className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">Browse Catalog</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredServices.map((service, idx) => (
                  <motion.article
                    key={service._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: idx * 0.06 }}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          service.images?.[0] ||
                          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={service.serviceName}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-background/85 px-3 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
                        {service.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span className="truncate">{service.location}</span>
                        </div>
                        <h3 className="line-clamp-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                          {service.serviceName}
                        </h3>
                        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {service.description}
                        </p>
                        {service.vendor && (
                          <p className="text-xs text-muted-foreground">
                            Vendor: <span className="font-medium text-foreground/80">{service.vendor.businessName || service.vendor.name}</span>
                          </p>
                        )}
                      </div>

                      <div className="mt-5 flex items-end justify-between border-t border-border/60 pt-4">
                        <div>
                          <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Starting at</span>
                          <span className="text-xl font-semibold text-foreground">${service.price.toLocaleString()}</span>
                        </div>
                        <Link href={`/services/${service._id}`}>
                          <Button size="sm" className="rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Wedding Service Categories */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center space-y-3">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 px-3 py-1 text-primary">
                Wedding Service Categories
              </Badge>
              <h2 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Explore by craft and celebration style
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Browse curated categories and find specialists for every detail of your wedding day.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES_DATA.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: idx * 0.05 }}
                  >
                    <Link
                      href={`/services?category=${encodeURIComponent(cat.name)}`}
                      className="group relative block h-full overflow-hidden rounded-3xl border border-border/60 bg-card/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                        <div className="mb-2 flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-primary shadow-sm backdrop-blur">
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <h3 className="text-lg font-semibold text-white drop-shadow-sm">{cat.name}</h3>
                        </div>
                        <p className="max-w-sm text-sm leading-relaxed text-white/85">{cat.desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose WedPlan */}
        <section className="border-y border-border/50 bg-card/25 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center space-y-3">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 px-3 py-1 text-primary">
                Why Choose WedPlan?
              </Badge>
              <h2 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Crafted for effortless, confident wedding planning
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                A trusted space where couples and vendors connect through clarity, quality, and seamless coordination.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Vetted Professionals",
                  desc: "Every vendor is reviewed so you can book with confidence, knowing quality and reliability come first.",
                },
                {
                  icon: CalendarCheck,
                  title: "Seamless Booking Requests",
                  desc: "Send date-specific inquiries, share your vision, and track confirmations directly from your dashboard.",
                },
                {
                  icon: CheckCircle2,
                  title: "Transparent Pricing",
                  desc: "Compare packages with clear pricing, portfolios, and service details to plan your budget with certainty.",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: idx * 0.08 }}
                    className="rounded-3xl border border-border/60 bg-background/70 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How WedPlan Works */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center space-y-3">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 px-3 py-1 text-primary">
                How WedPlan Works
              </Badge>
              <h2 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Three simple steps to your dream wedding
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Discover & Filter",
                  desc: "Search wedding packages by name, category, location, and price to find the perfect match.",
                },
                {
                  step: "2",
                  title: "Send Booking Request",
                  desc: "Choose your celebration date and venue details to submit a direct inquiry to the vendor.",
                },
                {
                  step: "3",
                  title: "Connect & Celebrate",
                  desc: "Track responses, confirm details, and collaborate with professionals to bring your vision to life.",
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-7 shadow-sm"
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-md shadow-primary/20">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
