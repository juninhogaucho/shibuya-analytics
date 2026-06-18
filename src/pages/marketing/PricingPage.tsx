import { useEffect } from 'react'
import { Check } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { trackAffiliateClick } from '../../lib/api/checkout'
import {
  captureAffiliateAttributionFromLocation,
  getPreferredAffiliateCode,
  markAffiliateClickTracked,
  wasAffiliateClickTracked,
} from '../../lib/affiliateAttribution'
import { appendCheckoutIntentToPath, readCheckoutIntent } from '../../lib/checkoutIntent'
import { addMarketToPath, formatPrice, getPlansForType, persistMarket, resolveMarket, type PricingPlan } from '../../lib/market'

function getPlanFit(plan: PricingPlan): { bestFor: string; outcome: string } {
  switch (plan.id) {
    case 'audit_monthly':
      return {
        bestFor: 'Best for traders who need the software loop alive every month without guided founder intervention.',
        outcome: 'Walk away with a live control system that keeps standards, uploads, reports, and next-session mandates visible across sessions.',
      }
    case 'reset_monthly':
      return {
        bestFor: 'Best for traders who already know the leak is process-driven and want the first real upload reviewed inside the monthly loop.',
        outcome: 'Walk away with continuity, deeper corrective surfaces, append proof, and a guided checkpoint after evidence exists.',
      }
    case 'audit_once':
      return {
        bestFor: 'Best for traders who want the fastest honest answer before committing to continuity.',
        outcome: 'Walk away with a baseline report, one live reset window, and a clear answer to whether the main problem is edge, behavior, or both.',
      }
    case 'reset_once':
      return {
        bestFor: 'Best for legacy reset customers who need a harder bounded intervention and guided founder review inside the reset window.',
        outcome: 'Walk away with the premium reset report, guided kickoff review, and up to three uploads to compare whether the process is actually tightening.',
      }
    default:
      return {
        bestFor: 'Best for traders who want a tighter operating process.',
        outcome: 'Walk away with a clearer next-session mandate and a better read on what is costing the account.',
      }
  }
}

function PlanCard({
  plan,
  ctaHref,
  ctaLabel,
}: {
  plan: PricingPlan
  ctaHref: string
  ctaLabel?: string
}) {
  const cadenceLabel = plan.type === 'subscription' ? 'per month' : 'one time'
  const fit = getPlanFit(plan)

  return (
    <article
      className={`rounded-3xl border p-8 md:p-10 backdrop-blur-md ${
        plan.featured
          ? 'border-indigo-500/30 bg-[#0A0A0B]/90 shadow-2xl shadow-indigo-900/20'
          : 'border-white/[0.06] bg-[#0A0A0B]/80'
      }`}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-medium text-white">{plan.name}</h3>
          {plan.featured && (
            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Popular
            </span>
          )}
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-mono text-5xl font-bold tracking-tight text-white">{formatPrice(plan)}</span>
          <span className="text-sm text-neutral-500">{cadenceLabel}</span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-neutral-400">{plan.description}</p>
        <div className="mt-4 rounded-2xl border border-white/6 bg-black/20 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Best For</p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">{fit.bestFor}</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">What You Walk Away With</p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">{fit.outcome}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {plan.accessWindowDays ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-300">
              {plan.accessWindowDays}-day live window
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-300">
              Continuous live access
            </span>
          )}
          {plan.uploadLimit != null ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-300">
              {plan.uploadLimit} upload{plan.uploadLimit !== 1 ? 's' : ''} included
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-300">
              Unlimited uploads
            </span>
          )}
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-300">
            {plan.guidedReviewIncluded ? 'Guided review included' : 'Self-serve by default'}
          </span>
        </div>
      </div>

      <div className="mb-10 space-y-4">
        {plan.perks.map((perk) => (
          <div key={perk} className="flex items-start gap-3 text-sm text-neutral-300">
            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
              <Check className="h-2.5 w-2.5 text-indigo-300" />
            </div>
            <span>{perk}</span>
          </div>
        ))}
      </div>

      <Link
        to={ctaHref}
        className={`block w-full rounded-xl py-4 text-center text-sm font-semibold transition-colors ${
          plan.featured
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : 'border border-white/10 text-white hover:border-transparent hover:bg-white hover:text-black'
        }`}
      >
        {ctaLabel ?? plan.ctaLabel}
      </Link>
    </article>
  )
}

export default function PricingPage() {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const checkoutIntent = readCheckoutIntent(location.search)
  const hasLockedInsightIntent = checkoutIntent?.source === 'locked_insight'
  const reportFirstHref = addMarketToPath('/upload', market)
  const privateDemoHref = hasLockedInsightIntent
    ? addMarketToPath(appendCheckoutIntentToPath('/private-demo', checkoutIntent), market)
    : reportFirstHref
  const privateDemoLabel = hasLockedInsightIntent
    ? 'Continue Private Demo Gate'
    : 'Generate Free Report First'
  const planCtaLabel = hasLockedInsightIntent ? undefined : 'Generate Free Report First'
  const monthlyPlans = getPlansForType(market, 'subscription')

  useEffect(() => {
    persistMarket(market)
    const attribution = captureAffiliateAttributionFromLocation(location.pathname, location.search)
    const affiliateCode = getPreferredAffiliateCode(attribution)

    if (!affiliateCode || wasAffiliateClickTracked(affiliateCode)) {
      return
    }

    void trackAffiliateClick(affiliateCode)
      .then(() => {
        markAffiliateClickTracked(affiliateCode)
      })
      .catch(() => undefined)
  }, [location.pathname, location.search, market])

  return (
    <section className="min-h-screen overflow-hidden bg-[#020203] pb-20 pt-32">
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2940&auto=format&fit=crop"
          alt="Metallic texture"
          className="h-full w-full object-cover opacity-[0.07] mix-blend-color-dodge"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020203] via-transparent to-[#020203]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-indigo-400">
            {market === 'india' ? 'India Direct Offer Ladder' : 'Direct Trader Offer Ladder'}
          </span>
          <h1 className="mb-6 text-4xl font-bold uppercase tracking-tight text-white md:text-6xl">
            {market === 'india'
              ? 'Choose The Monthly Live Workspace'
              : 'Choose Continuous Live Access'}
          </h1>
          <p className="font-serif text-xl italic text-neutral-400">
            {market === 'india'
              ? 'Psych Audit keeps the self-serve loop alive. Reset Pro adds the first-cycle guided review after a meaningful upload, so the review has evidence to work from.'
              : 'Psych Audit keeps the self-serve loop alive. Reset Pro adds the first-cycle guided review after a meaningful upload, so the review has evidence to work from.'}
          </p>
          <div className="mt-8 rounded-3xl border border-sky-300/20 bg-sky-300/[0.06] p-5 text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sky-200">
              Pricing route integrity
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {hasLockedInsightIntent
                ? 'Checkout unlocks only after locked insight context.'
                : 'Start paid intent from the report, not a cold checkout.'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-sky-50/75">
              {hasLockedInsightIntent
                ? 'This page carries report, archetype, dominant axis, story handoff, and locked module into checkout or the founder demo gate.'
                : 'Generic pricing can explain the ladder, but it should route traders back to upload/report first so paid access starts from an explicit question.'}
            </p>
          </div>
        </div>

        <section className="mb-20">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-300">Continuous Live Access</p>
              <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                Keep the workspace alive month after month.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-400">
                Built for traders who do not want a one-off diagnosis. These tiers keep uploads, history, mandates, and corrective surfaces live while the process is still evolving.
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {monthlyPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                ctaHref={hasLockedInsightIntent
                  ? addMarketToPath(appendCheckoutIntentToPath(`/checkout/${plan.checkoutSlug}`, checkoutIntent), market)
                  : reportFirstHref}
                ctaLabel={planCtaLabel}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto mb-20 max-w-5xl rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#0f0d08]/90 to-[#0A0A0B]/90 p-8 shadow-2xl shadow-amber-900/10 backdrop-blur-md md:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                From Free Report To Live Workspace
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white">Free report to inspect. Live workspace to fix it for real.</h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                The free report shows the behavioral leak without pretending to persist live account state. Paid access unlocks the trader runtime where uploads, history, action boards, briefs, alerts, and prescriptions actually belong.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  'Free report lets you understand the leak before you buy.',
                  'Psych Audit opens the monthly self-serve live loop after activation.',
                  'Reset Pro adds the guided review checkpoint after the first meaningful upload.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-neutral-300">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                      <Check className="h-2.5 w-2.5 text-amber-300" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/30 p-6">
              <p className="mb-3 text-sm font-semibold text-white">Choose your mode right now</p>
              <div className="space-y-3">
                <Link
                  to={addMarketToPath('/upload', market)}
                  className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
                >
                  Generate Free Report
                </Link>
                <Link
                  to={privateDemoHref}
                  className="w-full rounded-xl border border-indigo-300/30 bg-indigo-300/[0.08] px-4 py-3 text-sm font-semibold text-indigo-100 transition-colors hover:border-indigo-200/50 hover:bg-indigo-300/[0.14]"
                >
                  {privateDemoLabel}
                </Link>
                <Link
                  to={addMarketToPath('/activate', market)}
                  className="block w-full rounded-xl bg-amber-500 px-4 py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-amber-400"
                >
                  Activate Live Trader Account
                </Link>
                <Link
                  to={addMarketToPath('/login', market)}
                  className="block w-full rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-white/20"
                >
                  Sign In
                </Link>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-neutral-500">
                If you already paid, activate. If you are still deciding, generate the free report first.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl border-t border-white/10 pt-16">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-2xl font-bold uppercase text-white">How The Paid Loop Actually Works</h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-400">
              No fake demo logic. No conceptual jump after checkout. Just a direct path from payment into the live trader runtime.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                step: '1',
                title: 'Choose',
                body: 'Pick Psych Audit for the self-serve monthly loop or Reset Pro for the monthly loop with first-cycle guided review.',
              },
              {
                step: '2',
                title: 'Activate',
                body: 'Pay, receive the order code, activate the workspace, and create your return password.',
              },
              {
                step: '3',
                title: 'Upload',
                body: 'Bring in your broker or platform export and let Shibuya show what is costing the account.',
              },
              {
                step: '4',
                title: 'Act',
                body: 'Carry the next-session mandate, append the next session, and let Reset Pro review evidence instead of vibes.',
              },
            ].map((item) => (
              <article key={item.step} className="rounded-2xl border border-white/5 bg-[#080809] p-6">
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
