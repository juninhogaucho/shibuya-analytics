# Shibuya Sell And Fulfill

Updated: 2026-04-02

## What We Sell

Shibuya is a direct-trader performance operating system.

It does **not** sell:
- prop-firm infrastructure
- broker tooling
- white-label platform contracts
- PDF-only report delivery as the main product

It sells a live trader workspace that helps a trader answer three questions:
- is the real problem edge, behavior, or both
- what behavior is leaking money right now
- what should I do differently next session

### Current public offers

Global:
- `Psych Audit` (`shibuya_audit_monthly`) - `EUR 44 / month`
- `Reset Pro` (`shibuya_reset_pro_monthly`) - `EUR 199 / month`

India:
- `Psych Audit` (`shibuya_india_audit_monthly`) - `INR 1,499 / month`
- `Reset Pro` (`shibuya_india_reset_pro_monthly`) - `INR 5,999 / month`

These are recurring, activation-first live workspace products.

## What The Customer Actually Gets

After payment, the customer gets:
1. confirmation email
2. order code
3. activation path
4. live workspace access
5. password bootstrap on first live activation
6. upload/history/alerts/prescription loop
7. a trader-context setup layer so the action board can adapt to their real trading situation

The customer does **not** need founder intervention for the normal Shibuya path.

## Fulfillment Truth

The live path is now:
1. checkout creates a Stripe subscription session from the explicit plan catalog
2. success page shows order code and points to activation
3. webhook marks order paid and aligns recurring subscription state
4. fulfillment creates or updates the direct Shibuya customer record
5. activation verifies email + order code
6. activation issues live API token
7. first live access can bootstrap a return password
8. trader context can be captured and persisted
9. later visits can use normal email/password sign in

## What Changed On 2026-04-02

- chart lint debt was fixed so repo-wide ESLint passes
- Vitest was stabilized so the default test run passes on the current tree
- CI now runs `typecheck`, `lint`, `test:run`, and `build` on the current repo truth
- first-time live customers now have a proper claim-account/password-bootstrap step instead of relying on activation alone
- order confirmation email now matches activation-first workspace fulfillment instead of stale report/pack language
- India-first recurring pricing now replaces the old one-time public ladder
- the root route is now India-first and direct-trader only
- trader-context onboarding now exists so Shibuya can adapt to Indian retail F&O vs prop-eval intent

## Current Verification Truth

Current local tree:
- `npm run typecheck` passed
- `npm run lint` passed
- `npm run test:run` passed
- `npm run build` passed

Backend touched files:
- `python -m py_compile` passed for the relevant Medallion files

## Remaining Human-Only Steps

1. set live Stripe envs for:
   - `STRIPE_PRICE_SHIBUYA_AUDIT_MONTHLY`
   - `STRIPE_PRICE_SHIBUYA_RESET_PRO_MONTHLY`
   - `STRIPE_PRICE_SHIBUYA_INDIA_AUDIT_MONTHLY`
   - `STRIPE_PRICE_SHIBUYA_INDIA_RESET_PRO_MONTHLY`
2. set `VITE_DECRYPT_B2B_URL` if `/partners` should hard-handoff to Decrypt automatically
3. run one real paid canary:
   - checkout
   - success
   - activation
   - claim password
   - onboarding context
   - login
   - upload
4. decide whether India should enable extra payment methods such as UPI in Stripe

## Launch Claim Boundary

You can say:
- Shibuya sells recurring direct-trader live workspace access
- activation and fulfillment are wired for live use
- the repo is green locally

You should not yet say:
- India is proven at scale
- the product is battle-tested on paid traffic
- retention / renewal / continuity is already validated
