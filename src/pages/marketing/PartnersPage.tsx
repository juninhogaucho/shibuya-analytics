import { ArrowRight, BarChart3, Handshake, LineChart, ShieldCheck, Split, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PartnersPage() {
  const audiences = [
    {
      title: 'Prop firms',
      body: 'Find the traders whose edge is real, whose behavior is expensive, and whose next account should be treated differently.',
    },
    {
      title: 'Brokers',
      body: 'Turn trading history into retention, education, and account-development signals without pretending every trader has the same problem.',
    },
    {
      title: 'Tech providers',
      body: 'Keep your platform stack. Add Shibuya as the intelligence layer that explains what the trader is actually doing inside it.',
    },
  ]

  const tvaItems = [
    'Incremental conversion or attach rate after a Shibuya-assisted flow.',
    'Renewal, retention, or reactivation lift in eligible trader cohorts.',
    'Reduced preventable abuse, support load, or review burden.',
    'Verified add-on revenue tied to Shibuya reports, coaching, or workspace access.',
  ]

  const dealModels = [
    {
      title: 'Base distribution',
      eyebrow: 'Fastest path',
      body: 'A clean account, challenge, funded-account, or trader-month fee. Best when the partner already has reach and wants Shibuya as a resellable intelligence layer.',
    },
    {
      title: 'Partner-subsidized pilot',
      eyebrow: 'Lower upfront',
      body: 'Reduced setup economics only when the partner provides usable data, a defined cohort, decision-maker access, and a real distribution commitment.',
    },
    {
      title: 'TVA success share',
      eyebrow: 'Measured upside',
      body: 'A 10-25% share of verified annualized value added can sit above the base deal, but only after the baseline, floor, attribution window, and exclusions are agreed.',
    },
  ]

  return (
    <div className="bg-[#050505] text-white">
      <section className="mx-auto grid min-h-[82vh] max-w-7xl items-center gap-12 px-6 py-28 md:grid-cols-[1.05fr_0.95fr] md:py-36">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-indigo-300">Shibuya for firms</p>
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.95] tracking-[-0.06em] text-white md:text-7xl">
            Not another prop-tech shell.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-300 md:text-xl">
            Shibuya is the trader-intelligence layer for firms that already own distribution: prop firms, brokers,
            financial platforms, trading communities, and tech providers that need to understand how traders actually trade.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:support@shibuya-analytics.com?subject=Shibuya%20B2B%20distribution"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-indigo-200"
            >
              Open partner discussion
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/story"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-white/30 hover:bg-white/5"
            >
              See trader story
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="rounded-[1.5rem] border border-indigo-400/20 bg-indigo-500/10 p-6">
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Positioning</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">Sell the platform. Retain the intelligence.</h2>
              </div>
              <Split className="h-8 w-8 shrink-0 text-indigo-200" />
            </div>
            <div className="grid gap-3">
              {[
                'Decrypt / PropOS-style tooling can be sold, licensed, or partnered into existing tech-provider distribution.',
                'Shibuya remains the retained behavior, analytics, and math-driven trader truth layer.',
                'Partners distribute Shibuya across accounts; Shibuya measures edge, behavior, retention, and intervention quality.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-neutral-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {audiences.map((audience) => (
            <article key={audience.title} className="rounded-[1.5rem] border border-white/10 bg-[#0A0A0B] p-6">
              <Target className="mb-5 h-6 w-6 text-indigo-300" />
              <h3 className="text-xl font-bold text-white">{audience.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">{audience.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">Commercial model</p>
            <h2 className="text-4xl font-black uppercase tracking-[-0.04em] text-white md:text-5xl">
              Simple base fee. Optional proved-uplift share.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-neutral-400">
              The baseline model is clean: roughly USD 10-15 per active account, funded account, challenge,
              or trader-month depending on scope. The upside model only activates when the baseline and attribution method are agreed before launch.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              {dealModels.map((model) => (
                <article key={model.title} className="rounded-[1.25rem] border border-white/10 bg-[#0A0A0B] p-5">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-indigo-300">{model.eyebrow}</p>
                  <h3 className="mt-3 text-base font-bold text-white">{model.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-neutral-400">{model.body}</p>
                </article>
              ))}
            </div>
            <article className="rounded-[1.5rem] border border-white/10 bg-[#0A0A0B] p-6">
              <div className="mb-4 flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-emerald-300" />
                <h3 className="text-lg font-bold text-white">TVA: total value added</h3>
              </div>
              <p className="text-sm leading-relaxed text-neutral-400">
                TVA is annualized value created: measurable revenue lift, retention lift, cost reduction, risk reduction,
                or operating load removed. Shibuya should not claim TVA unless the firm agrees the baseline, eligible cohort,
                attribution window, and exclusion rules first.
              </p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-neutral-300">
                <strong className="text-white">Contract rule:</strong> partner revenue share pays for distribution.
                TVA share pays only for verified incremental value above an agreed floor.
              </div>
            </article>
            <article className="rounded-[1.5rem] border border-white/10 bg-[#0A0A0B] p-6">
              <div className="mb-4 flex items-center gap-3">
                <LineChart className="h-5 w-5 text-indigo-300" />
                <h3 className="text-lg font-bold text-white">What can count</h3>
              </div>
              <ul className="grid gap-3 text-sm leading-relaxed text-neutral-400">
                {tvaItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-[#0A0A0B] p-8">
            <ShieldCheck className="mb-6 h-7 w-7 text-emerald-300" />
            <h2 className="text-3xl font-black uppercase tracking-[-0.04em] text-white">Truth boundaries</h2>
            <p className="mt-5 text-sm leading-relaxed text-neutral-400">
              We do not sell "AI magic" or pretend Shibuya has already proven partner uplift before live evidence exists.
              The product is designed to measure trader behavior, isolate expensive patterns, and turn the result into
              account-level action. Proof comes from data, not demos.
            </p>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-[#0A0A0B] p-8">
            <Handshake className="mb-6 h-7 w-7 text-indigo-300" />
            <h2 className="text-3xl font-black uppercase tracking-[-0.04em] text-white">Partner path</h2>
            <p className="mt-5 text-sm leading-relaxed text-neutral-400">
              A distribution partner can offer Shibuya across its prop-firm, broker, or platform relationships.
              The partner owns reach and implementation leverage. Shibuya owns the retained trader-intelligence layer.
              The cleanest deal aligns base account economics with optional TVA share.
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
