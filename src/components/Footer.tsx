"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="py-10 px-6 md:px-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium tracking-[0.15em] uppercase text-text-muted/50">
          ScoreDeck
        </span>
        <span className="text-text-muted/20">&middot;</span>
        <span className="text-text-muted/30 text-[10px] font-light tracking-wider">
          &copy; {new Date().getFullYear()}
        </span>
      </div>
      <div className="flex gap-6">
        {[
          { label: t("news"), href: "/news" },
          { label: t("privacy"), href: "/privacy" },
          { label: t("terms"), href: "/terms" },
          { label: t("contact"), href: "/contact" },
        ].map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-text-muted/40 text-[10px] font-light tracking-wider hover:text-text-muted transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
