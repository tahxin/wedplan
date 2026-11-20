"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Menu,
  X,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Store,
  Heart,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
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
  const [currentSearch, setCurrentSearch] = useState("");

  useEffect(() => {
    setCurrentSearch(window.location.search);
  }, [pathname]);

  const currentPath = `${pathname}${currentSearch}`;
  const isAuthRoute = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const authHref = (base: "/sign-in" | "/sign-up") =>
    !isAuthRoute && currentPath
      ? `${base}?callbackUrl=${encodeURIComponent(currentPath)}`
      : base;

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
    if (role === "admin") return <ShieldCheck className="w-3.5 h-3.5 text-primary" />;
    if (role === "vendor") return <Store className="w-3.5 h-3.5 text-amber-600" />;
    return <Heart className="w-3.5 h-3.5 text-rose-500" />;
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

  const navLinkClass = (active: boolean) =>
    `relative text-sm font-medium transition-colors hover:text-primary ${
      active ? "text-primary" : "text-foreground/70"
    } after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary/70 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
      active ? "after:scale-x-100" : ""
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-rose-500 to-amber-500 text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/40 transition-transform duration-300 group-hover:-translate-y-0.5">
            <LogoMark className="h-6 w-6" />
          </div>
          <div className="leading-none">
            <span className="block font-serif text-2xl font-semibold tracking-tight text-foreground">
              WedPlan
            </span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Wedding Atelier
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className={navLinkClass(pathname === "/")}>
            Home
          </Link>
          <Link href="/services" className={navLinkClass(pathname.startsWith("/services"))}>
            Browse Services
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full border border-border/60 bg-card/60 p-1.5 pr-3 shadow-sm transition-all hover:border-primary/30 hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8 ring-1 ring-border">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-2 w-60 rounded-xl border-border/60 bg-popover/95 p-1.5 shadow-xl backdrop-blur-xl">
                <DropdownMenuLabel className="rounded-lg px-3 py-2.5 font-normal">
                  <div className="flex flex-col space-y-1.5">
                    <p className="truncate text-sm font-semibold leading-none text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[11px] font-medium capitalize text-primary">
                        {getRoleIcon()}
                        {role}
                      </span>
                      {user.subscriptionPlan === "premium" && (
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                          PREMIUM
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(dashboardHref)} className="cursor-pointer rounded-lg">
                  <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`${dashboardHref}/settings`)}
                  className="cursor-pointer rounded-lg"
                >
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={authHref("/sign-in")}>
                <Button variant="ghost" className="text-foreground/80 hover:bg-primary/5 hover:text-primary">
                  Sign In
                </Button>
              </Link>
              <Link href={authHref("/sign-up")}>
                <Button className="rounded-full bg-primary px-5 text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-foreground/80 transition-colors hover:bg-card hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/60 bg-background/95 px-4 pb-6 pt-4 shadow-lg backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === "/" ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted"
              }`}
            >
              Home
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith("/services") ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted"
              }`}
            >
              Browse Services
            </Link>
          </div>

          <div className="mx-auto mt-4 max-w-7xl border-t border-border/60 pt-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-card/60 p-3 ring-1 ring-border/50">
                  <Avatar className="h-10 w-10 ring-1 ring-border">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    Dashboard
                  </Link>
                  <Link
                    href={`${dashboardHref}/settings`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 pt-1">
                <Link href={authHref("/sign-in")} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center rounded-xl border-border/70">
                    Sign In
                  </Button>
                </Link>
                <Link href={authHref("/sign-up")} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
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
