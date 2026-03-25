import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const localeMap: Record<string, string> = {};
  for (const l of routing.locales) {
    localeMap[l] = `https://tryscoredeck.pro/${l}/contact`;
  }
  return {
    title: t("contactTitle"),
    description: t("contactDescription"),
    alternates: { canonical: `https://tryscoredeck.pro/${locale}/contact`, languages: localeMap },
  };
}

export default async function Contact() {
  const t = await getTranslations("Contact");
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-[680px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors"
        >
          &larr; {t("backToScoreDeck")}
        </Link>

        <h1 className="text-3xl font-bold mt-8 mb-2 tracking-tight">{t("title")}</h1>
        <p className="text-text-dim text-sm mb-12 leading-relaxed">
          {t("subtitle")}
        </p>

        <div className="space-y-8">
          <div className="glass-card rounded-xl p-6 border border-border">
            <h2 className="text-sm font-semibold mb-1">{t("emailTitle")}</h2>
            <p className="text-text-dim text-xs mb-3">{t("emailSubtitle")}</p>
            <a
              href="mailto:hello@tryscoredeck.pro"
              className="text-accent text-sm font-medium hover:underline"
            >
              hello@tryscoredeck.pro
            </a>
          </div>

          <div className="glass-card rounded-xl p-6 border border-border">
            <h2 className="text-sm font-semibold mb-1">{t("refundsTitle")}</h2>
            <p className="text-text-dim text-xs mb-3">
              {t("refundsSubtitle")}
            </p>
            <a
              href="mailto:hello@tryscoredeck.pro?subject=Refund Request"
              className="text-accent text-sm font-medium hover:underline"
            >
              {t("requestRefund")}
            </a>
          </div>

          <div className="glass-card rounded-xl p-6 border border-border">
            <h2 className="text-sm font-semibold mb-1">{t("bugsTitle")}</h2>
            <p className="text-text-dim text-xs mb-3">
              {t("bugsSubtitle")}
            </p>
            <a
              href="mailto:hello@tryscoredeck.pro?subject=Bug Report / Feature Request"
              className="text-accent text-sm font-medium hover:underline"
            >
              {t("sendFeedback")}
            </a>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-text-muted/30 text-[10px] tracking-wider uppercase">
              {t("responseTime")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
