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
          In the meantime, you can lock in <strong style="color: #f0f0f0;">lifetime access for just $29</strong> — only 1,000 spots available.
        </p>
        <a href="https://tryscoredeck.pro" style="display: inline-block; padding: 0.75rem 1.5rem; background: #22c55e; color: #000; font-weight: 700; border-radius: 8px; text-decoration: none;">
          Get Lifetime Access
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
    subject: "You're a ScoreDeck lifetime backer!",
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #0a0a0a; color: #f0f0f0; border-radius: 12px;">
        <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem;">
          Thank you, <span style="color: #22c55e;">backer</span>!
        </h1>
        <p style="color: #999; line-height: 1.7; margin-bottom: 1.5rem;">
          Your $29 lifetime access to ScoreDeck is confirmed. You'll get every future update, every new sport, and an early backer badge — forever.
        </p>
        <p style="color: #999; line-height: 1.7; margin-bottom: 1.5rem;">
          We'll send you a download link as soon as ScoreDeck is ready. You'll be among the very first to get it.
        </p>
        <p style="color: #666; font-size: 0.8rem; margin-top: 2rem;">
          — The ScoreDeck Team
        </p>
      </div>
    `,
  });
}
