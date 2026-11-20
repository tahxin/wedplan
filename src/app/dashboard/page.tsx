"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, getSession } from "@/lib/auth-client";
import { Loader2, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
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

    if (!isPending && session?.user) {
      navigateRole((session.user as { role?: string }).role);
      return;
    }

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-[2rem] border border-border/60 bg-card/70 p-8 text-center shadow-xl shadow-primary/5 backdrop-blur-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <LogoMark className="h-8 w-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            {timedOut ? "Taking a moment..." : "Opening Your Dashboard"}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {timedOut
              ? "We're having trouble retrieving your active session. You can choose your destination below or sign in again."
              : "Verifying your credentials and directing you to your workspace..."}
          </p>
        </div>

        {!timedOut ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Loading workspace...</span>
          </div>
        ) : (
          <div className="mt-1 flex w-full flex-col gap-2">
            <Button onClick={() => router.replace("/dashboard/admin")} variant="outline" className="w-full justify-between rounded-xl border-border/70 bg-background/60 text-sm">
              <span>Admin Dashboard</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button onClick={() => router.replace("/dashboard/vendor")} variant="outline" className="w-full justify-between rounded-xl border-border/70 bg-background/60 text-sm">
              <span>Vendor Dashboard</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button onClick={() => router.replace("/dashboard/customer")} variant="outline" className="w-full justify-between rounded-xl border-border/70 bg-background/60 text-sm">
              <span>Customer Dashboard</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button onClick={() => router.replace("/sign-in")} className="mt-1 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
