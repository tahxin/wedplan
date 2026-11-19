"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

export default function VendorDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();

  const [overview, setOverview] = useState<VendorOverview | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  useEffect(() => {
    if (!sessionPending) {
      if (!session) {
        router.replace("/sign-in?callbackUrl=/dashboard/vendor");
        return;
      }

      if (user?.role && user.role !== "vendor") {
        router.replace(`/dashboard/${user.role}`);
        return;
      }

      loadVendorData();
    }
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
      const res = await fetchApi<{ success: boolean; url: string }>(
        "/payments/create-checkout-session",
        { method: "POST" }
      );
      if (res.url) {
        window.location.href = res.url;
      } else {
        toast.error("Failed to generate checkout session");
        setIsUpgrading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upgrade initiation failed";
      toast.error(msg);
      setIsUpgrading(false);
    }
  };

  const isPremium = overview?.currentPlan === "premium";

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                <Store className="w-3.5 h-3.5 mr-1" /> Vendor Portal
              </Badge>
              {isPremium ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                  <Crown className="w-3 h-3" /> PREMIUM PARTNER
                </span>
              ) : (
                <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                  FREE PLAN (Max 3 Active)
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl font-bold text-neutral-900 mt-2">
              {user?.businessName || user?.name || "Vendor Studio"}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Manage your published wedding offerings, respond to client inquiries, and scale your business.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isPremium && (
              <Button
                variant="outline"
                disabled={isUpgrading}
                onClick={handleUpgradeToPremium}
                className="border-amber-400 text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold"
              >
                {isUpgrading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Crown className="w-4 h-4 mr-2 text-amber-600" />
                )}
                Upgrade to Premium ($20)
              </Button>
            )}

            <Button
              onClick={() => setIsAddingService(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Publish New Service
            </Button>
          </div>
        </div>

        {loading || sessionPending ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm font-medium">Loading vendor portal...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Total Services
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-neutral-900">
                  {overview?.totalServices ?? 0}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Active Services
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                  {overview?.activeServices ?? 0}
                  {!isPremium && (
                    <span className="text-xs text-neutral-400 font-normal ml-1">/ 3 max</span>
                  )}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Pending Requests
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                  {overview?.pendingRequests ?? 0}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Accepted Bookings
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-rose-600">
                  {overview?.acceptedBookings ?? 0}
                </p>
              </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="services" className="space-y-6">
              <TabsList className="bg-white border border-neutral-200 p-1 rounded-xl">
                <TabsTrigger value="services" className="text-xs font-semibold">
                  My Services ({services.length})
                </TabsTrigger>
                <TabsTrigger value="bookings" className="text-xs font-semibold">
                  Booking Inquiries ({bookings.length})
                </TabsTrigger>
                <TabsTrigger value="subscription" className="text-xs font-semibold">
                  Subscription Plan
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: SERVICES */}
              <TabsContent value="services" className="space-y-4">
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-neutral-900">Published Wedding Services</h2>
                      <p className="text-xs text-neutral-500">
                        Services submitted by your studio. Once approved by admins, they appear in public search.
                      </p>
                    </div>
                  </div>

                  {services.length === 0 ? (
                    <div className="py-16 text-center p-6 space-y-3">
                      <Store className="w-10 h-10 text-neutral-300 mx-auto" />
                      <h3 className="font-semibold text-neutral-800 text-base">No services published yet</h3>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        Start reaching couples by publishing your wedding packages and photography or venue listings.
                      </p>
                      <Button
                        onClick={() => setIsAddingService(true)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs mt-2"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Your First Service
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {services.map((service) => (
                        <div
                          key={service._id}
                          className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-neutral-50/50 transition-colors"
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-20 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={
                                  service.images?.[0] ||
                                  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80"
                                }
                                alt={service.serviceName}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-neutral-900 text-base">
                                  {service.serviceName}
                                </h3>
                                <Badge variant="outline" className="text-[10px] text-neutral-600">
                                  {service.category}
                                </Badge>
                              </div>

                              <p className="text-xs text-neutral-500 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                                <span>{service.location}</span>
                                <span>•</span>
                                <span className="font-bold text-neutral-900">
                                  ${service.price.toLocaleString()}
                                </span>
                              </p>

                              <div className="flex items-center gap-3 pt-1">
                                {service.status === "approved" && (
                                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    Approved
                                  </span>
                                )}
                                {service.status === "pending" && (
                                  <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                    Pending Admin Approval
                                  </span>
                                )}
                                {service.status === "rejected" && (
                                  <span className="inline-flex items-center text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                    Rejected
                                  </span>
                                )}

                                <span
                                  className={`text-[11px] font-medium ${
                                    service.isActive ? "text-neutral-600" : "text-neutral-400 italic"
                                  }`}
                                >
                                  {service.isActive ? "Active (Accepting Bookings)" : "Paused"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-neutral-100">
                            {/* Toggle Availability */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAvailability(service._id)}
                              className="text-xs gap-1.5"
                            >
                              {service.isActive ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-emerald-600" /> Pause Listing
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4 text-neutral-400" /> Activate Listing
                                </>
                              )}
                            </Button>

                            {/* Edit */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(service)}
                              className="text-xs text-neutral-700 hover:bg-neutral-50"
                              title="Edit service details"
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1 text-neutral-500" /> Edit
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteService(service._id)}
                              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 2: BOOKING INQUIRIES */}
              <TabsContent value="bookings" className="space-y-4">
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-neutral-900">Client Booking Requests</h2>
                      <p className="text-xs text-neutral-500">
                        Inquiries from couples for your wedding services.
                      </p>
                    </div>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="py-16 text-center p-6 space-y-3">
                      <Clock className="w-10 h-10 text-neutral-300 mx-auto" />
                      <h3 className="font-semibold text-neutral-800 text-base">No booking requests yet</h3>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        Inquiries submitted by couples will appear here for review and confirmation.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {bookings.map((booking) => (
                        <div
                          key={booking._id}
                          className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-neutral-50/50 transition-colors"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-neutral-900 text-base">
                                {booking.service?.serviceName || "Wedding Service"}
                              </h3>
                              <Badge variant="outline" className="text-[10px]">
                                {booking.status.toUpperCase()}
                              </Badge>
                            </div>

                            {booking.customer && (
                              <p className="text-xs text-neutral-700 flex items-center gap-2">
                                <strong>Customer:</strong>
                                <span>{booking.customer.name}</span>
                                <span className="text-neutral-400">({booking.customer.email})</span>
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                              <span className="flex items-center gap-1 font-medium text-neutral-800">
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
                              <p className="text-xs text-neutral-600 italic bg-neutral-50 p-2.5 rounded-lg max-w-xl">
                                &ldquo;{booking.message}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-neutral-100">
                            {booking.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  disabled={processingBookingId === booking._id}
                                  onClick={() => handleAcceptBooking(booking._id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                >
                                  {processingBookingId === booking._id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={processingBookingId === booking._id}
                                  onClick={() => handleRejectBooking(booking._id)}
                                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 text-xs"
                                >
                                  {processingBookingId === booking._id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                                    </>
                                  )}
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs font-semibold text-neutral-400">
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

              {/* TAB 3: SUBSCRIPTION */}
              <TabsContent value="subscription" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Free Plan Box */}
                  <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-neutral-900">Free Tier</h3>
                      {!isPremium && (
                        <Badge variant="outline" className="bg-neutral-100 text-neutral-700">
                          Current Plan
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Basic vendor membership to showcase your wedding business.
                    </p>
                    <div className="text-2xl font-bold text-neutral-900">$0</div>
                    <ul className="space-y-2.5 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Max 3 Active Services
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Direct Booking Requests
                      </li>
                      <li className="flex items-center gap-2 text-neutral-400">
                        <XCircle className="w-3.5 h-3.5" /> Unlimited Services
                      </li>
                      <li className="flex items-center gap-2 text-neutral-400">
                        <XCircle className="w-3.5 h-3.5" /> Premium Verified Badge
                      </li>
                    </ul>
                  </div>

                  {/* Premium Plan Box */}
                  <div className="bg-gradient-to-b from-amber-50/50 to-white rounded-2xl p-6 border-2 border-amber-300 shadow-md space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-600" />
                        <h3 className="font-bold text-lg text-neutral-900">Premium Partner</h3>
                      </div>
                      {isPremium && (
                        <Badge className="bg-amber-600 text-white">Active Plan</Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Scale your wedding studio with unlimited catalog listings & premium visibility.
                    </p>
                    <div className="text-3xl font-serif font-bold text-neutral-900">
                      $20 <span className="text-xs text-neutral-500 font-sans">/ one-time</span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-neutral-700 pt-2 border-t border-amber-100">
                      <li className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Publish Unlimited Services
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Premium Verified Partner Badge
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Priority placement in search results
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Direct Client Inquiries
                      </li>
                    </ul>

                    {!isPremium ? (
                      <Button
                        onClick={handleUpgradeToPremium}
                        disabled={isUpgrading}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-md mt-4"
                      >
                        {isUpgrading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Redirecting to Stripe...
                          </>
                        ) : (
                          "Upgrade to Premium Now ($20)"
                        )}
                      </Button>
                    ) : (
                      <div className="p-3 bg-amber-100/50 rounded-xl text-xs text-amber-900 font-medium text-center">
                        You are enjoying all Premium Partner privileges!
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Add Service Modal */}
        {isAddingService && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-neutral-100 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-serif text-xl font-bold text-neutral-900">
                  Publish Wedding Service
                </h3>
                <button
                  onClick={() => setIsAddingService(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateService} className="space-y-4">
                <div>
                  <Label htmlFor="srv-name" className="text-xs font-medium text-neutral-700">
                    Service / Package Name
                  </Label>
                  <Input
                    id="srv-name"
                    required
                    placeholder="e.g. Fairytale Castle Ballroom & Catering"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="mt-1 text-sm border-neutral-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="srv-cat" className="text-xs font-medium text-neutral-700">
                      Category
                    </Label>
                    <select
                      id="srv-cat"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-3 mt-1 rounded-md border border-neutral-200 bg-white text-xs text-neutral-800"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="srv-price" className="text-xs font-medium text-neutral-700">
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
                      className="mt-1 text-sm border-neutral-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="srv-loc" className="text-xs font-medium text-neutral-700">
                    Service Location
                  </Label>
                  <Input
                    id="srv-loc"
                    required
                    placeholder="e.g. Austin, TX & Hill Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 text-sm border-neutral-200"
                  />
                </div>

                <div>
                  <Label htmlFor="srv-desc" className="text-xs font-medium text-neutral-700">
                    Description & Offerings
                  </Label>
                  <Textarea
                    id="srv-desc"
                    required
                    rows={4}
                    placeholder="Detail everything included in this package (hours, staff, equipment, deliverables)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 text-sm border-neutral-200"
                  />
                </div>

                <div>
                  <Label htmlFor="srv-imgs" className="text-xs font-medium text-neutral-700">
                    Showcase Images (Upload files to ImgBB)
                  </Label>
                  <Input
                    id="srv-imgs"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="mt-1 text-xs cursor-pointer file:cursor-pointer"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Select up to 5 photos showcasing your wedding work.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingService(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingService}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
                  >
                    {submittingService ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
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
        {/* Edit Service Modal */}
        {editingService && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-neutral-100 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="font-serif text-xl font-bold text-neutral-900">
                  Update Service Package
                </h3>
                <button
                  onClick={() => setEditingService(null)}
                  className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateService} className="space-y-4">
                <div>
                  <Label htmlFor="edit-srv-name" className="text-xs font-medium text-neutral-700">
                    Service Name
                  </Label>
                  <Input
                    id="edit-srv-name"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 text-sm border-neutral-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-srv-cat" className="text-xs font-medium text-neutral-700">
                      Category
                    </Label>
                    <select
                      id="edit-srv-cat"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full h-10 px-3 mt-1 rounded-md border border-neutral-200 bg-white text-xs text-neutral-800"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="edit-srv-price" className="text-xs font-medium text-neutral-700">
                      Price ($ USD)
                    </Label>
                    <Input
                      id="edit-srv-price"
                      type="number"
                      required
                      min={1}
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="mt-1 text-sm border-neutral-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-srv-loc" className="text-xs font-medium text-neutral-700">
                    Location
                  </Label>
                  <Input
                    id="edit-srv-loc"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="mt-1 text-sm border-neutral-200"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-srv-desc" className="text-xs font-medium text-neutral-700">
                    Description & Offerings
                  </Label>
                  <Textarea
                    id="edit-srv-desc"
                    required
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="mt-1 text-sm border-neutral-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingService(null)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingEdit}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
                  >
                    {savingEdit ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
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
