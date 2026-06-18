import { Link } from 'react-router-dom'
import { ArrowRight, Eye, LockKeyhole, RadioTower } from 'lucide-react'

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
  'Day 1: private signal page and founder conversations.',
  'Day 2: guided Shibuya story, PropOS operator preview, and selected product snippets.',
  'After IFX: invite-first access while the production contracts come online.',
]

export default function LaunchSignalPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020204] text-white selection:bg-white selection:text-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(249,115,22,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30 [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3" aria-label="Shibuya home">
            <img src="/shibuya-logo.svg" alt="" className="h-8 w-auto" />
            <span className="font-display text-sm font-black uppercase tracking-[0.28em] text-white">
              Shibuya
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 md:flex">
            <Link className="transition hover:text-white" to="/story">Story</Link>
            <Link className="transition hover:text-white" to="/solutions">System</Link>
            <Link className="transition hover:text-white" to="/login">Invited Access</Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.72fr)]">
          <div className="max-w-4xl">
            <p className="mb-6 max-w-xl text-sm font-semibold uppercase tracking-[0.32em] text-neutral-500">
              Private build window open for IFX
            </p>

            <h1 className="max-w-5xl text-5xl font-black tracking-[-0.07em] text-white sm:text-7xl lg:text-8xl">
              Hold the line.
              <span className="block text-neutral-500">The trader ecosystem is being assembled.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-300 sm:text-xl">
              We are connecting Shibuya, PropOS, and Decrypt into one operating system for trader behavior,
              prop-firm operations, proof, access, and action. The public surface is intentionally limited while
              the production foundations are locked.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:founders@shibuya.trade?subject=IFX%20preview%20access"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-neutral-200"
              >
                Request IFX Preview
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </a>
              <Link
                to="/story"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.03] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-white/30 hover:bg-white/[0.06]"
              >
                View Current Story
              </Link>
            </div>

            <div className="mt-12 grid gap-4 text-sm text-neutral-400 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <RadioTower className="mt-0.5 h-5 w-5 text-indigo-300" aria-hidden="true" />
                <span>Live signal first, full system only when the contracts are right.</span>
              </div>
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 text-orange-300" aria-hidden="true" />
                <span>Access remains invite-first while identity and entitlement gates are hardened.</span>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="mt-0.5 h-5 w-5 text-emerald-300" aria-hidden="true" />
                <span>No fake numbers, no borrowed proof, no rushed product truth.</span>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
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
                IFX window
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
