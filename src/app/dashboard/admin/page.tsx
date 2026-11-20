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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 space-y-2">
          <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 px-3 py-1 text-primary">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> System Administration
          </Badge>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            WedPlan Management Console
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Review published wedding services, manage user accounts, and inspect platform transactions.
          </p>
        </div>

        {loading || sessionPending ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading administrative records...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Total Users</span>
                <p className="text-2xl font-semibold text-foreground">{overview?.totalUsers ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Vendors</span>
                <p className="text-2xl font-semibold text-amber-700">{overview?.totalVendors ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Customers</span>
                <p className="text-2xl font-semibold text-primary">{overview?.totalCustomers ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Total Services</span>
                <p className="text-2xl font-semibold text-foreground">{overview?.totalServices ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Pending Reviews</span>
                <p className="text-2xl font-semibold text-rose-700">{overview?.pendingServices ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Transactions</span>
                <p className="text-2xl font-semibold text-emerald-700">{overview?.totalTransactions ?? 0}</p>
              </div>
            </div>

            <Tabs defaultValue="services" className="space-y-6">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1.5 rounded-2xl border border-border/60 bg-card/50 p-1.5 shadow-sm backdrop-blur-sm sm:w-fit">
                <TabsTrigger value="services" className="rounded-xl px-4 py-2 text-xs font-semibold sm:text-sm">
                  <Layers className="mr-1.5 h-3.5 w-3.5" />
                  Services Moderation ({overview?.pendingServices ? `${overview.pendingServices} Pending` : services.length})
                </TabsTrigger>
                <TabsTrigger value="users" className="rounded-xl px-4 py-2 text-xs font-semibold sm:text-sm">
                  <Users className="mr-1.5 h-3.5 w-3.5" />
                  Users Directory ({users.length})
                </TabsTrigger>
                <TabsTrigger value="transactions" className="rounded-xl px-4 py-2 text-xs font-semibold sm:text-sm">
                  <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                  Stripe Transactions ({transactions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 shadow-sm backdrop-blur-sm">
                  <div className="flex flex-col justify-between gap-4 border-b border-border/60 p-6 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Services Review Queue</h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Approve or reject vendor offerings before they are visible to customers.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={serviceStatusFilter}
                        onChange={(e) => setServiceStatusFilter(e.target.value)}
                        className="h-10 cursor-pointer rounded-xl border border-border/70 bg-background/70 px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {filteredServices.length === 0 ? (
                    <div className="space-y-2 p-10 text-center sm:p-14">
                      <Layers className="mx-auto h-10 w-10 text-primary/35" />
                      <p className="text-sm font-medium text-foreground">No services match the filter</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {filteredServices.map((service) => (
                        <div
                          key={service._id}
                          className="flex flex-col justify-between gap-5 p-6 transition-colors hover:bg-background/40 lg:flex-row lg:items-center"
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
                                <span className="text-sm font-semibold text-foreground">${service.price.toLocaleString()}</span>
                              </div>

                              {service.vendor && (
                                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Store className="h-3.5 w-3.5" />
                                  <span>
                                    Vendor: <span className="font-medium text-foreground/85">{service.vendor.businessName || service.vendor.name}</span> ({service.vendor.email})
                                  </span>
                                </p>
                              )}

                              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground line-clamp-2">
                                {service.description}
                              </p>

                              <div className="flex items-center gap-2 pt-0.5">
                                {service.status === "approved" && (
                                  <span className="inline-flex rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                    Approved
                                  </span>
                                )}
                                {service.status === "pending" && (
                                  <span className="inline-flex rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                                    Pending Review
                                  </span>
                                )}
                                {service.status === "rejected" && (
                                  <span className="inline-flex rounded-full border border-rose-200/70 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                                    Rejected
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex w-full flex-wrap items-center justify-end gap-2 border-t border-border/50 pt-4 lg:w-auto lg:border-t-0 lg:pt-0">
                            {service.status !== "approved" && (
                              <Button
                                size="sm"
                                disabled={actionLoadingId === service._id}
                                onClick={() => handleApproveService(service._id)}
                                className="rounded-xl bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                              >
                                {actionLoadingId === service._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
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
                                className="rounded-xl border-amber-200/70 text-xs text-amber-800 hover:bg-amber-50"
                              >
                                {actionLoadingId === service._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                                  </>
                                )}
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={actionLoadingId === service._id}
                              onClick={() => handleDeleteService(service._id)}
                              className="rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                              title="Delete service"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 shadow-sm backdrop-blur-sm">
                  <div className="flex flex-col justify-between gap-4 border-b border-border/60 p-6 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Registered Accounts</h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">Search and moderate customer and vendor access.</p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search name or email..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="h-10 rounded-xl border-border/70 bg-background/70 pl-9 text-sm"
                        />
                      </div>

                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="h-10 cursor-pointer rounded-xl border border-border/70 bg-background/70 px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="all">All Roles</option>
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="divide-y divide-border/50">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id || u._id}
                        className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-background/40 sm:flex-row sm:items-center"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-semibold text-foreground">{u.name}</h4>
                            <Badge variant="outline" className="text-[10px] capitalize border-border/70 text-muted-foreground">
                              {u.role}
                            </Badge>
                            {u.isBlocked ? (
                              <span className="inline-flex rounded-full border border-rose-200/70 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                                Blocked
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          {u.businessName && (
                            <p className="text-sm text-muted-foreground">
                              Studio: <span className="font-medium text-foreground/85">{u.businessName}</span>
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
                                className="rounded-xl border-emerald-200/70 text-xs text-emerald-700 hover:bg-emerald-50"
                              >
                                <Unlock className="mr-1 h-3.5 w-3.5" /> Unblock Account
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoadingId === (u.id || u._id)}
                                onClick={() => handleBlockUser((u.id || u._id)!)}
                                className="rounded-xl border-rose-200/70 text-xs text-rose-700 hover:bg-rose-50"
                              >
                                <Ban className="mr-1 h-3.5 w-3.5" /> Block Account
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 shadow-sm backdrop-blur-sm">
                  <div className="border-b border-border/60 p-6">
                    <h2 className="text-xl font-semibold text-foreground">Platform Payments</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Verified vendor subscriptions processed through Stripe Checkout.
                    </p>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="space-y-2 p-10 text-center sm:p-14">
                      <CreditCard className="mx-auto h-10 w-10 text-primary/35" />
                      <p className="text-sm font-medium text-foreground">No transactions recorded yet</p>
                      <p className="text-sm text-muted-foreground">
                        When vendors upgrade to Premium via Stripe, completed orders appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {transactions.map((tx) => (
                        <div
                          key={tx._id}
                          className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-background/40 sm:flex-row sm:items-center"
                        >
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold text-foreground">
                                {tx.vendor?.businessName || tx.vendor?.name || "Vendor Studio"}
                              </h4>
                              <Badge className="bg-emerald-600 text-[10px] text-white hover:bg-emerald-600">
                                {tx.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Vendor: {tx.vendor?.email || "Unknown"}</p>
                            <p className="font-mono text-xs text-muted-foreground">Session ID: {tx.stripeSessionId}</p>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-xl font-semibold text-foreground">${tx.amount.toFixed(2)}</span>
                            <span className="block text-sm text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
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
