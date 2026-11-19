import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { AlertCircle, Store } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-neutral-900">
              Upgrade Cancelled
            </h1>
            <p className="text-sm text-neutral-500">
              The Stripe checkout session was cancelled. No charges were made to your payment method.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/dashboard/vendor">
              <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium">
                <Store className="w-4 h-4 mr-2" /> Back to Vendor Portal
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
