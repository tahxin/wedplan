"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { fetchApi } from "@/lib/api";
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
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Service } from "@/types";

export default function ServiceDetailsPage({
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

  // Booking Form State
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
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

  // Get tomorrow's date for date-picker min
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/services"
            className="inline-flex items-center text-xs font-medium text-neutral-500 hover:text-rose-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to all wedding services
          </Link>
        </div>

        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm font-medium">Loading service details...</p>
          </div>
        ) : !service ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-neutral-900">Service Not Found</h2>
            <p className="text-sm text-neutral-500">
              The service you requested may have been removed or is temporarily unavailable.
            </p>
            <Link href="/services">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white mt-2">
                Browse Other Services
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Gallery & Details */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              {/* Image Carousel / Gallery */}
              <div className="space-y-3">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-100 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[activeImageIndex]}
                    alt={service.serviceName}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>

                {images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeImageIndex === idx
                            ? "border-rose-600 ring-2 ring-rose-200"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-100 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50/50 px-3 py-1 font-semibold">
                    {service.category}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>{service.location}</span>
                  </div>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
                  {service.serviceName}
                </h1>

                <div className="pt-4 border-t border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">
                    Description & Offerings
                  </h3>
                  <div className="text-neutral-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                    {service.description}
                  </div>
                </div>
              </div>

              {/* Vendor Profile Card */}
              {service.vendor && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                    Service Provider
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg shrink-0">
                      {service.vendor.businessName?.[0] || service.vendor.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-neutral-900">
                        {service.vendor.businessName || service.vendor.name}
                      </h4>
                      <p className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                        <Store className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Verified Wedding Vendor</span>
                        <span>•</span>
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{service.vendor.email}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Pricing & Booking Widget */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 bg-white rounded-2xl p-6 sm:p-8 border border-rose-100 shadow-xl shadow-rose-100/40 space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                    Investment
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-4xl font-bold text-neutral-900">
                      ${service.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-500">/ package</span>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-5">
                  <h3 className="font-semibold text-neutral-900 text-base mb-1">
                    Request a Booking
                  </h3>
                  <p className="text-xs text-neutral-500 mb-4">
                    Submit your celebration date and location to inquire directly with this vendor.
                  </p>

                  {sessionLoading ? (
                    <div className="py-6 flex items-center justify-center text-neutral-400">
                      <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                    </div>
                  ) : !session ? (
                    <div className="bg-neutral-50 rounded-xl p-5 text-center space-y-3 border border-neutral-100">
                      <Sparkles className="w-6 h-6 text-rose-500 mx-auto" />
                      <p className="text-xs text-neutral-600">
                        Please sign in with your customer account to submit a booking inquiry.
                      </p>
                      <Link href={`/sign-in?callbackUrl=/services/${id}`} className="block">
                        <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs">
                          Sign In to Book
                        </Button>
                      </Link>
                    </div>
                  ) : isOwner ? (
                    <div className="bg-amber-50 rounded-xl p-4 text-xs text-amber-800 border border-amber-200">
                      <strong>Vendor Notice:</strong> This is your published service. You cannot book your own offering.
                    </div>
                  ) : isVendorOrAdmin ? (
                    <div className="bg-neutral-50 rounded-xl p-4 text-xs text-neutral-600 border border-neutral-200">
                      Booking is reserved for customer accounts. Please switch to a customer account to submit reservations.
                    </div>
                  ) : bookingSuccess ? (
                    <div className="bg-emerald-50 rounded-xl p-6 text-center space-y-3 border border-emerald-200">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                      <h4 className="font-bold text-neutral-900 text-sm">Request Sent!</h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Your booking request has been delivered to the vendor. You can track status in your dashboard.
                      </p>
                      <Link href="/dashboard/customer">
                        <Button variant="outline" className="text-xs border-emerald-300 text-emerald-700 mt-2">
                          View in My Bookings
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="eventDate" className="text-xs font-medium text-neutral-700">
                          Celebration Date
                        </Label>
                        <div className="relative mt-1">
                          <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                          <Input
                            id="eventDate"
                            type="date"
                            min={minDate}
                            required
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="pl-9 h-10 text-sm border-neutral-200 focus-visible:ring-rose-500"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="eventLocation" className="text-xs font-medium text-neutral-700">
                          Event Location / Venue
                        </Label>
                        <div className="relative mt-1">
                          <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                          <Input
                            id="eventLocation"
                            type="text"
                            required
                            placeholder="e.g. The Rosewood Estate, Dallas TX"
                            value={eventLocation}
                            onChange={(e) => setEventLocation(e.target.value)}
                            className="pl-9 h-10 text-sm border-neutral-200 focus-visible:ring-rose-500"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-xs font-medium text-neutral-700">
                          Vision & Notes (Optional)
                        </Label>
                        <Textarea
                          id="message"
                          rows={3}
                          placeholder="Tell the vendor about your guest count, schedule, or theme..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="mt-1 text-sm border-neutral-200 focus-visible:ring-rose-500"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmittingBooking}
                        className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-md shadow-rose-200 mt-2"
                      >
                        {isSubmittingBooking ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending Request...
                          </>
                        ) : (
                          "Send Booking Request"
                        )}
                      </Button>
                    </form>
                  )}
                </div>

                <div className="border-t border-neutral-100 pt-4 space-y-2 text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Vendor response time: usually within 24h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
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
