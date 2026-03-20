import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "ScoreDeck Privacy Policy — Learn how we collect, use, and protect your data. We never track browsing activity or sell personal information.",
  alternates: { canonical: "https://tryscoredeck.pro/privacy" },
};

export default function Privacy() {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-[680px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors"
        >
          &larr; Back to ScoreDeck
        </Link>

        <h1 className="text-3xl font-bold mt-8 mb-2 tracking-tight">Privacy Policy</h1>
        <p className="text-text-muted/40 text-xs mb-12">Last updated: March 20, 2026</p>

        <div className="space-y-10 text-sm text-text-dim leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              <strong className="text-text-primary/80">Account Information:</strong> When you join our waitlist or purchase early access, we collect your email address and payment information (processed securely by Dodo Payments).
            </p>
            <p className="mb-3">
              <strong className="text-text-primary/80">Usage Data:</strong> We collect anonymous usage analytics to improve the app, including feature usage patterns and crash reports. No personal browsing data is tracked.
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
              Your data is stored securely using Supabase (hosted on AWS). All data transmission is encrypted via TLS. Payment information is processed by Dodo Payments and is never stored on our servers. We do not sell, trade, or share your personal data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">4. Desktop Application</h2>
            <p>
              ScoreDeck runs as a lightweight desktop application. It does not monitor your screen, keystrokes, or browser activity. The app only communicates with our servers to fetch live sports data and sync your preferences.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">5. Cookies</h2>
            <p>
              Our website uses essential cookies only — no advertising or tracking cookies. The desktop app does not use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-text-dim/80">
              <li>Request access to your personal data</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Opt out of marketing emails at any time</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of any significant changes via email or through the app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">8. Contact</h2>
            <p>
              Questions about this policy? Reach us at{" "}
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
