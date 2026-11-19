"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldCheck,
  Users,
  Store,
  Layers,
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  Ban,
  Unlock,
} from "lucide-react";
import { User, Service, Transaction } from "@/types";

interface AdminOverview {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalServices: number;
  pendingServices: number;
  totalTransactions: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("all");

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const currentUser = session?.user as { role?: string; name?: string } | undefined;

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, usrRes, srvRes, txRes] = await Promise.all([
        fetchApi<{ success: boolean; overview: AdminOverview }>("/admin/overview"),
        fetchApi<{ success: boolean; users: User[] }>("/admin/users"),
        fetchApi<{ success: boolean; services: Service[] }>("/admin/services"),
        fetchApi<{ success: boolean; transactions: Transaction[] }>("/admin/transactions"),
      ]);

      setOverview(ovRes.overview);
      setUsers(usrRes.users || []);
      setServices(srvRes.services || []);
      setTransactions(txRes.transactions || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load admin controls";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionPending) {
      if (!session) {
        router.replace("/sign-in?callbackUrl=/dashboard/admin");
        return;
      }

      if (currentUser?.role !== "admin") {
        toast.error("Access restricted: Administrator role required");
        router.replace(currentUser?.role ? `/dashboard/${currentUser.role}` : "/dashboard");
        return;
      }

      loadAdminData();
    }
  }, [session, sessionPending, currentUser, router, loadAdminData]);

  const handleBlockUser = async (userId: string) => {
    setActionLoadingId(userId);
    try {
      await fetchApi(`/admin/users/${userId}/block`, { method: "PATCH" });
      toast.success("User account blocked");
      loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to block user";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    setActionLoadingId(userId);
    try {
      await fetchApi(`/admin/users/${userId}/unblock`, { method: "PATCH" });
      toast.success("User account unblocked");
      loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to unblock user";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveService = async (serviceId: string) => {
    setActionLoadingId(serviceId);
    try {
      await fetchApi(`/admin/services/${serviceId}/approve`, { method: "PATCH" });
      toast.success("Service approved & published");
      loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve service";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectService = async (serviceId: string) => {
    setActionLoadingId(serviceId);
    try {
      await fetchApi(`/admin/services/${serviceId}/reject`, { method: "PATCH" });
      toast.success("Service rejected");
      loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject service";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to permanently delete this service as administrator?"))
      return;

    setActionLoadingId(serviceId);
    try {
      await fetchApi(`/admin/services/${serviceId}`, { method: "DELETE" });
      toast.success("Service deleted");
      loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete service";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredServices = services.filter((s) => {
    if (serviceStatusFilter === "all") return true;
    return s.status === serviceStatusFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-rose-700 border-rose-300 bg-rose-50">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> System Administration
              </Badge>
            </div>
            <h1 className="font-serif text-3xl font-bold text-neutral-900 mt-2">
              WedPlan Management Console
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Review published wedding services, manage user accounts, and inspect platform transactions.
            </p>
          </div>
        </div>

        {loading || sessionPending ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-sm font-medium">Loading administrative records...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Total Users
                </span>
                <p className="text-2xl font-bold text-neutral-900">{overview?.totalUsers ?? 0}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Vendors
                </span>
                <p className="text-2xl font-bold text-amber-600">{overview?.totalVendors ?? 0}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Customers
                </span>
                <p className="text-2xl font-bold text-pink-600">{overview?.totalCustomers ?? 0}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Total Services
                </span>
                <p className="text-2xl font-bold text-neutral-900">{overview?.totalServices ?? 0}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Pending Reviews
                </span>
                <p className="text-2xl font-bold text-rose-600">{overview?.pendingServices ?? 0}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                  Transactions
                </span>
                <p className="text-2xl font-bold text-emerald-600">{overview?.totalTransactions ?? 0}</p>
              </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="services" className="space-y-6">
              <TabsList className="bg-white border border-neutral-200 p-1 rounded-xl">
                <TabsTrigger value="services" className="text-xs font-semibold">
                  <Layers className="w-3.5 h-3.5 mr-1.5" />
                  Services Moderation ({overview?.pendingServices ? `${overview.pendingServices} Pending` : services.length})
                </TabsTrigger>
                <TabsTrigger value="users" className="text-xs font-semibold">
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  Users Directory ({users.length})
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs font-semibold">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  Stripe Transactions ({transactions.length})
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: SERVICES MODERATION */}
              <TabsContent value="services" className="space-y-4">
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-neutral-900">Services Review Queue</h2>
                      <p className="text-xs text-neutral-500">
                        Approve or reject vendor offerings before they are visible to customers.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={serviceStatusFilter}
                        onChange={(e) => setServiceStatusFilter(e.target.value)}
                        className="h-9 px-3 rounded-md border border-neutral-200 bg-white text-xs font-medium text-neutral-700 cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {filteredServices.length === 0 ? (
                    <div className="py-16 text-center p-6 space-y-2">
                      <Layers className="w-10 h-10 text-neutral-300 mx-auto" />
                      <p className="text-sm font-medium text-neutral-700">No services match the filter</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {filteredServices.map((service) => (
                        <div
                          key={service._id}
                          className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-neutral-50/50 transition-colors"
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
                                <Badge variant="outline" className="text-[10px]">
                                  {service.category}
                                </Badge>
                                <span className="font-bold text-neutral-900 text-xs">
                                  ${service.price.toLocaleString()}
                                </span>
                              </div>

                              {service.vendor && (
                                <p className="text-xs text-neutral-600 flex items-center gap-1.5">
                                  <Store className="w-3.5 h-3.5 text-neutral-400" />
                                  <span>
                                    Vendor: <strong>{service.vendor.businessName || service.vendor.name}</strong> ({service.vendor.email})
                                  </span>
                                </p>
                              )}

                              <p className="text-xs text-neutral-500 line-clamp-2 max-w-2xl">
                                {service.description}
                              </p>

                              <div className="flex items-center gap-2 pt-1">
                                {service.status === "approved" && (
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    Approved
                                  </span>
                                )}
                                {service.status === "pending" && (
                                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    Pending Review
                                  </span>
                                )}
                                {service.status === "rejected" && (
                                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                    Rejected
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-neutral-100">
                            {service.status !== "approved" && (
                              <Button
                                size="sm"
                                disabled={actionLoadingId === service._id}
                                onClick={() => handleApproveService(service._id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              >
                                {actionLoadingId === service._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                  </>
                                )}
                              </Button>
                            )}

                            {service.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoadingId === service._id}
                                onClick={() => handleRejectService(service._id)}
                                className="text-amber-700 hover:bg-amber-50 border-amber-200 text-xs"
                              >
                                {actionLoadingId === service._id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                  </>
                                )}
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={actionLoadingId === service._id}
                              onClick={() => handleDeleteService(service._id)}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs"
                              title="Delete service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 2: USER MANAGEMENT */}
              <TabsContent value="users" className="space-y-4">
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-neutral-900">Registered Accounts</h2>
                      <p className="text-xs text-neutral-500">
                        Search and moderate customer and vendor access.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative w-64">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                        <Input
                          placeholder="Search name or email..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-9 h-9 text-xs border-neutral-200"
                        />
                      </div>

                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="h-9 px-3 rounded-md border border-neutral-200 bg-white text-xs font-medium text-neutral-700 cursor-pointer"
                      >
                        <option value="all">All Roles</option>
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id || u._id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-neutral-900">{u.name}</h4>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {u.role}
                            </Badge>
                            {u.isBlocked ? (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.2 rounded">
                                Blocked
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">{u.email}</p>
                          {u.businessName && (
                            <p className="text-xs text-neutral-600">
                              Studio: <strong>{u.businessName}</strong>
                            </p>
                          )}
                        </div>

                        {u.role !== "admin" && (
                          <div className="flex items-center gap-2">
                            {u.isBlocked ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoadingId === (u.id || u._id)}
                                onClick={() => handleUnblockUser((u.id || u._id)!)}
                                className="text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                              >
                                <Unlock className="w-3.5 h-3.5 mr-1" /> Unblock Account
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoadingId === (u.id || u._id)}
                                onClick={() => handleBlockUser((u.id || u._id)!)}
                                className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
                              >
                                <Ban className="w-3.5 h-3.5 mr-1" /> Block Account
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: TRANSACTIONS */}
              <TabsContent value="transactions" className="space-y-4">
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-neutral-100">
                    <h2 className="text-base font-bold text-neutral-900">Platform Payments</h2>
                    <p className="text-xs text-neutral-500">
                      Verified vendor subscriptions processed through Stripe Checkout.
                    </p>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="py-16 text-center p-6 space-y-2">
                      <CreditCard className="w-10 h-10 text-neutral-300 mx-auto" />
                      <p className="text-sm font-medium text-neutral-700">No transactions recorded yet</p>
                      <p className="text-xs text-neutral-400">
                        When vendors upgrade to Premium via Stripe, completed orders appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {transactions.map((tx) => (
                        <div
                          key={tx._id}
                          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm text-neutral-900">
                                {tx.vendor?.businessName || tx.vendor?.name || "Vendor Studio"}
                              </h4>
                              <Badge className="bg-emerald-600 text-white text-[10px]">
                                {tx.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-xs text-neutral-500">
                              Vendor: {tx.vendor?.email || "Unknown"}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-mono">
                              Session ID: {tx.stripeSessionId}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-bold text-neutral-900">
                              ${tx.amount.toFixed(2)}
                            </span>
                            <span className="text-xs text-neutral-400 block">
                              {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                dateStyle: "medium",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
