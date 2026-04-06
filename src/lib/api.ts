import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from './constants'
import { clearShibuyaSession, getStoredApiKey, isSampleMode, setLiveApiKey, updateSessionMeta } from './runtime'
import { readAffiliateAttribution } from './affiliateAttribution'
import { deriveTraderModeFromProfileContext } from './traderMode'
import type { 
  ActivationPayload, 
  ActivationResponse, 
  TradePastePreview,
  TradePasteMemoryResponse,
  TradeHistoryResponse,
  TradingReportsResponse,
  TradingReportComparisonResponse,
  DashboardOverview,
  AlertsResponse,
  EdgePortfolioResponse,
  SlumpPrescription,
  ShadowBoxingResponse,
  TraderProfileContext,
  DailyBriefingState,
  DailyDebriefState,
  AppointmentSlotResponse,
  AppointmentBookingResponse,
  AppointmentHistoryResponse,
  SupportTicketListResponse,
  SupportTicketDetailResponse,
  ShibuyaOpsCasesResponse,
  ShibuyaOpsCaseResponse,
  ShibuyaAffiliateReportResponse,
} from './types'

// Error types for better handling
export class ApiError extends Error {
  status: number
  requestId?: string
  
  constructor(message: string, status: number, requestId?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.requestId = requestId
  }
}

// Friendly error messages
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your data and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You don\'t have permission to access this resource.',
  404: 'The requested resource was not found.',
  413: 'File too large. Maximum size is 10MB.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error. Please try again in a few moments.',
  503: 'Service temporarily unavailable. We\'re working on it.',
}

function getErrorMessage(error: AxiosError): string {
  const status = error.response?.status || 0
  const data = error.response?.data as Record<string, unknown> | undefined
  
  // Check for specific error message from backend
  if (data?.detail && typeof data.detail === 'string') {
    return data.detail
  }
  if (data?.error && typeof data.error === 'string') {
    return data.error
  }
  
  // Network error
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Unable to connect to server. Please check your internet connection.'
  }
  
  // Timeout
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.'
  }
  
  // Use friendly message or fallback
  return ERROR_MESSAGES[status] || 'Something went wrong. Please try again.'
}

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for file uploads
  headers: {
    'X-Brand': 'shibuya',
  },
})

// Add auth token to requests
http.interceptors.request.use((config) => {
  const token = getStoredApiKey()
  if (token) {
    config.headers['X-API-Key'] = token
  }
  return config
})

// Handle auth errors
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const requestId = (error.response?.headers?.['x-request-id'] as string) || undefined
    
    if (status === 401) {
      clearShibuyaSession()
      window.location.href = '/login?session=expired'
    }
    
    // Create a friendly error with request ID for support
    const message = getErrorMessage(error)
    throw new ApiError(message, status || 0, requestId)
  }
)

// Retry logic for transient failures
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry client errors (4xx) or auth errors
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error
      }
      
      // Only retry on network/server errors
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }
  
  throw lastError
}

// Sample data used to teach the workflow before a trader has live account data.
const DEMO_DATA = {
  overview: {
    access_tier: 'psych_audit',
    billing_status: 'active',
    offer_kind: 'psych_audit',
    case_status: 'delivered',
    trader_mode: 'retail_fn0_struggler' as const,
    next_action: 'Upload next meaningful session',
    days_left: 18,
    access_expires_at: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    data_source: 'broker_csv',
    guided_review_included: false,
    guided_review_status: null,
    guided_review_booked_at: null,
    guided_review_completed_at: null,
    guided_review_url: null,
    profile_completed: true,
    upload_count: 2,
    uploads_used: 2,
    upload_limit: null,
    uploads_remaining: null,
    latest_upload_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reports_ready: 1,
    latest_report_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    last_report_snapshot_id: 'sample-upload-2',
    analysis_summary: {
      state: 'under_pressure' as const,
      recovery_ladder: 'under_pressure' as const,
      current_enemy: 'Overtrading is the main leak taxing the account right now.',
      edge_verdict: 'Edge is present, but behavior is still taxing it.',
      adherence_verdict: 'Standards are slipping. Tighten the loop before the leak compounds.',
      conviction_posture: 'Conviction is being wasted on too many decisions.',
      risk_ruin_posture: 'Ruin pressure is visible. One uncontrolled sequence can still do serious damage.',
      drift_posture: 'Drift is improving, but only if the next upload confirms it.',
      next_session_command: 'Trade fewer times and only from the first clean setup that actually deserves risk.',
      what_to_protect: [
        'Protect capital runway before you try to make the session exciting.',
        'Protect the process that already produced positive net P&L.',
        'Protect yourself from expiry-day size creep and zero-to-hero impulses.',
      ],
    },
    daily_briefing: {
      date: new Date().toISOString().slice(0, 10),
      current_state: 'under_pressure' as const,
      current_risk: 'overtrading' as const,
      avoid_today: 'Overtrading is the main leak taxing the account right now.',
      mission_line: 'Trade fewer times and only from the first clean setup that actually deserves risk.',
      headline: 'Lock the mission before the first order.',
      summary: 'Protect capital runway before you try to make the session exciting.',
      action_plan: [
        'Trade fewer times and only from the first clean setup that actually deserves risk.',
        'Protect capital runway before you try to make the session exciting.',
        'Upload the next meaningful session quickly so the proof loop stays honest.',
      ],
      proof_focus: 'Recover the next slice of discipline leak from 8100 worth of avoidable damage.',
      trader_mode: 'retail_fn0_struggler' as const,
      completed_at: new Date().toISOString(),
    },
    daily_debrief: {
      date: new Date().toISOString().slice(0, 10),
      gate_obeyed: true,
      stopped_correctly: true,
      protected_capital: true,
      main_lapse: 'Took one unnecessary expiry-day chase after the best move was gone.',
      main_win: 'Did not attempt to win the day back after the first red sequence.',
      tomorrow_line: 'Trade less, trade cleaner, and stop after the first reactive impulse.',
      standards_held_today: ['Capital preserved', 'Stop respected'],
      standards_broken_today: ['Overtrading'],
      completed_at: new Date().toISOString(),
    },
    saved_capital_vs_baseline: 2700,
    loss_quality: 'leaking_discipline',
    standards_adherence: 72,
    recurring_enemy: 'overtrading',
    recovery_ladder: 'under_pressure' as const,
    review_eligibility: false,
    review_summary: {
      eligible: false,
      touchpoint_1_status: 'locked',
      touchpoint_2_status: 'locked',
      next_review_type: 'kickoff_review',
      upcoming_appointment_at: null,
    },
    support_summary: {
      open_count: 0,
      latest_ticket_id: null,
      latest_status: null,
      latest_priority: null,
      latest_subject: null,
    },
    artifact_descriptors: [
      {
        kind: 'baseline_report',
        label: 'Baseline Brief',
        report_id: 'sample-report-baseline',
        snapshot_id: 'sample-upload-1',
        available: true,
      },
      {
        kind: 'latest_report',
        label: 'Latest Progress Brief',
        report_id: 'sample-report-latest',
        snapshot_id: 'sample-upload-2',
        available: true,
      },
      {
        kind: 'delta_report',
        label: 'Baseline vs Latest Delta',
        report_id: 'sample-report-latest',
        snapshot_id: 'sample-upload-2',
        available: true,
      },
    ],
    standards_held_today: ['Capital preserved', 'Stop respected'],
    standards_broken_today: ['Overtrading'],
    // BQL = Behavioral Quality Level: 0 = robot, 1 = full tilt
    bql_state: 'MEDIOCRE',
    bql_score: 0.58, // 58% emotional influence detected
    // Monte Carlo: Expected PnL minus luck = your true edge value
    monte_carlo_drift: 8920, // You're ₹8,920 ahead of pure luck
    ruin_probability: 0.034, // 3.4% chance of blowing account
    // The money you earned then gave back through discipline failures
    discipline_tax_30d: 8100, // Lost ₹8,100 to revenge trades, overtrading, etc.
    discipline_tax_breakdown: {
      revenge_trades: 4200,
      overtrading: 2350,
      size_violations: 1550,
    },
    sharpe_scenario: 1.67,
    pnl_gross: 30810, // Sum of all winning trades
    pnl_net: 22710, // Gross minus discipline tax (30810 - 8100)
    total_trades: 30,
    winning_trades: 20,
    // The real edges in your trading
    edge_portfolio: [
      { 
        name: 'Nifty opening drive', 
        status: 'PRIME' as const, 
        win_rate: 71, 
        pnl: 12300,
        trades: 12,
        avg_rr: 2.1,
        action: 'Based on YOUR data: This is your cleanest edge right now. When you trade the Nifty opening drive with discipline, the account actually moves forward.' 
      },
      { 
        name: 'BankNifty reversal fade', 
        status: 'STABLE' as const, 
        win_rate: 58, 
        pnl: 8900,
        trades: 10,
        avg_rr: 1.4,
        action: 'Based on YOUR data: This still works, but only when you let the first move exhaust itself. It breaks down when you chase volatility instead of fading it.' 
      },
      { 
        name: 'Expiry-day breakout chase', 
        status: 'DECAYED' as const, 
        win_rate: 39, 
        pnl: -6400,
        trades: 8,
        avg_rr: 0.8,
        action: 'Based on YOUR data: You have leaked about ₹6,400 on this setup in the last 30 days. Stop trading it immediately. Every trade here is taxing the account.' 
      },
    ],
    // Recent costly mistakes with specific details
    recent_errors: [
      { date: '2025-11-28', pair: 'BANKNIFTY', error: 'Revenge trade after the first expiry loss', cost: 520 },
      { date: '2025-11-25', pair: 'NIFTY', error: 'Doubled size into a losing options chase', cost: 380 },
      { date: '2025-11-22', pair: 'RELIANCE', error: '4th trade in 90min after the best move was already gone', cost: 290 },
    ],
    loyalty_unlock: {
      month: 2,
      reward: 'Premium reset review',
      message: 'Complete 30 more disciplined days and unlock a deeper reset review on the next cycle.',
      progress_pct: 67,
    },
    next_coach_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    streak: {
      current: 4,
      best: 12,
      message: '4-day discipline streak. Your best was 12 days (Oct 3-15).',
    },
  },
  alerts: {
    alerts: [
      { 
        id: '1', 
        type: 'crucial_moment' as const, 
        title: '🚨 Revenge Pattern Detected', 
        body: 'After your first BankNifty expiry loss, you took 3 more trades in 47 minutes. All losses. Total damage: ₹8,920. Your rule says "minimum 2-hour pause after a large loss".',
        severity: 'high' as const, 
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), 
        acknowledged: false,
        trade_ids: ['T-1847', 'T-1848', 'T-1849'],
      },
      { 
        id: '2', 
        type: 'margin_of_safety' as const, 
        title: '📊 Weekly Margin of Safety Report', 
        body: 'Your MoS improved from 1.2R to 1.8R this week. Main driver: you stopped forcing late index-option trades after the morning edge was already gone.',
        severity: 'info' as const, 
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), 
        acknowledged: false,
      },
      { 
        id: '3', 
        type: 'slump_warning' as const, 
        title: '⚠️ Wednesday Blowup Analysis', 
        body: 'Wednesday losses totaled ₹12,400 (3.8x your daily average). Breakdown: 67% came from BankNifty expiry chasing. 23% came from size violations after the first red trade.',
        severity: 'medium' as const, 
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), 
        acknowledged: true,
      },
      { 
        id: '4', 
        type: 'crucial_moment' as const, 
        title: '🎯 Prime Edge Opportunity Missed', 
        body: 'Your Nifty opening drive setup triggered cleanly at the open, but you were not at screen. This setup has 71% win rate and 2.1 average RR. Estimated opportunity cost: ₹6,800.',
        severity: 'medium' as const, 
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), 
        acknowledged: false,
      },
      { 
        id: '5', 
        type: 'info' as const, 
        title: '📈 Edge Portfolio Update', 
        body: 'BankNifty reversal fade has been upgraded from DECAYED to STABLE after 8 consecutive positive weeks. Resume with small size, not hero size.',
        severity: 'low' as const, 
        timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), 
        acknowledged: true,
      },
    ],
    unread_count: 3,
  },
  edgePortfolio: {
    edges: [
      { 
        name: 'Nifty opening drive', 
        status: 'PRIME' as const, 
        win_rate: 71,
        pnl: 42300,
        trades: 34,
        avg_rr: 2.1,
        expectancy: 0.89,
        sharpe: 2.3,
        max_dd_pct: 3.2,
        best_month: 'October (+₹21,400)',
        action: 'YOUR ACTION: This is your moneymaker. You made the bulk of your gains here. Trade more of this and less of the noisy setups draining the account.' 
      },
      { 
        name: 'BankNifty reversal fade', 
        status: 'STABLE' as const, 
        win_rate: 58,
        pnl: 18900,
        trades: 41,
        avg_rr: 1.4,
        expectancy: 0.34,
        sharpe: 1.4,
        max_dd_pct: 5.1,
        best_month: 'September (+₹8,900)',
        action: 'YOUR ACTION: Keep trading it, but only after the first move exhausts itself. Skip it when volatility turns the setup into a chase.' 
      },
      { 
        name: 'Expiry-day breakout chase', 
        status: 'DECAYED' as const, 
        win_rate: 39,
        pnl: -16400,
        trades: 28,
        avg_rr: 0.8,
        expectancy: -0.42,
        sharpe: -0.8,
        max_dd_pct: 12.3,
        best_month: 'None (negative all 3 months)',
        action: 'YOUR ACTION: Stop immediately. You have leaked ₹16,400 on 28 trades. This setup has been negative for 3 straight months. It is not recovering yet.' 
      },
      { 
        name: 'Options scalp around VWAP', 
        status: 'STABLE' as const, 
        win_rate: 52,
        pnl: 7200,
        trades: 12,
        avg_rr: 1.9,
        expectancy: 0.21,
        sharpe: 1.1,
        max_dd_pct: 4.8,
        best_month: 'November (+₹4,800)',
        action: 'YOUR ACTION: Promising but unproven. Only 12 trades. Keep size small until you have 25+ trades to confirm it works.' 
      },
      { 
        name: 'Friday overtrade spiral', 
        status: 'DECAYED' as const, 
        win_rate: 44,
        pnl: -8900,
        trades: 32,
        avg_rr: 0.6,
        expectancy: -0.28,
        sharpe: -0.5,
        max_dd_pct: 8.7,
        best_month: 'None',
        action: 'YOUR ACTION: Your Friday afternoon trading is -₹8,900. Your Friday win rate is 31% versus 59% from Monday to Thursday. Cut Friday afternoon trading after the edge is gone.' 
      },
    ],
    summary: {
      total: 5,
      prime: 1,
      decayed: 2,
      stable: 2,
      total_pnl: 43100,
      recommendation: 'Your portfolio is unbalanced. Most of your gains come from the Nifty opening drive. Kill the expiry-day chase and the Friday overtrade spiral now. If you only trade PRIME + STABLE edges at proper size, your monthly trajectory improves sharply.',
    },
  },
  slump: {
    is_slump: true,
    bql_state: 'EMOTIONAL_TRAINWRECK',
    consecutive_losses: 7,
    drawdown_pct: 8.4,
    days_in_slump: 3,
    prescription: {
      message: 'You are in a verified slump. Your last 7 trades were losses totaling ₹21,800. BQL score spiked from 0.34 to 0.81 in 48 hours. This is not an edge problem right now, it is a state-management problem. Follow this prescription for the next 72 hours.',
      max_trades_per_session: 2,
      banned_assets: ['BANKNIFTY weeklys', 'MIDCPNIFTY', 'FINNIFTY'],
      position_cap_pct: 25,
      cooldown_hours: 4,
      rules: [
        'Maximum 2 trades per session (you averaged 6.3 during this slump)',
        'Position size capped at 25% of your normal size',
        'No trading BankNifty weeklys, MIDCPNIFTY, or FINNIFTY. These are your tilt instruments right now.',
        'Mandatory 4-hour cooldown between sessions',
        'Must journal BEFORE placing any trade (screenshot required)',
        'If you hit a daily loss limit of ₹4,000, you are done for 48 hours, non-negotiable',
      ],
      recovery_criteria: [
        '3 consecutive winning trades OR',
        '2 days with positive PnL OR',
        'BQL score returns below 0.50',
      ],
      historical_context: 'Your last 4 slumps averaged 5.2 days. Traders who follow prescriptions recover in 2.8 days. Traders who ignore them extend slumps to 9.1 days.',
    },
  },
  shadowBoxing: {
    simulations: [
      { 
        firm: 'Aggressive 10% Rulebook', 
        account_size: 100000, 
        profit_target_pct: 10, 
        max_dd_pct: 10, 
        your_pnl_pct: 7.8, 
        your_max_dd_pct: 6.2, 
        passed: false, 
        pass_probability: 0.68,
        failure_reason: 'Missed profit target by 2.2%',
        improvement_needed: 'At current pace, need 8 more trading days to hit target',
      },
      { 
        firm: 'Lean 10% Rulebook', 
        account_size: 50000, 
        profit_target_pct: 10, 
        max_dd_pct: 10, 
        your_pnl_pct: 7.8, 
        your_max_dd_pct: 6.2, 
        passed: false, 
        pass_probability: 0.74,
        failure_reason: 'Missed profit target by 2.2%',
        improvement_needed: 'Smaller account = less pressure. Higher pass rate.',
      },
      { 
        firm: 'Low-DD Evaluation', 
        account_size: 100000, 
        profit_target_pct: 6, 
        max_dd_pct: 4, 
        your_pnl_pct: 7.8, 
        your_max_dd_pct: 6.2, 
        passed: false, 
        pass_probability: 0.42,
        failure_reason: 'Max DD exceeded (6.2% vs 4% limit)',
        improvement_needed: 'Need to reduce position sizing by 35% for this firm',
      },
      { 
        firm: 'Fast Track 8%', 
        account_size: 200000, 
        profit_target_pct: 8, 
        max_dd_pct: 8, 
        your_pnl_pct: 7.8, 
        your_max_dd_pct: 6.2, 
        passed: false, 
        pass_probability: 0.71,
        failure_reason: 'Missed profit target by 0.2%',
        improvement_needed: '2 more winning trades would have passed',
      },
      { 
        firm: 'Flexible 5% Target', 
        account_size: 100000, 
        profit_target_pct: 5, 
        max_dd_pct: 10, 
        your_pnl_pct: 7.8, 
        your_max_dd_pct: 6.2, 
        passed: true, 
        pass_probability: 0.89,
        days_to_pass: 18,
        buffer: '+2.8% above target',
      },
      { 
        firm: 'Standard 8% Target', 
        account_size: 100000, 
        profit_target_pct: 8, 
        max_dd_pct: 8, 
        your_pnl_pct: 7.8, 
        your_max_dd_pct: 6.2, 
        passed: false, 
        pass_probability: 0.67,
        failure_reason: 'Missed profit target by 0.2%',
        improvement_needed: 'Very close. One more trading week likely passes.',
      },
    ],
    best_result: { 
      firm: 'Flexible 5% Target', 
      account_size: 100000, 
      profit_target_pct: 5, 
      max_dd_pct: 10, 
      your_pnl_pct: 7.8, 
      your_max_dd_pct: 6.2, 
      passed: true, 
      pass_probability: 0.89,
      days_to_pass: 18,
      buffer: '+2.8% above target',
    },
    message: 'You passed 1 out of 6 funded-account rulebooks with your current trading. Flexible 5% Target is your best match right now. The stricter 10% and low-drawdown rulebooks still punish your drawdown control more than your raw edge.',
    capital_ready_score: 62,
    capital_ready_breakdown: {
      consistency: 71,
      drawdown_control: 58,
      profit_factor: 1.8,
      recommendation: 'You\'re 62% ready for funded capital. Main blocker: drawdown control. Your max drawdown of 6.2% fails 2 firms outright. Reduce position sizing by 25% and you become 78% ready.',
    },
  },
  reports: {
    status: 'success',
    count: 2,
    reports: [
      {
        id: 'sample-report-1',
        name: 'Baseline Reset Brief',
        discipline_score: 58,
        emotional_cost: 8100,
        primary_pattern: 'Revenge trading remains the main leak after index-option losses.',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'sample-report-2',
        name: 'Premium Reset Review',
        discipline_score: 64,
        emotional_cost: 5400,
        primary_pattern: 'Overtrading pressure improved after the last mandate, but expiry-day size creep remains open.',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  comparison: {
    has_comparison: true,
    last_report_snapshot_id: 'sample-upload-2',
    baseline: {
      snapshot_id: 'sample-upload-1',
      upload_id: 'sample-upload-1',
      captured_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      discipline_tax: 8100,
      discipline_tax_breakdown: {
        revenge_trades: 4200,
        overtrading: 2350,
        size_violations: 1550,
      },
      bql_score: 0.66,
      bql_state: 'MEDIOCRE',
      pnl_net: 18200,
      pnl_gross: 26300,
      total_trades: 24,
      winning_trades: 14,
      ruin_probability: 0.051,
      behavior_share: 0.308,
      breach_risk_score: 63.2,
      primary_pattern: 'revenge trades',
    },
    latest: {
      snapshot_id: 'sample-upload-2',
      upload_id: 'sample-upload-2',
      captured_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      discipline_tax: 5400,
      discipline_tax_breakdown: {
        revenge_trades: 2100,
        overtrading: 1900,
        size_violations: 1400,
      },
      bql_score: 0.52,
      bql_state: 'COMPOSURE_RETURNING',
      pnl_net: 22710,
      pnl_gross: 28110,
      total_trades: 30,
      winning_trades: 20,
      ruin_probability: 0.034,
      behavior_share: 0.192,
      breach_risk_score: 49.6,
      primary_pattern: 'overtrading',
    },
    delta_summary: {
      discipline_tax_change: -2700,
      revenge_change: -2100,
      overtrading_change: -450,
      size_change: -150,
      edge_vs_behavior_shift: 'behavior improving',
      breach_risk_shift: 'risk improving',
      bql_change: -0.14,
    },
  },
  tradeHistory: {
    trades: [
      { id: 'T-1001', timestamp: '2025-12-02T04:12:00Z', exit_time: '2025-12-02T04:35:00Z', symbol: 'NIFTY24DEC22500CE', side: 'BUY' as const, size: 2, pnl: 4520, bds_at_time: 0.32 },
      { id: 'T-1002', timestamp: '2025-12-02T05:05:00Z', exit_time: '2025-12-02T05:22:00Z', symbol: 'BANKNIFTY24DEC48000PE', side: 'SELL' as const, size: 1, pnl: -2180, bds_at_time: 0.64 },
      { id: 'T-1003', timestamp: '2025-12-02T05:45:00Z', exit_time: '2025-12-02T06:10:00Z', symbol: 'NIFTY24DEC22400PE', side: 'BUY' as const, size: 2, pnl: 3810, bds_at_time: 0.28 },
      { id: 'T-1004', timestamp: '2025-12-02T06:30:00Z', exit_time: '2025-12-02T06:42:00Z', symbol: 'BANKNIFTY24DEC47500CE', side: 'BUY' as const, size: 3, pnl: -3250, bds_at_time: 0.71 },
      { id: 'T-1005', timestamp: '2025-12-03T04:05:00Z', exit_time: '2025-12-03T04:28:00Z', symbol: 'NIFTY24DEC22600CE', side: 'BUY' as const, size: 1, pnl: 2140, bds_at_time: 0.24 },
      { id: 'T-1006', timestamp: '2025-12-03T04:42:00Z', exit_time: '2025-12-03T04:55:00Z', symbol: 'RELIANCE', side: 'BUY' as const, size: 10, pnl: 1680, bds_at_time: 0.38 },
      { id: 'T-1007', timestamp: '2025-12-03T05:20:00Z', exit_time: '2025-12-03T05:48:00Z', symbol: 'BANKNIFTY24DEC48200CE', side: 'SELL' as const, size: 2, pnl: -4210, bds_at_time: 0.84 },
      { id: 'T-1008', timestamp: '2025-12-03T06:05:00Z', exit_time: '2025-12-03T06:20:00Z', symbol: 'NIFTY24DEC22500PE', side: 'BUY' as const, size: 1, pnl: 890, bds_at_time: 0.45 },
      { id: 'T-1009', timestamp: '2025-12-04T04:08:00Z', exit_time: '2025-12-04T04:42:00Z', symbol: 'TCS', side: 'SELL' as const, size: 5, pnl: -1520, bds_at_time: 0.56 },
      { id: 'T-1010', timestamp: '2025-12-04T05:15:00Z', exit_time: '2025-12-04T05:32:00Z', symbol: 'NIFTY24DEC22700CE', side: 'BUY' as const, size: 2, pnl: 5120, bds_at_time: 0.26 },
      { id: 'T-1011', timestamp: '2025-12-04T05:55:00Z', exit_time: '2025-12-04T06:14:00Z', symbol: 'MIDCPNIFTY24DEC', side: 'BUY' as const, size: 4, pnl: 2340, bds_at_time: 0.31 },
      { id: 'T-1012', timestamp: '2025-12-04T06:30:00Z', exit_time: '2025-12-04T06:45:00Z', symbol: 'FINNIFTY24DEC', side: 'SELL' as const, size: 2, pnl: -1890, bds_at_time: 0.68 },
      { id: 'T-1013', timestamp: '2025-12-05T04:10:00Z', exit_time: '2025-12-05T04:38:00Z', symbol: 'NIFTY24DEC22400CE', side: 'BUY' as const, size: 2, pnl: 3450, bds_at_time: 0.29 },
      { id: 'T-1014', timestamp: '2025-12-05T05:02:00Z', exit_time: '2025-12-05T05:18:00Z', symbol: 'BANKNIFTY24DEC47800PE', side: 'BUY' as const, size: 1, pnl: -980, bds_at_time: 0.52 },
      { id: 'T-1015', timestamp: '2025-12-05T05:45:00Z', exit_time: '2025-12-05T06:10:00Z', symbol: 'RELIANCE', side: 'SELL' as const, size: 20, pnl: 3680, bds_at_time: 0.33 },
      { id: 'T-1016', timestamp: '2025-12-06T04:15:00Z', exit_time: '2025-12-06T04:28:00Z', symbol: 'NIFTY24DEC22500CE', side: 'BUY' as const, size: 3, pnl: -2840, bds_at_time: 0.74 },
      { id: 'T-1017', timestamp: '2025-12-06T05:10:00Z', exit_time: '2025-12-06T05:35:00Z', symbol: 'BANKNIFTY24DEC48100CE', side: 'BUY' as const, size: 1, pnl: 1950, bds_at_time: 0.41 },
      { id: 'T-1018', timestamp: '2025-12-06T06:00:00Z', exit_time: '2025-12-06T06:22:00Z', symbol: 'NIFTY24DEC22600PE', side: 'SELL' as const, size: 2, pnl: 2860, bds_at_time: 0.36 },
    ],
    total_count: 18,
    summary: {
      total_pnl: 15560,
      win_count: 11,
      loss_count: 7,
      best_trade: 5120,
      worst_trade: -4210,
    },
  } satisfies TradeHistoryResponse,
}

// Auth
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  api_key?: string
  customer_id?: string
  email?: string
  name?: string
  tier?: string
  prop_firm_id?: string | null
  prop_firm_name?: string | null
  error?: string
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/v1/auth/login', payload)
  if (data.success && data.api_key) {
    setLiveApiKey(data.api_key, {
      tier: data.tier,
      customerId: data.customer_id,
    })
  }
  return data
}

export async function register(payload: LoginRequest & { name?: string }): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/v1/auth/register', payload)
  if (data.success && data.api_key) {
    setLiveApiKey(data.api_key, { tier: data.tier })
  }
  return data
}

// Verify activation (order code based authentication)
export async function verifyActivation(payload: ActivationPayload): Promise<ActivationResponse> {
  const { data } = await http.post<ActivationResponse>('/v1/trader/activations/verify', payload)
  if (data.activationToken) {
    setLiveApiKey(data.activationToken, {
      customerId: data.customerId,
      tier: data.tier,
      planId: data.planId,
      market: data.market,
      offerKind: data.offerKind,
      caseStatus: data.caseStatus,
      accessExpiresAt: data.accessExpiresAt ?? null,
      dataSource: data.dataSource ?? null,
    })
  }
  return data
}

export interface BootstrapPasswordResponse {
  success: boolean
  message?: string
  error?: string
  new_api_key?: string | null
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
}

export interface ResetPasswordResponse {
  success: boolean
  message?: string
  error?: string
}

export interface ChangePasswordResponse {
  success: boolean
  message?: string
  error?: string
  new_api_key?: string | null
}

export async function bootstrapPassword(newPassword: string): Promise<BootstrapPasswordResponse> {
  const { data } = await http.post<BootstrapPasswordResponse>('/v1/auth/bootstrap-password', {
    new_password: newPassword,
  })

  if (data.new_api_key) {
    setLiveApiKey(data.new_api_key)
  }

  return data
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const { data } = await http.post<ForgotPasswordResponse>('/v1/auth/forgot-password', {
    email,
  })
  return data
}

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
  const { data } = await http.post<ResetPasswordResponse>('/v1/auth/reset-password', {
    token,
    new_password: newPassword,
  })
  return data
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> {
  const { data } = await http.post<ChangePasswordResponse>('/v1/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })

  if (data.new_api_key) {
    setLiveApiKey(data.new_api_key)
  }

  return data
}

// Legacy activation (kept for backwards compatibility)
export const requestActivation = verifyActivation

// Trade parsing
export async function parseTradePaste(payload: { body: string }) {
  const { data } = await http.post<TradePastePreview>('/v1/trader/trades/preview', payload)
  return data
}

export async function getTradePasteMemory(): Promise<TradePasteMemoryResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { has_previous: false, deltas: [], message: 'Sample workspace does not retain paste memory.' } as TradePasteMemoryResponse
  }
  return withRetry(async () => {
    const { data } = await http.get<TradePasteMemoryResponse>('/v1/dashboard/trade-paste-memory')
    return data
  })
}

export async function getTradeHistory(): Promise<TradeHistoryResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return DEMO_DATA.tradeHistory
  }
  return withRetry(async () => {
    const { data } = await http.get<TradeHistoryResponse>('/v1/dashboard/trade-history')
    return data
  })
}

export async function getTradingReports(limit = 20): Promise<TradingReportsResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return DEMO_DATA.reports
  }
  return withRetry(async () => {
    const { data } = await http.get<TradingReportsResponse>('/v1/trading-reports', {
      params: { limit },
    })
    return data
  })
}

export async function getTradingReportComparison(): Promise<TradingReportComparisonResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return DEMO_DATA.comparison
  }
  return withRetry(async () => {
    const { data } = await http.get<TradingReportComparisonResponse>('/v1/trading-reports/comparison')
    return data
  })
}

// Dashboard endpoints
export async function getDashboardOverview(): Promise<DashboardOverview> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 400)) // Simulate network
    return DEMO_DATA.overview
  }
  return withRetry(async () => {
    const { data } = await http.get<DashboardOverview>('/v1/dashboard/overview')
    updateSessionMeta({
      customerId: data.customer_id,
      tier: data.access_tier,
      offerKind: data.offer_kind,
      caseStatus: data.case_status,
      traderMode: data.trader_mode,
      nextAction: data.next_action,
      accessExpiresAt: data.access_expires_at ?? null,
      dataSource: data.data_source ?? null,
    })
    return data
  })
}

export async function getDashboardAlerts(): Promise<AlertsResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return DEMO_DATA.alerts
  }
  return withRetry(async () => {
    const { data } = await http.get<AlertsResponse>('/v1/dashboard/alerts')
    return data
  })
}

export async function getEdgePortfolio(): Promise<EdgePortfolioResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 350))
    return DEMO_DATA.edgePortfolio
  }
  return withRetry(async () => {
    const { data } = await http.get<EdgePortfolioResponse>('/v1/dashboard/edge-portfolio')
    return data
  })
}

export async function getSlumpPrescription(): Promise<SlumpPrescription> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return DEMO_DATA.slump
  }
  return withRetry(async () => {
    const { data } = await http.get<SlumpPrescription>('/v1/dashboard/slump-prescription')
    return data
  })
}

export async function getShadowBoxing(): Promise<ShadowBoxingResponse> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return DEMO_DATA.shadowBoxing
  }
  return withRetry(async () => {
    const { data } = await http.get<ShadowBoxingResponse>('/v1/dashboard/shadow-boxing')
    return data
  })
}

// Upload
export async function uploadTradesCSV(file: File): Promise<{ status: string; trades_uploaded: number; report: Record<string, unknown> }> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { status: 'sample', trades_uploaded: 0, report: { message: 'Upload disabled in sample workspace' } }
  }
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await http.post('/v1/dashboard/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// Submit parsed trades (from paste flow)
export async function submitParsedTrades(payload: { trades: unknown[]; rawText: string }): Promise<{ status: string; trades_uploaded: number }> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 800))
    // Simulate counting trades from raw text
    const lineCount = payload.rawText.trim().split('\n').filter(l => l.trim()).length
    return { status: 'sample', trades_uploaded: lineCount }
  }
  const { data } = await http.post('/v1/dashboard/trades/submit', payload)
  return data
}

// Public website contact form
export interface ContactMessagePayload {
  name: string
  email: string
  message: string
  source?: 'landing' | 'dashboard'
}

export async function submitContactMessage(payload: ContactMessagePayload): Promise<{ status: string }> {
  if (isSampleMode()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return { status: 'queued' }
  }
  const { data } = await http.post<{ status: string }>('/v1/site/contact', payload)
  return data
}

// Helper to check if authenticated
export function isAuthenticated(): boolean {
  return !!getStoredApiKey()
}

// Stripe Checkout
export interface CheckoutSessionRequest {
  plan_id: string
  email: string
  name: string
  success_url?: string
  cancel_url?: string
  affiliate_slug?: string
  ref_code?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  referral_code?: string
}

export interface CheckoutSessionResponse {
  checkout_url: string
  session_id: string
  order_id: string
}

export async function createCheckoutSession(payload: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
  const attribution = readAffiliateAttribution()
  const mergedPayload = {
    ...payload,
    affiliate_slug: payload.affiliate_slug ?? attribution?.affiliate_slug,
    ref_code: payload.ref_code ?? attribution?.ref_code,
    utm_source: payload.utm_source ?? attribution?.utm_source,
    utm_medium: payload.utm_medium ?? attribution?.utm_medium,
    utm_campaign: payload.utm_campaign ?? attribution?.utm_campaign,
  }
  const { data } = await http.post<CheckoutSessionResponse>('/v1/checkout/create-session', mergedPayload)
  return data
}

export async function trackAffiliateClick(code: string): Promise<void> {
  if (isSampleMode()) {
    return
  }

  await http.get(`/v1/affiliate/track/${encodeURIComponent(code.trim())}`)
}

export interface CheckoutSessionStatus {
  session_id: string
  status: string
  payment_status: string
  customer_email?: string
  order_id?: string
  customer_name?: string
  plan_id?: string
}

export async function getCheckoutSession(sessionId: string): Promise<CheckoutSessionStatus> {
  const { data } = await http.get<CheckoutSessionStatus>(`/v1/checkout/session/${sessionId}`)
  return data
}

// Logout / Clear Session
export function logout(): void {
  clearShibuyaSession()
  // Clear any cached data
  window.location.href = '/login'
}

// Clear all local data (for account deletion or hard reset)
export function clearAllData(): void {
  clearShibuyaSession()
  // Future: clear IndexedDB, cookies if used
  window.location.href = '/'
}

export interface TraderLifecycleEventPayload {
  event_name:
    | 'workspace_activated'
    | 'claim_password_completed'
    | 'onboarding_completed'
    | 'first_upload_completed'
    | 'next_session_mandate_viewed'
  market?: 'global' | 'india'
  tier?: string
  metadata?: Record<string, unknown>
}

export async function logTraderLifecycleEvent(payload: TraderLifecycleEventPayload): Promise<void> {
  if (isSampleMode()) {
    return
  }

  updateSessionMeta({
    market: payload.market,
    tier: payload.tier,
  })

  await http.post('/v1/trader/lifecycle-events', payload)
}

const SAMPLE_PROFILE_CONTEXT: TraderProfileContext = {
  capital_band: '50k_to_250k_inr',
  monthly_income_band: '25k_to_75k_inr',
  trader_focus: 'retail_fo',
  broker_platform: 'Sample broker',
  primary_instruments: ['nifty_options', 'banknifty_options'],
  trader_mode: 'retail_fn0_struggler',
  completed: true,
}

export async function getTraderProfileContext(): Promise<TraderProfileContext> {
  if (isSampleMode()) {
    return SAMPLE_PROFILE_CONTEXT
  }

  const { data } = await http.get<TraderProfileContext>('/v1/trader/profile-context')
  return data
}

export interface TraderProfileContextPayload {
  capital_band: TraderProfileContext['capital_band']
  monthly_income_band: TraderProfileContext['monthly_income_band']
  trader_focus: TraderProfileContext['trader_focus']
  broker_platform: string
  primary_instruments: TraderProfileContext['primary_instruments']
}

export async function saveTraderProfileContext(payload: TraderProfileContextPayload): Promise<TraderProfileContext> {
  if (isSampleMode()) {
    return {
      ...payload,
      trader_mode: deriveTraderModeFromProfileContext(payload),
      completed: true,
      updated_at: new Date().toISOString(),
    }
  }

  const { data } = await http.put<TraderProfileContext>('/v1/trader/profile-context', payload)
  return data
}

export async function saveTraderDailyBriefing(
  payload: Omit<DailyBriefingState, 'date' | 'completed_at'> & {
    headline?: string
    summary?: string
    action_plan?: string[]
    proof_focus?: string
    trader_mode?: string
  },
): Promise<DailyBriefingState> {
  if (isSampleMode()) {
    return {
      ...payload,
      date: new Date().toISOString().slice(0, 10),
      completed_at: new Date().toISOString(),
    }
  }

  const { data } = await http.put<{ status: string; daily_briefing: DailyBriefingState }>(
    '/v1/trader/daily-briefing',
    payload,
  )
  return data.daily_briefing
}

export async function saveTraderDailyDebrief(
  payload: Omit<DailyDebriefState, 'date' | 'completed_at'>,
): Promise<DailyDebriefState> {
  if (isSampleMode()) {
    return {
      ...payload,
      date: new Date().toISOString().slice(0, 10),
      completed_at: new Date().toISOString(),
    }
  }

  const { data } = await http.put<{ status: string; daily_debrief: DailyDebriefState }>(
    '/v1/trader/daily-debrief',
    payload,
  )
  return data.daily_debrief
}

export async function getAppointmentSlots(
  appointmentType: 'onboarding_intro' | 'review_30day' | 'onboarding' = 'onboarding_intro',
): Promise<AppointmentSlotResponse> {
  if (isSampleMode()) {
    return {
      timezone: 'UTC',
      slots: [
        {
          datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          display: 'Tomorrow at 10:00 AM UTC',
        },
        {
          datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          display: 'In 2 days at 2:30 PM UTC',
        },
      ],
    }
  }

  const { data } = await http.get<AppointmentSlotResponse>('/api/appointments/slots', {
    params: {
      appointment_type: appointmentType,
      type: appointmentType,
    },
  })
  return data
}

export async function bookMyAppointment(payload: {
  appointment_type: 'onboarding_intro' | 'review_30day' | 'onboarding'
  scheduled_at: string
  order_id?: string
  duration_minutes?: number
}): Promise<AppointmentBookingResponse> {
  if (isSampleMode()) {
    return {
      success: true,
      appointment_id: 'sample-appointment',
      scheduled_at: payload.scheduled_at,
      appointment_type: payload.appointment_type,
      message: 'Sample appointment booked.',
      meeting_link: 'https://meet.google.com/sample-room',
    }
  }

  const { data } = await http.post<AppointmentBookingResponse>('/api/appointments/book/me', payload)
  return data
}

export async function getMyAppointments(): Promise<AppointmentHistoryResponse> {
  if (isSampleMode()) {
    return {
      appointments: [
        {
          id: 'sample-appointment',
          type: 'onboarding_intro',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          meeting_link: 'https://meet.google.com/sample-room',
          duration_minutes: 30,
        },
      ],
    }
  }

  const { data } = await http.get<AppointmentHistoryResponse>('/api/appointments/me')
  return data
}

export async function cancelMyAppointment(appointmentId: string): Promise<{ success: boolean; message: string }> {
  if (isSampleMode()) {
    return { success: true, message: 'Sample appointment cancelled.' }
  }

  const { data } = await http.post<{ success: boolean; message: string }>(`/api/appointments/${appointmentId}/cancel/me`)
  return data
}

export async function getSupportTickets(): Promise<SupportTicketListResponse> {
  if (isSampleMode()) {
    return {
      status: 'success',
      count: 1,
      tickets: [
        {
          id: 'sample-ticket',
          subject: 'Need help cleaning a broker export',
          category: 'technical',
          priority: 'medium',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          message_count: 1,
        },
      ],
    }
  }

  const { data } = await http.get<SupportTicketListResponse>('/support/tickets')
  return data
}

export async function getSupportTicket(ticketId: string): Promise<SupportTicketDetailResponse> {
  if (isSampleMode()) {
    return {
      status: 'success',
      ticket: {
        id: ticketId,
        subject: 'Need help cleaning a broker export',
        category: 'technical',
        priority: 'medium',
        status: 'open',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 2,
        messages: [
          {
            id: 'sample-ticket-msg-1',
            sender_id: 'sample-customer',
            sender_type: 'customer',
            message: 'The CSV from my broker keeps failing on upload.',
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sample-ticket-msg-2',
            sender_id: 'support',
            sender_type: 'admin',
            message: 'Use the import concierge and try the rescue path once more before sending the raw file.',
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        ],
      },
    }
  }

  const { data } = await http.get<SupportTicketDetailResponse>(`/support/tickets/${ticketId}`)
  return data
}

export async function createSupportTicket(payload: {
  subject: string
  message: string
  category?: 'general' | 'account' | 'billing' | 'technical' | 'payout' | 'challenge' | 'kyc'
  priority?: 'low' | 'medium' | 'high'
}): Promise<SupportTicketListResponse['tickets'][number]> {
  if (isSampleMode()) {
    return {
      id: 'sample-ticket-new',
      subject: payload.subject,
      category: payload.category ?? 'general',
      priority: payload.priority ?? 'medium',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 1,
    }
  }

  const { data } = await http.post<{ status: string; ticket: SupportTicketListResponse['tickets'][number] }>(
    '/support/tickets',
    payload,
  )
  return data.ticket
}

export async function replyToSupportTicket(ticketId: string, payload: { message: string }): Promise<SupportTicketDetailResponse['ticket']> {
  if (isSampleMode()) {
    return {
      id: ticketId,
      subject: 'Need help cleaning a broker export',
      category: 'technical',
      priority: 'medium',
      status: 'open',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 3,
      messages: [
        {
          id: 'sample-ticket-msg-1',
          sender_id: 'sample-customer',
          sender_type: 'customer',
          message: 'The CSV from my broker keeps failing on upload.',
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sample-ticket-msg-2',
          sender_id: 'support',
          sender_type: 'admin',
          message: 'Use the import concierge and try the rescue path once more before sending the raw file.',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: 'sample-ticket-msg-3',
          sender_id: 'sample-customer',
          sender_type: 'customer',
          message: payload.message,
          created_at: new Date().toISOString(),
        },
      ],
    }
  }

  const { data } = await http.post<SupportTicketDetailResponse>(`/support/tickets/${ticketId}/reply`, payload)
  return data.ticket
}

export async function getShibuyaOpsCases(params?: {
  status?: string
  trader_mode?: string
  affiliate_slug?: string
  offer_kind?: string
  q?: string
  limit?: number
}): Promise<ShibuyaOpsCasesResponse> {
  const { data } = await http.get<ShibuyaOpsCasesResponse>('/v1/admin/shibuya/cases', {
    params,
  })
  return data
}

export async function getShibuyaOpsCase(customerId: string): Promise<ShibuyaOpsCaseResponse> {
  const { data } = await http.get<ShibuyaOpsCaseResponse>(`/v1/admin/shibuya/cases/${customerId}`)
  return data
}

export async function updateShibuyaOpsCase(
  customerId: string,
  payload: {
    case_status?: string
    guided_review_status?: string
    next_action?: string
    note?: string
  },
): Promise<ShibuyaOpsCaseResponse> {
  const { data } = await http.patch<ShibuyaOpsCaseResponse>(`/v1/admin/shibuya/cases/${customerId}`, payload)
  return data
}

export async function sendShibuyaOpsReminder(
  customerId: string,
  reminderType: 'onboarding' | 'upload' | 'guided_review' | 'expiry',
): Promise<{ status: string; sent: boolean }> {
  const { data } = await http.post<{ status: string; sent: boolean }>(
    `/v1/admin/shibuya/cases/${customerId}/reminders/${reminderType}`,
  )
  return data
}

export async function getShibuyaAffiliateReport(): Promise<ShibuyaAffiliateReportResponse> {
  const { data } = await http.get<ShibuyaAffiliateReportResponse>('/v1/admin/shibuya/affiliates/report')
  return data
}
