import React, { useEffect, useState } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, Clock, ArrowRight, KeyRound, Loader2, AlertCircle } from 'lucide-react'
import { getCheckoutSession } from '../../lib/api'
import { addMarketToPath, getMarketHomePath, getPlanByPlanId, inferMarketFromPlanId, persistMarket, resolveMarket } from '../../lib/market'
import { rememberRecentOrderAccess } from '../../lib/recentAccess'

interface OrderInfo {
  name: string
  email: string
  plan: string
  planId?: string
  market?: 'global' | 'india'
  currency?: string
  orderId?: string
  sessionId?: string
  timestamp: string
}

function loadStoredOrder(): OrderInfo | null {
  if (typeof window === 'undefined') {
    return null
  }

  const storedOrder = window.localStorage.getItem('shibuya_order')
  if (!storedOrder) {
    return null
  }

  window.localStorage.removeItem('shibuya_order')
  return JSON.parse(storedOrder) as OrderInfo
}

const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const urlMarket = resolveMarket(location.pathname, location.search)
  const sessionId = searchParams.get('session_id')
  const [initialOrder] = useState<OrderInfo | null>(() => loadStoredOrder())
  const [order, setOrder] = useState<OrderInfo | null>(initialOrder)
  const [loading, setLoading] = useState(initialOrder === null && Boolean(sessionId))
  const [verifyError, setVerifyError] = useState<string | null>(null)

  useEffect(() => {
    if (order) {
      const persistedMarket = order.market ?? inferMarketFromPlanId(order.planId) ?? urlMarket
      persistMarket(persistedMarket)
      rememberRecentOrderAccess({
        email: order.email,
        orderCode: order.orderId,
        market: persistedMarket,
        planId: order.planId,
        planName: order.plan,
      })
      return
    }

    if (!sessionId) {
      return
    }

    getCheckoutSession(sessionId)
      .then((session) => {
        if (session.payment_status === 'paid' || session.status === 'complete') {
          const inferredMarket = inferMarketFromPlanId(session.plan_id)
          persistMarket(inferredMarket)
          const verifiedOrder = {
            name: session.customer_name || '',
            email: session.customer_email || '',
            plan: session.plan_id || '',
            planId: session.plan_id || '',
            market: inferredMarket,
            orderId: session.order_id,
            sessionId: session.session_id,
            timestamp: new Date().toISOString(),
          }
          rememberRecentOrderAccess({
            email: verifiedOrder.email,
            orderCode: verifiedOrder.orderId,
            market: verifiedOrder.market,
            planId: verifiedOrder.planId,
            planName: verifiedOrder.plan,
          })
          setOrder(verifiedOrder)
        } else {
          setVerifyError('Payment has not completed yet. If you just paid, give it a moment and refresh this page.')
        }
      })
      .catch(() => {
        setVerifyError('Could not verify your order. Check your email for the order code, or contact support.')
      })
      .finally(() => setLoading(false))
  }, [order, sessionId, urlMarket])

  const market = order?.market ?? urlMarket
  const plan = getPlanByPlanId(order?.planId)

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center md:py-32">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-indigo-400" />
        <p className="text-neutral-400">Verifying your payment...</p>
      </div>
    )
  }

  if (verifyError && !order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center md:py-32">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
          <AlertCircle className="h-10 w-10 text-amber-400" />
        </div>
        <h1 className="mb-4 text-3xl font-bold text-white">Payment Pending</h1>
        <p className="mb-8 text-lg text-neutral-400">{verifyError}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to={addMarketToPath('/activate', market)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Go to Activation
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={getMarketHomePath(market)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-black"
          >
            Back to Home
          </Link>
        </div>
        <p className="mt-6 text-sm text-neutral-500">
          Questions?{' '}
          <a href="mailto:support@shibuya-analytics.com" className="text-indigo-400 hover:underline">
            support@shibuya-analytics.com
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center md:py-32">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20"
      >
        <CheckCircle className="h-10 w-10 text-green-400" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 text-3xl font-bold text-white md:text-4xl"
      >
        Checkout Complete
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 text-lg text-neutral-400"
      >
        Thank you for your order{order?.name ? `, ${order.name.split(' ')[0]}` : ''}. The next step is activation, not waiting.
      </motion.p>

      {order?.orderId && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-left"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
              <KeyRound className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-white">Your order code</h3>
              <p className="font-mono text-sm text-neutral-300">{order.orderId}</p>
              <p className="mt-2 text-xs text-neutral-500">
                Keep this code. Use it with your email on the activation page if the confirmation email takes a moment to arrive.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8 rounded-2xl border border-white/5 bg-[#0A0A0B] p-8 text-left"
      >
        <h3 className="mb-6 font-semibold text-white">What happens now?</h3>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
              <Mail className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="mb-1 font-medium text-white">Confirmation Email</h4>
              <p className="text-sm text-neutral-400">
                Check your inbox{order?.email ? ` at ${order.email}` : ''}. We send your order code and activation instructions there as payment settles.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
              <Clock className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="mb-1 font-medium text-white">Activate Your Account</h4>
              <p className="text-sm text-neutral-400">
                Go to activation, enter your email and order code, unlock the live trader workspace, and create your return password if this is your first live access.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h4 className="mb-1 font-medium text-white">Upload And Start</h4>
              <p className="text-sm text-neutral-400">
                Upload your trade history inside the workspace, then use history, alerts, edge analysis, and prescriptions directly.
              </p>
            </div>
          </div>

          {plan?.guidedReviewIncluded ? (
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
                <CheckCircle className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="mb-1 font-medium text-white">Guided Review Unlock</h4>
                <p className="text-sm text-neutral-400">
                  Your guided reset checkpoint unlocks after the first meaningful upload. Review the board first, then book the call.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to={addMarketToPath('/activate', market)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Activate Live Account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={getMarketHomePath(market)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-black"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-sm text-neutral-500">
          Questions? Contact us at{' '}
          <a href="mailto:support@shibuya-analytics.com" className="text-indigo-400 hover:underline">
            support@shibuya-analytics.com
          </a>
        </p>
      </motion.div>
    </div>
  )
}

export default CheckoutSuccessPage
