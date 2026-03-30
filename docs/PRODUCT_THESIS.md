# Shibuya Product Thesis

Updated: 2026-03-28
Scope: canonical product thesis for `shibuya-analytics`

## What Shibuya Is

Shibuya is not a report generator.

Shibuya is a trader performance operating system.

It should help some traders become better traders and, through better process, more self-aware humans.

Its job is to help a trader:
- understand where their real edge lives
- see how they sabotage themselves between good trades
- recover faster from mistakes
- prepare better for the next session
- improve process, not just inspect damage afterward

## What Problem It Solves

Most traders do not fail because they never have a good trade.

They fail because:
- they press weak setups and hesitate on strong ones
- they revenge trade after negative reward shocks
- they size incorrectly when emotional state shifts
- they misread their own consistency
- they confuse intensity with quality

Shibuya exists to close that gap.

The product is not trying to prove that every trader can be saved.

It is trying to give serious traders a better chance to:
- see themselves clearly
- stop compounding avoidable mistakes
- recover faster
- earn the right to bigger opportunity through better behavior

## Product Rule

Every surface in Shibuya must answer at least one of these questions:

1. What is my actual edge?
2. What mistake am I repeating?
3. What state am I in right now?
4. What should I do before the next session?
5. What should I stop doing immediately?
6. What evidence shows I am improving?

If a metric does not change a trader decision or operator action, it is noise.

## Core Trader Loop

The canonical loop is:

1. Ingest trades or execution history.
2. Establish baseline and current state.
3. Diagnose behavioral leaks and edge concentration.
4. Prescribe the next concrete action.
5. Append new data after the next session.
6. Measure whether the trader followed the prescription.
7. Show improvement or relapse clearly.

The product should feel like a coach plus operating system, not a static analytics PDF.

## What Makes It Defensible

Shibuya becomes defensible when it combines:
- serious behavioral and risk inference
- trader-specific pattern detection
- session-by-session prescription
- cross-firm portability
- optional embedded distribution through props and brokers

The moat is not "we have many metrics."

The moat is:
- trader-specific inference
- actionable prescription
- portability across firms and brokers
- optional firm-side intelligence on the same engine

## Product Surfaces That Matter

### 1. Baseline

Show where the trader actually is:
- edge profile
- discipline leaks
- ruin / risk profile
- current strengths and liabilities

### 2. Session Preparation

Help the trader before damage happens:
- risk posture
- fatigue / readiness cues
- setup focus
- conditions to avoid

### 3. Trade Append / Review

Make it easy to keep the system current:
- CSV
- paste parsing
- later connectors

### 4. Crucial Moment / Intervention Layer

Translate patterns into action:
- stop trading this setup
- reduce size
- sit out this condition
- enforce a break after this type of loss
- focus only on these two edges this week

### 5. Improvement Proof

Show whether the trader is actually changing:
- discipline tax trend
- error recurrence trend
- edge concentration trend
- adherence to prescriptions

## Commercial Truth

Shibuya should serve three customer types:

### Direct Trader

Buys Shibuya for personal performance improvement.

### Partner-Supported Trader

Gets a better experience because their prop or broker supports Shibuya ingestion or embedded analytics.

### Prop / Broker

Buys embedded Shibuya or operator intelligence, with or without PropOS.

## Strategic Constraint

Do not build Shibuya as a generic "AI trading insights" app.

That is commodity behavior and easy to replace with a chat window.

Build it as:
- behavioral diagnosis
- process correction
- session-to-session operating system

That is harder to replace and more aligned with the mission.

## Human Constraint

Shibuya should respect the trader as a human performer, not reduce them to a score.

That means:
- state inference should lead to better action, not deterministic labeling
- the product should help the trader think and act better between sessions
- insights should be concrete enough to matter and humble enough not to pretend omniscience
