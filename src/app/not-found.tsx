import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-md w-full space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              404 Error
            </span>
            <h1 className="font-serif text-4xl font-bold text-neutral-900">
              Page Not Found
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              We couldn&apos;t find the wedding page you were looking for. It may have moved or no longer exists.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                <Home className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </Link>
            <Link href="/services" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-neutral-300">
                <Search className="w-4 h-4 mr-2" /> Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
