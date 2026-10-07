import { serviceClient } from "@/lib/adminAuth";
import { sendBackerConfirmation } from "@/lib/resend";

export const MAX_BACKERS = 1000;

/**
 * Records a founding backer. Called only from the Dodo and Stripe webhooks,
 * after the payment provider has verified the payment, so the public count
 * can't be inflated. Returns false when full or already a backer.
 */
export async function recordBacker(email: string, paymentId: string | null): Promise<boolean> {
  const db = serviceClient();
  const { count } = await db.from("backers").select("*", { count: "exact", head: true });
  if ((count ?? 0) >= MAX_BACKERS) return false;

  const { error } = await db
    .from("backers")
    .insert([{ email: email.toLowerCase().trim(), payment_id: paymentId }]);
  if (error) {
    if (error.code === "23505") return false; // already a backer
    throw new Error(error.message);
  }

  sendBackerConfirmation(email).catch((err) => console.error("Failed to send backer email:", err));
  return true;
}
