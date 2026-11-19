"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Lock, Mail, Loader2 } from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.error) {
        toast.error(res.error.message || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back!");

      // If user had an intended return URL, send them there; otherwise /dashboard
      if (callbackUrl && callbackUrl.startsWith("/")) {
        router.push(callbackUrl);
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl || "/dashboard",
      });
    } catch {
      toast.error("Google sign in failed");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-rose-100/40 border border-rose-100/60 p-8 sm:p-10">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900">
              Welcome Back
            </h1>
            <p className="text-sm text-neutral-500">
              Sign in to manage your bookings or wedding services.
            </p>
          </div>

          {/* Social Sign In */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              disabled={isGoogleLoading || isLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 h-11 border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-medium"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-neutral-400">or sign in with email</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-neutral-700">
                Email Address
              </Label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 border-neutral-200 focus-visible:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-medium text-neutral-700">
                Password
              </Label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-10 border-neutral-200 focus-visible:ring-rose-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-md shadow-rose-200 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-semibold text-rose-600 hover:text-rose-700">
              Sign Up
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50/50">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
