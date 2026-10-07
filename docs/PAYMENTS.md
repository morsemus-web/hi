# Payments

ScoreDeck sells two subscription plans **on the website only**:

| Plan | Price shown | Stripe env var | Dodo env var |
|---|---|---|---|
| `quarterly` | $5/month, billed quarterly | `STRIPE_PRICE_QUARTERLY` | `NEXT_PUBLIC_DODO_MONTHLY_ID` |
| `annual` | Pro Annual | `STRIPE_PRICE_ANNUAL` | `NEXT_PUBLIC_DODO_ANNUAL_ID` |

A paid plan sets `profiles.tier` to the plan name and `profiles.ads_free_until` to the end of the paid period. Ads disappear on web and Android while `ads_free_until` is in the future.

The Android app **does not sell anything**. Google Play requires Play Billing for in-app digital purchases such as ad removal, so the app only explains that ad-free comes with a website subscription. Users sign in with the same email and their ads switch off.

## Choosing the provider

```
NEXT_PUBLIC_CHECKOUT_PROVIDER=stripe   # or dodo (default)
```

This controls **new** purchases only. Both webhooks stay active, so existing Dodo subscribers keep their access and renewals while new customers go through Stripe. Because this is a `NEXT_PUBLIC_` variable, a redeploy is needed after changing it.

## Stripe flow

```
Pricing button ──► signed in? ──no──► /login
                        │ yes
                        ▼
POST /api/checkout {plan}  (Bearer token)
   → Stripe Checkout Session (subscription, client_reference_id = user id,
     subscription metadata user_id, promo codes, optional Stripe Tax)
                        ▼
Stripe hosted checkout ──► /thanks
                        ▼
POST /api/stripe/webhook
   checkout.session.completed → save stripe_customer_id / subscription id
   invoice.paid               → payments ledger + tier + ads_free_until
                                (+ founding backer on the first invoice)
   customer.subscription.deleted → tier back to 'free'
                                   (access runs to the end of the paid period)
```

- **Buyers must be signed in**, so every subscription is tied to an account.
- **`invoice.paid` is the source of truth.** It handles renewals too, and works even if it arrives before `checkout.session.completed`: the user ID travels in the subscription metadata.
- **Idempotent.** Stripe retries failed webhooks; ledger rows are unique per invoice, and `ads_free_until` only ever moves forward.
- **Customer portal.** The account page shows **Manage subscription** for Stripe customers. It opens Stripe's billing portal (`POST /api/stripe/portal`) to change card, download invoices or cancel.

## Setting up Stripe

1. **Account.** Create it for Titan Orbyt Technologies LLC and complete business verification.
2. **Products.** Create "ScoreDeck Pro" with two recurring prices: quarterly (every 3 months) and yearly. Put the two `price_…` IDs in `STRIPE_PRICE_QUARTERLY` and `STRIPE_PRICE_ANNUAL`.
3. **Webhook.** Developers → Webhooks → add endpoint `https://tryscoredeck.pro/api/stripe/webhook` with the events `checkout.session.completed`, `invoice.paid` and `customer.subscription.deleted`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
4. **Keys.** Put the secret key in `STRIPE_SECRET_KEY`. Use `sk_test_…` on Preview deployments and `sk_live_…` only on Production.
5. **Customer portal.** Settings → Billing → Customer portal: enable cancellation and invoice history.
6. **Tax.** Stripe is **not** a merchant of record: Titan Orbyt is the seller and is responsible for VAT and sales tax.
   - Turn on Stripe Tax, add your UAE VAT registration, and set `STRIPE_AUTOMATIC_TAX=true`.
   - Stripe then collects the customer's address at checkout and adds the right tax.
   - Filing returns is still your (or your accountant's) job.
7. Run `reporting-setup.sql` if you haven't. It adds the `stripe_customer_id` and `stripe_subscription_id` columns and the `provider` column on `payments`.
8. **Test.** In test mode, subscribe with card `4242 4242 4242 4242`. Check that the account page shows ad-free as active, a `payments` row with `provider = 'stripe'` appears, and the Reports tab shows the revenue.
9. **Switch.** Set `NEXT_PUBLIC_CHECKOUT_PROVIDER=stripe` on Production and redeploy.

## Dodo (legacy)

`/api/dodo/webhook` verifies Standard Webhooks signatures with `DODO_WEBHOOK_SECRET` and rejects everything if the secret is missing. It records every payment in the ledger (`provider = 'dodo'`) and extends `ads_free_until` for the mobile product. Keep it running until the last Dodo subscription has ended.

## Founding backers

The homepage shows "X backed / Y spots left" from the `backers` table (maximum 1,000). A backer is added **only by a webhook after a verified payment**: Dodo `payment.succeeded`, or a Stripe subscription's first invoice. There is no public endpoint that adds backers.

## Revenue reporting

Every successful payment from either provider lands in the `payments` ledger. The admin **Reports** tab shows revenue per provider and currency for any date range. See [REPORTING.md](REPORTING.md).
