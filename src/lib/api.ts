import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from './constants'
import type { 
  ActivationPayload, 
  ActivationResponse, 
  TradePastePreview,
  DashboardOverview,
  AlertsResponse,
  EdgePortfolioResponse,
  SlumpPrescription,
  ShadowBoxingResponse,
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
})

// Add auth token to requests
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('shibuya_api_key')
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
      localStorage.removeItem('shibuya_api_key')
      window.location.href = '/activate'
    }
    
    // Create a friendly error with request ID for support
    const message = getErrorMessage(error)
    throw new ApiError(message, status || 0, requestId)
  }
)

// Check if in demo mode
function isDemoMode(): boolean {
  return localStorage.getItem('shibuya_api_key') === 'shibuya_demo_mode'
}

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

// Demo Data - Realistic, detailed, showcasing the value proposition
const DEMO_DATA = {
  overview: {
    // BQL = Behavioral Quality Level: 0 = robot, 1 = full tilt
    bql_state: 'MEDIOCRE',
    bql_score: 0.58, // 58% emotional influence detected
    // Monte Carlo: Expected PnL minus luck = your true edge value
    monte_carlo_drift: 892, // You're $892 ahead of pure luck
    ruin_probability: 0.034, // 3.4% chance of blowing account
    // The money you earned then gave back through discipline failures
    discipline_tax_30d: 810, // Lost $810 to revenge trades, overtrading, etc.
    discipline_tax_breakdown: {
      revenge_trades: 420,
      overtrading: 235,
      size_violations: 155,
    },
    sharpe_scenario: 1.67,
    pnl_gross: 3081, // Sum of all winning trades
    pnl_net: 2271, // Gross minus discipline tax (3081 - 810)
    total_trades: 30,
    winning_trades: 20,
    // The real edges in your trading
    edge_portfolio: [
      { 
        name: 'London Session FVG', 
        status: 'PRIME' as const, 
        win_rate: 71, 
        pnl: 1230,
        trades: 12,
        avg_rr: 2.1,
        action: 'Based on YOUR data: This is your best setup. You win 71% of the time here. Consider taking more of these and fewer of your weaker setups.' 
      },
      { 
        name: 'NY AM Reversal', 
        status: 'STABLE' as const, 
        win_rate: 58, 
        pnl: 890,
        trades: 10,
        avg_rr: 1.4,
        action: 'Based on YOUR data: You\'re profitable here but not crushing it. Your win rate drops when VIX is high. Consider sitting out during high volatility days.' 
      },
      { 
        name: 'Asian Range Break', 
        status: 'DECAYED' as const, 
        win_rate: 39, 
        pnl: -640,
        trades: 8,
        avg_rr: 0.8,
        action: 'Based on YOUR data: You\'ve lost €640 on this setup in the last 30 days. Stop trading it immediately. Every trade here is costing you money.' 
      },
    ],
    // Recent costly mistakes with specific details
    recent_errors: [
      { date: '2025-11-28', pair: 'EUR/USD', error: 'Revenge trade after -$340 loss', cost: 520 },
      { date: '2025-11-25', pair: 'GBP/JPY', error: 'Doubled position into losing trade', cost: 380 },
      { date: '2025-11-22', pair: 'NAS100', error: '4th trade in 90min (fatigue zone)', cost: 290 },
    ],
    loyalty_unlock: {
      month: 2,
      reward: 'FXReplay Pro License',
      message: 'Complete 30 more days and get FXReplay Pro ($228 value) free.',
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
        body: 'After your EUR/USD loss at 14:23, you took 3 more trades in 47 minutes. All losses. Total damage: $892. Your rule says "2hr minimum after any loss >$200".',
        severity: 'high' as const, 
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), 
        acknowledged: false,
        trade_ids: ['T-1847', 'T-1848', 'T-1849'],
      },
      { 
        id: '2', 
        type: 'margin_of_safety' as const, 
        title: '📊 Weekly Margin of Safety Report', 
        body: 'Your MoS improved from 1.2R to 1.8R this week. Main driver: You stopped trading Asian session (as prescribed). Continue avoiding GBP pairs during low liquidity.',
        severity: 'info' as const, 
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), 
        acknowledged: false,
      },
      { 
        id: '3', 
        type: 'slump_warning' as const, 
        title: '⚠️ Wednesday Blowup Analysis', 
        body: 'Wednesday losses totaled $1,240 (3.8x your daily average of $326). Breakdown: 67% came from NAS100 during FOMC (you knew better). 23% from size violations on GBP/USD.',
        severity: 'medium' as const, 
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), 
        acknowledged: true,
      },
      { 
        id: '4', 
        type: 'crucial_moment' as const, 
        title: '🎯 Prime Edge Opportunity Missed', 
        body: 'Your London FVG setup triggered at 08:14 GMT but you were not at screen. This setup has 71% WR and 2.1 avg RR. Estimated opportunity cost: $680.',
        severity: 'medium' as const, 
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), 
        acknowledged: false,
      },
      { 
        id: '5', 
        type: 'info' as const, 
        title: '📈 Edge Portfolio Update', 
        body: 'NY AM Reversal has been upgraded from DECAYED to STABLE after 8 consecutive weeks of positive performance. You can resume trading it with small size.',
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
        name: 'London Session FVG', 
        status: 'PRIME' as const, 
        win_rate: 71,
        pnl: 4230,
        trades: 34,
        avg_rr: 2.1,
        expectancy: 0.89,
        sharpe: 2.3,
        max_dd_pct: 3.2,
        best_month: 'October (+$2,140)',
        action: 'YOUR ACTION: This is your moneymaker. You made $4,230 in 34 trades. Consider taking more of these and cutting your decayed setups.' 
      },
      { 
        name: 'NY AM Reversal', 
        status: 'STABLE' as const, 
        win_rate: 58,
        pnl: 1890,
        trades: 41,
        avg_rr: 1.4,
        expectancy: 0.34,
        sharpe: 1.4,
        max_dd_pct: 5.1,
        best_month: 'September (+$890)',
        action: 'YOUR ACTION: Keep trading but watch your VIX filter. Your win rate drops 40% when VIX is above 25. Skip it on high-volatility days.' 
      },
      { 
        name: 'Asian Range Break', 
        status: 'DECAYED' as const, 
        win_rate: 39,
        pnl: -1640,
        trades: 28,
        avg_rr: 0.8,
        expectancy: -0.42,
        sharpe: -0.8,
        max_dd_pct: 12.3,
        best_month: 'None (negative all 3 months)',
        action: 'YOUR ACTION: Stop immediately. You\'ve lost $1,640 on 28 trades. This setup has been negative for 3 straight months. It\'s not coming back.' 
      },
      { 
        name: 'News Fade (NFP/CPI)', 
        status: 'STABLE' as const, 
        win_rate: 52,
        pnl: 720,
        trades: 12,
        avg_rr: 1.9,
        expectancy: 0.21,
        sharpe: 1.1,
        max_dd_pct: 4.8,
        best_month: 'November (+$480)',
        action: 'YOUR ACTION: Promising but unproven. Only 12 trades. Keep size small until you have 25+ trades to confirm it works.' 
      },
      { 
        name: 'Friday PM Scalps', 
        status: 'DECAYED' as const, 
        win_rate: 44,
        pnl: -890,
        trades: 32,
        avg_rr: 0.6,
        expectancy: -0.28,
        sharpe: -0.5,
        max_dd_pct: 8.7,
        best_month: 'None',
        action: 'YOUR ACTION: Your Friday afternoon trading is -$890. Your Friday win rate is 31% vs 59% Mon-Thu. You\'re tired. Stop trading Fridays after 2pm.' 
      },
    ],
    summary: {
      total: 5,
      prime: 1,
      decayed: 2,
      stable: 2,
      total_pnl: 4310,
      recommendation: 'Your portfolio is unbalanced. 98% of profits come from London FVG. Kill the 2 decayed edges NOW, they cost you $2,530 and masked your real skill. If you only traded PRIME + STABLE edges at proper sizing, projected monthly PnL jumps from $2,366 to $4,180.',
    },
  },
  slump: {
    is_slump: true,
    bql_state: 'EMOTIONAL_TRAINWRECK',
    consecutive_losses: 7,
    drawdown_pct: 8.4,
    days_in_slump: 3,
    prescription: {
      message: 'You are in a verified slump. Your last 7 trades were losses totaling $2,180. BQL score spiked from 0.34 to 0.81 in 48 hours. This is not a trading problem, it\'s a state management problem. Follow this prescription for the next 72 hours.',
      max_trades_per_session: 2,
      banned_assets: ['GBP/JPY', 'NAS100', 'XAU/USD'],
      position_cap_pct: 25,
      cooldown_hours: 4,
      rules: [
        'Maximum 2 trades per session (you averaged 6.3 during this slump)',
        'Position size capped at 25% of your normal size',
        'No trading GBP/JPY, NAS100, or XAU/USD, these are your "tilt pairs"',
        'Mandatory 4-hour cooldown between sessions',
        'Must journal BEFORE placing any trade (screenshot required)',
        'If you hit daily loss limit ($400), you\'re done for 48 hours, non-negotiable',
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
        firm: 'FTMO', 
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
        firm: 'FTMO', 
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
        firm: 'The5ers', 
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
        firm: 'MyFundedFX', 
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
        firm: 'FundedNext', 
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
        firm: 'E8 Funding', 
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
      firm: 'FundedNext', 
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
    message: 'You passed 1 out of 6 prop firm challenges with your current trading. FundedNext $100K is your best match (89% pass probability, 18 days to target). FTMO requires 23% more profit or 18% less drawdown. Focus on your PRIME edge only and you\'d pass 4/6 firms.',
    capital_ready_score: 62,
    capital_ready_breakdown: {
      consistency: 71,
      drawdown_control: 58,
      profit_factor: 1.8,
      recommendation: 'You\'re 62% ready for funded capital. Main blocker: drawdown control. Your max drawdown of 6.2% fails 2 firms outright. Reduce position sizing by 25% and you become 78% ready.',
    },
  },
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
  error?: string
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/v1/auth/login', payload)
  if (data.success && data.api_key) {
    localStorage.setItem('shibuya_api_key', data.api_key)
  }
  return data
}

export async function register(payload: LoginRequest & { name?: string }): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/v1/auth/register', payload)
  if (data.success && data.api_key) {
    localStorage.setItem('shibuya_api_key', data.api_key)
  }
  return data
}

// Verify activation (order code based authentication)
export async function verifyActivation(payload: ActivationPayload): Promise<ActivationResponse> {
  const { data } = await http.post<ActivationResponse>('/v1/trader/activations/verify', payload)
  if (data.activationToken) {
    localStorage.setItem('shibuya_api_key', data.activationToken)
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

// Dashboard endpoints
export async function getDashboardOverview(): Promise<DashboardOverview> {
  if (isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 400)) // Simulate network
    return DEMO_DATA.overview
  }
  return withRetry(async () => {
    const { data } = await http.get<DashboardOverview>('/v1/dashboard/overview')
    return data
  })
}

export async function getDashboardAlerts(): Promise<AlertsResponse> {
  if (isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return DEMO_DATA.alerts
  }
  return withRetry(async () => {
    const { data } = await http.get<AlertsResponse>('/v1/dashboard/alerts')
    return data
  })
}

export async function getEdgePortfolio(): Promise<EdgePortfolioResponse> {
  if (isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 350))
    return DEMO_DATA.edgePortfolio
  }
  return withRetry(async () => {
    const { data } = await http.get<EdgePortfolioResponse>('/v1/dashboard/edge-portfolio')
    return data
  })
}

export async function getSlumpPrescription(): Promise<SlumpPrescription> {
  if (isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return DEMO_DATA.slump
  }
  return withRetry(async () => {
    const { data } = await http.get<SlumpPrescription>('/v1/dashboard/slump-prescription')
    return data
  })
}

export async function getShadowBoxing(): Promise<ShadowBoxingResponse> {
  if (isDemoMode()) {
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
  if (isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { status: 'demo', trades_uploaded: 0, report: { message: 'Upload disabled in demo mode' } }
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
  if (isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 800))
    // Simulate counting trades from raw text
    const lineCount = payload.rawText.trim().split('\n').filter(l => l.trim()).length
    return { status: 'demo', trades_uploaded: lineCount }
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
  if (isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return { status: 'queued' }
  }
  const { data } = await http.post<{ status: string }>('/v1/site/contact', payload)
  return data
}

// Helper to check if authenticated
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('shibuya_api_key')
}

// Stripe Checkout
export interface CheckoutSessionRequest {
  plan_id: string
  email: string
  name: string
  success_url?: string
  cancel_url?: string
}

export interface CheckoutSessionResponse {
  checkout_url: string
  session_id: string
  order_id: string
}

export async function createCheckoutSession(payload: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
  const { data } = await http.post<CheckoutSessionResponse>('/v1/checkout/create-session', payload)
  return data
}

// Logout / Clear Session
export function logout(): void {
  localStorage.removeItem('shibuya_api_key')
  // Clear any cached data
  window.location.href = '/activate'
}

// Clear all local data (for account deletion or hard reset)
export function clearAllData(): void {
  localStorage.removeItem('shibuya_api_key')
  // Future: clear IndexedDB, cookies if used
  window.location.href = '/'
}
