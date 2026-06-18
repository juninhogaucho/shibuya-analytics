import { ArrowRight, Lock, ShieldCheck, UnlockKeyhole } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { BehavioralFingerprint } from '../../components/landing/BehavioralFingerprint'
import { addMarketToPath, getPlanForMarket, resolveMarket } from '../../lib/market'
import { getPublicReportSession } from '../../lib/publicReportSession'
import { buildFreeReportPreview, toReportSectionSlug } from '../../lib/storyExperience'

export default function FreeReportPage() {
  const { id } = useParams()
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const params = new URLSearchParams(location.search)
  const report = buildFreeReportPreview({
    reportId: id,
    archetypeId: params.get('archetype'),
    axisId: params.get('axis'),
  })
  const reportSession = getPublicReportSession(report.reportId)
  const resetPlan = getPlanForMarket(market, 'reset_monthly')
  const auditPlan = getPlanForMarket(market, 'audit_monthly')
  const privateDemoPath = addMarketToPath(
    `/private-demo?source=free_report&report=${encodeURIComponent(report.reportId)}&archetype=${report.archetype.id}&axis=${report.dominantAxis.id}`,
    market,
  )

  return (
    <section className="min-h-screen bg-[#030304] px-6 pb-20 pt-14 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-emerald-300">Free Behavioral Leak Report</p>
            <h1 className="font-display text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">
              Your baseline is forming.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-300">
              Report ID <span className="font-mono text-neutral-100">{report.reportId}</span>. This preview unlocks one sharp recognition point and shows what remains locked until the trader chooses a live workspace.
            </p>
            <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200">Public report packet</p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {reportSession?.evidenceLabel ?? 'No local upload packet found'}
              </h2>
              <p className="mt-3 text-sm leading-7 text-emerald-50/80">
                {reportSession?.validationSummary ?? 'This report was opened directly. It can show the public fingerprint preview, but it does not have upload-step validation metadata in this browser.'}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-emerald-50/75">
                {(reportSession?.validationFacts ?? [
                  'Story signal came from URL parameters only.',
                  'No raw trade rows, file metadata, or local validation packet is attached.',
                  'Use the upload page to generate a report with a local evidence handoff.',
                ]).map((fact) => (
                  <li key={fact} className="flex gap-2">
                    <span className="text-emerald-300">-</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-6 text-emerald-50/60">
                {reportSession?.boundary ?? 'Direct-link fallback only. Production analytics still require backend normalization and generated artifacts.'}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-indigo-300/20 bg-indigo-300/[0.08] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-200">Pressure Index</p>
                <p className="mt-1 font-mono text-2xl font-black text-white">{report.pressureIndex}/100</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Suggested path</p>
                <p className="mt-1 text-lg font-semibold text-white">{report.recommendedPath.label}</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Dominant predicted axis</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{report.dominantAxis.label}</h2>
            <p className="mt-3 text-sm leading-7 text-neutral-400">{report.dominantAxis.description}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5">
            <BehavioralFingerprint scores={report.scores} />
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.05] p-5 text-sm leading-7 text-amber-100/90">
              <strong>Not a trade call.</strong> Shibuya describes state. It does not tell traders what instrument to buy, sell, hold, or avoid.
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-[#09090B] p-5 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <UnlockKeyhole className="h-5 w-5 text-emerald-300" />
                <h2 className="text-2xl font-semibold text-white">Unlocked preview</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {report.unlocked.map((item) => (
                  <article key={item.label} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{item.label}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{item.value}</h3>
                    <p className="mt-3 text-sm leading-6 text-neutral-400">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[#09090B] p-5 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Lock className="h-5 w-5 text-indigo-300" />
                <h2 className="text-2xl font-semibold text-white">Locked until live workspace</h2>
              </div>
              <div className="grid gap-3">
                {report.locked.map((item) => (
                  <Link
                    key={item.title}
                    to={addMarketToPath(
                      `/insight/${toReportSectionSlug(item.title)}?source=locked_report&report=${encodeURIComponent(report.reportId)}&archetype=${report.archetype.id}&axis=${report.dominantAxis.id}`,
                      market,
                    )}
                    className="group flex gap-4 rounded-3xl border border-white/8 bg-black/25 p-5 transition hover:border-indigo-300/40 hover:bg-indigo-300/[0.06]"
                    aria-label={`Unlock ${item.title}`}
                  >
                    <Lock className="mt-1 h-4 w-4 shrink-0 text-neutral-500" />
                    <div>
                      <h3 className="text-base font-semibold text-white transition group-hover:text-indigo-100">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-neutral-400">{item.body}</p>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-300">
                        Unlock with {resetPlan.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <p className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-neutral-300">
                {report.conversionLine}
              </p>
            </section>

            <section className="rounded-[2rem] border border-indigo-300/20 bg-indigo-300/[0.06] p-5 md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-200">Private insight contract</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{report.privateInsightGate.headline}</h2>
                  <p className="mt-4 text-sm leading-7 text-indigo-50/75">{report.privateInsightGate.body}</p>
                </div>
                <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald-300" />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <h3 className="text-base font-semibold text-white">Evidence required before private claims</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
                    {report.privateInsightGate.evidenceRequired.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <h3 className="text-base font-semibold text-white">Boundary the demo keeps visible</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
                    {report.privateInsightGate.refusesToClaim.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm leading-7 text-neutral-300">{report.privateInsightGate.demoPromise}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link
                    to={addMarketToPath(`/checkout/${resetPlan.checkoutSlug}?source=private_insight_gate`, market)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-indigo-200"
                  >
                    Unlock {report.privateInsightGate.primaryUnlock}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={privateDemoPath}
                    className="inline-flex items-center justify-center rounded-xl border border-indigo-300/30 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-indigo-100 transition hover:border-indigo-200/50 hover:bg-indigo-300/[0.08]"
                  >
                    Open Private Demo Gate
                  </Link>
                </div>
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
              <Link
                to={addMarketToPath(`/checkout/${resetPlan.checkoutSlug}`, market)}
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-indigo-200"
              >
                {resetPlan.ctaLabel}
              </Link>
              <Link
                to={addMarketToPath(`/checkout/${auditPlan.checkoutSlug}`, market)}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black"
              >
                {auditPlan.ctaLabel}
              </Link>
              <Link
                to={privateDemoPath}
                className="inline-flex items-center justify-center rounded-xl border border-indigo-300/30 bg-indigo-300/[0.08] px-4 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-indigo-100 transition hover:border-indigo-200/50"
              >
                Private Demo Access
              </Link>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
