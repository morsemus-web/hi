import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const localeMap: Record<string, string> = {};
  for (const l of routing.locales) {
    localeMap[l] = `https://tryscoredeck.pro/${l}/terms`;
  }
  return {
    title: t("termsTitle"),
    description: t("termsDescription"),
    alternates: { canonical: `https://tryscoredeck.pro/${locale}/terms`, languages: localeMap },
  };
}

export default async function Terms() {
  const t = await getTranslations("Terms");
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
        <p className="text-text-muted/40 text-xs mb-12">{t("lastUpdated")}</p>

        <div className="space-y-10 text-sm text-text-dim leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ScoreDeck ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">2. Description of Service</h2>
            <p>
              ScoreDeck is a desktop application that provides real-time sports scores, live commentary, and match updates for Cricket, Football, Basketball, and Formula 1. The service includes a system tray overlay, toolbar widget, and floating popout tracker.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">3. Founding Access & Pricing</h2>
            <p className="mb-3">
              Founding Access is a one-time payment of $29 that grants lifetime access to ScoreDeck, including all future updates and features. This offer is limited to the first 1,000 users.
            </p>
            <p>
              The waitlist is free. Waitlisted users will be notified when the app launches and may be offered different pricing at that time.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">4. Refund Policy</h2>
            <p>
              If you are unsatisfied with ScoreDeck, you may request a full refund within 14 days of purchase. Contact us at{" "}
              <a href="mailto:hello@tryscoredeck.pro" className="text-accent hover:underline">
                hello@tryscoredeck.pro
              </a>{" "}
              to initiate a refund.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">5. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-text-dim/80">
              <li>Reverse engineer, decompile, or disassemble the application</li>
              <li>Redistribute, sublicense, or resell the software</li>
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to access data not intended for you</li>
              <li>Interfere with the service&apos;s infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">6. News Content & Editorial Policy</h2>
            <p className="mb-3">
              ScoreDeck publishes sports news, match previews, analysis, and commentary on tryscoredeck.pro/news. All news content is original editorial work and is provided free of charge.
            </p>
            <p className="mb-3">
              <strong className="text-text-primary/80">Editorial Independence:</strong> Our sports desk operates with editorial independence. News coverage is not influenced by advertising, sponsorships, or commercial relationships.
            </p>
            <p className="mb-3">
              <strong className="text-text-primary/80">Accuracy & Corrections:</strong> We strive for accuracy in all reporting. If you believe an article contains an error, please contact us at{" "}
              <a href="mailto:hello@tryscoredeck.pro" className="text-accent hover:underline">hello@tryscoredeck.pro</a>
              . We will review and issue corrections promptly.
            </p>
            <p>
              <strong className="text-text-primary/80">Content Licensing:</strong> All news articles, analysis, and editorial content published on ScoreDeck are protected by copyright. You may share articles via their URL but may not reproduce, redistribute, or republish content without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">7. Intellectual Property</h2>
            <p>
              ScoreDeck, its logo, design, and code are the property of ScoreDeck. Sports data displayed within the app and referenced in news articles is sourced from third-party providers and publicly available information, and remains the property of the respective leagues and organizations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">8. Availability</h2>
            <p>
              We strive for 99.9% uptime but do not guarantee uninterrupted service. Live scores depend on third-party data providers and may occasionally be delayed or unavailable.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">9. Limitation of Liability</h2>
            <p>
              ScoreDeck is provided "as is" without warranty of any kind. We are not liable for any damages arising from the use or inability to use the service, including but not limited to missed scores, data inaccuracies, or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">11. Contact</h2>
            <p>
              Questions about these terms? Reach us at{" "}
              <a href="mailto:hello@tryscoredeck.pro" className="text-accent hover:underline">
                hello@tryscoredeck.pro
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
