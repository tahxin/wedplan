"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { fetchApi } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/upload";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  Crown,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Calendar,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Pencil,
} from "lucide-react";
import { Service, Booking } from "@/types";

const CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
];

interface VendorOverview {
  totalServices: number;
  activeServices: number;
  pendingRequests: number;
  acceptedBookings: number;
  currentPlan: "free" | "premium";
  subscriptionExpiresAt?: string | null;
}

function VendorDashboardContent() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();

  const [overview, setOverview] = useState<VendorOverview | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: "services" | "bookings" | "subscription" =
    tabParam === "bookings" || tabParam === "subscription" ? tabParam : "services";

  const setActiveTab = (tab: "services" | "bookings" | "subscription") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/dashboard/vendor?${params.toString()}`, { scroll: false });
  };

  // Add Service Form State
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [submittingService, setSubmittingService] = useState(false);

  // Upgrade state
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Edit Service Form State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState(CATEGORIES[0]);
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Processing state for booking accept/reject
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);

  const user = session?.user as
    | {
        role?: string;
        name?: string;
        businessName?: string;
        subscriptionPlan?: "free" | "premium";
      }
    | undefined;

  const loadVendorData = useCallback(async () => {
    // Only load data if session is ready and user is vendor
    if (!session || !user || user.role !== "vendor") {
      return;
    }
    
    setLoading(true);
    try {
      const [ovRes, srvRes, bkgRes] = await Promise.all([
        fetchApi<{ success: boolean; overview: VendorOverview }>("/vendor/overview"),
        fetchApi<{ success: boolean; services: Service[] }>("/vendor/services"),
        fetchApi<{ success: boolean; bookings: Booking[] }>("/vendor/bookings"),
      ]);

      setOverview(ovRes.overview);
      setServices(srvRes.services || []);
      setBookings(bkgRes.bookings || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load vendor portal";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [session, user]);

  useEffect(() => {
    if (sessionPending) {
      // Still loading session, wait
      return;
    }
    
    if (!session) {
      router.replace("/sign-in?callbackUrl=/dashboard/vendor");
      return;
    }

    if (user?.role && user.role !== "vendor") {
      router.replace(`/dashboard/${user.role}`);
      return;
    }

    // Load data only after session is confirmed and user is vendor
    loadVendorData();
  }, [session, sessionPending, user, router, loadVendorData]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingService(true);

    try {
      const uploadedImages: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        toast.info("Uploading images to ImgBB...");
        for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
          try {
            const url = await uploadImageToImgBB(imageFiles[i]);
            uploadedImages.push(url);
          } catch {
            // Continue with other images if one fails
          }
        }
      }

      // If no image was uploaded, supply a default curated wedding image
      if (uploadedImages.length === 0) {
        uploadedImages.push(
          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
        );
      }

      await fetchApi("/vendor/services", {
        method: "POST",
        body: JSON.stringify({
          serviceName: serviceName.trim(),
          category,
          description: description.trim(),
          price: Number(price),
          location: location.trim(),
          images: uploadedImages,
        }),
      });

      toast.success("Service submitted for admin review!");
      setIsAddingService(false);
      // Reset form
      setServiceName("");
      setDescription("");
      setPrice("");
      setLocation("");
      setImageFiles(null);
      loadVendorData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create service";
      toast.error(msg);
    } finally {
      setSubmittingService(false);
    }
  };

  const handleToggleAvailability = async (serviceId: string) => {
    try {
      const res = await fetchApi<{ success: boolean; message: string; isActive: boolean }>(
        `/vendor/services/${serviceId}/availability`,
        { method: "PATCH" }
      );
      toast.success(res.message);
      loadVendorData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update availability";
      toast.error(msg);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to permanently delete this service?")) return;

    try {
      await fetchApi(`/vendor/services/${serviceId}`, { method: "DELETE" });
      toast.success("Service deleted");
      loadVendorData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete service";
      toast.error(msg);
    }
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setEditName(service.serviceName);
    setEditCategory(service.category);
    setEditDescription(service.description);
    setEditPrice(String(service.price));
    setEditLocation(service.location);
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setSavingEdit(true);

    try {
      await fetchApi(`/vendor/services/${editingService._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          serviceName: editName.trim(),
          category: editCategory,
          description: editDescription.trim(),
          price: Number(editPrice),
          location: editLocation.trim(),
        }),
      });

      toast.success("Service updated successfully!");
      setEditingService(null);
      loadVendorData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update service";
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    setProcessingBookingId(bookingId);
    try {
      await fetchApi(`/vendor/bookings/${bookingId}/accept`, { method: "PATCH" });
      toast.success("Booking request accepted!");
      loadVendorData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to accept booking";
      toast.error(msg);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    setProcessingBookingId(bookingId);
    try {
      await fetchApi(`/vendor/bookings/${bookingId}/reject`, { method: "PATCH" });
      toast.success("Booking request declined");
      loadVendorData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to decline booking";
      toast.error(msg);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleUpgradeToPremium = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetchApi<{ success: boolean; url?: string; message?: string }>(
        "/payments/create-checkout-session",
        { method: "POST" }
      );
      if (res?.url) {
        window.location.assign(res.url);
        return;
      }
      toast.error(res?.message || "Failed to generate checkout session");
      setIsUpgrading(false);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 401 || status === 403) {
        return;
      }
      const msg = err instanceof Error ? err.message : "Upgrade initiation failed";
      toast.error(msg);
      setIsUpgrading(false);
    }
  };

  const isPremium = overview?.currentPlan === "premium";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 px-3 py-1 text-primary">
                <Store className="mr-1.5 h-3.5 w-3.5" /> Vendor Portal
              </Badge>
              {isPremium ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                  <Crown className="h-3.5 w-3.5" /> PREMIUM PARTNER
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[11px] font-semibold text-foreground/80">
                  FREE PLAN (Max 3 Active)
                </span>
              )}
            </div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {user?.businessName || user?.name || "Vendor Studio"}
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Manage your published wedding offerings, respond to client inquiries, and scale your business.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isPremium && (
              <Button
                variant="outline"
                disabled={isUpgrading}
                onClick={handleUpgradeToPremium}
                className="rounded-full border-amber-300/70 bg-amber-50/70 text-amber-900 hover:bg-amber-100/70"
              >
                {isUpgrading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="mr-2 h-4 w-4 text-amber-600" />
                )}
                Upgrade to Premium ($20)
              </Button>
            )}

            <Button
              onClick={() => setIsAddingService(true)}
              className="rounded-full bg-primary px-6 text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Publish New Service
            </Button>
          </div>
        </div>

        {loading || sessionPending ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading vendor portal...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 sm:gap-5">
              <Link
                href="/dashboard/vendor?tab=services"
                className="rounded-3xl border border-border/60 bg-card/50 p-5 text-left shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Total Services
                </span>
                <p className="text-3xl font-semibold text-foreground">{overview?.totalServices ?? 0}</p>
              </Link>

              <Link
                href="/dashboard/vendor?tab=services"
                className="rounded-3xl border border-border/60 bg-card/50 p-5 text-left shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Active Services
                </span>
                <p className="text-3xl font-semibold text-emerald-700">
                  {overview?.activeServices ?? 0}
                  {!isPremium && <span className="ml-1 text-xs font-normal text-muted-foreground">/ 3 max</span>}
                </p>
              </Link>

              <Link
                href="/dashboard/vendor?tab=bookings"
                className="rounded-3xl border border-border/60 bg-card/50 p-5 text-left shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Pending Requests
                </span>
                <p className="text-3xl font-semibold text-amber-700">{overview?.pendingRequests ?? 0}</p>
              </Link>

              <Link
                href="/dashboard/vendor?tab=bookings"
                className="rounded-3xl border border-border/60 bg-card/50 p-5 text-left shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Accepted Bookings
                </span>
                <p className="text-3xl font-semibold text-primary">{overview?.acceptedBookings ?? 0}</p>
              </Link>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "services" | "bookings" | "subscription")}
              className="space-y-6"
            >
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1.5 rounded-2xl border border-border/60 bg-card/50 p-1.5 shadow-sm backdrop-blur-sm sm:w-fit">
                <TabsTrigger value="services" className="rounded-xl px-4 py-2 text-xs font-semibold sm:text-sm">
                  My Services ({services.length})
                </TabsTrigger>
                <TabsTrigger value="bookings" className="rounded-xl px-4 py-2 text-xs font-semibold sm:text-sm">
                  Booking Inquiries ({bookings.length})
                </TabsTrigger>
                <TabsTrigger value="subscription" className="rounded-xl px-4 py-2 text-xs font-semibold sm:text-sm">
                  Subscription Plan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center justify-between border-b border-border/60 p-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Published Wedding Services</h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Services submitted by your studio. Once approved by admins, they appear in public search.
                      </p>
                    </div>
                  </div>

                  {services.length === 0 ? (
                    <div className="space-y-3 p-10 text-center sm:p-14">
                      <Store className="mx-auto h-10 w-10 text-primary/35" />
                      <h3 className="text-lg font-semibold text-foreground">No services published yet</h3>
                      <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                        Start reaching couples by publishing your wedding packages and photography or venue listings.
                      </p>
                      <Button
                        onClick={() => setIsAddingService(true)}
                        className="mt-2 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="mr-1.5 h-4 w-4" /> Add Your First Service
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {services.map((service) => (
                        <div
                          key={service._id}
                          className="flex flex-col justify-between gap-5 p-6 transition-colors hover:bg-background/40 md:flex-row md:items-center"
                        >
                          <div className="flex flex-1 items-start gap-4">
                            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={
                                  service.images?.[0] ||
                                  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80"
                                }
                                alt={service.serviceName}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="min-w-0 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-semibold text-foreground">{service.serviceName}</h3>
                                <Badge variant="outline" className="text-[10px] border-border/70 text-muted-foreground">
                                  {service.category}
                                </Badge>
                              </div>

                              <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5" /> {service.location}
                                </span>
                                <span className="text-border">•</span>
                                <span className="font-semibold text-foreground">${service.price.toLocaleString()}</span>
                              </p>

                              <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                                {service.status === "approved" && (
                                  <span className="inline-flex items-center rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                    Approved
                                  </span>
                                )}
                                {service.status === "pending" && (
                                  <span className="inline-flex items-center rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                                    Pending Admin Approval
                                  </span>
                                )}
                                {service.status === "rejected" && (
                                  <span className="inline-flex items-center rounded-full border border-rose-200/70 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                                    Rejected
                                  </span>
                                )}
                                <span className={`text-[11px] font-medium ${service.isActive ? "text-foreground/70" : "italic text-muted-foreground"}`}>
                                  {service.isActive ? "Active (Accepting Bookings)" : "Paused"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-4 md:w-auto md:justify-end md:border-t-0 md:pt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAvailability(service._id)}
                              className="rounded-xl border-border/70 bg-background/60 text-xs"
                            >
                              {service.isActive ? (
                                <>
                                  <ToggleRight className="mr-1.5 h-4 w-4 text-emerald-600" /> Pause Listing
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="mr-1.5 h-4 w-4 text-muted-foreground" /> Activate Listing
                                </>
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(service)}
                              className="rounded-xl border-border/70 bg-background/60 text-xs"
                              title="Edit service details"
                            >
                              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteService(service._id)}
                              className="rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 shadow-sm backdrop-blur-sm">
                  <div className="border-b border-border/60 p-6">
                    <h2 className="text-xl font-semibold text-foreground">Client Booking Requests</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Inquiries from couples for your wedding services.
                    </p>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="space-y-3 p-10 text-center sm:p-14">
                      <Clock className="mx-auto h-10 w-10 text-primary/35" />
                      <h3 className="text-lg font-semibold text-foreground">No booking requests yet</h3>
                      <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                        Inquiries submitted by couples will appear here for review and confirmation.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {bookings.map((booking) => (
                        <div
                          key={booking._id}
                          className="flex flex-col justify-between gap-5 p-6 transition-colors hover:bg-background/40 lg:flex-row lg:items-center"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-foreground">
                                {booking.service?.serviceName || "Wedding Service"}
                              </h3>
                              <Badge variant="outline" className="text-[10px] border-border/70 text-muted-foreground">
                                {booking.status.toUpperCase()}
                              </Badge>
                            </div>

                            {booking.customer && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground/85">Customer:</span> {booking.customer.name}
                                <span className="text-muted-foreground"> ({booking.customer.email})</span>
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
                              <p className="max-w-xl rounded-xl border border-border/50 bg-background/50 p-2.5 text-sm italic text-muted-foreground">
                                &ldquo;{booking.message}&rdquo;
                              </p>
                            )}
                          </div>

                          <div className="flex w-full items-center justify-end gap-2 border-t border-border/50 pt-4 lg:w-auto lg:border-t-0 lg:pt-0">
                            {booking.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  disabled={processingBookingId === booking._id}
                                  onClick={() => handleAcceptBooking(booking._id)}
                                  className="rounded-xl bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                                >
                                  {processingBookingId === booking._id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Accept
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={processingBookingId === booking._id}
                                  onClick={() => handleRejectBooking(booking._id)}
                                  className="rounded-xl border-rose-200/70 text-xs text-rose-700 hover:bg-rose-50"
                                >
                                  {processingBookingId === booking._id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="mr-1 h-3.5 w-3.5" /> Decline
                                    </>
                                  )}
                                </Button>
                              </>
                            ) : (
                              <span className="text-sm font-medium text-muted-foreground">
                                {booking.status === "accepted" ? "Booking Confirmed" : "Booking Closed"}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="subscription" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4 rounded-3xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold text-foreground">Free Tier</h3>
                      {!isPremium && (
                        <Badge variant="outline" className="border-border/70 bg-muted/40 text-foreground/80">
                          Current Plan
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Basic vendor membership to showcase your wedding business.
                    </p>
                    <div className="text-3xl font-semibold text-foreground">$0</div>
                    <ul className="space-y-2.5 border-t border-border/60 pt-3 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Max 3 Active Services
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Direct Booking Requests
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground/70">
                        <XCircle className="h-4 w-4" /> Unlimited Services
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground/70">
                        <XCircle className="h-4 w-4" /> Premium Verified Badge
                      </li>
                    </ul>
                  </div>

                  <div className="relative space-y-4 overflow-hidden rounded-3xl border border-amber-300/70 bg-gradient-to-b from-amber-50/70 to-card/60 p-6 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-200/30 blur-2xl" />
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-amber-600" />
                        <h3 className="text-xl font-semibold text-foreground">Premium Partner</h3>
                      </div>
                      {isPremium && <Badge className="bg-amber-600 text-white hover:bg-amber-600">Active Plan</Badge>}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Scale your wedding studio with unlimited catalog listings & premium visibility.
                    </p>
                    <div className="font-serif text-4xl font-semibold text-foreground">
                      $20 <span className="font-sans text-sm font-medium text-muted-foreground">/ one-time</span>
                    </div>
                    <ul className="space-y-2.5 border-t border-amber-200/60 pt-3 text-sm text-foreground/85">
                      <li className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Publish Unlimited Services
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Premium Verified Partner Badge
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Priority placement in search results
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Direct Client Inquiries
                      </li>
                    </ul>

                    {!isPremium ? (
                      <Button
                        onClick={handleUpgradeToPremium}
                        disabled={isUpgrading}
                        className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 font-semibold text-white shadow-md hover:from-amber-600 hover:to-amber-700"
                      >
                        {isUpgrading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redirecting to Stripe...
                          </>
                        ) : (
                          "Upgrade to Premium Now ($20)"
                        )}
                      </Button>
                    ) : (
                      <div className="rounded-xl border border-amber-200/70 bg-amber-100/50 p-3 text-center text-sm font-medium text-amber-900">
                        You are enjoying all Premium Partner privileges!
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {isAddingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-3xl border border-border/60 bg-card p-6 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-serif text-2xl font-semibold text-foreground">Publish Wedding Service</h3>
                <button
                  onClick={() => setIsAddingService(false)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateService} className="space-y-4">
                <div>
                  <Label htmlFor="srv-name" className="text-sm font-medium text-foreground">
                    Service / Package Name
                  </Label>
                  <Input
                    id="srv-name"
                    required
                    placeholder="e.g. Fairytale Castle Ballroom & Catering"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="mt-1.5 h-11 rounded-xl border-border/70 bg-background/70 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="srv-cat" className="text-sm font-medium text-foreground">
                      Category
                    </Label>
                    <select
                      id="srv-cat"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-border/70 bg-background/70 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="srv-price" className="text-sm font-medium text-foreground">
                      Package Price ($ USD)
                    </Label>
                    <Input
                      id="srv-price"
                      type="number"
                      required
                      min={1}
                      placeholder="2500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="mt-1.5 h-11 rounded-xl border-border/70 bg-background/70 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="srv-loc" className="text-sm font-medium text-foreground">
                    Service Location
                  </Label>
                  <Input
                    id="srv-loc"
                    required
                    placeholder="e.g. Austin, TX & Hill Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1.5 h-11 rounded-xl border-border/70 bg-background/70 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="srv-desc" className="text-sm font-medium text-foreground">
                    Description & Offerings
                  </Label>
                  <Textarea
                    id="srv-desc"
                    required
                    rows={4}
                    placeholder="Detail everything included in this package (hours, staff, equipment, deliverables)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 rounded-xl border-border/70 bg-background/70 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="srv-imgs" className="text-sm font-medium text-foreground">
                    Showcase Images (Upload files to ImgBB)
                  </Label>
                  <Input
                    id="srv-imgs"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="mt-1.5 h-11 cursor-pointer rounded-xl border-border/70 bg-background/70 text-xs file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">Select up to 5 photos showcasing your wedding work.</p>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddingService(false)} className="rounded-xl border-border/70">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submittingService} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    {submittingService ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Uploading & Submitting...
                      </>
                    ) : (
                      "Submit Service"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-3xl border border-border/60 bg-card p-6 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-serif text-2xl font-semibold text-foreground">Update Service Package</h3>
                <button
                  onClick={() => setEditingService(null)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateService} className="space-y-4">
                <div>
                  <Label htmlFor="edit-srv-name" className="text-sm font-medium text-foreground">
                    Service Name
                  </Label>
                  <Input
                    id="edit-srv-name"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1.5 h-11 rounded-xl border-border/70 bg-background/70 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-srv-cat" className="text-sm font-medium text-foreground">
                      Category
                    </Label>
                    <select
                      id="edit-srv-cat"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-border/70 bg-background/70 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="edit-srv-price" className="text-sm font-medium text-foreground">
                      Price ($ USD)
                    </Label>
                    <Input
                      id="edit-srv-price"
                      type="number"
                      required
                      min={1}
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="mt-1.5 h-11 rounded-xl border-border/70 bg-background/70 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-srv-loc" className="text-sm font-medium text-foreground">
                    Location
                  </Label>
                  <Input
                    id="edit-srv-loc"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="mt-1.5 h-11 rounded-xl border-border/70 bg-background/70 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-srv-desc" className="text-sm font-medium text-foreground">
                    Description & Offerings
                  </Label>
                  <Textarea
                    id="edit-srv-desc"
                    required
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="mt-1.5 rounded-xl border-border/70 bg-background/70 text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-3">
                  <Button type="button" variant="outline" onClick={() => setEditingService(null)} className="rounded-xl border-border/70">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingEdit} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    {savingEdit ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      "Save Updates"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function VendorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VendorDashboardContent />
    </Suspense>
  );
}
