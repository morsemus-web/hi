import Link from "next/link";

export const metadata = {
  title: "Terms of Service — ScoreDeck",
};

export default function Terms() {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-[680px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors"
        >
          &larr; Back to ScoreDeck
        </Link>

        <h1 className="text-3xl font-bold mt-8 mb-2 tracking-tight">Terms of Service</h1>
        <p className="text-text-muted/40 text-xs mb-12">Last updated: March 20, 2026</p>

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
            <h2 className="text-base font-semibold text-text-primary mb-3">6. Intellectual Property</h2>
            <p>
              ScoreDeck, its logo, design, and code are the property of ScoreDeck. Sports data displayed within the app is sourced from third-party providers and remains the property of the respective leagues and organizations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">7. Availability</h2>
            <p>
              We strive for 99.9% uptime but do not guarantee uninterrupted service. Live scores depend on third-party data providers and may occasionally be delayed or unavailable.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">8. Limitation of Liability</h2>
            <p>
              ScoreDeck is provided "as is" without warranty of any kind. We are not liable for any damages arising from the use or inability to use the service, including but not limited to missed scores, data inaccuracies, or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-3">10. Contact</h2>
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
