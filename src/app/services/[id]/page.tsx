"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { fetchApi, getApiBaseUrl } from "@/lib/api";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Store,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Mail,
  AlertCircle,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { Service } from "@/types";

function ServiceDetailsContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isPending: sessionLoading } = useSession();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const user = session?.user as
    | {
        id: string;
        role?: "customer" | "vendor" | "admin";
      }
    | undefined;

  useEffect(() => {
    async function loadService() {
      setLoading(true);
      const apiUrl = getApiBaseUrl();
      try {
        const res = await fetch(`${apiUrl}/services/${id}`);
        if (!res.ok) {
          setService(null);
        } else {
          const data = await res.json();
          setService(data.service || null);
        }
      } catch {
        setService(null);
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [id]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please sign in to book this service");
      router.push(`/sign-in?callbackUrl=/services/${id}`);
      return;
    }

    if (user?.role !== "customer") {
      toast.error("Only registered customers can book services");
      return;
    }

    if (!eventDate || !eventLocation.trim()) {
      toast.error("Please fill in the event date and location");
      return;
    }

    setIsSubmittingBooking(true);

    try {
      await fetchApi("/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId: id,
          eventDate,
          eventLocation: eventLocation.trim(),
          message: message.trim(),
        }),
      });

      toast.success("Booking request sent successfully to the vendor!");
      setBookingSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit booking request";
      toast.error(msg);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const images = service?.images && service.images.length > 0
    ? service.images
    : ["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"];

  const isOwner = user && service && service.vendorId === user.id;
  const isVendorOrAdmin = user && (user.role === "vendor" || user.role === "admin");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-6">
          <Link
            href="/services"
            className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to all wedding services
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-28 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading service details...</p>
          </div>
        ) : !service ? (
          <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-border/70 bg-card/50 p-10 text-center shadow-sm sm:p-12">
            <AlertCircle className="mx-auto h-10 w-10 text-primary" />
            <h2 className="font-serif text-3xl font-semibold text-foreground">Service Not Found</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The service you requested may have been removed or is temporarily unavailable.
            </p>
            <Link href="/services">
              <Button className="mt-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                Browse Other Services
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-6 lg:col-span-7 xl:col-span-8">
              <div className="space-y-3">
                <div className="aspect-[16/10] overflow-hidden rounded-[2rem] border border-border/60 bg-muted shadow-xl shadow-primary/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[activeImageIndex]}
                    alt={service.serviceName}
                    className="h-full w-full object-cover transition-all duration-500"
                  />
                </div>

                {images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-16 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                          activeImageIndex === idx
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-5 rounded-3xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 px-3 py-1 font-semibold text-primary">
                    {service.category}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{service.location}</span>
                  </div>
                </div>

                <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                  {service.serviceName}
                </h1>

                <div className="border-t border-border/60 pt-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Description & Offerings
                  </h3>
                  <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {service.description}
                  </div>
                </div>
              </div>

              {service.vendor && (
                <div className="space-y-4 rounded-3xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Service Provider
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary ring-1 ring-primary/15">
                      {service.vendor.businessName?.[0] || service.vendor.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-xl font-semibold text-foreground">
                        {service.vendor.businessName || service.vendor.name}
                      </h4>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Store className="h-3.5 w-3.5" /> Verified Wedding Vendor</span>
                        <span className="text-border">•</span>
                        <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {service.vendor.email}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 space-y-6 rounded-3xl border border-primary/15 bg-card/70 p-6 shadow-xl shadow-primary/5 backdrop-blur-md sm:p-8">
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Investment
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-4xl font-semibold text-foreground sm:text-5xl">
                      ${service.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">/ package</span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-5">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">Request a Booking</h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    Submit your celebration date and location to inquire directly with this vendor.
                  </p>

                  {sessionLoading ? (
                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : !session ? (
                    <div className="space-y-3 rounded-2xl border border-border/60 bg-background/60 p-5 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                        <LogoMark className="h-6 w-6" />
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Please sign in with your customer account to submit a booking inquiry.
                      </p>
                      <Link href={`/sign-in?callbackUrl=/services/${id}`} className="block">
                        <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                          Sign In to Book
                        </Button>
                      </Link>
                    </div>
                  ) : isOwner ? (
                    <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 text-sm text-amber-900">
                      <strong>Vendor Notice:</strong> This is your published service. You cannot book your own offering.
                    </div>
                  ) : isVendorOrAdmin ? (
                    <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                      Booking is reserved for customer accounts. Please switch to a customer account to submit reservations.
                    </div>
                  ) : bookingSuccess ? (
                    <div className="space-y-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-6 text-center">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                      <h4 className="text-base font-semibold text-foreground">Request Sent!</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Your booking request has been delivered to the vendor. You can track status in your dashboard.
                      </p>
                      <Link href="/dashboard/customer">
                        <Button variant="outline" className="mt-1 rounded-xl border-emerald-300/70 text-emerald-700 hover:bg-emerald-100/60">
                          View in My Bookings
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="eventDate" className="text-sm font-medium text-foreground">
                          Celebration Date
                        </Label>
                        <div className="relative mt-1.5">
                          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="eventDate"
                            type="date"
                            min={minDate}
                            required
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="h-11 rounded-xl border-border/70 bg-background/70 pl-9 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="eventLocation" className="text-sm font-medium text-foreground">
                          Event Location / Venue
                        </Label>
                        <div className="relative mt-1.5">
                          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="eventLocation"
                            type="text"
                            required
                            placeholder="e.g. The Rosewood Estate, Dallas TX"
                            value={eventLocation}
                            onChange={(e) => setEventLocation(e.target.value)}
                            className="h-11 rounded-xl border-border/70 bg-background/70 pl-9 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-sm font-medium text-foreground">
                          Vision & Notes (Optional)
                        </Label>
                        <Textarea
                          id="message"
                          rows={4}
                          placeholder="Tell the vendor about your guest count, schedule, or theme..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="mt-1.5 rounded-xl border-border/70 bg-background/70 text-sm"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmittingBooking}
                        className="mt-2 h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                      >
                        {isSubmittingBooking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending Request...
                          </>
                        ) : (
                          "Send Booking Request"
                        )}
                      </Button>
                    </form>
                  )}
                </div>

                <div className="space-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground sm:text-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                    <span>Vendor response time: usually within 24h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>No upfront fee to send booking inquiries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ServiceDetailsContent params={params} />
    </Suspense>
  );
}
