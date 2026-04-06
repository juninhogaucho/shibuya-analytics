import React, { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, User, MessageSquare, CreditCard, Gift, Check, AlertCircle, Upload, ArrowRight } from 'lucide-react'
import { API_BASE_URL } from '../../lib/constants'
import { createCheckoutSession, trackAffiliateClick } from '../../lib/api'
import {
  captureAffiliateAttributionFromLocation,
  getPreferredAffiliateCode,
  markAffiliateClickTracked,
  readAffiliateAttribution,
  wasAffiliateClickTracked,
} from '../../lib/affiliateAttribution'
import { addMarketToPath, formatPrice, getMarketPricing, getPlanKey, persistMarket, resolveMarket } from '../../lib/market'
import { rememberRecentOrderAccess } from '../../lib/recentAccess'

interface CheckoutForm {
  name: string
  email: string
  discord: string
  referral: string
}

interface PromoValidation {
  valid: boolean
  code?: string
  code_type?: string
  dashboard_months_bonus: number
  message: string
}

const CheckoutPage: React.FC = () => {
  const { plan } = useParams<{ plan: string }>()
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const planKey = getPlanKey(plan)
  const currentPlan = getMarketPricing(market)[planKey]
  const isSubscription = currentPlan.type === 'subscription'
  const isGuided = currentPlan.supportTier === 'guided'

  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    email: '',
    discord: '',
    referral: '',
  })
  const [promoValidating, setPromoValidating] = useState(false)
  const [promoResult, setPromoResult] = useState<PromoValidation | null>(null)

  useEffect(() => {
    persistMarket(market)
    const captured = captureAffiliateAttributionFromLocation(location.pathname, location.search)
    const attribution = captured ?? readAffiliateAttribution()
    const affiliateCode = getPreferredAffiliateCode(attribution)

    if (attribution?.ref_code && !form.referral) {
      setForm((current) => ({
        ...current,
        referral: current.referral || attribution.ref_code || '',
      }))
    }

    if (!affiliateCode || wasAffiliateClickTracked(affiliateCode)) {
      return
    }

    void trackAffiliateClick(affiliateCode)
      .then(() => {
        markAffiliateClickTracked(affiliateCode)
      })
      .catch(() => undefined)
  }, [form.referral, location.pathname, location.search, market])

  const validatePromoCode = async (code: string) => {
    if (!code.trim()) {
      setPromoResult(null)
      return
    }

    setPromoValidating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/v1/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })

      if (response.ok) {
        const result: PromoValidation = await response.json()
        setPromoResult(result)
      } else {
        setPromoResult({ valid: false, dashboard_months_bonus: 0, message: 'Could not validate code' })
      }
    } catch {
      setPromoResult({
        valid: true,
        code: code.trim(),
        dashboard_months_bonus: 0,
        message: 'Code recorded and will be verified after checkout',
      })
    } finally {
      setPromoValidating(false)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)

    try {
      persistMarket(market)
      const origin = window.location.origin
      const successUrl = `${origin}${addMarketToPath(`/checkout/success?plan=${encodeURIComponent(currentPlan.planId)}`, market)}`
      const cancelUrl = `${origin}${addMarketToPath(`/checkout/${currentPlan.checkoutSlug}`, market)}`

      const session = await createCheckoutSession({
        plan_id: currentPlan.planId,
        email: form.email.trim(),
        name: form.name.trim(),
        success_url: successUrl,
        cancel_url: cancelUrl,
        referral_code: form.referral.trim() || undefined,
      })

      localStorage.setItem('shibuya_order', JSON.stringify({
        name: form.name,
        email: form.email,
        discord: form.discord,
        referral: form.referral,
        plan: currentPlan.name,
        planId: currentPlan.planId,
        market,
        tier: currentPlan.id === 'reset_monthly' || currentPlan.id === 'reset_once' ? 'reset_pro' : 'psych_audit',
        currency: currentPlan.currency,
        orderId: session.order_id,
        sessionId: session.session_id,
        timestamp: new Date().toISOString(),
      }))

      rememberRecentOrderAccess({
        email: form.email.trim(),
        orderCode: session.order_id,
        market,
        planId: currentPlan.planId,
        planName: currentPlan.name,
      })

      window.location.href = session.checkout_url
    } catch (error) {
      console.error('Checkout error:', error)
      setCheckoutError('Payment system unavailable. Please try again or contact support@shibuya-analytics.com')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen font-sans selection:bg-indigo-500/30">
      <div className="mx-auto max-w-2xl px-6 py-24 md:py-32">
        <div className="mb-8">
          <Link
            to={addMarketToPath('/pricing', market)}
            className="mb-6 inline-flex items-center gap-2 text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">Start The Live Shibuya Loop</h1>
          <p className="text-neutral-400">
            Checkout unlocks the live workspace where you upload history, separate edge from sabotage, and get a next-session mandate.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{currentPlan.name}</h3>
              <p className="text-sm text-neutral-400">{currentPlan.description}</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-3xl font-bold text-white">{formatPrice(currentPlan)}</span>
              <p className="text-xs text-neutral-500">{currentPlan.billingLabel}</p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-white/5 bg-[#0A0A0B] p-6 md:p-8">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <User className="h-5 w-5 text-indigo-400" />
              Your Details
            </h3>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#050505] px-4 py-3 text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-300">
                  <Mail className="h-4 w-4" />
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#050505] px-4 py-3 text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
                  placeholder="your@email.com"
                />
                <p className="mt-1 text-xs text-neutral-500">We will send your order code and activation instructions here.</p>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-300">
                  <MessageSquare className="h-4 w-4" />
                  Discord Username <span className="text-neutral-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="discord"
                  value={form.discord}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#050505] px-4 py-3 text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-300">
                  <Gift className="h-4 w-4" />
                  Referral / Affiliate Code <span className="text-neutral-500">(Optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="referral"
                    value={form.referral}
                    onChange={handleChange}
                    className="flex-1 rounded-lg border border-white/10 bg-[#050505] px-4 py-3 uppercase text-white placeholder-neutral-500 transition-colors focus:border-indigo-500 focus:outline-none"
                    placeholder="ENTER CODE"
                  />
                  <button
                    type="button"
                    onClick={() => validatePromoCode(form.referral)}
                    disabled={promoValidating || !form.referral.trim()}
                    className="rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500"
                  >
                    {promoValidating ? '...' : 'Apply'}
                  </button>
                </div>
                {promoResult && (
                  <div
                    className={`mt-2 flex items-center gap-2 rounded-lg p-3 text-sm ${
                      promoResult.valid
                        ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border border-red-500/20 bg-red-500/10 text-red-400'
                    }`}
                  >
                    {promoResult.valid ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {promoResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0A0A0B] p-6 md:p-8">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <Upload className="h-5 w-5 text-indigo-400" />
              {isSubscription ? 'What changes after monthly access starts' : 'What changes after payment clears'}
            </h3>
            <p className="mb-6 text-sm text-neutral-400">
              {isSubscription
                ? 'This does not buy a PDF. It starts a live trader workspace that stays active while continuity is healthy.'
                : 'This does not buy a PDF. It opens a 30-day live reset window where you activate, upload, and work the loop for real.'}
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                'Activate the live workspace with your order code.',
                'Upload your broker or platform export inside the workspace.',
                market === 'india'
                  ? 'See discipline tax, edge concentration, and behavior leaks in rupees.'
                  : 'See discipline tax, edge concentration, and current trader state.',
                'Carry a next-session mandate forward and update it after each session.',
                isGuided
                  ? isSubscription
                    ? 'Your first billing cycle includes one guided review call so the reset does not stay theoretical.'
                    : 'This package includes one guided kickoff review so the reset does not stay theoretical.'
                  : isSubscription
                    ? 'This tier is built to stay lightweight enough to keep live at volume.'
                    : 'This package is built to give you a bounded reset window without forcing a recurring commitment first.',
              ].map((item) => (
                <div key={item} className="rounded-xl border border-white/5 bg-black/20 p-4 text-sm leading-relaxed text-neutral-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0A0A0B] p-6">
            <h4 className="mb-4 font-medium text-white">What happens next?</h4>
            <div className="space-y-3 text-sm">
              {[
                isSubscription
                  ? 'Complete the recurring checkout through the live Shibuya payment flow.'
                  : 'Complete the one-time checkout and secure the reset window.',
                'Receive your order code by email and on the success screen.',
                'Activate your live trader account.',
                isSubscription
                  ? 'Upload history and keep the live loop running session by session.'
                  : 'Upload history and use the 30-day reset window before the account becomes read-only.',
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
                    <span className="text-xs font-bold text-indigo-400">{index + 1}</span>
                  </div>
                  <p className="text-neutral-400">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {checkoutError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-200">{checkoutError}</p>
                <button
                  type="button"
                  onClick={() => setCheckoutError(null)}
                  className="mt-1 text-xs text-red-400 underline hover:text-red-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 py-4 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Starting checkout...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Continue to Secure Checkout
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>

          <p className="text-center text-xs text-neutral-500">
            By proceeding, you agree to our <Link to="/terms" className="text-indigo-400 hover:underline">Terms</Link> and <Link to="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
          </p>
        </motion.form>
      </div>
    </div>
  )
}

export default CheckoutPage
