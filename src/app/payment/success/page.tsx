"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown, Loader2, Sparkles } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetchApi<{
          success: boolean;
          user: { subscriptionPlan: string };
        }>("/me");

        if (res.user?.subscriptionPlan === "premium") {
          setIsPremium(true);
          setChecking(false);
          clearInterval(interval);
        }
      } catch {
        // Retry
      }

      if (attempts >= 10) {
        setChecking(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
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
                <span>Synchronizing verified Stripe webhook...</span>
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
      </main>

      <Footer />
    </div>
  );
}
