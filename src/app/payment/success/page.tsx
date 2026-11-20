"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown, Loader2, Sparkles } from "lucide-react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { data: session } = useSession();

  const [checking, setChecking] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  let interval: ReturnType<typeof setInterval> | null = null;

  useEffect(() => {
    if (!session) {
      router.replace("/sign-in?callbackUrl=%2Fpayment%2Fsuccess");
      return;
    }

    let isCancelled = false;

    const verifyPayment = async () => {
      if (sessionId) {
        try {
          const confirmRes = await fetchApi<{ success: boolean; plan: string }>(
            "/payments/confirm-session",
            { method: "POST", body: JSON.stringify({ sessionId }) }
          );
          if (confirmRes.success && !isCancelled) {
            setIsPremium(true);
            setChecking(false);
            return;
          }
        } catch {
          // Fall through to polling
        }
      }

      let attempts = 0;
      interval = setInterval(async () => {
        attempts++;
        if (isCancelled) return;

        try {
          const res = await fetchApi<{ user: { subscriptionPlan: string } }>("/me");
          if (res.user?.subscriptionPlan === "premium" && !isCancelled) {
            setIsPremium(true);
            setChecking(false);
            if (interval) clearInterval(interval);
          }
        } catch {
          // Retry
        }

        if (attempts >= 10 && !isCancelled) {
          setChecking(false);
          if (interval) clearInterval(interval);
        }
      }, 2000);
    };

    verifyPayment();

    return () => {
      isCancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [sessionId, session, router]);

  return (
    <div className="w-full max-w-md space-y-6 rounded-[2rem] border border-border/60 bg-card/70 p-8 text-center shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-700 ring-1 ring-amber-200/70">
        <Crown className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground">
          Payment Confirmed!
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Thank you for upgrading your wedding vendor membership.
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
        {checking ? (
          <div className="flex items-center justify-center gap-2 font-medium text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying Stripe checkout session...</span>
          </div>
        ) : isPremium ? (
          <div className="flex items-center justify-center gap-2 font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <span>Your Premium Membership is Now Active!</span>
          </div>
        ) : (
          <div>
            Payment received. Your subscription privileges will reflect shortly as Stripe webhook processing completes.
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link href="/dashboard/vendor">
          <Button className="w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
            <Sparkles className="mr-2 h-4 w-4" /> Return to Vendor Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex w-full max-w-md flex-col items-center justify-center space-y-4 rounded-[2rem] border border-border/60 bg-card/70 p-8 text-center shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading payment details...</p>
            </div>
          }
        >
          <PaymentSuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}