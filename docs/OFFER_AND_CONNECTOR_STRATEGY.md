# Offer And Connector Strategy

Updated: 2026-03-28
Scope: commercial and technical access model for Shibuya

## Core Principle

Shibuya should not depend on one connector per prop firm as the default model.

That path does not scale.

The correct approach is a connector ladder.

## Connector Ladder

### Tier 1. Universal Ingestion

Use when the trader or firm is not integrated yet.

Examples:
- CSV upload
- statement import
- paste parser

Why it matters:
- works with everyone
- fastest route to trader value
- no partner agreement required

### Tier 2. Platform-Level Connectors

Use one connector to unlock many firms or brokers.

Examples:
- `MT4`
- `MT5`
- `cTrader`
- `Match-Trader`
- `DXtrade`

Why it matters:
- much better scale than one-off firm integrations
- traders can move between firms without losing Shibuya value

### Tier 3. Partner Endpoints

Use when a prop or broker wants deeper data flow or richer embedded use.

Examples:
- trade / account history APIs
- webhooks
- position, payout, and intervention events

Why it matters:
- unlocks richer intelligence
- supports partner-specific UX
- creates an upgrade path into embedded Shibuya

### Tier 4. Embedded Shibuya

Use when the partner wants the intelligence layer inside their own product.

Examples:
- embedded trader dashboards
- operator alerts
- risk / behavior APIs
- co-branded partner surfaces

Why it matters:
- lets firms buy the intelligence without replacing their stack
- strongest bridge into PropOS for firms that later want full replacement

## Offer Ladder

### 1. Direct Trader Offer

What we sell:
- baseline diagnostic
- recurring performance operating system
- append-and-improve workflow

Why it wins:
- fastest proof of trader value
- independent of partner readiness

### 2. Supported-By-Shibuya Program

What we ask from firms:
- access to a safe ingestion endpoint or platform connection
- permission to advertise compatibility

What they get:
- trader acquisition signal
- trader retention upside
- optional firm-side intelligence
- future embedded upsell path

Why they should care:
- traders may prefer firms that support Shibuya
- better traders often trade longer and at larger size
- the same data can power operator intelligence later

### 3. Embedded Shibuya Offer

What we sell:
- behavioral/risk intelligence for the firm's current stack

Why it wins:
- no full replatform required
- lower switching friction
- easier first enterprise buy

### 4. Full PropOS Offer

What we sell:
- white-label operating system plus Shibuya intelligence

Why it wins:
- highest ACV
- strongest platform lock-in
- best expression of the full stack

## Commercial Positioning Rule

Do not force firms to choose between:
- keep their stack
- get Shibuya

That is too heavy a first ask.

The better ladder is:

1. support the endpoint or connector
2. prove trader demand and value
3. sell embedded Shibuya
4. sell PropOS when replacement becomes rational

## Product Rule

A trader should be able to say:

"I can use Shibuya whether or not my current firm uses PropOS."

And a firm should be able to say:

"We can buy Shibuya intelligence without replacing our tech stack on day one."

If both statements are not true, the strategy is too narrow.
