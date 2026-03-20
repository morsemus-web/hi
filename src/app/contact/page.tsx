import Link from "next/link";

export const metadata = {
  title: "Contact — ScoreDeck",
};

export default function Contact() {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-[680px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors"
        >
          &larr; Back to ScoreDeck
        </Link>

        <h1 className="text-3xl font-bold mt-8 mb-2 tracking-tight">Contact Us</h1>
        <p className="text-text-dim text-sm mb-12 leading-relaxed">
          Have a question, feedback, or need support? We&apos;d love to hear from you.
        </p>

        <div className="space-y-8">
          <div className="glass-card rounded-xl p-6 border border-border">
            <h2 className="text-sm font-semibold mb-1">Email</h2>
            <p className="text-text-dim text-xs mb-3">Best for general questions and support</p>
            <a
              href="mailto:hello@tryscoredeck.pro"
              className="text-accent text-sm font-medium hover:underline"
            >
              hello@tryscoredeck.pro
            </a>
          </div>

          <div className="glass-card rounded-xl p-6 border border-border">
            <h2 className="text-sm font-semibold mb-1">Refunds</h2>
            <p className="text-text-dim text-xs mb-3">
              Founding Access comes with a 14-day refund policy. Just email us with your payment details.
            </p>
            <a
              href="mailto:hello@tryscoredeck.pro?subject=Refund Request"
              className="text-accent text-sm font-medium hover:underline"
            >
              Request a refund
            </a>
          </div>

          <div className="glass-card rounded-xl p-6 border border-border">
            <h2 className="text-sm font-semibold mb-1">Bug Reports & Feature Requests</h2>
            <p className="text-text-dim text-xs mb-3">
              Found a bug or have an idea for a feature? Let us know — we read every message.
            </p>
            <a
              href="mailto:hello@tryscoredeck.pro?subject=Bug Report / Feature Request"
              className="text-accent text-sm font-medium hover:underline"
            >
              Send feedback
            </a>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-text-muted/30 text-[10px] tracking-wider uppercase">
              We typically respond within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
