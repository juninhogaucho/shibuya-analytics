import { ArrowRight, LockKeyhole, Route, ShieldCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { PublicJourneySpine } from '../../components/landing/PublicJourneySpine'
import { hasPrivateDemoGateConfigured } from '../../lib/privateDemoAccess'
import { resolveMarket } from '../../lib/market'
import { buildIfxDemoJourneyPaths } from '../../lib/ifxDemoJourney'

export function DemoLauncherPage() {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const privateGateReady = hasPrivateDemoGateConfigured()
  const {
    storyPath,
    uploadPath,
    reportPath,
    lockedInsightPath,
    privateDemoPath,
    appendProofPath,
    activationPath,
  } = buildIfxDemoJourneyPaths(market)
  const primaryRoute = [
    {
      label: 'Start',
      title: 'Story first',
      body: 'Open with recognition: state problem, Marco mirror, Edge Decay pain, proof boundary.',
      href: storyPath,
      cta: 'Run Story',
    },
    {
      label: 'Prove',
      title: 'Generate upload packet',
      body: 'Use guided upload to create the local sample report packet instead of relying on URL context only.',
      href: uploadPath,
      cta: 'Generate Packet',
    },
    {
      label: 'Name',
      title: 'Show locked question',
      body: 'Continue into the private insight so the viewer sees the question live Reset Pro must prove.',
      href: lockedInsightPath,
      cta: 'Show Question',
    },
    {
      label: 'Demo',
      title: 'Unlock Reset Pro',
      body: 'Use the founder gate to show the sample operating loop, then close on append proof.',
      href: privateDemoPath,
      cta: 'Open Gate',
    },
    {
      label: 'Close',
      title: 'Append proof close',
      body: 'End at the parser and append receipt so the viewer sees where live evidence has to begin.',
      href: appendProofPath,
      cta: 'Close Demo',
    },
  ] as const
  const demoStops = [
    {
      label: '01',
      title: 'Public StoryExperience',
      body: 'Open the public mirror. Use this when there is time to let the trader recognize the state problem before upload.',
      href: storyPath,
      cta: 'Open Story',
    },
    {
      label: '02',
      title: 'Guided Upload',
      body: 'Marco / Edge Decay context is already attached. Best demo action: click Generate Guided Sample Report.',
      href: uploadPath,
      cta: 'Open Upload',
    },
    {
      label: '03',
      title: 'Free Report Fallback',
      body: 'Direct report link for rushed demos. It is weaker than upload-generated evidence and says so.',
      href: reportPath,
      cta: 'Open Report',
    },
    {
      label: '04',
      title: 'Locked Private Insight',
      body: 'Shows the private question without revealing an answer or claiming account-specific proof.',
      href: lockedInsightPath,
      cta: 'Open Insight',
    },
    {
      label: '05',
      title: 'Private Reset Pro Gate',
      body: 'Founder-controlled sample workspace. The code opens demo structure only, not live analytics.',
      href: privateDemoPath,
      cta: 'Open Gate',
    },
    {
      label: '06',
      title: 'Append Proof Close',
      body: 'Final sample-demo endpoint. Show parse, confirm, and the receipt that says live proof is still locked.',
      href: appendProofPath,
      cta: 'Open Append',
    },
    {
      label: '07',
      title: 'Activation Proof Boundary',
      body: 'Payment/activation context route for showing what live still has to prove after checkout.',
      href: activationPath,
      cta: 'Open Activation',
    },
  ] as const

  return (
    <section className="min-h-screen overflow-x-hidden bg-[#030304] px-4 pb-20 pt-14 text-white sm:px-6 md:px-12">
      <div className="mx-0 w-full max-w-[22.25rem] min-w-0 sm:mx-auto sm:max-w-7xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-cyan-300">
              IFX Demo Launcher
            </p>
            <h1 className="break-words font-display text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">
              One controlled path from story to append-proof close.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-300">
              This launcher is the operator surface for fast live demos. It keeps Shibuya in the right order:
              public recognition, upload/report evidence, locked private question, Reset Pro sample workspace, then append-proof close.
            </p>
          </div>
          <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
            <div className="flex items-start gap-3">
              <Route className="mt-1 h-5 w-5 shrink-0 text-cyan-200" />
              <div>
                <h2 className="text-xl font-semibold text-white">Presenter rule</h2>
                <p className="mt-3 text-sm leading-7 text-cyan-50/75">
                  Do not browse randomly. Open the story if time allows; otherwise start at guided upload, show the locked
                  question, then unlock Reset Pro and close on append proof.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <PublicJourneySpine
            activeStage="story"
            detail="The launcher preserves the public StoryExperience first, then upload/report, locked insight, private demo, append-proof close, and separate activation proof boundary."
          />
        </div>

        <section className="mb-8 rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.055] p-5 md:p-8">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200">
                DEMO LAUNCH PACKET
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Marco / Edge Decay / global-ready storyline.</h2>
              <p className="mt-4 text-sm leading-7 text-emerald-50/75">
                The links below carry the same public context through every surface. That makes the demo coherent while
                still marking URL-only fallbacks as weaker than upload-generated packets.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-100">Private gate</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {privateGateReady ? 'Configured for this build' : 'Disabled until demo code is configured'}
                </p>
                <p className="mt-2 text-xs leading-5 text-emerald-50/60">
                  Secret values are never printed on the page or in readiness output.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-100">Live backend</p>
                <p className="mt-2 text-sm font-semibold text-white">Still a separate proof requirement</p>
                <p className="mt-2 text-xs leading-5 text-emerald-50/60">
                  This launcher can demo frontend flow. Live upload/payment proof still depends on backend environment.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[2rem] border border-indigo-300/20 bg-indigo-300/[0.055] p-5 md:p-8">
          <div className="mb-6 grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-200">
                PRIMARY IFX ROUTE
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Story first. Shortcuts are fallback only.</h2>
            </div>
            <p className="text-sm leading-7 text-indigo-50/75">
              Use this row when you are presenting. It keeps the product thesis intact: public recognition earns upload,
              upload creates the packet, locked insight names the question, Reset Pro demonstrates the operating loop, and append proof closes the demo.
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-5">
            {primaryRoute.map((step, index) => (
              <article key={step.label} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-100">
                  {index + 1}. {step.label}
                </p>
                <h3 className="mt-2 text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-indigo-50/70">{step.body}</p>
                <Link
                  to={step.href}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-center text-xs font-black uppercase tracking-[0.13em] text-black transition hover:bg-indigo-100"
                >
                  {step.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-indigo-50/60">
            Fallback rule: direct report, direct insight, and activation links are recovery routes. They are useful for speed,
            but they are weaker proof than the story-to-upload packet path and must be described that way.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {demoStops.map((stop) => (
            <article key={stop.label} className="rounded-[1.75rem] border border-white/10 bg-[#09090B] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200">Stop {stop.label}</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{stop.title}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-400">{stop.body}</p>
              <Link
                to={stop.href}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-100"
              >
                {stop.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border border-amber-500/20 bg-amber-500/[0.055] p-5 md:p-8">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-200">
                Truth boundary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">The launcher is not live proof.</h2>
              <p className="mt-4 text-sm leading-7 text-amber-50/80">
                It proves the demo path is coherent and guarded. It does not prove Stripe mode, backend normalization,
                generated account artifacts, durable append history, or trader-specific conclusions.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  'Public story can create recognition.',
                  'Upload/report can create a local preview packet.',
                  'Private workspace can show sample operating structure only.',
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-amber-50/80">
                    <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-amber-200" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
