"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.replace("/sign-in?callbackUrl=/dashboard");
      } else {
        const user = session.user as { role?: string };
        const role = user?.role || "customer";

        if (role === "admin") {
          router.replace("/dashboard/admin");
        } else if (role === "vendor") {
          router.replace("/dashboard/vendor");
        } else {
          router.replace("/dashboard/customer");
        }
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-3 text-neutral-500">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
        <p className="text-sm font-medium">Loading your WedPlan dashboard...</p>
      </div>
    </div>
  );
}
