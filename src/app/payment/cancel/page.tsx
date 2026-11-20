import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { AlertCircle, Store } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 rounded-[2rem] border border-border/60 bg-card/70 p-8 text-center shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border/60">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground">
              Upgrade Cancelled
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The Stripe checkout session was cancelled. No charges were made to your payment method.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/dashboard/vendor">
              <Button className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90">
                <Store className="mr-2 h-4 w-4" /> Back to Vendor Portal
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
