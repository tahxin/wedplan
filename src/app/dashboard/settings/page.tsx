"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { fetchApi } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/upload";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Briefcase,
  Loader2,
  Save,
  ShieldCheck,
  Store,
  Heart,
} from "lucide-react";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const user = session?.user as
    | {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        role?: "customer" | "vendor" | "admin";
        businessName?: string;
      }
    | undefined;

  useEffect(() => {
    if (!sessionPending) {
      if (!session) {
        router.replace("/sign-in?callbackUrl=/dashboard/settings");
        return;
      }

      if (user) {
        setName(user.name || "");
        setBusinessName(user.businessName || "");
        setImagePreview(user.image || null);
      }
    }
  }, [session, sessionPending, router, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalImageUrl = imagePreview || "";
      if (imageFile) {
        try {
          toast.info("Uploading new profile photo...");
          finalImageUrl = await uploadImageToImgBB(imageFile);
        } catch {
          toast.warning("Failed to upload image to ImgBB, keeping previous");
        }
      }

      await fetchApi("/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          businessName: businessName.trim(),
          image: finalImageUrl,
        }),
      });

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const role = user?.role || "customer";

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className="capitalize text-xs">
                  {role === "admin" && <ShieldCheck className="w-3.5 h-3.5 mr-1 text-rose-500" />}
                  {role === "vendor" && <Store className="w-3.5 h-3.5 mr-1 text-amber-500" />}
                  {role === "customer" && <Heart className="w-3.5 h-3.5 mr-1 text-pink-500" />}
                  {role} Account
                </Badge>
              </div>
              <h1 className="font-serif text-3xl font-bold text-neutral-900">
                Profile Settings
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Manage your public personal profile and business identity.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar upload */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 border-2 border-rose-100 shadow-xs shrink-0 flex items-center justify-center text-neutral-400">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avatar-file" className="text-xs font-semibold text-neutral-700">
                  Profile Photo
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="avatar-file"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs h-9 cursor-pointer file:cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">JPG, PNG or WEBP under 5MB.</p>
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <Label className="text-xs font-medium text-neutral-700">Email Address (Read-only)</Label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <Input
                  disabled
                  value={user?.email || ""}
                  className="pl-10 h-10 bg-neutral-50 text-neutral-500 border-neutral-200 text-sm"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="prof-name" className="text-xs font-medium text-neutral-700">
                Full Name
              </Label>
              <div className="relative mt-1">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <Input
                  id="prof-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-10 border-neutral-200 text-sm focus-visible:ring-rose-500"
                />
              </div>
            </div>

            {/* Business name (Vendor only) */}
            {role === "vendor" && (
              <div>
                <Label htmlFor="prof-biz" className="text-xs font-medium text-neutral-700">
                  Studio / Business Name
                </Label>
                <div className="relative mt-1">
                  <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <Input
                    id="prof-biz"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Celestial Bridal Studios"
                    className="pl-10 h-10 border-neutral-200 text-sm focus-visible:ring-rose-500"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-6 h-10 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
