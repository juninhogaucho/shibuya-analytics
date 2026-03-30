// API base URL - uses env var, fails explicitly in production
const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE
  if (!url) {
    if (import.meta.env.PROD) {
      console.error('CRITICAL: VITE_API_BASE not configured in production!')
      return 'https://api-not-configured.invalid'
    }
    return 'http://127.0.0.1:8001'
  }
  return url
}
export const API_BASE_URL = getApiBaseUrl()

// Stripe Payment Links
export const STRIPE_PAYMENT_LINKS: Record<string, string> = {
  basic: import.meta.env.VITE_STRIPE_LINK_BASIC ?? 'https://buy.stripe.com/8x28wI9O6bor63xaBt6sw00',
  premium: import.meta.env.VITE_STRIPE_LINK_PREMIUM ?? 'https://buy.stripe.com/28EcMY1hA0JN0Jd8tl6sw01',
}

// Checkout URLs
export const CHECKOUT_URLS = {
  basic: '/checkout/basic',
  premium: '/checkout/premium',
}

// Plan ID to key mapping for checkout
export const PLAN_KEYS: Record<string, keyof typeof PRICING> = {
  'basic': 'basic',
  'premium': 'premium',
}

// Pricing configuration
export const PRICING = {
  basic: {
    id: 'basic',
    name: 'The Reality Check',
    price: 99,
    currency: 'EUR',
    type: 'one-time' as const,
    description: 'Baseline access to the Shibuya trader workspace. Activate, upload your history, and see where discipline leaks and edge concentration are shaping your results.',
    perks: [
      'Live trader account activation after payment',
      'Discipline tax and edge portfolio baseline',
      'Upload trades inside the live workspace',
      'History, alerts, and next-session guidance',
    ],
  },
  premium: {
    id: 'premium',
    name: 'The Deep Dive',
    price: 149,
    currency: 'EUR',
    type: 'one-time' as const,
    description: 'A deeper Shibuya entry point for traders who want tighter follow-through, richer baseline context, and more guided performance correction.',
    perks: [
      'Everything in The Reality Check',
      'Deeper baseline and follow-up context',
      'Stronger trader support after activation',
      'Built for tighter iteration on process',
      'Priority fulfillment and support',
    ],
    featured: true,
  },
}

export const VALUE_PROPS = [
  {
    title: 'See Where You Actually Bleed Money',
    body:
      'We calculate your "Discipline Tax" - the exact euro amount you lose to revenge trades, oversizing, and overtrading. Not vague percentages. Real numbers that hurt to look at.',
  },
  {
    title: 'Know Which Setups Actually Work',
    body:
      'Your Edge Portfolio shows which strategies are making you money (PRIME), which are break-even (STABLE), and which are quietly destroying your account (DECAYED).',
  },
  {
    title: 'Get a Real Plan, Not Generic Advice',
    body:
      'No "manage your emotions better" nonsense. We give you specific rules: "Don\'t trade GBP pairs after a loss" or "Max 3 trades until your mental state improves."',
  },
  {
    title: 'Understand Your Patterns',
    body:
      'We use quant-level behavioral analysis to show you patterns you can\'t see yourself. When do you overtrade? Which pairs trigger your worst decisions?',
  },
]
