export const API_BASE_URL = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8001'

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
    description: 'A brutally honest PDF diagnosis of your trading. We show you exactly where you\'re bleeding money, and it\'s probably not where you think.',
    perks: [
      'Complete discipline tax breakdown (the real cost of your emotional trades)',
      'Edge portfolio analysis (which setups actually make you money)',
      'Written and analyzed by a real human, not AI',
      'Delivered within 72 hours',
    ],
  },
  premium: {
    id: 'premium',
    name: 'The Deep Dive',
    price: 149,
    currency: 'EUR',
    type: 'one-time' as const,
    description: 'Two reports + two 1:1 video calls. We don\'t just show you the problem, we work through solutions together.',
    perks: [
      'Everything in The Reality Check',
      'Two PDF reports (initial + 30-day follow-up)',
      'Two 30-min video calls with a real human',
      'Personalized trading rules based on YOUR patterns',
      'Priority support via email',
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
