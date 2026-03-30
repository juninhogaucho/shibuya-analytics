import { motion } from 'motion/react'

const partnerTracks = [
  {
    name: 'Supported By Shibuya',
    price: 'Pilot-first',
    summary: 'Low-friction compatibility for technology providers that want a real wedge before a deeper commercial commitment.',
    bullets: [
      'Safe ingestion path or export format',
      'Compatibility positioning and co-marketing',
      'Fastest route to proving demand from your installed base',
    ],
  },
  {
    name: 'Embedded Trader Intelligence',
    price: 'Revenue share or wholesale',
    summary: 'Trader-facing Shibuya sold through your platform so your firms can offer a differentiated performance layer without replatforming first.',
    bullets: [
      'Co-sold or embedded trader activation',
      'Portable performance workspace for your customers',
      'New sell-through revenue for your platform',
    ],
  },
  {
    name: 'Operator Intelligence',
    price: 'Platform license',
    summary: 'Risk, behavior, and intervention intelligence for the firms already running on your stack.',
    bullets: [
      'Operator-side cohort and account intelligence',
      'Abuse, drift, and intervention support',
      'Second enterprise wedge beyond trader analytics',
    ],
  },
]

const whyProvidersBuy = [
  {
    title: 'Differentiate the installed base',
    body: 'Your firms can add a serious intelligence layer without waiting for a full platform rewrite or migration.',
  },
  {
    title: 'Create sell-through revenue',
    body: 'Shibuya is something your platform can resell, bundle, or embed instead of leaving that value on the table.',
  },
  {
    title: 'Increase trader retention',
    body: 'Firms with better feedback loops are better positioned to keep serious traders engaged longer.',
  },
  {
    title: 'Open a stronger enterprise story',
    body: 'The same engine that helps traders can later power operator-side risk and behavior intelligence.',
  },
]

const commercialModels = [
  {
    title: 'Non-exclusive pilot',
    body: 'Start with one usable data path and one real cohort. Prove demand before asking anyone to bet the stack.',
  },
  {
    title: 'Revenue-share distribution',
    body: 'Your platform sells or bundles Shibuya and participates in the revenue without building the intelligence layer itself.',
  },
  {
    title: 'Wholesale or platform license',
    body: 'If your customers want a native-feeling add-on, we support wholesale or licensed operator models after the pilot works.',
  },
]

const fitCriteria = [
  'You power multiple firms or a meaningful book of traders already.',
  'You can expose a usable export, API, webhook, or platform connector.',
  'You want new revenue and stickier customers without forcing a platform migration first.',
]

const noFitCriteria = [
  'You want exclusivity before there is any proof.',
  'You want partner-grade intelligence while refusing usable data access.',
  'You want free custom work without distribution, pilot cohort, or commercial ownership on your side.',
]

export function PartnersPage() {
  return (
    <div className="min-h-screen bg-[#020204] text-white">
      <section className="relative overflow-hidden border-b border-white/5 bg-grid-pattern py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/50 to-[#020204]" />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              For Technology Providers
            </p>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
              Sell Shibuya Into Your Installed Base Without Replatforming First
            </h1>
            <p className="max-w-3xl text-xl leading-relaxed text-gray-400">
              Shibuya is a trader-performance and operator-intelligence layer for prop-tech vendors, brokers,
              and white-label platforms. Your customers keep your infrastructure. You add new sell-through value.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-500">
              We still sell Shibuya and PropOS directly to props and brokers. This page exists for technology providers
              that want to resell or embed Shibuya inside their own offer.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="mailto:support@shibuya-analytics.com?subject=Shibuya%20Partner%20Inquiry"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
              >
                Request Partner Conversation
              </a>
              <a
                href="#commercial-model"
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
              >
                Review Commercial Model
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 rounded-3xl border border-white/10 bg-[#0A0A0F] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Channel Rule</p>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-300">
              This does not replace our direct B2B motion. We still sell full PropOS and direct Shibuya deployments to
              props and brokers. Technology providers are an additional sell-through channel for Shibuya, and an optional
              path into PropOS when one of their customers wants the full stack.
            </p>
          </div>
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Offer Ladder</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">One wedge, three levels of commercial depth</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {partnerTracks.map((track, index) => (
              <motion.article
                key={track.name}
                className="rounded-3xl border border-white/10 bg-[#0A0A0F] p-8"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">{track.price}</p>
                  <h3 className="mt-3 text-2xl font-bold text-white">{track.name}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-gray-400">{track.summary}</p>
                </div>
                <ul className="space-y-3 border-t border-white/5 pt-6">
                  {track.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="mt-0.5 text-emerald-400">+</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050508] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Why This Works</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">The provider wins when its customers get more value without changing stacks</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {whyProvidersBuy.map((item, index) => (
              <motion.article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-[#0A0A0F] p-6"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Provider value {index + 1}</div>
                <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{item.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="commercial-model" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Commercial Model</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">Start with a pilot, then choose the model that fits your distribution</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {commercialModels.map((item, index) => (
              <motion.article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-[#0A0A0F] p-6"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Model {index + 1}</div>
                <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{item.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050508] py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2">
          <article className="rounded-3xl border border-green-500/10 bg-green-500/5 p-8">
            <h3 className="mb-6 text-xl font-bold text-green-400">Right fit</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              {fitCriteria.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 text-green-400">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-red-500/10 bg-red-500/5 p-8">
            <h3 className="mb-6 text-xl font-bold text-red-400">Wrong fit</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              {noFitCriteria.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 text-red-400">x</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Partner Thesis</p>
          <h2 className="mb-6 text-3xl font-bold text-white">Do not force firms to choose between their stack and better intelligence</h2>
          <p className="mb-8 text-gray-400">
            The right first sale is not platform replacement. It is a distribution-friendly intelligence layer that
            your customers can adopt first, and your platform can monetize immediately.
          </p>
          <a
            href="mailto:support@shibuya-analytics.com?subject=Shibuya%20Partner%20Pilot"
            className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
          >
            Start A Partner Pilot
          </a>
        </div>
      </section>
    </div>
  )
}
