"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors duration-200 cursor-pointer ${
            l === locale
              ? "text-accent bg-accent/10"
              : "text-text-muted/40 hover:text-text-muted"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
