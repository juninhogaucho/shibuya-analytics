export type EngineCategory = 'state' | 'attribution' | 'decay' | 'risk' | 'action' | 'trust'

export interface EngineCategoryConfig {
  label: string
  color: string
}

export interface EngineDefinition {
  id: string
  name: string
  shortName: string
  category: EngineCategory
  domain: string
  domainColor: string
  pitchLine: string
  formula: string
  formulaExplain: string
  whatItDoes: string
  whyThisMath: string
  institutional: string
  realDepth: string
  vsOthers: string
  reference: string
  forYou: string
}

export const ENGINE_CATEGORIES: Record<EngineCategory, EngineCategoryConfig> = {
  state: { label: 'Trader state', color: '#8b5cf6' },
  attribution: { label: 'Attribution', color: '#06b6d4' },
  decay: { label: 'Decay', color: '#f59e0b' },
  risk: { label: 'Risk boundary', color: '#ef4444' },
  action: { label: 'Action policy', color: '#22c55e' },
  trust: { label: 'Proof trail', color: '#94a3b8' },
}

const baseProofBoundary =
  'This is a product-facing review primitive: it should surface evidence, constraints, and next checks. It is not a live guarantee until connected to the validated backend, broker/order data, and generated artifacts.'

export const ENGINES: EngineDefinition[] = [
  {
    id: 'bql',
    name: 'Behavioral Quality Ledger',
    shortName: 'BQL',
    category: 'state',
    domain: 'Behavior',
    domainColor: ENGINE_CATEGORIES.state.color,
    pitchLine: 'Separates good execution from lucky outcomes.',
    formula: 'quality = rule_fit * context_score - avoidable_error_load',
    formulaExplain:
      'The useful unit is not raw PnL. The useful unit is whether a decision matched the rules, context, and risk budget available at the time.',
    whatItDoes:
      'Turns uploaded trade history into a ledger of rule-fit, avoidable mistakes, and repeatable strengths.',
    whyThisMath:
      'A trader can make money while degrading process. This check keeps outcome and decision quality separate.',
    institutional:
      'Desks review decision process, risk budget use, and mandate fit instead of celebrating isolated wins.',
    realDepth: baseProofBoundary,
    vsOthers:
      'Most dashboards stop at win rate, expectancy, and drawdown. This layer asks whether the trader deserved the result.',
    reference:
      'Inspired by process attribution, decision quality scoring, and behavioral finance controls.',
    forYou:
      'You see which wins are worth scaling and which losses were acceptable business costs.',
  },
  {
    id: 'hddm',
    name: 'Hesitation and Drift Review',
    shortName: 'HDDM',
    category: 'state',
    domain: 'Behavior',
    domainColor: ENGINE_CATEGORIES.state.color,
    pitchLine: 'Flags when timing drift changes the trade before entry.',
    formula: 'drift = observed_entry - planned_entry | context',
    formulaExplain:
      'The check compares intended execution against actual execution under the same market context.',
    whatItDoes:
      'Highlights late entries, rushed exits, and hesitation patterns that repeatedly change trade quality.',
    whyThisMath:
      'Execution drift is often invisible in aggregate PnL but visible in timing deltas and rule deviation.',
    institutional:
      'Execution teams review slippage, latency, and mandate drift because small deviations compound.',
    realDepth: baseProofBoundary,
    vsOthers:
      'A normal journal records the trade. This review asks whether the trader entered the trade they planned.',
    reference:
      'Inspired by drift-diffusion style decision review and execution-quality analysis.',
    forYou:
      'You know whether your edge is being lost before the position even starts.',
  },
  {
    id: 'quantum',
    name: 'Regime Conflict Check',
    shortName: 'RCC',
    category: 'state',
    domain: 'Regime',
    domainColor: ENGINE_CATEGORIES.state.color,
    pitchLine: 'Shows when two incompatible trade stories are being mixed.',
    formula: 'conflict = exposure_story_a overlap exposure_story_b',
    formulaExplain:
      'The check looks for contradictory assumptions across positions, timeframes, and stated setup logic.',
    whatItDoes:
      'Finds sessions where the trader is effectively long one narrative and short another without noticing.',
    whyThisMath:
      'A bad day often starts as narrative conflict, not as one obviously bad trade.',
    institutional:
      'Portfolio teams test whether positions express a coherent view or cancel each other under stress.',
    realDepth: baseProofBoundary,
    vsOthers:
      'Most tools summarize trades independently. This check reviews whether the whole session makes sense.',
    reference:
      'Inspired by portfolio coherence checks and cognitive conflict review.',
    forYou:
      'You stop stacking positions that fight each other while pretending to diversify.',
  },
  {
    id: 'dean',
    name: 'Decision Attribution Engine',
    shortName: 'DEAN',
    category: 'attribution',
    domain: 'Attribution',
    domainColor: ENGINE_CATEGORIES.attribution.color,
    pitchLine: 'Explains what actually drove the account change.',
    formula: 'account_delta = size + selection + timing + error + market',
    formulaExplain:
      'The change in equity is decomposed into controllable and less-controllable contributors.',
    whatItDoes:
      'Breaks a session into drivers: sizing, selection, timing, market state, and avoidable process error.',
    whyThisMath:
      'Without attribution, traders overfit stories to whatever happened last.',
    institutional:
      'Funds attribute return before changing process because the wrong cause leads to the wrong fix.',
    realDepth: baseProofBoundary,
    vsOthers:
      'A PnL chart says what happened. Attribution says what to protect, repair, or ignore.',
    reference:
      'Inspired by performance attribution and post-trade review workflows.',
    forYou:
      'You can tell whether the fix is sizing, setup selection, patience, or doing less.',
  },
  {
    id: 'counterfactual',
    name: 'Counterfactual Session Replay',
    shortName: 'CSR',
    category: 'attribution',
    domain: 'Attribution',
    domainColor: ENGINE_CATEGORIES.attribution.color,
    pitchLine: 'Tests the session against the rules you claim to follow.',
    formula: 'counterfactual = session_result(rule_set_applied)',
    formulaExplain:
      'The replay estimates what changes if obvious rule violations are removed or constraints are applied.',
    whatItDoes:
      'Shows whether the account needed more edge or simply needed the existing rules enforced.',
    whyThisMath:
      'The fastest improvement is often removing known violations rather than inventing a new strategy.',
    institutional:
      'Risk teams compare actual behavior to mandate-compliant behavior before changing allocation.',
    realDepth: baseProofBoundary,
    vsOthers:
      'Most reviews tell you to be disciplined. This one shows the cost of not being disciplined.',
    reference:
      'Inspired by causal review and counterfactual policy evaluation.',
    forYou:
      'You see the monetary cost of breaking your own constraints.',
  },
  {
    id: 'afma',
    name: 'Alpha Fatigue Monitor',
    shortName: 'AFMA',
    category: 'decay',
    domain: 'Decay',
    domainColor: ENGINE_CATEGORIES.decay.color,
    pitchLine: 'Flags when an edge starts behaving like a habit.',
    formula: 'fatigue = edge_quality_t - edge_quality_baseline',
    formulaExplain:
      'The check compares recent setup behavior against a baseline rather than assuming old performance still applies.',
    whatItDoes:
      'Identifies setups whose quality, frequency, or payoff profile is degrading.',
    whyThisMath:
      'Many traders keep scaling a pattern after the market has stopped paying it.',
    institutional:
      'Managers monitor strategy decay before drawdown makes the problem obvious.',
    realDepth: baseProofBoundary,
    vsOthers:
      'A normal dashboard waits for drawdown. This review watches for edge degradation earlier.',
    reference:
      'Inspired by alpha decay monitoring and rolling performance diagnostics.',
    forYou:
      'You know what to pause before it becomes the reason the account breaks.',
  },
  {
    id: 'lyapunov',
    name: 'Instability Detector',
    shortName: 'LID',
    category: 'decay',
    domain: 'Decay',
    domainColor: ENGINE_CATEGORIES.decay.color,
    pitchLine: 'Finds when small mistakes start compounding into loss of control.',
    formula: 'instability = error_growth / session_time',
    formulaExplain:
      'The review watches whether small deviations accelerate across a session instead of remaining isolated.',
    whatItDoes:
      'Flags spiral sessions: revenge sizing, repeated re-entry, and shrinking rule quality after stress.',
    whyThisMath:
      'The account usually fails through compounding behavior, not one single bad click.',
    institutional:
      'Risk controls are designed around escalation because instability is path dependent.',
    realDepth: baseProofBoundary,
    vsOthers:
      'Most products mark drawdown. This check marks the behavioral acceleration that produced it.',
    reference:
      'Inspired by stability analysis and escalation control.',
    forYou:
      'You get a clear reason to stop trading before the day becomes structurally worse.',
  },
  {
    id: 'evt',
    name: 'Tail Loss Boundary',
    shortName: 'EVT',
    category: 'risk',
    domain: 'Risk',
    domainColor: ENGINE_CATEGORIES.risk.color,
    pitchLine: 'Shows the account state where normal risk rules stop being enough.',
    formula: 'tail_boundary = quantile(loss | stress_state)',
    formulaExplain:
      'The check focuses on severe downside states rather than average outcomes.',
    whatItDoes:
      'Highlights the drawdown and loss clusters that deserve hard constraints.',
    whyThisMath:
      'Averages hide the conditions that actually end funded accounts.',
    institutional:
      'Risk teams model tails because survival is decided in abnormal states.',
    realDepth: baseProofBoundary,
    vsOthers:
      'Most tools show max loss after the fact. This review turns tail zones into operating boundaries.',
    reference:
      'Inspired by extreme value thinking and stress-risk controls.',
    forYou:
      'You know which conditions require smaller size, fewer trades, or no session.',
  },
  {
    id: 'cox',
    name: 'Breach Hazard Review',
    shortName: 'BHR',
    category: 'risk',
    domain: 'Risk',
    domainColor: ENGINE_CATEGORIES.risk.color,
    pitchLine: 'Estimates what behavior is moving the account toward rule breach.',
    formula: 'hazard = f(drawdown, size, frequency, rule_drift)',
    formulaExplain:
      'The review links account conditions and behavior to breach pressure without pretending to predict certainty.',
    whatItDoes:
      'Ranks the drivers that make an account more fragile under prop-style constraints.',
    whyThisMath:
      'The question is not whether the trader is good. The question is whether the account can survive the next bad sequence.',
    institutional:
      'Survival analysis is useful when the endpoint is a breach, stop, or failure event.',
    realDepth: baseProofBoundary,
    vsOthers:
      'A dashboard can show distance to max drawdown. This explains what is eating that distance.',
    reference:
      'Inspired by hazard modeling and account survival review.',
    forYou:
      'You can change the behavior most likely to break the account first.',
  },
  {
    id: 'copula',
    name: 'Hidden Correlation Check',
    shortName: 'HCC',
    category: 'risk',
    domain: 'Risk',
    domainColor: ENGINE_CATEGORIES.risk.color,
    pitchLine: 'Reveals when trades that look separate fail together.',
    formula: 'joint_stress = dependence(asset_a, asset_b | stress)',
    formulaExplain:
      'The check looks at dependence under stress rather than calm-market correlation alone.',
    whatItDoes:
      'Finds clustered exposure across symbols, setups, sessions, or narratives.',
    whyThisMath:
      'Diversification that disappears under stress is not protection.',
    institutional:
      'Portfolios monitor joint failure because correlated losses create liquidity and breach events.',
    realDepth: baseProofBoundary,
    vsOthers:
      'Most dashboards count trades. This review asks whether those trades are secretly one big bet.',
    reference:
      'Inspired by dependence modeling and portfolio stress review.',
    forYou:
      'You avoid stacking positions that all lose for the same reason.',
  },
  {
    id: 'dml',
    name: 'Decision Margin Layer',
    shortName: 'DML',
    category: 'action',
    domain: 'Action',
    domainColor: ENGINE_CATEGORIES.action.color,
    pitchLine: 'Turns review evidence into the next-session constraint.',
    formula: 'next_action = argmax(survival + quality | constraints)',
    formulaExplain:
      'The output is a constraint or checklist item, not a generic motivational summary.',
    whatItDoes:
      'Maps evidence into practical next steps: reduce size, narrow setup, pause a symbol, or require proof.',
    whyThisMath:
      'Insight is useless unless it changes what the trader is allowed to do next.',
    institutional:
      'Operating reviews end with mandates, risk limits, and monitored changes.',
    realDepth: baseProofBoundary,
    vsOthers:
      'Most apps produce analysis. This layer should produce an operating decision.',
    reference:
      'Inspired by policy learning, decision support, and constraint-based operating systems.',
    forYou:
      'You leave the review with one or two concrete constraints for the next session.',
  },
  {
    id: 'snell',
    name: 'Stop-or-Continue Gate',
    shortName: 'SCG',
    category: 'action',
    domain: 'Action',
    domainColor: ENGINE_CATEGORIES.action.color,
    pitchLine: 'Decides when continuing has worse expected value than stopping.',
    formula: 'continue_if EV(next_trade) > value(stop)',
    formulaExplain:
      'The check compares the value of another trade against preserving account state.',
    whatItDoes:
      'Creates a session gate for when to stop, reduce size, or require a reset.',
    whyThisMath:
      'The best trade on many days is protecting the right to trade tomorrow.',
    institutional:
      'Desks use limits and stop rules because opportunity value includes survival.',
    realDepth: baseProofBoundary,
    vsOthers:
      'Most products tell you what happened. This one should help decide whether the next trade is allowed.',
    reference:
      'Inspired by optimal stopping and risk-limit governance.',
    forYou:
      'You get a defensible reason to stop while the account is still alive.',
  },
]

