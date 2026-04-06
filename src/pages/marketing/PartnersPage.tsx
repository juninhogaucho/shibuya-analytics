import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DECRYPT_B2B_URL } from '../../lib/market'

export function PartnersPage() {
  useEffect(() => {
    if (DECRYPT_B2B_URL) {
      window.location.replace(DECRYPT_B2B_URL)
    }
  }, [])

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-4xl items-center px-6 py-24">
      <div className="w-full rounded-[2rem] border border-white/10 bg-[#0A0A0B] p-10 text-center shadow-2xl shadow-black/30">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">B2B Handoff</p>
        <h1 className="text-4xl font-bold uppercase tracking-tight text-white md:text-5xl">
          Looking for Shibuya inside a prop, broker, or platform stack?
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400">
          That lives on the Decrypt / PropOS side, not on the direct-trader site. We are taking you to the correct B2B surface.
        </p>
        {DECRYPT_B2B_URL ? (
          <p className="mt-6 text-sm text-neutral-500">Redirecting now...</p>
        ) : (
          <div className="mt-8">
            <p className="mb-6 text-sm text-neutral-500">
              `VITE_DECRYPT_B2B_URL` is not configured in this build yet, so the automatic redirect is unavailable.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-black"
            >
              Back To Shibuya Pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
