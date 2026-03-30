import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, User, MessageSquare, CreditCard, Gift, Check, AlertCircle, Upload, ArrowRight } from 'lucide-react'
import { API_BASE_URL } from '../../lib/constants'
import { createCheckoutSession } from '../../lib/api'
import Navbar from '../../components/landing/Navbar'
import Footer from '../../components/landing/Footer'

const PLANS = {
  basic: {
    name: 'The Reality Check',
    price: 99,
    planId: 'shibuya_single',
    description: 'Baseline workspace activation with discipline tax, edge concentration, and trader-state feedback.',
  },
  premium: {
    name: 'The Deep Dive',
    price: 149,
    planId: 'shibuya_transform',
    description: 'Deeper trader-performance entry point with stronger follow-through and higher-touch support.',
  },
} as const

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
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    email: '',
    discord: '',
    referral: '',
  })
  const [promoValidating, setPromoValidating] = useState(false)
  const [promoResult, setPromoResult] = useState<PromoValidation | null>(null)
  const currentPlan = PLANS[plan as keyof typeof PLANS] || PLANS.basic

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
      const origin = window.location.origin
      const successUrl = `${origin}/checkout/success?plan=${encodeURIComponent(currentPlan.planId)}`
      const cancelUrl = `${origin}/checkout/${plan || 'basic'}`

      const session = await createCheckoutSession({
        plan_id: currentPlan.planId,
        email: form.email.trim(),
        name: form.name.trim(),
        success_url: successUrl,
        cancel_url: cancelUrl,
      })

      localStorage.setItem('shibuya_order', JSON.stringify({
        name: form.name,
        email: form.email,
        discord: form.discord,
        referral: form.referral,
        plan: currentPlan.name,
        planId: currentPlan.planId,
        orderId: session.order_id,
        sessionId: session.session_id,
        timestamp: new Date().toISOString(),
      }))

      window.location.href = session.checkout_url
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout could not be started. Please try again or contact support@shibuya-analytics.com')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative font-sans bg-[#030304] selection:bg-indigo-500/30">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-24 md:py-32">
        <div className="mb-8">
          <Link to="/pricing" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Activate Your Live Trader Account</h1>
          <p className="text-neutral-400">Checkout unlocks the live Shibuya workspace. Upload your history after activation.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-white text-lg">{currentPlan.name}</h3>
              <p className="text-sm text-neutral-400">{currentPlan.description}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-white font-mono">EUR {currentPlan.price}</span>
              <p className="text-xs text-neutral-500">one-time</p>
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
          <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Your Details
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-white placeholder-neutral-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-white placeholder-neutral-500"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-neutral-500 mt-1">We will send your order code and activation instructions here.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Discord Username <span className="text-neutral-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="discord"
                  value={form.discord}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-white placeholder-neutral-500"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Promo or Referral Code <span className="text-neutral-500">(Optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="referral"
                    value={form.referral}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-white placeholder-neutral-500 uppercase"
                    placeholder="ENTER CODE"
                  />
                  <button
                    type="button"
                    onClick={() => validatePromoCode(form.referral)}
                    disabled={promoValidating || !form.referral.trim()}
                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {promoValidating ? '...' : 'Apply'}
                  </button>
                </div>
                {promoResult && (
                  <div className={`mt-2 p-3 rounded-lg text-sm flex items-center gap-2 ${
                    promoResult.valid
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {promoResult.valid ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {promoResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              What you will do after activation
            </h3>
            <p className="text-sm text-neutral-400 mb-6">
              You do not need to upload your CSV before checkout. The live workspace is where uploads, history, alerts, and prescriptions become part of your ongoing loop.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                'Activate your live trader account with the order code.',
                'Upload your broker or platform export inside the workspace.',
                'Review your trade history, edge portfolio, and discipline tax.',
                'Use alerts and next-session guidance to iterate forward.',
              ].map((item) => (
                <div key={item} className="rounded-xl border border-white/5 bg-black/20 p-4 text-sm text-neutral-300 leading-relaxed">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-6">
            <h4 className="font-medium text-white mb-4">What happens next?</h4>
            <div className="space-y-3 text-sm">
              {[
                'Complete payment through the live Shibuya checkout flow.',
                'Receive your order code by email and on the success screen.',
                'Activate your live trader account.',
                'Upload your trade history and start using the workspace immediately.',
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-indigo-400 font-bold">{index + 1}</span>
                  </div>
                  <p className="text-neutral-400">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting checkout...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay EUR {currentPlan.price} and Activate
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          <p className="text-xs text-center text-neutral-500">
            By proceeding, you agree to our <Link to="/terms" className="text-indigo-400 hover:underline">Terms</Link> and <Link to="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
          </p>
        </motion.form>
      </div>

      <Footer />
    </div>
  )
}

export default CheckoutPage
