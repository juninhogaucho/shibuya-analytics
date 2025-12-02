export interface ActivationPayload {
  email: string
  orderCode: string
}

export interface ActivationResponse {
  status: 'pending' | 'ready' | 'error'
  message: string
  nextStep?: 'baseline' | 'dashboard'
  activationToken?: string
}

export interface TradePastePreview {
  rowsParsed: number
  symbols: string[]
  issues?: string[]
}

// Dashboard Types
export interface DashboardOverview {
  bql_state: string
  bql_score: number
  monte_carlo_drift: number
  ruin_probability: number
  discipline_tax_30d: number
  discipline_tax_breakdown?: {
    revenge_trades: number
    overtrading: number
    size_violations: number
  }
  sharpe_scenario: number
  pnl_gross?: number
  pnl_net?: number
  total_trades?: number
  winning_trades?: number
  edge_portfolio: EdgeItem[]
  recent_errors?: RecentError[]
  loyalty_unlock: LoyaltyUnlock | null
  next_coach_date: string
  streak?: {
    current: number
    best: number
    message: string
  }
}

export interface RecentError {
  date: string
  pair: string
  error: string
  cost: number
}

export interface EdgeItem {
  name: string
  status: 'PRIME' | 'STABLE' | 'DECAYED'
  win_rate: number
  pnl?: number
  trades?: number
  avg_rr?: number
  expectancy?: number
  sharpe?: number
  max_dd_pct?: number
  best_month?: string
  action: string
}

export interface LoyaltyUnlock {
  month: number
  reward: string
  message: string
  progress_pct?: number
}

export interface AlertItem {
  id: string
  type: 'crucial_moment' | 'slump_warning' | 'margin_of_safety' | 'info'
  title: string
  body: string
  severity: 'high' | 'medium' | 'low' | 'info'
  timestamp: string
  acknowledged: boolean
}

export interface AlertsResponse {
  alerts: AlertItem[]
  unread_count: number
}

export interface EdgePortfolioResponse {
  edges: EdgeItem[]
  summary: {
    total: number
    prime: number
    decayed: number
    stable: number
    total_pnl?: number
    recommendation: string
  }
}

export interface SlumpPrescription {
  is_slump: boolean
  bql_state: string
  consecutive_losses?: number
  drawdown_pct?: number
  days_in_slump?: number
  prescription: {
    max_trades_per_session: number
    banned_assets: string[]
    position_cap_pct: number
    cooldown_hours: number
    message: string
    rules: string[]
    recovery_criteria?: string[]
    historical_context?: string
  } | null
}

// Shadow Boxing - Prop Firm Simulations
export interface PropFirmSimulation {
  firm: string
  account_size: number
  profit_target_pct: number
  max_dd_pct: number
  your_pnl_pct: number
  your_max_dd_pct: number
  passed: boolean
  pass_probability: number
  failure_reason?: string
  improvement_needed?: string
  days_to_pass?: number
  buffer?: string
}

export interface ShadowBoxingResponse {
  simulations: PropFirmSimulation[]
  best_result: PropFirmSimulation | null
  message: string
  capital_ready_score?: number
  capital_ready_breakdown?: {
    consistency: number
    drawdown_control: number
    profit_factor: number
    recommendation: string
  }
}
