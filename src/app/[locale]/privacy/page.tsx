import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const localeMap: Record<string, string> = {};
  for (const l of routing.locales) {
    localeMap[l] = `https://tryscoredeck.pro/${l}/privacy`;
  }
  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    alternates: { canonical: `https://tryscoredeck.pro/${locale}/privacy`, languages: localeMap },
  };
}

export default async function Privacy() {
  const t = await getTranslations("Privacy");
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
            <h2 className="text-base font-semibold text-text-primary mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              <strong className="text-text-primary/80">Account Information:</strong> When you join our waitlist or purchase early access, we collect your email address. Payments are processed by Stripe or Dodo Payments; we receive confirmation of the payment and the amount, never your card details.
            </p>
            <p className="mb-3">
              <strong className="text-text-primary/80">Usage Data:</strong> The website, desktop app and Android app send anonymous usage events: when the app is opened, a periodic signal while it is in use, and which sport or league you open. Each device is identified only by a random ID generated on that device. We record the app version and your approximate country (derived from your connection, not stored as an IP address). This data is not linked to your account or email. The website does not send these events if your browser has Do Not Track enabled. In the EU, EEA, UK and Switzerland they are only collected if you agree in the consent prompt (website) or turn on "Share anonymous usage statistics" (desktop and Android apps). You can turn this off at any time in the apps' settings.
            </p>
            <p className="mb-3">
              <strong className="text-text-primary/80">Advertising:</strong> Free users see ads. Ads from our direct sponsors are served by us and we only record whether an ad was shown or clicked. When no sponsor ad is available, the website shows ads from Google AdSense and the Android app shows ads from Google AdMob. Google may use cookies (website) or your device&apos;s advertising ID (Android) to show and measure ads, under Google&apos;s own privacy policy. Where required by law, you are asked for consent first and can choose non-personalised ads. Subscribers with an active ad-free plan see no ads.
            </p>
            <p>
              <strong className="text-text-primary/80">Sports Preferences:</strong> Your selected teams, leagues, and notification preferences are stored locally on your device and synced to your account for a personalized experience.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-text-dim/80">
              <li>To provide and maintain the ScoreDeck service</li>
              <li>To send you product updates and launch notifications</li>
              <li>To process payments and manage your subscription</li>
              <li>To improve our product based on aggregated, anonymous usage data</li>
              <li>To respond to support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">3. Data Storage & Security</h2>
            <p>
              Your data is stored securely using Supabase (hosted on AWS). All data transmission is encrypted via TLS. Card details are handled by Stripe or Dodo Payments and never reach our servers. We do not sell your personal data. We share data only with the service providers needed to run ScoreDeck (Supabase for storage, Stripe and Dodo Payments for payments, Resend for email, Vercel for hosting) and, for advertising and analytics, with Google as described above.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">4. Desktop Application</h2>
            <p>
              ScoreDeck runs as a lightweight desktop application. It does not monitor your screen, keystrokes, or browser activity. The app only communicates with our servers to fetch live sports data, sync your preferences, show sponsor messages, and send the anonymous usage events described above.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">5. News Content</h2>
            <p className="mb-3">
              ScoreDeck publishes sports news articles, match previews, and analysis on our website. News content is original editorial work produced by the ScoreDeck Sports Desk.
            </p>
            <p className="mb-3">
              <strong className="text-text-primary/80">Google News:</strong> Our news section is integrated with Google News. By accessing our news content, you may be subject to Google&apos;s own privacy policies regarding content recommendation and display.
            </p>
            <p>
              <strong className="text-text-primary/80">Third-Party Data:</strong> Sports statistics, scores, and match data referenced in our articles are sourced from publicly available information and third-party data providers. We attribute sources where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">6. Cookies</h2>
            <p>
              The website uses cookies and similar storage for sign-in, for Google Analytics (visit statistics) and for Google AdSense (advertising). Visitors in the EU, EEA, UK and Switzerland are asked for consent before non-essential cookies are used. Our own anonymous usage statistics use a random ID in your browser&apos;s local storage, not a cookie. The desktop and Android apps do not use cookies; the Android app may use the advertising ID for Google AdMob as described above.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-text-dim/80">
              <li>Request access to your personal data</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Opt out of marketing emails at any time</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of any significant changes via email or through the app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">9. Contact</h2>
            <p>
              ScoreDeck is operated by Orbytech IT Solutions L.L.C, Dubai, United Arab Emirates, which is responsible for your personal data. Questions about this policy? Reach us at{" "}
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
