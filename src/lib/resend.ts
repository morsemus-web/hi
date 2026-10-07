import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWaitlistWelcome(email: string) {
  return resend.emails.send({
    from: "ScoreDeck <hello@tryscoredeck.pro>",
    to: email,
    subject: "You're on the ScoreDeck waitlist!",
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #0a0a0a; color: #f0f0f0; border-radius: 12px;">
        <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem;">
          Welcome to <span style="color: #22c55e;">ScoreDeck</span>
        </h1>
        <p style="color: #999; line-height: 1.7; margin-bottom: 1.5rem;">
          You're on the list! We'll email you the moment ScoreDeck is ready to download.
        </p>
        <p style="color: #999; line-height: 1.7; margin-bottom: 1.5rem;">
          ScoreDeck is free to use. <strong style="color: #f0f0f0;">ScoreDeck Pro</strong> removes ads and unlocks every sport, from $5/month billed quarterly. Cancel anytime.
        </p>
        <a href="https://tryscoredeck.pro/#pricing" style="display: inline-block; padding: 0.75rem 1.5rem; background: #22c55e; color: #000; font-weight: 700; border-radius: 8px; text-decoration: none;">
          See Pro plans
        </a>
        <p style="color: #666; font-size: 0.8rem; margin-top: 2rem;">
          — The ScoreDeck Team
        </p>
      </div>
    `,
  });
}

export async function sendBackerConfirmation(email: string) {
  return resend.emails.send({
    from: "ScoreDeck <payment@tryscoredeck.pro>",
    to: email,
    subject: "Welcome to ScoreDeck Pro",
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #0a0a0a; color: #f0f0f0; border-radius: 12px;">
        <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem;">
          Welcome to <span style="color: #22c55e;">ScoreDeck Pro</span>!
        </h1>
        <p style="color: #999; line-height: 1.7; margin-bottom: 1.5rem;">
          Your subscription is active: no ads, and every sport unlocked. As one of our first subscribers you're also a founding backer, which we won't forget.
        </p>
        <p style="color: #999; line-height: 1.7; margin-bottom: 1.5rem;">
          Manage or cancel your plan anytime at <a href="https://tryscoredeck.pro/account" style="color: #22c55e;">tryscoredeck.pro/account</a>.
        </p>
        <p style="color: #666; font-size: 0.8rem; margin-top: 2rem;">
          — The ScoreDeck Team
        </p>
      </div>
    `,
  });
}
