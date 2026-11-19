"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-neutral-100 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-neutral-900">
            Something went wrong
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {error.message || "An unexpected error occurred while loading this page."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="text-xs">
              <Home className="w-3.5 h-3.5 mr-1.5" /> Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
