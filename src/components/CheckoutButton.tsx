"use client";

const GUMROAD_URL = "https://chaddhafateh.gumroad.com/l/tgdwsy?wanted=true";

export default function CheckoutButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={GUMROAD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
