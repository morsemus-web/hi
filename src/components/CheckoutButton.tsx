"use client";

import { useEffect, useState } from "react";
import { DodoPayments } from "dodopayments-checkout";
import { supabase } from "@/lib/supabase";

// Starts checkout for a plan through whichever provider is active
// (NEXT_PUBLIC_CHECKOUT_PROVIDER = "stripe" | "dodo"; default dodo).

type Plan = "quarterly" | "annual";

const PROVIDER = process.env.NEXT_PUBLIC_CHECKOUT_PROVIDER === "stripe" ? "stripe" : "dodo";

const DODO_PRODUCTS: Record<Plan, string | undefined> = {
  quarterly: process.env.NEXT_PUBLIC_DODO_MONTHLY_ID,
  annual: process.env.NEXT_PUBLIC_DODO_ANNUAL_ID,
};

export default function CheckoutButton({
  children,
  className,
  plan,
}: {
  children: React.ReactNode;
  className?: string;
  plan: Plan;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const available = PROVIDER === "stripe" || !!DODO_PRODUCTS[plan];

  useEffect(() => {
    if (PROVIDER === "dodo") {
      const mode = (process.env.NEXT_PUBLIC_DODO_MODE as "test" | "live") || "test";
      DodoPayments.Initialize({ mode });
    }
  }, []);

  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (PROVIDER === "stripe") {
        // Stripe subscriptions are tied to an account, so sign in first.
        if (!session) {
          window.location.href = "/login";
          return;
        }
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ plan }),
        });
        const body = await res.json();
        if (!res.ok || !body.checkout_url) throw new Error(body.error || "Checkout failed");
        window.location.href = body.checkout_url;
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: DODO_PRODUCTS[plan], email: session?.user?.email }),
      });
      if (!res.ok) throw new Error("Failed to create checkout session");
      const { checkout_url } = await res.json();

      if (window.DodoPayments) {
        window.DodoPayments.open({
          url: checkout_url,
          onSuccess: () => {
            window.location.href = "/thanks";
          },
        });
      } else {
        window.location.href = checkout_url;
      }
    } catch {
      alert("Something went wrong with the checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleCheckout} className={className} disabled={isLoading || !available}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
