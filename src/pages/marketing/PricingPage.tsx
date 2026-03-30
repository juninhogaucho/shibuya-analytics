import { Check } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PRICING } from '../../lib/constants'
import { enterSampleMode } from '../../lib/runtime'

function PlanCard({
  name,
  price,
  description,
  perks,
  ctaLabel,
  ctaHref,
  featured = false,
}: {
  name: string
  price: number
  description: string
  perks: string[]
  ctaLabel: string
  ctaHref: string
  featured?: boolean
}) {
  return (
    <article
      className={`rounded-3xl border p-8 md:p-10 backdrop-blur-md ${
        featured
          ? 'border-indigo-500/30 bg-[#0A0A0B]/90 shadow-2xl shadow-indigo-900/20'
          : 'border-white/[0.06] bg-[#0A0A0B]/80'
      }`}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-medium text-white">{name}</h3>
          {featured && (
            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Popular
            </span>
          )}
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-mono text-5xl font-bold tracking-tight text-white">EUR {price}</span>
          <span className="text-sm text-neutral-500">one-time</span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-neutral-400">{description}</p>
      </div>

      <div className="mb-10 space-y-4">
        {perks.map((perk) => (
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
          featured
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : 'border border-white/10 text-white hover:border-transparent hover:bg-white hover:text-black'
        }`}
      >
        {ctaLabel}
      </Link>
    </article>
  )
}

export default function PricingPage() {
  const navigate = useNavigate()

  const handleSampleWorkspace = () => {
    enterSampleMode()
    navigate('/dashboard')
  }

  return (
    <section className="min-h-screen overflow-hidden bg-[#020203] pb-20 pt-32">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2940&auto=format&fit=crop"
          alt="Metallic texture"
          className="h-full w-full object-cover opacity-[0.07] mix-blend-color-dodge"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020203] via-transparent to-[#020203]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-indigo-400">
            Choose Your Starting Point
          </span>
          <h1 className="mb-6 text-4xl font-bold uppercase tracking-tight text-white md:text-6xl">
            Shibuya Is Live In Two Truthful Ways
          </h1>
          <p className="font-serif text-xl italic text-neutral-400">
            Start with a one-time diagnostic, or activate the trader workspace you already bought. Sample exploration is available now.
          </p>
        </div>

        <div className="mx-auto mb-12 grid max-w-5xl gap-8 md:grid-cols-2">
          <PlanCard
            name={PRICING.basic.name}
            price={PRICING.basic.price}
            description={PRICING.basic.description}
            perks={PRICING.basic.perks}
            ctaLabel="Get Reality Check"
            ctaHref="/checkout/basic"
          />
          <PlanCard
            name={PRICING.premium.name}
            price={PRICING.premium.price}
            description={PRICING.premium.description}
            perks={PRICING.premium.perks}
            ctaLabel="Start Deep Dive"
            ctaHref="/checkout/premium"
            featured
          />
        </div>

        <section className="mx-auto mb-20 max-w-5xl rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#0f0d08]/90 to-[#0A0A0B]/90 p-8 shadow-2xl shadow-amber-900/10 backdrop-blur-md md:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Trader Workspace
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white">Sample now. Live after activation.</h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                The workspace is real today. You can explore the sample workspace immediately. Live trader accounts activate with a valid order code or partner-issued access.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  'Sample workspace teaches the workflow without pretending to persist live data.',
                  'Live trader accounts persist uploads, history, alerts, edge analysis, and prescriptions.',
                  'Partner and prop-distributed access uses the same activation path as direct traders.',
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
              <p className="mb-3 text-sm font-semibold text-white">What you can do right now</p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSampleWorkspace}
                  className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
                >
                  Open Sample Workspace
                </button>
                <Link
                  to="/activate"
                  className="block w-full rounded-xl bg-amber-500 px-4 py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-amber-400"
                >
                  Activate Live Trader Account
                </Link>
                <Link
                  to="/login"
                  className="block w-full rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-white/20"
                >
                  Sign In
                </Link>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-neutral-500">
                If you have already purchased access, use the activation route with your order code. If you are evaluating Shibuya, use the sample workspace first.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl border-t border-white/10 pt-16">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-2xl font-bold uppercase text-white">Truthful Buying Path</h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-400">
              The product should not force traders to guess what is live, what is sample, or what happens after payment.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                step: '1',
                title: 'Explore',
                body: 'Open the sample workspace and understand the product without fake persistence.',
              },
              {
                step: '2',
                title: 'Choose',
                body: 'Buy a report or receive partner-issued access if your prop or broker supports Shibuya.',
              },
              {
                step: '3',
                title: 'Activate',
                body: 'Use your email and order code to unlock the live trader account.',
              },
              {
                step: '4',
                title: 'Improve',
                body: 'Upload trades, inspect the deltas, and act on the next session instead of reading static reports.',
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
