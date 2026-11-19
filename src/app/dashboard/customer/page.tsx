"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  MapPin,
  Heart,
  Store,
  Ban,
  Eye,
} from "lucide-react";
import { Booking } from "@/types";

interface CustomerOverview {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();

  const [overview, setOverview] = useState<CustomerOverview | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const user = session?.user as { role?: string; name?: string } | undefined;

  useEffect(() => {
    if (!sessionPending) {
      if (!session) {
        router.replace("/sign-in?callbackUrl=/dashboard/customer");
        return;
      }

      if (user?.role && user.role !== "customer") {
        router.replace(`/dashboard/${user.role}`);
        return;
      }

      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, sessionPending]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, bookingsRes] = await Promise.all([
        fetchApi<{ success: boolean; overview: CustomerOverview }>("/customer/overview"),
        fetchApi<{ success: boolean; bookings: Booking[] }>("/customer/bookings"),
      ]);

      setOverview(overviewRes.overview);
      setBookings(bookingsRes.bookings || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking request?")) return;

    setCancellingId(bookingId);
    try {
      await fetchApi(`/customer/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      toast.success("Booking request cancelled successfully");
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel booking";
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
            <Ban className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-pink-600 border-pink-200 bg-pink-50/50">
                <Heart className="w-3 h-3 mr-1 fill-pink-500" /> Customer Portal
              </Badge>
            </div>
            <h1 className="font-serif text-3xl font-bold text-neutral-900 mt-2">
              Welcome, {user?.name || "Friend"}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Track your wedding service inquiries and reservation statuses.
            </p>
          </div>

          <Link href="/services">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" /> Browse More Services
            </Button>
          </Link>
        </div>

        {loading || sessionPending ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm font-medium">Loading your bookings...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Requests</span>
                  <Calendar className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">
                  {overview?.total ?? 0}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                  {overview?.pending ?? 0}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Accepted</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                  {overview?.accepted ?? 0}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Declined</span>
                  <XCircle className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-rose-600">
                  {overview?.rejected ?? 0}
                </p>
              </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">My Booking Requests</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    All direct inquiries you have submitted to wedding vendors.
                  </p>
                </div>
                <span className="text-xs font-semibold text-neutral-400">
                  {bookings.length} {bookings.length === 1 ? "Inquiry" : "Inquiries"}
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="py-16 text-center p-6 space-y-3">
                  <Sparkles className="w-10 h-10 text-neutral-300 mx-auto" />
                  <h3 className="font-semibold text-neutral-800 text-base">No booking requests yet</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Explore our wedding catalog and inquire directly with vendors to begin reserving services.
                  </p>
                  <Link href="/services">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white text-xs mt-2">
                      Explore Wedding Services
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-neutral-50/50 transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-20 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              booking.service?.images?.[0] ||
                              "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80"
                            }
                            alt={booking.service?.serviceName || "Service"}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-neutral-900 text-base">
                              {booking.service?.serviceName || "Wedding Service"}
                            </h3>
                            <Badge variant="outline" className="text-[10px] text-neutral-500">
                              {booking.service?.category}
                            </Badge>
                          </div>

                          {booking.vendor && (
                            <p className="text-xs text-neutral-600 flex items-center gap-1.5">
                              <Store className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{booking.vendor.businessName || booking.vendor.name}</span>
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                            <span className="flex items-center gap-1 text-neutral-700 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-rose-500" />
                              {new Date(booking.eventDate).toLocaleDateString(undefined, {
                                dateStyle: "medium",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                              {booking.eventLocation}
                            </span>
                          </div>

                          {booking.message && (
                            <p className="text-xs text-neutral-500 italic pt-1 bg-neutral-50 p-2 rounded-lg max-w-xl">
                              &ldquo;{booking.message}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-neutral-100">
                        {getStatusBadge(booking.status)}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                          className="text-xs text-neutral-700 hover:bg-neutral-50"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-neutral-500" /> Details
                        </Button>

                        {booking.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={cancellingId === booking._id}
                            onClick={() => handleCancelBooking(booking._id)}
                            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                          >
                            {cancellingId === booking._id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              "Cancel Request"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-neutral-100 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-neutral-900">
                    Booking Request Details
                  </h3>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Service Header */}
              <div className="flex items-start gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                <div className="w-16 h-14 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      selectedBooking.service?.images?.[0] ||
                      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={selectedBooking.service?.serviceName || "Service"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">
                    {selectedBooking.service?.serviceName || "Wedding Service"}
                  </h4>
                  <Badge variant="outline" className="text-[10px] text-neutral-600 mt-0.5">
                    {selectedBooking.service?.category}
                  </Badge>
                  {selectedBooking.service?.price && (
                    <p className="text-xs font-semibold text-neutral-800 mt-1">
                      Package: ${selectedBooking.service.price.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Information Grid */}
              <div className="space-y-3 text-xs">
                {selectedBooking.vendor && (
                  <div className="p-3 rounded-lg border border-neutral-100 flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Wedding Vendor</span>
                    <span className="font-semibold text-neutral-800">
                      {selectedBooking.vendor.businessName || selectedBooking.vendor.name} ({selectedBooking.vendor.email})
                    </span>
                  </div>
                )}

                <div className="p-3 rounded-lg border border-neutral-100 flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Celebration Date</span>
                  <span className="font-semibold text-neutral-800">
                    {new Date(selectedBooking.eventDate).toLocaleDateString(undefined, {
                      dateStyle: "full",
                    })}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-neutral-100 flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Event Location</span>
                  <span className="font-semibold text-neutral-800">
                    {selectedBooking.eventLocation}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-neutral-100 flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Request Sent On</span>
                  <span className="text-neutral-600">
                    {new Date(selectedBooking.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>

                {selectedBooking.message && (
                  <div className="p-3.5 rounded-lg border border-neutral-100 bg-neutral-50 space-y-1">
                    <span className="text-neutral-500 font-medium block">Vision & Notes</span>
                    <p className="text-neutral-700 italic leading-relaxed">
                      &ldquo;{selectedBooking.message}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                {selectedBooking.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancellingId === selectedBooking._id}
                    onClick={() => {
                      handleCancelBooking(selectedBooking._id);
                      setSelectedBooking(null);
                    }}
                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Cancel Request
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => setSelectedBooking(null)}
                  className="bg-neutral-900 text-white text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
