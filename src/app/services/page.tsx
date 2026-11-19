"use client";

import { useEffect, useState, useTransition } from "react";
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
  Sparkles,
  Loader2,
  X,
  ChevronRight,
  Store,
} from "lucide-react";
import { Service } from "@/types";

const CATEGORIES = [
  "All Categories",
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
];

export default function BrowseServicesPage() {
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

  const fetchServices = async () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (category && category !== "All Categories") params.append("category", category);
    if (location.trim()) params.append("location", location.trim());
    if (sort) params.append("sort", sort);

    try {
      const res = await fetch(`${apiUrl}/services?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
        setTotalCount(data.total || 0);
      } else {
        setServices([]);
        setTotalCount(0);
      }
    } catch {
      setServices([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
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
    <div className="min-h-screen flex flex-col bg-neutral-50/40">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50/50 px-3 py-1">
            Catalog
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
            Browse Wedding Services
          </h1>
          <p className="text-sm text-neutral-500">
            Discover and connect with top wedding professionals across photography, venues, catering, and more.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 mb-8 space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search by name */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 border-neutral-200 focus-visible:ring-rose-500 text-sm"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <Input
                placeholder="City, State, or Region..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-9 h-10 border-neutral-200 focus-visible:ring-rose-500 text-sm"
              />
            </div>

            {/* Sort by price */}
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-md border border-neutral-200 bg-white text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button type="submit" className="flex-1 h-10 bg-rose-600 hover:bg-rose-700 text-white text-sm">
                Apply Filters
              </Button>
              {(search || location || category !== "All Categories" || sort !== "newest") && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="h-10 px-3 text-neutral-600 hover:bg-rose-50"
                  title="Clear all filters"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-neutral-400 font-medium flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  category === cat
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-6">
          <span>
            Showing <strong className="text-neutral-800">{services.length}</strong> of{" "}
            <strong className="text-neutral-800">{totalCount}</strong> services
          </span>
          {category !== "All Categories" && (
            <span className="font-medium text-rose-600">Filtered by {category}</span>
          )}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm font-medium">Loading wedding services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-neutral-800 text-base">No services found</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We couldn&apos;t find any approved services matching your search or filters. Try adjusting your criteria.
            </p>
            <Button variant="outline" onClick={clearFilters} className="text-xs">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const detailsHref = session
                ? `/services/${service._id}`
                : `/sign-in?callbackUrl=/services/${service._id}`;

              return (
                <div
                  key={service._id}
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
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{service.location}</span>
                      </div>
                      <h3 className="font-semibold text-base text-neutral-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                        {service.serviceName}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {service.description}
                      </p>

                      {service.vendor && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-100">
                          <Store className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate font-medium">
                            {service.vendor.businessName || service.vendor.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-400 block">Starting at</span>
                        <span className="text-lg font-bold text-neutral-900">
                          ${service.price.toLocaleString()}
                        </span>
                      </div>

                      <Link href={detailsHref}>
                        <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs">
                          View Details
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
