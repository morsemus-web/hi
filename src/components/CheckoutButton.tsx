"use client";

import { useEffect, useState } from "react";
import { DodoPayments } from "dodopayments-checkout";
import { supabase } from "@/lib/supabase";

export default function CheckoutButton({
  children,
  className,
  productId,
}: {
  children: React.ReactNode;
  className?: string;
  productId?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize Dodo Payments
    // We use the environment variable if available, otherwise default to test
    const mode = (process.env.NEXT_PUBLIC_DODO_MODE as "test" | "live") || "test";
    DodoPayments.Initialize({ mode });
  }, []);

  const handleCheckout = async (e: React.MouseEvent) => {
    // If no productId is provided, fall back to the default behavior (e.g. scroll to pricing or do nothing)
    if (!productId) return;

    e.preventDefault();
    setIsLoading(true);

    try {
      // Get user email if logged in
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
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
        // Fallback if script didn't load
        window.location.href = checkout_url;
      }
    } catch (error) {
      alert("Something went wrong with the checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className={className}
      disabled={isLoading || !productId}
    >
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
