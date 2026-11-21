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
import { Loader2 } from "lucide-react";
import { Calendar, Clock, CheckCircle2, XCircle, Heart, Store } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
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


  const user = session?.user as { role?: string; name?: string } | undefined;

  const [activeTab, setActiveTab] = useState<"overview">("overview");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes] = await Promise.all([
        fetchApi<{ success: boolean; overview: CustomerOverview }>("/customer/overview"),
      ]);

      setOverview(overviewRes.overview);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionPending) {
      return;
    }
    
    if (!session) {
      router.replace("/sign-in?callbackUrl=/dashboard/customer");
      return;
    }

    if (user?.role && user.role !== "customer") {
      router.replace(`/dashboard/${user.role}`);
      return;
    }

    loadData();
  }, [session, sessionPending, user, router, loadData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "bookings") {
      setActiveTab("overview");
    }
  }, []);

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
            <p className="text-sm font-medium">Loading your dashboard...</p>
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
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
