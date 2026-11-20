"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import { clearAuthTokenCache } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/upload";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Heart,
  Store,
  Upload,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect");

  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error(
        "Password must be at least 6 characters with at least one uppercase and one lowercase letter"
      );
      return;
    }

    if (role === "vendor" && !businessName.trim()) {
      toast.error("Please provide your business name");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        try {
          imageUrl = await uploadImageToImgBB(imageFile);
        } catch (uploadErr) {
          console.warn("Image upload failed, proceeding without profile image:", uploadErr);
          toast.warning("Profile photo upload failed, but continuing sign-up...");
        }
      }

      const res = await signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        image: imageUrl || undefined,
        role,
        businessName: role === "vendor" ? businessName.trim() : undefined,
      } as any);

      if (res.error) {
        toast.error(res.error.message || "Failed to create account");
        setIsLoading(false);
        return;
      }

      clearAuthTokenCache();
      toast.success("Account created successfully! Welcome to WedPlan.");
      const defaultDestination = role === "vendor" ? "/dashboard/vendor" : "/dashboard/customer";
      const isSafeCallback =
        !!callbackUrl &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("//");
      const blockedTargets = ["/sign-in", "/sign-up"];
      if (isSafeCallback && !blockedTargets.some((t) => callbackUrl === t || callbackUrl.startsWith(`${t}?`))) {
        if (callbackUrl === "/dashboard") {
          router.push(defaultDestination);
        } else {
          router.push(callbackUrl);
        }
      } else {
        router.push(defaultDestination);
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign up failed";
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const defaultDestination = role === "vendor" ? "/dashboard/vendor" : "/dashboard/customer";
      const isSafeCallback =
        !!callbackUrl &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("//");
      const blockedTargets = ["/sign-in", "/sign-up"];
      const oauthCallback =
        isSafeCallback && !blockedTargets.some((t) => callbackUrl === t || callbackUrl.startsWith(`${t}?`))
          ? callbackUrl
          : defaultDestination;

      await signIn.social({
        provider: "google",
        callbackURL: oauthCallback,
      });
    } catch {
      toast.error("Google sign up failed");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="relative flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(225,29,72,0.1),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(251,191,36,0.12),transparent_28%)]" />
        <div className="w-full max-w-xl rounded-[2rem] border border-border/60 bg-card/70 p-8 shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-10">
          <div className="mb-8 space-y-3 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <LogoMark className="h-7 w-7" />
            </div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground">
              Create Your Account
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Join WedPlan to discover dream wedding services or showcase your business to couples.
            </p>
          </div>

          <div className="mb-6">
            <Label className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              I am joining as a
            </Label>
            <RadioGroup
              value={role}
              onValueChange={(val) => setRole(val as "customer" | "vendor")}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <label
                htmlFor="role-customer"
                className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                  role === "customer"
                    ? "border-primary/40 bg-primary/5 shadow-sm ring-1 ring-primary/10"
                    : "border-border/70 bg-background/50 hover:border-primary/20 hover:bg-background/70"
                }`}
              >
                <RadioGroupItem value="customer" id="role-customer" className="sr-only" />
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${role === "customer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Heart className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Customer</div>
                  <div className="text-xs text-muted-foreground">Plan wedding & book</div>
                </div>
              </label>

              <label
                htmlFor="role-vendor"
                className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                  role === "vendor"
                    ? "border-primary/40 bg-primary/5 shadow-sm ring-1 ring-primary/10"
                    : "border-border/70 bg-background/50 hover:border-primary/20 hover:bg-background/70"
                }`}
              >
                <RadioGroupItem value="vendor" id="role-vendor" className="sr-only" />
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${role === "vendor" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Store className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Vendor</div>
                  <div className="text-xs text-muted-foreground">Offer wedding services</div>
                </div>
              </label>
            </RadioGroup>
          </div>

          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              disabled={isGoogleLoading || isLoading}
              onClick={handleGoogleSignUp}
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
                <span className="bg-card/70 px-3 text-muted-foreground">or sign up with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
              <div className="relative mt-1.5">
                <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" type="text" required placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl border-border/70 bg-background/70 pl-10" />
              </div>
            </div>

            {role === "vendor" && (
              <div>
                <Label htmlFor="businessName" className="text-sm font-medium text-foreground">Business / Studio Name</Label>
                <div className="relative mt-1.5">
                  <Briefcase className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="businessName" type="text" required placeholder="Grand Mirage Weddings" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="h-11 rounded-xl border-border/70 bg-background/70 pl-10" />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" required placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl border-border/70 bg-background/70 pl-10" />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl border-border/70 bg-background/70 pl-10" />
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                <span className={`flex items-center gap-1 ${hasMinLength ? "font-medium text-emerald-600" : "text-muted-foreground"}`}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> 6+ characters
                </span>
                <span className={`flex items-center gap-1 ${hasUppercase ? "font-medium text-emerald-600" : "text-muted-foreground"}`}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> 1 uppercase
                </span>
                <span className={`flex items-center gap-1 ${hasLowercase ? "font-medium text-emerald-600" : "text-muted-foreground"}`}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> 1 lowercase
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="image" className="text-sm font-medium text-foreground">Profile Photo (Optional)</Label>
              <div className="mt-1.5 flex items-center gap-3">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded-xl object-cover ring-2 ring-primary/20" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 text-muted-foreground">
                    <Upload className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="h-10 cursor-pointer rounded-xl border-border/70 bg-background/70 text-xs file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading || !isPasswordValid} className="mt-6 h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"} className="font-semibold text-primary hover:text-primary/80">
              Sign In
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <SignUpContent />
    </Suspense>
  );
}
