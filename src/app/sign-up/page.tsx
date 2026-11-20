"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import { uploadImageToImgBB } from "@/lib/upload";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sparkles,
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

  // Password validation: min 6 chars, at least one uppercase, at least one lowercase
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
        // Role and businessName are handled by the server via additionalFields.
        // We do not pass them here to avoid FIELD_NOT_ALLOWED errors.
      });

      if (res.error) {
        toast.error(res.error.message || "Failed to create account");
        setIsLoading(false);
        return;
      }

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
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-rose-100/40 border border-rose-100/60 p-8 sm:p-10">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900">
              Create Your Account
            </h1>
            <p className="text-sm text-neutral-500">
              Join WedPlan to discover dream services or showcase your wedding business.
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <Label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2.5 block">
              I am joining as a
            </Label>
            <RadioGroup
              value={role}
              onValueChange={(val) => setRole(val as "customer" | "vendor")}
              className="grid grid-cols-2 gap-3"
            >
              <label
                htmlFor="role-customer"
                className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  role === "customer"
                    ? "border-rose-500 bg-rose-50/40 text-rose-900 shadow-sm"
                    : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <RadioGroupItem value="customer" id="role-customer" className="sr-only" />
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    role === "customer" ? "bg-rose-500 text-white" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Customer</div>
                  <div className="text-[11px] text-neutral-500">Plan wedding & book</div>
                </div>
              </label>

              <label
                htmlFor="role-vendor"
                className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  role === "vendor"
                    ? "border-rose-500 bg-rose-50/40 text-rose-900 shadow-sm"
                    : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <RadioGroupItem value="vendor" id="role-vendor" className="sr-only" />
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    role === "vendor" ? "bg-rose-500 text-white" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Vendor</div>
                  <div className="text-[11px] text-neutral-500">Offer wedding services</div>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Social Sign Up */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              disabled={isGoogleLoading || isLoading}
              onClick={handleGoogleSignUp}
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
                <span className="bg-white px-3 text-neutral-400">or sign up with email</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs font-medium text-neutral-700">
                Full Name
              </Label>
              <div className="relative mt-1">
                <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-10 border-neutral-200 focus-visible:ring-rose-500"
                />
              </div>
            </div>

            {role === "vendor" && (
              <div>
                <Label htmlFor="businessName" className="text-xs font-medium text-neutral-700">
                  Business / Studio Name
                </Label>
                <div className="relative mt-1">
                  <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <Input
                    id="businessName"
                    type="text"
                    required
                    placeholder="Grand Mirage Weddings"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="pl-10 h-10 border-neutral-200 focus-visible:ring-rose-500"
                  />
                </div>
              </div>
            )}

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
                  placeholder="jane@example.com"
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

              {/* Password Rule checklist */}
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span
                  className={`flex items-center gap-1 ${
                    hasMinLength ? "text-emerald-600 font-medium" : "text-neutral-400"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> 6+ characters
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    hasUppercase ? "text-emerald-600 font-medium" : "text-neutral-400"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> 1 uppercase
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    hasLowercase ? "text-emerald-600 font-medium" : "text-neutral-400"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> 1 lowercase
                </span>
              </div>
            </div>

            {/* Profile Image (Optional) */}
            <div>
              <Label htmlFor="image" className="text-xs font-medium text-neutral-700">
                Profile Photo (Optional)
              </Label>
              <div className="mt-1 flex items-center gap-3">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-rose-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 border border-dashed border-neutral-300">
                    <Upload className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs h-9 cursor-pointer file:cursor-pointer file:bg-neutral-100 file:border-0 file:rounded-md file:text-xs file:font-medium hover:file:bg-neutral-200"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-md shadow-rose-200 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link
              href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}
              className="font-semibold text-rose-600 hover:text-rose-700"
            >
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50/50">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
