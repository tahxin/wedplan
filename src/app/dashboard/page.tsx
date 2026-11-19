"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, getSession } from "@/lib/auth-client";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let active = true;

    const navigateRole = (role?: string) => {
      const targetRole = role || "customer";
      if (targetRole === "admin") {
        router.replace("/dashboard/admin");
      } else if (targetRole === "vendor") {
        router.replace("/dashboard/vendor");
      } else {
        router.replace("/dashboard/customer");
      }
    };

    // 1. If useSession resolved with user
    if (!isPending && session?.user) {
      navigateRole((session.user as { role?: string }).role);
      return;
    }

    // 2. Active probe via getSession()
    getSession()
      .then((res) => {
        if (!active) return;
        if (res?.data?.user) {
          navigateRole((res.data.user as { role?: string }).role);
        } else if (!isPending && !session) {
          router.replace("/sign-in?callbackUrl=/dashboard");
        }
      })
      .catch(() => {
        if (!active) return;
        if (!isPending && !session) {
          router.replace("/sign-in?callbackUrl=/dashboard");
        }
      });

    // 3. Fallback timer in case network / cookies hang
    const timer = setTimeout(() => {
      if (active) {
        setTimedOut(true);
      }
    }, 2500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm border border-rose-100">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        
        <div>
          <h2 className="text-lg font-serif font-bold text-neutral-900">
            {timedOut ? "Taking a moment..." : "Opening Your Dashboard"}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {timedOut
              ? "We're having trouble retrieving your active session. You can choose your destination below or sign in again."
              : "Verifying your credentials and directing you to your workspace..."}
          </p>
        </div>

        {!timedOut ? (
          <div className="flex items-center gap-2 text-rose-600 text-xs font-medium bg-rose-50/60 px-3 py-1.5 rounded-full border border-rose-100">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading workspace...</span>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2 mt-2">
            <Button
              onClick={() => router.replace("/dashboard/admin")}
              variant="outline"
              className="w-full justify-between text-xs"
            >
              <span>Admin Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </Button>
            <Button
              onClick={() => router.replace("/dashboard/vendor")}
              variant="outline"
              className="w-full justify-between text-xs"
            >
              <span>Vendor Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </Button>
            <Button
              onClick={() => router.replace("/dashboard/customer")}
              variant="outline"
              className="w-full justify-between text-xs"
            >
              <span>Customer Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </Button>
            <Button
              onClick={() => router.replace("/sign-in")}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs mt-2"
            >
              Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
