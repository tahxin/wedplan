"use client";

import { useEffect, useState, useTransition, useCallback, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Filter,
  ArrowUpDown,
  Loader2,
  X,
  ChevronRight,
  Store,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { Service } from "@/types";
import { getApiBaseUrl } from "@/lib/api";

const CATEGORIES = [
  "All Categories",
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
];

function BrowseServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const initialCategory = searchParams.get("category") || "All Categories";
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "";
  const initialSort = searchParams.get("sort") || "newest";

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [sort, setSort] = useState(initialSort);

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [, startTransition] = useTransition();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchServices = useCallback(async (searchQuery: string, categoryFilter: string, locationFilter: string, sortOrder: string, isInitial = false) => {
    // If not initial fetch, we can show a subtle indicator or keep existing grid without flashing full skeleton
    if (isInitial) {
      setLoading(true);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const apiUrl = getApiBaseUrl();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("search", searchQuery.trim());
    if (categoryFilter && categoryFilter !== "All Categories") params.append("category", categoryFilter);
    if (locationFilter.trim()) params.append("location", locationFilter.trim());
    if (sortOrder) params.append("sort", sortOrder);

    try {
      const res = await fetch(`${apiUrl}/services?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
        setTotalCount(data.total || 0);
      } else {
        setServices([]);
        setTotalCount(0);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Ignore aborted requests
      }
      setServices([]);
      setTotalCount(0);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchServices(initialSearch, initialCategory, initialLocation, initialSort, true);
  }, [initialSearch, initialCategory, initialLocation, initialSort, fetchServices]);

  // Debounced search & filter effect
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchServices(search, category, location, sort, false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search, category, location, sort, fetchServices]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices(search, category, location, sort, true);
  };

  const clearFilters = () => {
    setCategory("All Categories");
    setSearch("");
    setLocation("");
    setSort("newest");
    startTransition(() => {
      router.push("/services");
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 space-y-3 sm:mb-10">
          <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 px-3 py-1 text-primary">
            Catalog
          </Badge>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Browse Wedding Services
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Search approved and active wedding services, filter by category and location, and sort by price to find the perfect fit for your celebration.
          </p>
        </div>

        <div className="mb-8 space-y-4 rounded-3xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-xl border-border/70 bg-background/70 pl-9 text-sm"
              />
            </div>

            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="City, State, or Region..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11 rounded-xl border-border/70 bg-background/70 pl-9 text-sm"
              />
            </div>

            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                id="sort-select"
                name="sort"
                aria-label="Sort wedding services"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 w-full cursor-pointer rounded-xl border border-border/70 bg-background/70 pl-9 pr-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" className="h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Apply Filters
              </Button>
              {(search || location || category !== "All Categories" || sort !== "newest") && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="h-11 rounded-xl px-3"
                  title="Clear all filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
            <span className="mr-1 flex shrink-0 items-center gap-1 font-medium text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/60 bg-background/70 text-foreground/80 hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing <strong className="text-foreground">{services.length}</strong> of{" "}
            <strong className="text-foreground">{totalCount}</strong> services
          </span>
          {category !== "All Categories" && (
            <span className="font-medium text-primary">Filtered by {category}</span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading wedding services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-dashed border-border/70 bg-card/40 p-10 text-center sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <LogoMark className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No services found</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We couldn&apos;t find any approved services matching your search or filters. Try adjusting your criteria.
            </p>
            <Button variant="outline" onClick={clearFilters} className="rounded-full">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const detailsHref = session
                ? `/services/${service._id}`
                : `/sign-in?callbackUrl=/services/${service._id}`;

              return (
                <article
                  key={service._id}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
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
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{service.location}</span>
                      </div>
                      <h3 className="line-clamp-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                        {service.serviceName}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>

                      {service.vendor && (
                        <div className="mt-1 flex items-center gap-2 rounded-xl border border-border/50 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                          <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate font-medium text-foreground/80">
                            {service.vendor.businessName || service.vendor.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex items-end justify-between border-t border-border/60 pt-4">
                      <div>
                        <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Starting at</span>
                        <span className="text-xl font-semibold text-foreground">
                          ${service.price.toLocaleString()}
                        </span>
                      </div>

                      <Link href={detailsHref}>
                        <Button size="sm" className="rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90">
                          View Details
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function BrowseServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <BrowseServicesContent />
    </Suspense>
  );
}
