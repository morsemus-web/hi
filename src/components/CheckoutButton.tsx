"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    DodoPaymentsCheckout?: {
      DodoPayments: {
        Initialize: (config: Record<string, unknown>) => void;
        Checkout: { open: (opts: { checkoutUrl: string }) => void };
      };
    };
  }
}

let initialized = false;

function initDodo() {
  if (initialized || !window.DodoPaymentsCheckout) return;
  window.DodoPaymentsCheckout.DodoPayments.Initialize({
    mode: process.env.NEXT_PUBLIC_DODO_MODE || "test",
    displayType: "overlay",
  });
  initialized = true;
}

export function openCheckout() {
  const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_ID || "";
  const redirectUrl =
    process.env.NEXT_PUBLIC_REDIRECT_URL || window.location.origin + "/thanks";

  const url = `https://checkout.dodopayments.com/buy/${productId}?quantity=1&redirect_url=${encodeURIComponent(redirectUrl)}`;

  if (window.DodoPaymentsCheckout) {
    initDodo();
    window.DodoPaymentsCheckout.DodoPayments.Checkout.open({
      checkoutUrl: url,
    });
  } else {
    window.open(url, "_blank");
  }
}

export default function CheckoutButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    // Load Dodo Payments script
    if (document.getElementById("dodo-script")) return;
    const script = document.createElement("script");
    script.id = "dodo-script";
    script.src =
      "https://cdn.jsdelivr.net/npm/dodopayments-checkout@latest/dist/index.js";
    script.onload = () => initDodo();
    document.head.appendChild(script);
  }, []);

  return (
    <button onClick={openCheckout} className={className}>
      {children}
    </button>
  );
}
