export type Market = 'global' | 'india'
export type PlanKey = 'audit_monthly' | 'reset_monthly' | 'audit_once' | 'reset_once'
export type OfferMode = 'subscription' | 'payment'

export interface PricingPlan {
  id: PlanKey
  checkoutSlug: string
  planId: string
  name: string
  price: number
  currency: 'EUR' | 'INR'
  currencySymbol: 'EUR' | '₹'
  type: OfferMode
  billingLabel: '/month' | 'one time'
  description: string
  perks: string[]
  featured?: boolean
  ctaLabel: string
  supportTier: 'self-serve' | 'guided'
  accessWindowDays?: number
  uploadLimit?: number | null
  guidedReviewIncluded?: boolean
}

export type PricingCatalog = Record<PlanKey, PricingPlan>

const MARKET_STORAGE_KEY = 'shibuya_market'

export const DECRYPT_B2B_URL = import.meta.env.VITE_DECRYPT_B2B_URL ?? ''

export const MARKET_PRICING: Record<Market, PricingCatalog> = {
  global: {
    audit_monthly: {
      id: 'audit_monthly',
      checkoutSlug: 'psych-audit-live',
      planId: 'shibuya_audit_monthly',
      name: 'Psych Audit Live',
      price: 44,
      currency: 'EUR',
      currencySymbol: 'EUR',
      type: 'subscription',
      billingLabel: '/month',
      description:
        'The continuity layer for traders who want the Shibuya loop alive session by session instead of treating diagnosis like a one-off event.',
      perks: [
        'Persistent live trader workspace',
        'Discipline tax in account currency',
        'Edge vs behavior split',
        'Trader-state view and prop-relevance callouts',
        'Next-session mandate that stays live across sessions',
        '30-day reset score and progress framing',
      ],
      ctaLabel: 'Start Psych Audit Live',
      supportTier: 'self-serve',
      uploadLimit: null,
      guidedReviewIncluded: false,
    },
    reset_monthly: {
      id: 'reset_monthly',
      checkoutSlug: 'reset-pro-live',
      planId: 'shibuya_reset_pro_monthly',
      name: 'Reset Pro Live',
      price: 199,
      currency: 'EUR',
      currencySymbol: 'EUR',
      type: 'subscription',
      billingLabel: '/month',
      description:
        'The deeper monthly corrective tier for traders who want ongoing alerts, harder intervention, and guided review in the live loop.',
      perks: [
        'Everything in Psych Audit Live',
        'Deeper alerts, prescriptions, and slump workflow',
        'Premium review artifact and corrective framing',
        'One guided review call in your first billing cycle',
        'Priority support while you stabilize process',
      ],
      featured: true,
      ctaLabel: 'Start Reset Pro Live',
      supportTier: 'guided',
      uploadLimit: null,
      guidedReviewIncluded: true,
    },
    audit_once: {
      id: 'audit_once',
      checkoutSlug: 'edge-or-behavior',
      planId: 'shibuya_single',
      name: 'Edge or Behavior',
      price: 99,
      currency: 'EUR',
      currencySymbol: 'EUR',
      type: 'payment',
      billingLabel: 'one time',
      description:
        'A one-time reset window built to expose whether your current leak is structural, behavioral, or state-driven before you commit to continuity.',
      perks: [
        '30-day live workspace window after activation',
        'Discipline tax and baseline diagnosis',
        'Edge concentration and weak-zone mapping',
        'Next-session brief and baseline report artifact',
      ],
      ctaLabel: 'Buy Edge or Behavior',
      supportTier: 'self-serve',
      accessWindowDays: 30,
      uploadLimit: 1,
      guidedReviewIncluded: false,
    },
    reset_once: {
      id: 'reset_once',
      checkoutSlug: 'next-session-reset',
      planId: 'shibuya_transform',
      name: 'Next Session Reset',
      price: 149,
      currency: 'EUR',
      currencySymbol: 'EUR',
      type: 'payment',
      billingLabel: 'one time',
      description:
        'A one-time premium reset package for traders who need a harder intervention, deeper surfaces, and a guided review to lock the reset.',
      perks: [
        'Everything in Edge or Behavior',
        'Premium reset report and stronger corrective context',
        'One guided kickoff review call',
        'Up to 3 uploads inside the reset window',
      ],
      ctaLabel: 'Start Next Session Reset',
      supportTier: 'guided',
      accessWindowDays: 30,
      uploadLimit: 3,
      guidedReviewIncluded: true,
    },
  },
  india: {
    audit_monthly: {
      id: 'audit_monthly',
      checkoutSlug: 'psych-audit-live',
      planId: 'shibuya_india_audit_monthly',
      name: 'Psych Audit Live',
      price: 1499,
      currency: 'INR',
      currencySymbol: '₹',
      type: 'subscription',
      billingLabel: '/month',
      description:
        'Built for Indian retail F&O traders who want the Shibuya software loop alive month after month so the leak can actually shrink, not just be diagnosed once.',
      perks: [
        'Persistent live trader workspace',
        'See discipline tax in rupees',
        'Separate edge decay from behavior in one baseline',
        'Trader-state view and prop-eval relevance callouts',
        'Next-session mandate that stays live across sessions',
        '30-day reset score and progress framing',
      ],
      ctaLabel: 'Start Psych Audit Live',
      supportTier: 'self-serve',
      uploadLimit: null,
      guidedReviewIncluded: false,
    },
    reset_monthly: {
      id: 'reset_monthly',
      checkoutSlug: 'reset-pro-live',
      planId: 'shibuya_india_reset_pro_monthly',
      name: 'Reset Pro Live',
      price: 5999,
      currency: 'INR',
      currencySymbol: '₹',
      type: 'subscription',
      billingLabel: '/month',
      description:
        'For traders who already know the account damage is behavioral and want a harder live loop, deeper intervention, and guided review while the reset is happening.',
      perks: [
        'Everything in Psych Audit Live',
        'Deeper alerts, prescriptions, and slump workflow',
        'Premium review artifact and stronger corrective context',
        'One guided review call in the first billing cycle',
        'Priority support while you stabilize process',
        'Built for prop-evaluation and repeat-breach recovery',
      ],
      featured: true,
      ctaLabel: 'Start Reset Pro Live',
      supportTier: 'guided',
      uploadLimit: null,
      guidedReviewIncluded: true,
    },
    audit_once: {
      id: 'audit_once',
      checkoutSlug: 'psych-audit',
      planId: 'shibuya_india_psych_audit',
      name: 'Psych Audit',
      price: 1999,
      currency: 'INR',
      currencySymbol: '₹',
      type: 'payment',
      billingLabel: 'one time',
      description:
        'The low-friction India entry offer: one account, manual upload, a 30-day live window, and a brutally clear answer to whether the leak is edge, behavior, or both.',
      perks: [
        'One account and a 30-day live workspace window',
        'Discipline tax in rupees',
        'Edge vs behavior split',
        'Recent costly mistakes and next-session brief',
        'Downloadable baseline report artifact',
      ],
      ctaLabel: 'Get My Psych Audit',
      supportTier: 'self-serve',
      accessWindowDays: 30,
      uploadLimit: 1,
      guidedReviewIncluded: false,
    },
    reset_once: {
      id: 'reset_once',
      checkoutSlug: 'reset-intensive',
      planId: 'shibuya_india_reset_intensive',
      name: 'Reset Intensive',
      price: 7999,
      currency: 'INR',
      currencySymbol: '₹',
      type: 'payment',
      billingLabel: 'one time',
      description:
        'The premium one-time India reset package for traders who need stronger intervention, deeper surfaces, and one guided kickoff review to force the reset.',
      perks: [
        'Everything in Psych Audit',
        'Deeper alerts, prescriptions, and slump workflow',
        'Premium reset report artifact',
        'One guided kickoff review call',
        'Up to 3 uploads inside the reset window',
      ],
      featured: true,
      ctaLabel: 'Start Reset Intensive',
      supportTier: 'guided',
      accessWindowDays: 30,
      uploadLimit: 3,
      guidedReviewIncluded: true,
    },
  },
}

export function getStoredMarket(): Market | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.localStorage.getItem(MARKET_STORAGE_KEY)
  return value === 'india' ? 'india' : value === 'global' ? 'global' : null
}

export function persistMarket(market: Market): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(MARKET_STORAGE_KEY, market)
}

export function resolveMarket(pathname: string, search: string): Market {
  if (pathname === '/' || pathname.startsWith('/india')) {
    return 'india'
  }

  if (pathname.startsWith('/global') || pathname.startsWith('/intl')) {
    return 'global'
  }

  const params = new URLSearchParams(search)
  const explicitMarket = params.get('market')
  if (explicitMarket === 'india') {
    return 'india'
  }
  if (explicitMarket === 'global') {
    return 'global'
  }

  return getStoredMarket() ?? 'india'
}

export function getMarketPricing(market: Market): PricingCatalog {
  return MARKET_PRICING[market]
}

export function getPlansForType(market: Market, type: OfferMode): PricingPlan[] {
  return Object.values(MARKET_PRICING[market]).filter((plan) => plan.type === type)
}

export function getPlanForMarket(market: Market, planKey: PlanKey): PricingPlan {
  return MARKET_PRICING[market][planKey]
}

export function getPlanByPlanId(planId?: string | null): PricingPlan | null {
  if (!planId) {
    return null
  }

  for (const catalog of Object.values(MARKET_PRICING)) {
    for (const plan of Object.values(catalog)) {
      if (plan.planId === planId) {
        return plan
      }
    }
  }

  return null
}

export function isGuidedPlanId(planId?: string | null): boolean {
  return Boolean(getPlanByPlanId(planId)?.guidedReviewIncluded)
}

export function getPlanKey(planKey: string | undefined): PlanKey {
  switch (planKey) {
    case 'psych-audit':
    case 'audit-once':
    case 'audit_once':
      return 'audit_once'
    case 'reset-intensive':
    case 'reset-once':
    case 'reset_once':
      return 'reset_once'
    case 'reset-pro-live':
    case 'premium':
    case 'reset_monthly':
      return 'reset_monthly'
    case 'psych-audit-live':
    case 'basic':
    case 'audit_monthly':
    default:
      return 'audit_monthly'
  }
}

export function addMarketToPath(path: string, market: Market): string {
  if (market === 'india') {
    return `${path}${path.includes('?') ? '&' : '?'}market=india`
  }

  return `${path}${path.includes('?') ? '&' : '?'}market=global`
}

export function getMarketHomePath(market: Market): string {
  return market === 'india' ? '/' : '/global'
}

export function formatPrice(plan: PricingPlan): string {
  if (plan.currency === 'INR') {
    return `${plan.currencySymbol}${plan.price.toLocaleString('en-IN')}`
  }

  return `${plan.currencySymbol} ${plan.price}`
}

export function inferMarketFromPlanId(planId?: string | null): Market {
  return planId?.startsWith('shibuya_india_') ? 'india' : 'global'
}
