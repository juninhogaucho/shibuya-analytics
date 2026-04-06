export interface ActivationPayload {
  email: string
  orderCode: string
}

export interface ActivationResponse {
  status: 'pending' | 'ready' | 'error'
  message: string
  nextStep?: 'baseline' | 'dashboard'
  activationToken?: string
  customerId?: string
  passwordRequired?: boolean
  tier?: string
  planId?: string
  market?: 'global' | 'india'
  offerKind?: string
  caseStatus?: string
  accessExpiresAt?: string | null
  dataSource?: string | null
}

export interface TradePastePreview {
  rowsParsed: number
  symbols: string[]
  issues?: string[]
}

export interface TradePasteMemoryDelta {
  metric: string
  previous: string
  current: string
  delta: string
  direction: 'up' | 'down'
}

export interface TradePasteMemoryResponse {
  has_previous: boolean
  deltas: TradePasteMemoryDelta[]
  message: string
}

export interface TradeHistoryTrade {
  id: string
  timestamp: string
  exit_time?: string
  symbol: string
  side: 'BUY' | 'SELL' | string
  size: number
  pnl: number
  bds_at_time?: number
}

export interface TradeHistoryResponse {
  trades: TradeHistoryTrade[]
  total_count: number
  summary: {
    total_pnl: number
    win_count: number
    loss_count: number
    best_trade: number
    worst_trade: number
  }
}

export interface TradingReportRecord {
  id: string
  customer_id?: string | null
  email?: string | null
  name?: string | null
  discipline_score?: number | null
  emotional_cost?: number | null
  primary_pattern?: string | null
  report_pdf_path?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface TradingReportsResponse {
  status: string
  reports: TradingReportRecord[]
  count: number
}

export type TraderMode =
  | 'retail_fn0_struggler'
  | 'prop_eval_survival'
  | 'profitable_refiner'

export type CampaignStateLevel =
  | 'in_control'
  | 'under_pressure'
  | 'loss_of_command'

export type CampaignRiskTag =
  | 'revenge'
  | 'overtrading'
  | 'size_discipline'
  | 'drift'
  | 'fatigue'
  | 'complacency'

export interface DailyBriefingState {
  date: string
  current_state: CampaignStateLevel
  current_risk: CampaignRiskTag
  avoid_today: string
  mission_line: string
  headline?: string
  summary?: string
  action_plan?: string[]
  proof_focus?: string
  trader_mode?: TraderMode
  completed_at?: string
}

export interface DailyDebriefState {
  date: string
  gate_obeyed: boolean
  stopped_correctly: boolean
  protected_capital: boolean
  main_lapse: string
  main_win: string
  tomorrow_line: string
  standards_held_today: string[]
  standards_broken_today: string[]
  completed_at?: string
}

export interface CampaignJournalEntry {
  date: string
  briefing?: DailyBriefingState | null
  debrief?: DailyDebriefState | null
}

export interface CampaignMetrics {
  daily_briefing_completed: boolean
  daily_debrief: DailyDebriefState | null
  standards_held_today: string[]
  standards_broken_today: string[]
  saved_capital_vs_baseline: number
  clean_session_count: number
  revenge_free_streak: number
  size_discipline_streak: number
  sessions_stopped_correctly: number
  best_controlled_week: number
  recurring_enemy: string
  standards_held_most_often: string
  standards_broken_most_often: string
  most_dangerous_session: string
  cleanest_session: string
  last_real_improvement: string
}

export interface CampaignRecapArtifact {
  title: string
  subtitle: string
  highlights: string[]
  body: string
  sanitized_body: string
  filename: string
  sanitized_filename: string
}

export interface CampaignState {
  campaign_chapter: string
  operator_identity: string
  current_enemy: string
  mission_line: string
  momentum_line: string
  proof_target: string
  command_line: string
  daily_briefing_completed: boolean
  daily_debrief: DailyDebriefState | null
  standards_held_today: string[]
  standards_broken_today: string[]
  saved_capital_vs_baseline: number
  clean_session_count: number
  revenge_free_streak: number
  size_discipline_streak: number
  best_controlled_week: number
  weekly_recap_artifact?: CampaignRecapArtifact | null
  thirty_day_recap_artifact?: CampaignRecapArtifact | null
  sanitized_share_artifact?: CampaignRecapArtifact | null
}

export interface TradingReportSnapshot {
  snapshot_id: string
  upload_id?: string
  captured_at?: string | null
  discipline_tax: number
  discipline_tax_breakdown?: {
    revenge_trades: number
    overtrading: number
    size_violations: number
  }
  bql_score: number
  bql_state: string
  pnl_net: number
  pnl_gross: number
  total_trades: number
  winning_trades: number
  ruin_probability: number
  behavior_share: number
  breach_risk_score: number
  primary_pattern?: string | null
}

export interface TradingReportDeltaSummary {
  discipline_tax_change: number
  revenge_change: number
  overtrading_change: number
  size_change: number
  edge_vs_behavior_shift: string
  breach_risk_shift: string
  bql_change: number
}

export interface TradingReportComparisonResponse {
  has_comparison: boolean
  baseline: TradingReportSnapshot | null
  latest: TradingReportSnapshot | null
  delta_summary: TradingReportDeltaSummary | null
  last_report_snapshot_id?: string | null
}

export interface AnalysisSummary {
  state: CampaignStateLevel
  recovery_ladder: CampaignStateLevel
  current_enemy: string
  edge_verdict: string
  adherence_verdict: string
  conviction_posture: string
  risk_ruin_posture: string
  drift_posture: string
  next_session_command: string
  what_to_protect: string[]
}

export interface SupportSummary {
  open_count: number
  latest_ticket_id?: string | null
  latest_status?: string | null
  latest_priority?: string | null
  latest_subject?: string | null
}

export interface ReviewSummary {
  eligible: boolean
  touchpoint_1_status: 'locked' | 'available' | 'booked' | 'completed' | string
  touchpoint_2_status: 'locked' | 'available' | 'booked' | 'completed' | string
  next_review_type?: string | null
  upcoming_appointment_at?: string | null
}

export interface ArtifactDescriptor {
  kind: string
  label: string
  report_id?: string | null
  snapshot_id?: string | null
  available: boolean
}

export interface AppointmentSlot {
  datetime: string
  display: string
}

export interface AppointmentSlotResponse {
  slots: AppointmentSlot[]
  timezone: string
}

export interface AppointmentBookingResponse {
  success: boolean
  appointment_id: string
  scheduled_at: string
  appointment_type: string
  message: string
  meeting_link?: string | null
}

export interface AppointmentRecord {
  id: string
  type: string
  scheduled_at: string
  status: string
  meeting_link?: string | null
  duration_minutes?: number | null
}

export interface AppointmentHistoryResponse {
  appointments: AppointmentRecord[]
}

export interface SupportTicketSummary {
  id: string
  subject: string
  category?: string | null
  priority?: string | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
  message_count?: number
}

export interface SupportTicketListResponse {
  status: string
  tickets: SupportTicketSummary[]
  count: number
}

export interface SupportTicketMessage {
  id: string
  sender_id: string
  sender_type: string
  message: string
  is_internal?: boolean
  created_at?: string | null
}

export interface SupportTicketDetail extends SupportTicketSummary {
  customer_id?: string
  customer_email?: string | null
  messages: SupportTicketMessage[]
}

export interface SupportTicketDetailResponse {
  status: string
  ticket: SupportTicketDetail
}

export interface ShibuyaOpsCaseSummary {
  customer_id: string
  email?: string | null
  name?: string | null
  customer_status?: string | null
  tier?: string | null
  created_at?: string | null
  updated_at?: string | null
  plan_id?: string | null
  offer_kind?: string | null
  case_status?: string | null
  guided_review_status?: string | null
  guided_review_included?: boolean
  guided_review_booked_at?: string | null
  guided_review_completed_at?: string | null
  uploads_used?: number
  uploads_allowed?: number | null
  uploads_remaining?: number | null
  reports_ready?: number
  last_report_snapshot_id?: string | null
  access_expires_at?: string | null
  days_left?: number | null
  affiliate_slug?: string | null
  ref_code?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  broker?: string | null
  instrument_focus?: string[]
  trader_mode?: TraderMode
  next_action?: string | null
  latest_delta_summary?: TradingReportDeltaSummary | null
  premium_touchpoint_1_status?: string | null
  premium_touchpoint_2_status?: string | null
  last_reminder_sent?: string | null
  pending_support_need?: boolean
  pending_artifact_delivery?: boolean
}

export interface ShibuyaOpsCaseDetail extends ShibuyaOpsCaseSummary {
  profile_context?: Record<string, unknown>
  report_snapshots?: TradingReportSnapshot[]
  report_artifact_map?: Record<string, string>
  reports?: TradingReportRecord[]
  upload_history?: Array<Record<string, unknown>>
  ops_notes?: Array<{
    at?: string
    by?: string
    note?: string
  }>
}

export interface ShibuyaOpsCasesResponse {
  status: string
  count: number
  cases: ShibuyaOpsCaseSummary[]
}

export interface ShibuyaOpsCaseResponse {
  status: string
  case: ShibuyaOpsCaseDetail
}

export interface ShibuyaAffiliateRow {
  affiliate_slug?: string | null
  ref_code?: string | null
  utm_campaign?: string | null
  visits: number
  checkout_starts: number
  paid_conversions: number
  visit_to_checkout_rate: number
  checkout_to_paid_rate: number
  active_monthly_customers: number
  one_time_completions: number
  expired_one_time_customers: number
  monthly_at_risk: number
}

export interface ShibuyaAffiliateReportResponse {
  status: string
  rows: ShibuyaAffiliateRow[]
  note?: string
}

// Dashboard Types
export interface DashboardOverview {
  customer_id?: string
  access_tier?: string
  billing_status?: string
  offer_kind?: string
  case_status?: string
  trader_mode?: TraderMode
  next_action?: string
  access_expires_at?: string | null
  days_left?: number | null
  data_source?: string | null
  guided_review_included?: boolean
  guided_review_status?: string | null
  guided_review_booked_at?: string | null
  guided_review_completed_at?: string | null
  guided_review_url?: string | null
  profile_completed?: boolean
  upload_count?: number
  uploads_used?: number
  upload_limit?: number | null
  uploads_remaining?: number | null
  latest_upload_at?: string | null
  reports_ready?: number
  latest_report_at?: string | null
  last_report_snapshot_id?: string | null
  analysis_summary?: AnalysisSummary | null
  market_context_source?: string | null
  market_context_status?: string | null
  market_context_note?: string | null
  daily_briefing?: DailyBriefingState | null
  daily_debrief?: DailyDebriefState | null
  saved_capital_vs_baseline?: number
  loss_quality?: 'acceptable_losses' | 'leaking_discipline' | 'unacceptable_losses' | string | null
  standards_adherence?: number | null
  recurring_enemy?: string | null
  recovery_ladder?: CampaignStateLevel | null
  review_eligibility?: boolean
  review_summary?: ReviewSummary | null
  support_summary?: SupportSummary | null
  artifact_descriptors?: ArtifactDescriptor[]
  standards_held_today?: string[]
  standards_broken_today?: string[]
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

export type TraderCapitalBand =
  | 'under_50k_inr'
  | '50k_to_250k_inr'
  | '250k_to_1m_inr'
  | 'over_1m_inr'

export type TraderIncomeBand =
  | 'student_or_none'
  | 'under_25k_inr'
  | '25k_to_75k_inr'
  | '75k_to_200k_inr'
  | 'over_200k_inr'

export type TraderFocus =
  | 'retail_fo'
  | 'prop_eval'
  | 'mixed'
  | 'profitable_refinement'

export type TraderInstrumentFocus =
  | 'nifty_options'
  | 'banknifty_options'
  | 'stock_options'
  | 'futures'
  | 'forex'
  | 'gold'
  | 'crypto'
  | 'us_indices'
  | 'other'

export interface TraderProfileContext {
  capital_band: TraderCapitalBand
  monthly_income_band: TraderIncomeBand
  trader_focus: TraderFocus
  broker_platform: string
  primary_instruments: TraderInstrumentFocus[]
  trader_mode: TraderMode
  completed: boolean
  updated_at?: string | null
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
