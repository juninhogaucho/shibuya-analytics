# Trader Runtime Contract

Updated: 2026-03-28
Scope: canonical runtime truth for `shibuya-analytics`

This file defines the only acceptable runtime model for the Shibuya trader product.

## Core Principle

The trader product has two meaningful runtime states:

1. Sample workspace
2. Live trader account

That is it.

## 1. Sample Workspace

Use this to let a trader inspect the product before real data exists.

Allowed:
- controlled sample trades
- controlled sample alerts
- controlled sample edge and slump outputs
- onboarding guidance that explains the workflow

Required:
- the product must clearly indicate that the trader is viewing sample data
- sample surfaces must teach the real workflow, not pretend the trader is already live
- entry points into the sample workspace must be framed as sample exploration, not production access

## 2. Live Trader Account

Use this when the trader has activated or signed in with a real account.

Required:
- dashboard surfaces must use real backend payloads or fail honestly
- missing data must show as absence, not theater
- upload, append, history, alerts, and prescriptions must bind to real account state

Forbidden:
- showing sample trades as if they belonged to the trader
- showing sample prescriptions as if they were generated from real uploads
- silently falling back from live account state to sample data on critical surfaces

## Technical Alias Rule

The repo still uses the token value `shibuya_demo_mode` as a technical alias for the sample workspace.

That is an implementation detail, not a product term.

Product copy, docs, and marketing should say:
- `sample workspace`
- `sample data`
- `live trader account`

Not:
- `demo mode`
- `demo dashboard`

## Product Rule

Shibuya is not a static report viewer.

It should feel like:
- a trader operating system
- a behavioral feedback loop
- a next-session decision tool

If a surface cannot clearly answer one of those jobs, it should not outrank launch-critical work.
