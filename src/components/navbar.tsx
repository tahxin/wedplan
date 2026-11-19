"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Sparkles,
  Menu,
  X,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Store,
  Heart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = session?.user as
    | {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        role?: "customer" | "vendor" | "admin";
        subscriptionPlan?: "free" | "premium";
      }
    | undefined;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/sign-in");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const role = user?.role || "customer";
  const dashboardHref =
    role === "admin"
      ? "/dashboard/admin"
      : role === "vendor"
      ? "/dashboard/vendor"
      : "/dashboard/customer";

  const getRoleIcon = () => {
    if (role === "admin") return <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />;
    if (role === "vendor") return <Store className="w-3.5 h-3.5 text-amber-500" />;
    return <Heart className="w-3.5 h-3.5 text-pink-500" />;
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rose-100/60 bg-white/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-sm shadow-rose-200 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-rose-600 transition-colors">
            Wed<span className="text-rose-600 font-sans font-medium">Plan</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-rose-600 ${
              pathname === "/" ? "text-rose-600 font-semibold" : "text-neutral-600"
            }`}
          >
            Home
          </Link>
          <Link
            href="/services"
            className={`text-sm font-medium transition-colors hover:text-rose-600 ${
              pathname.startsWith("/services")
                ? "text-rose-600 font-semibold"
                : "text-neutral-600"
            }`}
          >
            Browse Services
          </Link>
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {isPending ? (
            <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 p-1 rounded-full hover:bg-rose-50/60 transition-colors focus:outline-none">
                <Avatar className="w-9 h-9 ring-2 ring-rose-200 ring-offset-1">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback className="bg-rose-100 text-rose-700 font-medium text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-neutral-800 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1">
                <DropdownMenuLabel className="font-normal py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-neutral-900 leading-none truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    <div className="pt-1 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 capitalize">
                        {getRoleIcon()}
                        {role}
                      </span>
                      {user.subscriptionPlan === "premium" && (
                        <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                          PREMIUM
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(dashboardHref)} className="cursor-pointer">
                  <LayoutDashboard className="w-4 h-4 mr-2 text-neutral-500" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`${dashboardHref}/settings`)}
                  className="cursor-pointer"
                >
                  <Settings className="w-4 h-4 mr-2 text-neutral-500" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-neutral-700 hover:text-rose-600 hover:bg-rose-50">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-rose-50 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-rose-100 bg-white px-4 pt-3 pb-6 space-y-4">
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-neutral-700 hover:text-rose-600 px-2 py-1.5 rounded-md hover:bg-rose-50"
            >
              Home
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-neutral-700 hover:text-rose-600 px-2 py-1.5 rounded-md hover:bg-rose-50"
            >
              Browse Services
            </Link>
          </div>

          <div className="pt-3 border-t border-neutral-100">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2 py-1">
                  <Avatar className="w-10 h-10 ring-2 ring-rose-200">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="bg-rose-100 text-rose-700">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm text-neutral-700 px-3 py-2 rounded-md hover:bg-rose-50 font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4 text-neutral-500" />
                    Dashboard
                  </Link>
                  <Link
                    href={`${dashboardHref}/settings`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm text-neutral-700 px-3 py-2 rounded-md hover:bg-rose-50 font-medium"
                  >
                    <Settings className="w-4 h-4 text-neutral-500" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-2 text-sm text-rose-600 px-3 py-2 rounded-md hover:bg-rose-50 font-medium w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center bg-rose-600 hover:bg-rose-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
