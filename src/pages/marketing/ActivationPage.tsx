import { type FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logTraderLifecycleEvent } from '../../lib/api/trader'
import { verifyActivation } from '../../lib/api/auth'
import { describeCheckoutIntent, readCheckoutIntent } from '../../lib/checkoutIntent'
import { addMarketToPath, getPlanByPlanId, resolveMarket } from '../../lib/market'
import {
  buildDemoLauncherSampleReportSession,
  getPublicReportSession,
  hasDemoLauncherSamplePacketRequest,
  persistPublicReportSession,
} from '../../lib/publicReportSession'
import { setLiveApiKey } from '../../lib/runtime'
import { readRecentOrderAccess } from '../../lib/recentAccess'
import {
  buildFreeReportPreview,
  findLockedReportSectionBySlug,
  getFingerprintAxis,
  getTraderArchetype,
} from '../../lib/storyExperience'

export function ActivationPage() {
  const recentAccess = readRecentOrderAccess()
  const recentPlan = getPlanByPlanId(recentAccess?.planId)
  const [email, setEmail] = useState(recentAccess?.email ?? '')
  const [orderCode, setOrderCode] = useState(recentAccess?.orderCode ?? '')
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const checkoutIntent = readCheckoutIntent(location.search)
  const storedActivationReportSession = getPublicReportSession(checkoutIntent?.reportId)
  const hasStoredActivationReportSession = Boolean(storedActivationReportSession)
  const demoLauncherActivationSession =
    hasStoredActivationReportSession || !checkoutIntent?.reportId || !hasDemoLauncherSamplePacketRequest(location.search)
      ? null
      : buildDemoLauncherSampleReportSession({
        reportId: checkoutIntent.reportId,
        market,
        archetypeId: getTraderArchetype(checkoutIntent.archetypeId).id,
        axisId: getFingerprintAxis(checkoutIntent.axisId).id,
        storySource: checkoutIntent.storySource,
        selectedPainAxisIds: checkoutIntent.selectedPainAxisIds,
        visitedSceneCount: checkoutIntent.visitedSceneCount,
        signalMarkerIds: checkoutIntent.signalMarkerIds,
      })
  const activationReportSession = storedActivationReportSession ?? demoLauncherActivationSession

  useEffect(() => {
    if (demoLauncherActivationSession) {
      persistPublicReportSession(demoLauncherActivationSession)
    }
  }, [demoLauncherActivationSession])
  const activationReport = checkoutIntent
    ? buildFreeReportPreview({
        reportId: checkoutIntent.reportId ?? 'activation-origin',
        archetypeId: checkoutIntent.archetypeId,
        axisId: checkoutIntent.axisId,
        storySource: activationReportSession?.storySource ?? checkoutIntent.storySource,
        selectedPainAxisIds: activationReportSession?.selectedPainAxisIds ?? checkoutIntent.selectedPainAxisIds,
        visitedSceneCount: activationReportSession?.visitedSceneCount ?? checkoutIntent.visitedSceneCount,
        signalMarkerIds: activationReportSession?.signalMarkerIds ?? checkoutIntent.signalMarkerIds,
      })
    : null
  const activationLockedSection = activationReport
    ? findLockedReportSectionBySlug(activationReport, checkoutIntent?.lockedSectionId)
    : null
  const activationSelectedPainAxisIds = activationReportSession?.selectedPainAxisIds ?? checkoutIntent?.selectedPainAxisIds ?? []
  const activationSelectedPainAxisIdsForStorage = activationSelectedPainAxisIds.length ? activationSelectedPainAxisIds : undefined
  const activationStorySource = activationReportSession?.storySource ?? checkoutIntent?.storySource
  const activationVisitedSceneCount = activationReportSession?.visitedSceneCount ?? checkoutIntent?.visitedSceneCount
  const activationSignalMarkerIds = activationReportSession?.signalMarkerIds ?? checkoutIntent?.signalMarkerIds ?? []
  const activationSignalMarkerIdsForStorage = activationSignalMarkerIds.length ? activationSignalMarkerIds : undefined
  const activationSignalMarkerLabels = activationReport?.storyHandoff.signalMarkers.map((marker) => marker.label) ?? []
  const activationPainAxisLabels = activationSelectedPainAxisIds
    .map((axisId) => getFingerprintAxis(axisId))
    .filter((axis, index, axes) => activationSelectedPainAxisIds[index] === axis.id && axes.findIndex((candidate) => candidate.id === axis.id) === index)
    .map((axis) => axis.label)
  const activationProofLadder = [
    {
      label: 'Payment context carried',
      status: 'ready',
      detail: checkoutIntent
        ? describeCheckoutIntent(checkoutIntent)
        : 'No checkout context is attached to this activation route.',
    },
    {
      label: 'Activation pending',
      status: 'pending',
      detail: 'Email plus order code must verify before any live workspace state is created.',
    },
    {
      label: 'First meaningful upload required',
      status: 'locked',
      detail: 'The live workspace cannot make account-specific private claims until uploaded history is normalized into generated artifacts.',
    },
    {
      label: 'Append proof close required',
      status: 'locked',
      detail: 'A paid activation still needs append history before Shibuya can confirm whether the public hypothesis survived real trading behavior.',
    },
    {
      label: 'Private conclusion still locked',
      status: 'locked',
      detail: activationReport?.resetProBridge.decisionQuestion
        ?? 'The private answer remains locked until activation, upload proof, and append history exist.',
    },
  ]
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setStatusMessage(null)

    try {
      const response = await verifyActivation({ email, orderCode })

      if (response.status === 'ready' && response.activationToken) {
        // Store the activation token BEFORE redirect so AuthGuard recognises the session.
        setLiveApiKey(response.activationToken, {
          customerId: response.customerId ?? undefined,
          tier: response.tier ?? undefined,
          planId: response.planId ?? undefined,
          market: (response.market as 'global' | 'india') ?? market,
          offerKind: response.offerKind ?? undefined,
          caseStatus: response.caseStatus ?? undefined,
          accessExpiresAt: response.accessExpiresAt ?? undefined,
          dataSource: response.dataSource ?? undefined,
          orderId: orderCode,
          activationSource: checkoutIntent?.source,
          activationReportId: checkoutIntent?.reportId,
          activationArchetypeId: checkoutIntent?.archetypeId,
          activationAxisId: checkoutIntent?.axisId,
          activationStorySource,
          activationSelectedPainAxisIds: activationSelectedPainAxisIdsForStorage,
          activationVisitedSceneCount,
          activationSignalMarkerIds: activationSignalMarkerIdsForStorage,
          activationLockedSectionId: checkoutIntent?.lockedSectionId,
          activationLockedSectionTitle: activationLockedSection?.title,
          activationBridgeHeadline: activationReport?.resetProBridge.headline,
          activationBridgeDecisionQuestion: activationReport?.resetProBridge.decisionQuestion,
          activationBridgeWhyNow: activationReport?.resetProBridge.whyNow,
          activationBridgeLiveProof: activationReport?.resetProBridge.liveWorkspaceMustProve,
        })

        await logTraderLifecycleEvent({
          event_name: 'workspace_activated',
          market: response.market ?? market,
          tier: response.tier,
          metadata: {
            orderCode,
            passwordRequired: response.passwordRequired ?? false,
            activationSource: checkoutIntent?.source,
            activationReportId: checkoutIntent?.reportId,
            activationStorySource,
            activationVisitedSceneCount,
            activationSignalMarkerIds: activationSignalMarkerIdsForStorage,
            activationLockedSectionId: checkoutIntent?.lockedSectionId,
            activationBridgeQuestion: activationReport?.resetProBridge.decisionQuestion,
          },
        }).catch(() => undefined)

        setStatusMessage(
          response.passwordRequired
            ? 'Activation successful. Redirecting you to create a return-access password.'
            : 'Activation successful. Redirecting to your trader workspace.',
        )
        navigate(addMarketToPath(response.passwordRequired ? '/claim-account' : '/dashboard', response.market ?? market), { replace: true })
        return
      }

      if (response.status === 'pending') {
        setStatusMessage('Your payment is still processing. Check your confirmation email and try again in a few minutes.')
        return
      }

      setError(response.message || 'Activation failed. Please verify your order code and email.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="activation-terminal">
      <div className="terminal-background-grid"></div>
      <div className="terminal-container glass-panel">
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <span className="terminal-title">shibuya_activate.sh - bash - 80x24</span>
        </div>

        <div className="terminal-body">
          <div className="terminal-line">
            <span className="terminal-prompt">root@shibuya:~$</span>
            <span className="terminal-cmd">./activate_trader_workspace --live-loop</span>
          </div>

          <div className="terminal-output">
            <p className="text-green-400">Live trader workspace: AVAILABLE</p>
            <p className="text-green-400">Public free report: AVAILABLE</p>
            <p>Shibuya Analytics trader runtime</p>
            <p className="terminal-muted">
              Use the exact email and order code from payment to unlock the live workspace.
              On your first live activation, you will also create the password you use for return access.
            </p>
            {recentAccess?.email && recentAccess?.orderCode ? (
              <p className="terminal-muted">
                Last checkout detected for {recentAccess.email}. The form is already filled so you can keep moving.
              </p>
            ) : null}
            {recentPlan?.guidedReviewIncluded ? (
              <p className="terminal-muted">
                This offer includes a guided review checkpoint after your first meaningful upload. Activation is step one, not the finish line.
              </p>
            ) : null}
            {checkoutIntent ? (
              <div className="terminal-status terminal-status-success" style={{ marginTop: '1rem' }}>
                <span className="status-icon">CTX</span>
                <div>
                  <p>{describeCheckoutIntent(checkoutIntent).toUpperCase()} CONTEXT DETECTED</p>
                  <p className="terminal-muted">
                    {activationLockedSection?.title
                      ? `Activation will carry "${activationLockedSection.title}" into the live workspace as requested context.`
                      : 'Activation will carry this public-story context into the live workspace.'}
                  </p>
                  <p className="terminal-muted">
                    This is routing context only. The private claim still requires live activation, upload proof, and generated workspace evidence.
                  </p>
                  <p className="terminal-muted">
                    Report: {checkoutIntent.reportId ?? 'not provided'} | Archetype: {activationReport?.archetype.name ?? 'not provided'} | Axis: {activationReport?.dominantAxis.label ?? 'not provided'}
                  </p>
                  <p className="terminal-muted">
                    Public packet: {activationReportSession?.evidenceLabel ?? 'URL context only'} | Story: {activationStorySource ?? 'not available'} | Scenes: {activationVisitedSceneCount ?? 'not available'} | Pain axes: {activationPainAxisLabels.length ? activationPainAxisLabels.join(', ') : 'none captured'}
                  </p>
                  {activationSignalMarkerLabels.length ? (
                    <p className="terminal-muted">
                      Public signal markers: {activationSignalMarkerLabels.join(', ')}
                    </p>
                  ) : null}
                  {activationReport?.resetProBridge ? (
                    <p className="terminal-muted">
                      Reset Pro bridge: {activationReport.resetProBridge.decisionQuestion}
                    </p>
                  ) : null}
                  <div
                    className="terminal-status terminal-status-success"
                    style={{ marginTop: '1rem', background: 'rgba(14, 165, 233, 0.08)', borderColor: 'rgba(125, 211, 252, 0.28)' }}
                  >
                    <span className="status-icon">LAD</span>
                    <div>
                      <p>LIVE ACTIVATION PROOF LADDER</p>
                      <p className="terminal-muted">
                        This ladder separates what payment can carry, what first upload can evidence, and what append history must still prove.
                      </p>
                      <p className="terminal-muted">
                        APPEND PROOF CLOSE: activation is access control, not the conclusion; repeated account history must confirm or reject the carried question.
                      </p>
                      <div className="grid-responsive" style={{ marginTop: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
                        {activationProofLadder.map((item) => (
                          <div key={item.label} className="glass-panel" style={{ background: 'rgba(0,0,0,0.18)', borderColor: 'rgba(255,255,255,0.08)' }}>
                            <p className="badge" style={{ marginBottom: '0.5rem' }}>{item.status.toUpperCase()}</p>
                            <h4 style={{ marginBottom: '0.5rem' }}>{item.label}</h4>
                            <p className="terminal-muted" style={{ marginBottom: 0 }}>{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {statusMessage && (
            <div className="terminal-success-block">
              <div className="terminal-status terminal-status-success">
                <span className="status-icon">OK</span>
                <div>
                  <p>ACTIVATION STATUS</p>
                  <p className="terminal-muted">{statusMessage}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              className="terminal-status"
              style={{ borderColor: 'rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.08)' }}
            >
              <span className="status-icon">ERR</span>
              <div>
                <p>ACTIVATION FAILED</p>
                <p className="terminal-muted">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="terminal-form">
            <p className="terminal-instruction">
              Enter the exact email and order code tied to your purchase. This is what turns evaluation into a persistent live workspace.
            </p>

            <div className="terminal-field">
              <label>
                <span className="field-label">EMAIL_ADDRESS</span>
                <div className="field-input-wrapper">
                  <span className="field-prefix">-&gt;</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="trader@example.com"
                  />
                </div>
              </label>
            </div>

            <div className="terminal-field">
              <label>
                <span className="field-label">ORDER_CODE</span>
                <div className="field-input-wrapper">
                  <span className="field-prefix">-&gt;</span>
                  <input
                    type="text"
                    value={orderCode}
                    onChange={(event) => setOrderCode(event.target.value)}
                    required
                    placeholder="ord_abc123..."
                  />
                </div>
              </label>
            </div>

            <button className="terminal-btn terminal-btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'ACTIVATING...' : 'UNLOCK LIVE WORKSPACE'}
            </button>
          </form>

          <div className="terminal-divider">
            <span>OR RUN THE PUBLIC MIRROR FIRST</span>
          </div>

          <Link to={addMarketToPath('/upload', market)} className="terminal-btn terminal-btn-ghost">
            <span className="demo-icon">▶</span>
            GENERATE FREE REPORT
          </Link>

          <p className="terminal-hint">
            The public report is for evaluation. Live is where uploads, history, alerts, next-session mandates, and your return access persist.
          </p>

          <div className="terminal-footer">
            <p className="terminal-muted">
              Already activated? <Link to={addMarketToPath('/login', market)} className="terminal-link">Sign in</Link>
            </p>
            <p className="terminal-muted">
              Need access first? <Link to={addMarketToPath('/pricing', market)} className="terminal-link">Choose your starting point</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
