import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-6 rounded-[2rem] border border-border/60 bg-card/70 p-10 text-center shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Sparkles className="h-8 w-8" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              404 Error
            </span>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Page Not Found
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              We couldn&apos;t find the wedding page you were looking for. It may have moved, been removed, or the link may be incorrect.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90 sm:w-auto">
                <Home className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <Link href="/services" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full rounded-full border-border/70 bg-background/60 sm:w-auto">
                <Search className="mr-2 h-4 w-4" /> Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
