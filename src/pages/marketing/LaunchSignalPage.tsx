import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Eye, LockKeyhole, RadioTower, Sparkles } from 'lucide-react'
import { buildIfxDemoJourneyPaths } from '../../lib/ifxDemoJourney'
import { addMarketToPath, resolveMarket } from '../../lib/market'

const ecosystemLanes = [
  {
    title: 'Shibuya',
    label: 'Trader behavior layer',
    body: 'The direct trader loop: diagnose the repeat mistake, expose the discipline tax, and turn the next session into a controlled mandate.',
  },
  {
    title: 'PropOS',
    label: 'Operator layer',
    body: 'The prop-firm operating system: challenge lifecycle, risk work, payouts, trader support, approvals, and the command surface around them.',
  },
  {
    title: 'Decrypt',
    label: 'Ecosystem control plane',
    body: 'The shared runtime for identity, entitlements, app access, tenant context, analytics, proof artifacts, and governance.',
  },
]

const launchPhases = [
  'Open the public story and let the trader recognize the leak before any product pitch.',
  'Generate the sample report path so the locked private question is visible.',
  'Use the presenter gate only for the Reset Pro sample workspace; do not claim live account proof.',
]

export default function LaunchSignalPage() {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)
  const {
    storyPath,
    privateDemoPath,
  } = buildIfxDemoJourneyPaths(market)
  const demoLauncherPath = addMarketToPath('/demo', market)

  return (
    <main className="shibuya-ifx-page relative min-h-screen overflow-hidden bg-[#020204] text-white selection:bg-white selection:text-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(249,115,22,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30 [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-full flex-col px-5 py-8 sm:px-8 lg:max-w-7xl lg:px-10">
        <header className="flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3" aria-label="Shibuya home">
            <img src="/shibuya-logo.svg" alt="" className="h-8 w-auto" />
            <span className="font-display text-sm font-black uppercase tracking-[0.28em] text-white">
              Shibuya
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 md:flex">
            <Link className="transition hover:text-white" to={storyPath}>Story</Link>
            <Link className="transition hover:text-white" to={demoLauncherPath}>Demo path</Link>
            <Link className="transition hover:text-white" to="/solutions">System</Link>
            <Link className="transition hover:text-white" to="/login">Invited Access</Link>
          </nav>
        </header>

        <div className="grid min-w-0 flex-1 items-center gap-12 py-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.72fr)]">
          <div className="min-w-0 max-w-full lg:max-w-4xl">
            <p className="mb-6 max-w-full text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500 sm:text-sm sm:tracking-[0.32em] lg:max-w-xl">
              IFX demo launcher
            </p>

            <h1 className="max-w-full break-words text-4xl font-black leading-[0.96] tracking-[-0.055em] text-white sm:text-7xl sm:tracking-[-0.07em] lg:max-w-5xl lg:text-8xl">
              Start with the trader.
              <span className="block text-neutral-500">Then show the operating loop.</span>
            </h1>

            <p className="mt-8 max-w-full break-words text-base leading-7 text-neutral-300 sm:text-xl sm:leading-8 lg:max-w-2xl">
              Shibuya is the public story experience for trader behavior: recognition, provisional fingerprint,
              upload, sample report, locked private insight, then the Reset Pro workspace behind founder access.
              This IFX link is a truthful demo path, not a live backend proof claim.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to={storyPath}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-neutral-200 sm:w-auto sm:px-6 sm:tracking-[0.18em]"
              >
                Start 3-Minute Story
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                to={privateDemoPath}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.03] px-5 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white transition hover:border-white/30 hover:bg-white/[0.06] sm:w-auto sm:px-6 sm:tracking-[0.18em]"
              >
                Founder Demo Gate
              </Link>
              <Link
                to={demoLauncherPath}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-indigo-300/25 bg-indigo-300/[0.08] px-5 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-indigo-100 transition hover:border-indigo-200/40 hover:bg-indigo-300/[0.12] sm:w-auto sm:px-6 sm:tracking-[0.18em]"
              >
                Operator Launcher
              </Link>
            </div>

            <div className="mt-12 grid gap-4 text-sm text-neutral-400 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <RadioTower className="mt-0.5 h-5 w-5 text-indigo-300" aria-hidden="true" />
                <span>One public link, one clear narrative, no setup required for the viewer.</span>
              </div>
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 text-orange-300" aria-hidden="true" />
                <span>Private workspace stays behind the presenter code and remains sample data only.</span>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="mt-0.5 h-5 w-5 text-emerald-300" aria-hidden="true" />
                <span>The pitch is behavior, proof loops, and trader state instead of another AI signal feed.</span>
              </div>
            </div>
          </div>

          <aside className="min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
            <div className="mb-5 rounded-[1.5rem] border border-indigo-300/20 bg-indigo-300/[0.08] p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-indigo-200" aria-hidden="true" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-100">
                    Show this first
                  </p>
                  <h2 className="mt-3 break-words text-xl font-black tracking-tight text-white sm:text-2xl">
                    Public story / sample report / locked question / founder demo gate.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-300">
                    Use the story link for everyone. Use the presenter gate only when you explicitly want to show
                    the controlled Reset Pro sample workspace.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
                What is coming online
              </p>
              <div className="mt-6 space-y-4">
                {ecosystemLanes.map((lane) => (
                  <article key={lane.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="text-lg font-black tracking-tight text-white">{lane.title}</h2>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                        {lane.label}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-neutral-400">{lane.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
                Presenter path
              </p>
              <ol className="mt-5 space-y-3">
                {launchPhases.map((phase, index) => (
                  <li key={phase} className="flex gap-3 text-sm leading-6 text-neutral-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-black text-white">
                      {index + 1}
                    </span>
                    <span>{phase}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        <footer className="flex flex-col justify-between gap-4 border-t border-white/10 py-6 text-xs uppercase tracking-[0.2em] text-neutral-600 md:flex-row">
          <span>Building in public only where the foundation can hold.</span>
          <span>Shibuya x PropOS x Decrypt</span>
        </footer>
      </section>
    </main>
  )
}
