"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { clearAuthTokenCache } from "@/lib/api";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Loader2 } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect");
  const isBlocked = searchParams.get("blocked") === "1";

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

      clearAuthTokenCache();
      toast.success("Welcome back!");

      const user = (res.data as { user?: { role?: string } })?.user;
      const role = user?.role || "customer";

      const isSafeCallback =
        !!callbackUrl &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("//");
      const blockedTargets = ["/sign-in", "/sign-up"];
      if (isSafeCallback && !blockedTargets.some((t) => callbackUrl === t || callbackUrl.startsWith(`${t}?`))) {
        if (callbackUrl === "/dashboard") {
          router.push(`/dashboard/${role}`);
        } else {
          router.push(callbackUrl);
        }
      } else {
        router.push(`/dashboard/${role}`);
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
      const isSafeCallback =
        !!callbackUrl &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("//");
      const blockedTargets = ["/sign-in", "/sign-up"];
      const oauthCallback =
        isSafeCallback && !blockedTargets.some((t) => callbackUrl === t || callbackUrl.startsWith(`${t}?`))
          ? callbackUrl
          : "/dashboard";

      await signIn.social({
        provider: "google",
        callbackURL: oauthCallback,
      });
    } catch {
      toast.error("Google sign in failed");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="relative flex flex-1 items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(225,29,72,0.1),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(251,191,36,0.12),transparent_28%)]" />
        <div className="w-full max-w-md rounded-[2rem] border border-border/60 bg-card/70 p-8 shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-10">
          <div className="mb-8 space-y-3 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <LogoMark className="h-7 w-7" />
            </div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground">
              Welcome Back
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sign in to manage your bookings, services, and wedding plans.
            </p>
          </div>

          {isBlocked && (
            <div className="mb-6 rounded-2xl border border-rose-200/70 bg-rose-50/80 p-4 text-center text-sm font-medium text-rose-800">
              Your account is blocked. Please contact support.
            </div>
          )}

          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              disabled={isGoogleLoading || isLoading}
              onClick={handleGoogleSignIn}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border-border/70 bg-background/70 font-medium text-foreground hover:bg-background"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.14em]">
                <span className="bg-card/70 px-3 text-muted-foreground">or sign in with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-border/70 bg-background/70 pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-border/70 bg-background/70 pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-6 h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={callbackUrl ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-up"}
              className="font-semibold text-primary hover:text-primary/80"
            >
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
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
