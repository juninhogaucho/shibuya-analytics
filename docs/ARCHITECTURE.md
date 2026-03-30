# Shibuya Architecture

Updated: 2026-03-28

This document replaces older architecture notes that framed Shibuya too narrowly as a report/dashboard app.

## System Role

Shibuya is the trader-facing product.

Its backend intelligence should come from `medallion`.
Its commercial relationship to props and brokers should remain flexible:
- direct trader
- partner-supported trader
- embedded partner intelligence
- full PropOS distribution where appropriate

## Canonical Product Model

### Customer Types

#### 1. Direct Trader

Uses Shibuya directly.

Needs:
- simple onboarding
- universal ingestion
- clear edge diagnosis
- behavior correction
- recurring value

#### 2. Partner-Supported Trader

Uses Shibuya while trading with a prop or broker that supports ingestion or embedded surfaces.

Needs:
- portability across firms
- low-friction account connection
- confidence that data is current and accurate

#### 3. Prop / Broker Partner

Consumes Shibuya intelligence for their traders or operators.

Needs:
- embedded or API-level access
- low switching friction
- optional path into PropOS

## Core Product Loop

The frontend should support this loop cleanly:

1. Account activation
2. Data ingestion
3. Baseline diagnosis
4. Ongoing append / sync
5. Current-state and next-session guidance
6. Improvement proof over time

If a page does not support this loop, it is secondary.

## Ingestion Architecture

Build ingestion as a ladder.

### Layer 1: Universal

- CSV uploads
- statement import
- paste parsing

This is mandatory because it keeps the product useful even when no connector exists.

### Layer 2: Platform Connectors

Examples:
- `MT4`
- `MT5`
- `cTrader`
- `Match-Trader`
- other major platforms later

This is the primary scaling layer.

### Layer 3: Partner Endpoints

Use only when deeper integration is required.

Examples:
- account history APIs
- trade webhooks
- payout / breach / funding events

### Layer 4: Embedded Surfaces

When a partner buys Shibuya intelligence directly, the same backend contracts should support:
- trader-facing insights
- operator-facing insights
- co-branded embeds

## Frontend Surface Map

### Public Shell

Purpose:
- communicate what Shibuya does
- convert direct traders
- explain partner-support logic

Rule:
- do not promise connector coverage that does not exist

### Activation And Onboarding

Purpose:
- verify the customer
- collect baseline inputs
- route them into the right ingestion path

### Trader Dashboard

Purpose:
- show current state
- show behavioral leaks
- show edge concentration
- show the next concrete action

### Append / Sync Surface

Purpose:
- keep the model current
- reduce ingestion friction

### Intervention Layer

Purpose:
- turn analytics into action
- stop the trader from repeating obvious damage patterns

## Backend Contract Expectations

The frontend should assume `medallion` provides:
- activation and session auth
- ingestion status
- baseline generation
- append / sync endpoints
- trader analytics modules
- intervention and alert payloads
- provenance and model versioning where needed

If an endpoint does not exist yet, the UI should degrade honestly.

## Truth Rules

1. Do not blur demo visuals with live trader state.
2. Do not present "AI insight" without a real decision implication.
3. Do not force partner-specific integration before universal ingestion is solid.
4. Do not optimize for dashboard breadth before loop completion.

## Current Strategic Priority

In order:

1. make Shibuya valuable to a direct trader
2. make it portable through connector architecture
3. make it embeddable for partner distribution
4. let PropOS become the highest-value deployment, not the only way the intelligence reaches traders
