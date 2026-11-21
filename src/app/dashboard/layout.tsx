"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Store, 
  Heart,
  Users,
  Layers,
  CreditCard,
  CalendarDays,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoMark } from "@/components/brand/logo-mark";
import { toast } from "sonner";
import { clearAuthTokenCache } from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // In Next.js App Router, we should probably handle session redirection in middleware
  // but for the dashboard shell UI, we'll just use the session data.
  const user = session?.user as { role?: string; name?: string; email?: string; image?: string } | undefined;
  const role = user?.role || "customer";

  const handleSignOut = async () => {
    try {
      clearAuthTokenCache();
      await signOut();
      toast.success("Signed out successfully");
      router.replace("/sign-in");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  // Sidebar links based on role
  const adminLinks = [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Manage Services", href: "/dashboard/admin?tab=services", icon: Layers },
    { name: "User Directory", href: "/dashboard/admin?tab=users", icon: Users },
    { name: "Transactions", href: "/dashboard/admin?tab=transactions", icon: CreditCard },
    { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ];

  const vendorLinks = [
    { name: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard },
    { name: "My Services", href: "/dashboard/vendor?tab=services", icon: Layers },
    { name: "Bookings", href: "/dashboard/vendor?tab=bookings", icon: CalendarDays },
    { name: "Subscription", href: "/dashboard/vendor?tab=subscription", icon: CreditCard },
    { name: "Settings", href: "/dashboard/vendor/settings", icon: Settings },
  ];

  const customerLinks = [
    { name: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    { name: "Browse Services", href: "/services", icon: Search },
    { name: "Settings", href: "/dashboard/customer/settings", icon: Settings },
  ];

  const links = role === "admin" ? adminLinks : role === "vendor" ? vendorLinks : customerLinks;

  const roleIcon = role === "admin" ? (
    <ShieldCheck className="h-4 w-4 text-primary" />
  ) : role === "vendor" ? (
    <Store className="h-4 w-4 text-amber-600" />
  ) : (
    <Heart className="h-4 w-4 text-rose-500" />
  );

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle sidebar collapse state from local storage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-open");
    if (savedState !== null) {
      setIsSidebarOpen(savedState === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("sidebar-open", String(newState));
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LogoMark className="h-10 w-10 animate-pulse text-primary/50" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside 
        className={`fixed left-0 top-0 z-40 hidden h-screen border-r border-border/60 bg-card/30 backdrop-blur-xl transition-all duration-300 lg:block ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-18 items-center border-b border-border/60 px-6">
            <Link href="/" className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/40">
                <LogoMark className="h-6 w-6" />
              </div>
              {isSidebarOpen && (
                <div className="leading-none transition-opacity duration-300">
                  <span className="block font-serif text-xl font-semibold tracking-tight text-foreground">WedPlan</span>
                  <span className="mt-0.5 block text-[8px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Atelier</span>
                </div>
              )}
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
            {links.map((link) => {
              // For now, if the path doesn't exist as a separate file, 
              // we treat "Overview" as the active link for all dashboard sub-views 
              // unless we implement the tab splitting.
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/dashboard" && link.href !== "/services");
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <link.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-primary" : "group-hover:text-foreground"}`} />
                  {isSidebarOpen && <span className="truncate">{link.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border/60 p-4">
            <div className={`flex items-center gap-3 rounded-2xl bg-muted/40 p-2 ring-1 ring-border/50 ${!isSidebarOpen && "justify-center"}`}>
              <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border/60">
                <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {user?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">{user?.name}</p>
                  <div className="flex items-center gap-1">
                    {roleIcon}
                    <p className="text-[10px] font-medium capitalize text-muted-foreground">{role}</p>
                  </div>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className={`mt-2 w-full justify-start rounded-xl px-3 text-destructive hover:bg-destructive/10 hover:text-destructive ${!isSidebarOpen && "justify-center px-0"}`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {isSidebarOpen && <span className="ml-3">Sign Out</span>}
            </Button>
          </div>
        </div>

        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground shadow-sm transition-colors"
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="lg:hidden">
        <header className="fixed top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-lg">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <LogoMark className="h-5 w-5" />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">WedPlan</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="rounded-xl border border-border/60 bg-card/40"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl transition-all duration-300">
            <div className="flex h-full flex-col px-6 pb-8 pt-24">
              <nav className="flex-1 space-y-2 overflow-y-auto">
                {links.map((link) => {
                  const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/dashboard" && link.href !== "/services");
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-semibold transition-all ${
                        isActive 
                          ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                          : "text-foreground/70 hover:bg-muted"
                      }`}
                    >
                      <link.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 space-y-4 pt-6 border-t border-border/60">
                <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4 ring-1 ring-border/50">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                      {user?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-foreground">{user?.name}</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {roleIcon}
                      <p className="text-xs font-semibold capitalize text-muted-foreground">{role} Workspace</p>
                    </div>
                  </div>
                </div>
                <Button onClick={handleSignOut} variant="outline" className="w-full h-12 rounded-2xl border-rose-200 bg-rose-50/30 text-rose-700 hover:bg-rose-50">
                  <LogOut className="mr-2 h-5 w-5" /> Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"} pt-16 lg:pt-0`}>
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
