export const API_BASE_URL = import.meta.env.VITE_API_BASE ?? 'https://api.medallion.studio'

// Stripe checkout URLs - will be configured once Stripe is set up
export const CHECKOUT_URLS = {
  steve: '/checkout/steve',           // $99 one-time report
  stevePlus: '/checkout/steve-plus',  // $149 report + 2 calls
  david: '/checkout/david',           // $250/mo subscription
}

// Keep old name for compatibility during migration
export const ODOO_CHECKOUT_URLS = CHECKOUT_URLS

// Pricing configuration
export const PRICING = {
  steve: {
    id: 'steve',
    name: 'Edge Autopsy',
    price: 99,
    currency: 'USD',
    type: 'one-time' as const,
    description: 'One PDF diagnosis, Discipline Tax, cohort benchmark. Delivered within 72 hours, no dashboard login.',
    perks: [
      'Full Medallion engine analysis',
      'Shadow Boxing snapshot included',
      'Email + Loom breakdown',
    ],
  },
  stevePlus: {
    id: 'steve-plus',
    name: 'Edge Autopsy Pro',
    price: 149,
    currency: 'USD',
    type: 'one-time' as const,
    description: 'Two reports, two 1:1 calls, priority queue. Perfect for traders who want live teardown feedback.',
    perks: [
      'Everything in $99 tier',
      '2x coaching calls scheduled automatically',
      'Personalized rules preview',
    ],
    featured: true,
  },
  david: {
    id: 'david',
    name: 'Full Access',
    price: 250,
    currency: 'USD',
    type: 'subscription' as const,
    interval: 'month' as const,
    description: 'Full dashboard, append trades model, Margin of Safety coach, Edge Portfolio, Investor Packet.',
    perks: [
      'Unlimited uploads with append flow',
      'Non real-time alerts + Sunday digest',
      'Capital-ready bundle & loyalty unlocks',
      'Shadow Boxing prop firm simulator',
      'Slump Prescription automation',
    ],
  },
}

export const VALUE_PROPS = [
  {
    title: 'Margin of Safety Coach',
    body:
      'Every Sunday David receives Monte Carlo drift, current BQL state, and a plain-language plan. We hit before the week starts to plug the deprivation gap.',
  },
  {
    title: 'Shadow Boxing Simulator',
    body:
      'We feed his trades through FTMO, FundedNext, and more. “You would have passed $100k challenges 3 times in 6 months.” Capital readiness becomes obvious.',
  },
  {
    title: 'Slump Prescription',
    body:
      'When BQL screams EMOTIONAL TRAINWRECK, we prescribe hard limits: max trades, banned assets, enforced size cap. Automated risk manager mode.',
  },
  {
    title: 'Edge Portfolio',
    body:
      'AFMA treats strategies like employees. London Breakout is DECAYED, Asian Range is PRIME. David rebalances edges instead of blaming himself.',
  },
]
