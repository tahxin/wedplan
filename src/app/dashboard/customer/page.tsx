"use client";

import { useEffect, useState, useCallback } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  Heart,
  Store,
  Ban,
  Eye,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
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
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const user = session?.user as { role?: string; name?: string } | undefined;

  const loadData = useCallback(async () => {
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
  }, []);

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
  }, [session, sessionPending, user, router, loadData]);

  const handleCancelBooking = async (bookingId: string) => {
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

  const confirmCancelBooking = async () => {
    const booking = bookingToCancel;
    setBookingToCancel(null);
    if (booking) await handleCancelBooking(booking._id);
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <Clock className="h-3.5 w-3.5" /> Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/70 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
            <XCircle className="h-3.5 w-3.5" /> Declined
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <Ban className="h-3.5 w-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 px-3 py-1 text-primary">
              <Heart className="mr-1 h-3 w-3 fill-current" /> Customer Portal
            </Badge>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Welcome, {user?.name || "Friend"}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Track your wedding service inquiries, review booking statuses, and manage pending requests.
            </p>
          </div>

          <Link href="/services">
            <Button className="rounded-full bg-primary px-6 text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90">
              <LogoMark className="mr-2 h-4 w-4" /> Browse More Services
            </Button>
          </Link>
        </div>

        {loading || sessionPending ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading your bookings...</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 sm:gap-5">
              <div className="rounded-3xl border border-border/60 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em]">Total Requests</span>
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <p className="text-3xl font-semibold text-foreground">{overview?.total ?? 0}</p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em]">Pending</span>
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-3xl font-semibold text-amber-700">{overview?.pending ?? 0}</p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em]">Accepted</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-3xl font-semibold text-emerald-700">{overview?.accepted ?? 0}</p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em]">Declined</span>
                  <XCircle className="h-4 w-4 text-rose-600" />
                </div>
                <p className="text-3xl font-semibold text-rose-700">{overview?.rejected ?? 0}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col gap-2 border-b border-border/60 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">My Booking Requests</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    All direct inquiries you have submitted to wedding vendors.
                  </p>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {bookings.length} {bookings.length === 1 ? "Inquiry" : "Inquiries"}
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="space-y-3 p-10 text-center sm:p-14">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary/70 ring-1 ring-primary/15">
                    <LogoMark className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">No booking requests yet</h3>
                  <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Explore our wedding catalog and inquire directly with vendors to begin reserving services.
                  </p>
                  <Link href="/services">
                    <Button className="mt-2 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                      Explore Wedding Services
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex flex-col justify-between gap-5 p-6 transition-colors hover:bg-background/40 md:flex-row md:items-center"
                    >
                      <div className="flex flex-1 items-start gap-4">
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              booking.service?.images?.[0] ||
                              "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80"
                            }
                            alt={booking.service?.serviceName || "Service"}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-foreground">
                              {booking.service?.serviceName || "Wedding Service"}
                            </h3>
                            <Badge variant="outline" className="text-[10px] border-border/70 text-muted-foreground">
                              {booking.service?.category}
                            </Badge>
                          </div>

                          {booking.vendor && (
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Store className="h-3.5 w-3.5" />
                              <span>{booking.vendor.businessName || booking.vendor.name}</span>
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5 font-medium text-foreground/85">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              {new Date(booking.eventDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {booking.eventLocation}
                            </span>
                          </div>

                          {booking.message && (
                            <p className="mt-1 max-w-xl rounded-xl border border-border/50 bg-background/50 p-2.5 text-sm italic text-muted-foreground">
                              &ldquo;{booking.message}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex w-full items-center justify-between gap-3 border-t border-border/50 pt-4 md:w-auto md:justify-end md:border-t-0 md:pt-0">
                        {getStatusBadge(booking.status)}

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                            className="rounded-xl border-border/70 bg-background/60"
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> Details
                          </Button>

                          {booking.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={cancellingId === booking._id}
                              onClick={() => setBookingToCancel(booking)}
                              className="rounded-xl border-rose-200/70 text-rose-700 hover:bg-rose-50"
                            >
                              {cancellingId === booking._id ? (
                                <>
                                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                "Cancel Request"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg space-y-6 overflow-y-auto rounded-3xl border border-border/60 bg-card p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-semibold text-foreground">Booking Request Details</h3>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <button onClick={() => setSelectedBooking(null)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">✕</button>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background/50 p-4">
                <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedBooking.service?.images?.[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80"}
                    alt={selectedBooking.service?.serviceName || "Service"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{selectedBooking.service?.serviceName || "Wedding Service"}</h4>
                  <Badge variant="outline" className="mt-1 text-[10px] border-border/70">{selectedBooking.service?.category}</Badge>
                  {selectedBooking.service?.price && (
                    <p className="mt-1.5 text-sm font-semibold text-foreground">Package: ${selectedBooking.service.price.toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {selectedBooking.vendor && (
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-3">
                    <span className="font-medium text-muted-foreground">Wedding Vendor</span>
                    <span className="text-right font-semibold text-foreground">{selectedBooking.vendor.businessName || selectedBooking.vendor.name} ({selectedBooking.vendor.email})</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-3">
                  <span className="font-medium text-muted-foreground">Celebration Date</span>
                  <span className="font-semibold text-foreground">{new Date(selectedBooking.eventDate).toLocaleDateString(undefined, { dateStyle: "full" })}</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-3">
                  <span className="font-medium text-muted-foreground">Event Location</span>
                  <span className="text-right font-semibold text-foreground">{selectedBooking.eventLocation}</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-3">
                  <span className="font-medium text-muted-foreground">Request Sent On</span>
                  <span className="text-foreground/80">{new Date(selectedBooking.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                </div>
                {selectedBooking.message && (
                  <div className="space-y-1.5 rounded-xl border border-border/60 bg-background/50 p-3.5">
                    <span className="block font-medium text-muted-foreground">Vision & Notes</span>
                    <p className="italic leading-relaxed text-foreground/85">&ldquo;{selectedBooking.message}&rdquo;</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                {selectedBooking.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancellingId === selectedBooking._id}
                    onClick={() => {
                      setBookingToCancel(selectedBooking);
                      setSelectedBooking(null);
                    }}
                    className="rounded-xl border-rose-200/70 text-rose-700 hover:bg-rose-50"
                  >
                    Cancel Request
                  </Button>
                )}
                <Button size="sm" onClick={() => setSelectedBooking(null)} className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        <AlertDialog
          open={Boolean(bookingToCancel)}
          onOpenChange={(open) => {
            if (!open) setBookingToCancel(null);
          }}
        >
          <AlertDialogContent className="rounded-2xl border-border/60 bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel this booking request?</AlertDialogTitle>
              <AlertDialogDescription>
                {bookingToCancel?.service?.serviceName
                  ? `Your request for ${bookingToCancel.service.serviceName} will be withdrawn. This cannot be undone.`
                  : "Your request will be withdrawn. This cannot be undone."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Keep Request</AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  confirmCancelBooking();
                }}
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Cancel Request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <Footer />
    </div>
  );
}
