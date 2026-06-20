import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, Clock, ArrowRight, KeyRound, Loader2, AlertCircle } from 'lucide-react'
import { getCheckoutSession } from '../../lib/api/checkout'
import { appendCheckoutIntentToPath, describeCheckoutIntent, readCheckoutIntent } from '../../lib/checkoutIntent'
import type { CheckoutIntent } from '../../lib/checkoutIntent'
import { addMarketToPath, getMarketHomePath, getPlanByPlanId, inferMarketFromPlanId, persistMarket, resolveMarket } from '../../lib/market'
import {
  appendDemoLauncherSamplePacketToPath,
  getPublicReportSession,
  hasDemoLauncherSamplePacketRequest,
  isDemoLauncherSampleReportSession,
} from '../../lib/publicReportSession'
import {
  buildPublicReportEngagementSummary,
  getPublicReportEngagement,
  type PublicReportEngagementSummary,
} from '../../lib/publicReportEngagement'
import { rememberRecentOrderAccess } from '../../lib/recentAccess'
import { getFingerprintAxis } from '../../lib/storyExperience'

interface OrderInfo {
  name: string
  email: string
  plan: string
  planId?: string
  market?: 'global' | 'india'
  currency?: string
  orderId?: string
  sessionId?: string
  checkoutIntent?: CheckoutIntent | null
  checkoutEngagementSummary?: PublicReportEngagementSummary
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
  const urlCheckoutIntent = useMemo(() => readCheckoutIntent(location.search), [location.search])
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
            checkoutIntent: urlCheckoutIntent,
            checkoutEngagementSummary: buildPublicReportEngagementSummary(
              getPublicReportEngagement(urlCheckoutIntent?.reportId),
              urlCheckoutIntent?.lockedSectionId,
            ),
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
  }, [order, sessionId, urlMarket, urlCheckoutIntent])

  const market = order?.market ?? urlMarket
  const plan = getPlanByPlanId(order?.planId)
  const rawCheckoutIntent = order?.checkoutIntent ?? urlCheckoutIntent
  const rawReportSession = getPublicReportSession(rawCheckoutIntent?.reportId)
  const activationEngagementSummary = order?.checkoutEngagementSummary ?? buildPublicReportEngagementSummary(
    getPublicReportEngagement(rawCheckoutIntent?.reportId),
    rawCheckoutIntent?.lockedSectionId,
  )
  const shouldCarryDemoLauncherPacket =
    isDemoLauncherSampleReportSession(rawReportSession) || hasDemoLauncherSamplePacketRequest(location.search)
  const hasLockedInsightSuccessIntent =
    rawCheckoutIntent?.source === 'locked_insight' &&
    Boolean(rawCheckoutIntent.reportId && rawCheckoutIntent.lockedSectionId)
  const hasLockedSectionIntentProof = activationEngagementSummary.currentSectionClickCount > 0
  const successContextReady =
    hasLockedInsightSuccessIntent &&
    (hasLockedSectionIntentProof || shouldCarryDemoLauncherPacket)
  const checkoutIntent = successContextReady ? rawCheckoutIntent : null
  const reportSession = checkoutIntent ? rawReportSession : null
  const selectedPainAxisIds = reportSession?.selectedPainAxisIds ?? checkoutIntent?.selectedPainAxisIds ?? []
  const selectedPainAxisLabels = selectedPainAxisIds
    .map((axisId) => getFingerprintAxis(axisId))
    .filter((axis, index, axes) => selectedPainAxisIds[index] === axis.id && axes.findIndex((candidate) => candidate.id === axis.id) === index)
    .map((axis) => axis.label)
  const activationPath = addMarketToPath(
    appendDemoLauncherSamplePacketToPath(
      appendCheckoutIntentToPath('/activate', checkoutIntent),
      shouldCarryDemoLauncherPacket,
    ),
    market,
  )
  const activationHandoffContractRows = [
    {
      label: 'Order code proves',
      body: 'Checkout created a payment handoff that can be verified during activation.',
    },
    {
      label: 'Activation must verify',
      body: 'Email, order code, customer state, entitlement, market, and selected plan before live workspace state is created.',
    },
    {
      label: 'Upload must prove',
      body: 'Normalized trade history, generated artifacts, and append history before account-specific private conclusions are allowed.',
    },
  ]

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
            to={activationPath}
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

  if (!order && !sessionId) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center md:py-32">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20">
          <AlertCircle className="h-10 w-10 text-rose-300" />
        </div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-rose-200">
          Checkout success route integrity
        </p>
        <h1 className="mb-4 text-3xl font-bold text-white">Checkout record missing</h1>
        <p className="mb-8 text-lg leading-8 text-neutral-400">
          This page cannot claim checkout completion without a stored order receipt or verified session id.
          Start from the public report and locked insight before payment so activation receives a real question.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to={addMarketToPath('/upload', market)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Generate Free Report First
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={addMarketToPath('/pricing', market)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-black"
          >
            Return To Pricing
          </Link>
        </div>
        <p className="mt-6 text-sm text-neutral-500">
          Success route rule: order code, verified session, and activation handoff context are required before this page can behave like a checkout receipt.
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

      {checkoutIntent && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-8 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5 text-left"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Carried into activation</p>
          <h3 className="mt-2 font-semibold text-white">{describeCheckoutIntent(checkoutIntent)}</h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">
            Activation keeps the public-story context attached so the live workspace can start from the exact locked module instead of treating this like a generic signup.
          </p>
          <div className="mt-4 grid gap-2 text-xs text-neutral-400 md:grid-cols-2">
            {checkoutIntent.lockedSectionId && <span>Module: {checkoutIntent.lockedSectionId}</span>}
            {checkoutIntent.reportId && <span>Report: {checkoutIntent.reportId}</span>}
            {checkoutIntent.archetypeId && <span>Archetype: {checkoutIntent.archetypeId}</span>}
            {checkoutIntent.axisId && <span>Axis: {checkoutIntent.axisId}</span>}
            {checkoutIntent.signalMarkerIds?.length ? <span>Signals: {checkoutIntent.signalMarkerIds.join(', ')}</span> : null}
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-neutral-300">
            <p className="font-semibold text-amber-100">
              {reportSession?.evidenceLabel ?? 'URL context only'}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100">
              Artifact status: {reportSession?.artifactStatusLabel ?? 'URL context only'} / Live/private artifact: {reportSession?.productionArtifactProven ? 'proven' : 'not proven'}
            </p>
            <p className="mt-1 text-neutral-400">
              {reportSession?.validationSummary ?? 'No local public report packet was found in this browser. Activation can preserve the route context, but not upload-step evidence.'}
            </p>
            {(reportSession?.storySource ?? checkoutIntent.storySource) ? (
              <p className="mt-2 text-neutral-500">
                Story handoff: {reportSession?.storySource ?? checkoutIntent.storySource}; scenes {reportSession?.visitedSceneCount ?? checkoutIntent.visitedSceneCount ?? 'not available'}; pain axes {selectedPainAxisLabels.length ? selectedPainAxisLabels.join(', ') : 'none captured'}.
              </p>
            ) : null}
            <p className="mt-2 text-neutral-500">
              Activation boundary: payment can carry this context forward, but the live workspace still needs a first meaningful upload before private claims are treated as account-specific evidence.
            </p>
          </div>
          <div className="mt-4 rounded-xl border border-sky-300/20 bg-sky-300/[0.06] p-4 text-xs leading-6 text-neutral-300">
            <p className="font-semibold uppercase tracking-[0.18em] text-sky-100">Activation engagement receipt</p>
            <p className="mt-2 text-neutral-400">
              Views {activationEngagementSummary.reportViewCount}; locked clicks {activationEngagementSummary.lockedSectionClickCount}; this module {activationEngagementSummary.currentSectionClickCount}; private gate attempts {activationEngagementSummary.privateDemoIntentCount}.
            </p>
            <p className="mt-2 text-neutral-500">{activationEngagementSummary.boundary}</p>
          </div>
          <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-100">Activation handoff contract</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {activationHandoffContractRows.map((row) => (
                <div key={row.label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="font-semibold text-white">{row.label}</p>
                  <p className="mt-2 text-xs leading-5 text-neutral-400">{row.body}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {rawCheckoutIntent && !checkoutIntent && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-8 rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] p-5 text-left"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-100">Activation context not carried</p>
          <h3 className="mt-2 font-semibold text-white">URL-only checkout context is visible, but not trusted.</h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">
            Checkout success will not carry route text into activation unless this browser has a local locked-section intent receipt or the explicit controlled launcher packet.
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-neutral-300">
            <p className="font-semibold text-amber-100">Success handoff boundary</p>
            <p className="mt-1 text-neutral-400">
              The order code can still be activated. The live workspace will start without inheriting this public question unless the activation route receives verified local context.
            </p>
            <p className="mt-2 text-neutral-500">
              Blocked route context: report {rawCheckoutIntent.reportId ?? 'not provided'}; section {rawCheckoutIntent.lockedSectionId ?? 'not provided'}; source {rawCheckoutIntent.source}.
            </p>
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
            to={activationPath}
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
