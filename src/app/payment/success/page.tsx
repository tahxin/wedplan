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
    // Session guard - redirect unauthenticated users immediately
    if (!session) {
      router.replace("/sign-in?callbackUrl=%2Fpayment%2Fsuccess");
      return;
    }

    let isCancelled = false;

    const verifyPayment = async () => {
      // Direct confirmation if sessionId present
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

      // Poll /me endpoint for webhook update
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
    <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-rose-100 shadow-xl shadow-rose-100/50 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
        <Crown className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold text-neutral-900">
          Payment Confirmed!
        </h1>
        <p className="text-sm text-neutral-500">
          Thank you for upgrading your wedding vendor membership.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-600 space-y-2">
        {checking ? (
          <div className="flex items-center justify-center gap-2 text-amber-700 font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Stripe checkout session...</span>
          </div>
        ) : isPremium ? (
          <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Your Premium Membership is Now Active!</span>
          </div>
        ) : (
          <div className="text-neutral-500">
            Payment received. Your subscription privileges will reflect shortly as Stripe webhook processing completes.
          </div>
        )}
      </div>

      <div className="pt-2 flex flex-col gap-2">
        <Link href="/dashboard/vendor">
          <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium">
            <Sparkles className="w-4 h-4 mr-2" /> Return to Vendor Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-rose-100 shadow-xl shadow-rose-100/50 text-center flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-sm text-neutral-500">Loading payment details...</p>
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