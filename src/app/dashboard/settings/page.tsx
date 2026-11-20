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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 rounded-[2rem] border border-border/60 bg-card/60 p-8 shadow-sm backdrop-blur-xl sm:p-10">
          <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className="capitalize border-primary/20 bg-primary/5 text-primary">
                  {role === "admin" && <ShieldCheck className="mr-1 h-3.5 w-3.5" />}
                  {role === "vendor" && <Store className="mr-1 h-3.5 w-3.5" />}
                  {role === "customer" && <Heart className="mr-1 h-3.5 w-3.5" />}
                  {role} Account
                </Badge>
              </div>
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground">
                Profile Settings
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your public personal profile and business identity.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/40 text-muted-foreground ring-1 ring-primary/10">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8" />
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avatar-file" className="text-sm font-medium text-foreground">
                  Profile Photo
                </Label>
                <Input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="h-10 cursor-pointer rounded-xl border-border/70 bg-background/70 text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium"
                />
                <p className="text-xs text-muted-foreground">JPG, PNG or WEBP under 5MB.</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Email Address (Read-only)</Label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  disabled
                  value={user?.email || ""}
                  className="h-11 rounded-xl border-border/70 bg-muted/40 pl-10 text-sm text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="prof-name" className="text-sm font-medium text-foreground">
                Full Name
              </Label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="prof-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl border-border/70 bg-background/70 pl-10 text-sm"
                />
              </div>
            </div>

            {role === "vendor" && (
              <div>
                <Label htmlFor="prof-biz" className="text-sm font-medium text-foreground">
                  Studio / Business Name
                </Label>
                <div className="relative mt-1.5">
                  <Briefcase className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="prof-biz"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Celestial Bridal Studios"
                    className="h-11 rounded-xl border-border/70 bg-background/70 pl-10 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-11 rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
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
