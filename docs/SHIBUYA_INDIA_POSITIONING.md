# Shibuya India Positioning

Updated: 2026-04-02
Audience: founder, operator, next agent

## Canonical Decision

Shibuya now uses:
- an India-first direct-trader root on `/`
- a non-India direct-trader surface on `/global` or `/intl`

Shibuya does **not** use its primary public surface to sell:
- props
- brokers
- tech providers
- platform embedding

Those buyers belong on `Decrypt / PropOS`.

## Why India Matters

The supporting research is in [shibuya_india.md](C:/Users/W10/medallion/docs/research/shibuya_india.md).

The direct implication is:
- India is not just another geography
- it is one of the clearest direct-trader markets for Shibuya
- the pain is behavioral, large, culturally legible, and regulator-validated

The commercial wedge is not "analytics."

It is:
- know if the problem is edge or behavior
- know what the leak is costing in rupees
- know what changes next session

## Public Offer

India launch is now recurring-first, not one-time-report-first.

Current marketed offers:

1. `Psych Audit`
   - `INR 1,499 / month`
   - plan id: `shibuya_india_audit_monthly`
   - low-friction, self-serve, high-volume entry

2. `Reset Pro`
   - `INR 5,999 / month`
   - plan id: `shibuya_india_reset_pro_monthly`
   - deeper corrective tier with one guided review call in the first billing cycle

Both are sold as:
- payment
- activation
- live workspace
- password bootstrap
- trader-context setup
- upload
- edge-vs-behavior diagnosis
- next-session mandate

## Product Boundary

Public Shibuya is:

- `Shibuya Direct`
  - direct trader product
  - sample workspace before payment
  - live trader account after activation

Embedded Shibuya still exists strategically, but it is sold through `Decrypt / PropOS`, not the direct-trader site.

## Product Shape

India-first Shibuya should behave like a behavioral operating system, not a research report.

That means:
- the dashboard leads with an Action Board
- the product should know whether the trader is:
  - low-capital Indian retail F&O
  - prop-eval focused
  - mixed
  - already profitable but still leaking behaviorally
- outputs should adapt to:
  - capital reality
  - income pressure
  - broker/platform
  - primary instruments such as Nifty or BankNifty options

Current implementation now includes a trader-context onboarding layer to support that adaptation.

## Route Strategy

Current route logic:

- `/`
  - India-first direct-trader root
- `/global`
  - non-India direct-trader route
- `/partners`
  - backward-compatible handoff to Decrypt B2B

## Fulfillment Truth

Shibuya direct offers are no longer allowed to pretend they are static report products.

Checkout and fulfillment must lead to:
1. order confirmation
2. order code
3. activation
4. live workspace
5. return-password bootstrap
6. trader-context setup
7. ongoing recurring access controlled by subscription state

## Current Verification Truth

On the current edited local tree:
- India-first routing exists
- B2B leakage has been removed from the primary Shibuya public surface
- recurring India pricing exists in frontend and Medallion catalog logic
- activation-first fulfillment and password bootstrap are wired
- trader-context onboarding exists
- TypeScript is clean
- lint passes
- tests pass
- production build passes
- touched Medallion Python files compile cleanly

Still not proven:
- clean paid India canary
- recurring renewal proof on live infra

Do not overstate those as solved until the canaries exist.
