import { type FormEvent, useMemo, useState } from 'react'
import { ArrowRight, FileUp, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { addMarketToPath, resolveMarket } from '../../lib/market'
import {
  buildPublicReportSession,
  persistPublicReportSession,
  validatePublicReportInput,
} from '../../lib/publicReportSession'
import {
  FINGERPRINT_AXES,
  TRADER_ARCHETYPES,
  getFingerprintAxis,
  getTraderArchetype,
  type FingerprintAxisId,
  type StoryArchetypeId,
} from '../../lib/storyExperience'

export default function PublicUploadPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const market = resolveMarket(location.pathname, location.search)
  const params = new URLSearchParams(location.search)
  const initialArchetype = getTraderArchetype(params.get('archetype'))
  const initialAxis = getFingerprintAxis(params.get('axis'))
  const storySource = params.get('story')
  const selectedPainAxisIds = (params.get('pain_axes') ?? '').split(',').filter(Boolean)
  const visitedSceneCount = Number(params.get('scene_count') ?? 0)
  const [archetypeId, setArchetypeId] = useState<StoryArchetypeId>(initialArchetype.id)
  const [axisId, setAxisId] = useState<FingerprintAxisId>(initialAxis.id)
  const [fileName, setFileName] = useState('')
  const [pasteBody, setPasteBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const archetype = useMemo(() => getTraderArchetype(archetypeId), [archetypeId])
  const axis = useMemo(() => getFingerprintAxis(axisId), [axisId])
  const selectedPainAxes = useMemo(
    () => selectedPainAxisIds
      .map((candidate) => getFingerprintAxis(candidate))
      .filter((candidate, index, axes) => candidate.id === selectedPainAxisIds[index] && axes.findIndex((axisCandidate) => axisCandidate.id === candidate.id) === index),
    [selectedPainAxisIds],
  )
  const hasStoryHandoff = storySource === 'guided' || visitedSceneCount > 0 || selectedPainAxes.length > 0

  const reportSearch = `?market=${market}&archetype=${archetype.id}&axis=${axis.id}`

  const generateReport = (source: 'upload' | 'sample') => {
    const reportId = source === 'sample' ? 'sample-behavioral-leak-report' : `free-report-${Date.now()}`
    const validationError = validatePublicReportInput({
      fileName,
      pasteBody,
      source,
    })

    if (validationError) {
      setError(validationError)
      return
    }

    persistPublicReportSession(buildPublicReportSession({
      reportId,
      market,
      archetypeId: archetype.id,
      axisId: axis.id,
      fileName,
      pasteBody,
      source,
      storySource,
      selectedPainAxisIds,
      visitedSceneCount,
    }))

    navigate(`/report/${reportId}${reportSearch}`)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    generateReport('upload')
  }

  return (
    <section className="min-h-screen bg-[#030304] px-6 pb-20 pt-14 text-white md:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-indigo-300">Upload Moment</p>
          <h1 className="font-display text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">
            Upload your trade history. See what the fingerprint gets right.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-300">
            The story page built a provisional mirror. This step is where Shibuya asks for evidence. In this public demo,
            no file is sent to a production engine; the page shows the exact validation and report transition the live path must own.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-neutral-300">
            {[
              'Supported first: CSV/export, statement paste, broker-cleaned table.',
              'Validation must be specific and fixable, never a generic upload failed.',
              'The report preview describes state. It does not tell anyone what to buy or sell.',
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-[#09090B] p-5 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">Provisional signal</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Confirm or reject the page prediction.</h2>
              </div>
              <div className="rounded-2xl border border-indigo-300/20 bg-indigo-300/[0.08] p-3 text-indigo-100">
                <FileUp className="h-5 w-5" />
              </div>
            </div>

            {hasStoryHandoff ? (
              <div className="mb-6 rounded-3xl border border-indigo-300/20 bg-indigo-300/[0.06] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-200">Story handoff packet</p>
                <h3 className="mt-2 text-lg font-semibold text-white">The public story context is attached before upload.</h3>
                <p className="mt-3 text-sm leading-6 text-indigo-50/75">
                  This packet explains why the upload form opened with a specific archetype and pain axis. It remains provisional until trade history confirms it.
                </p>
                <div className="mt-4 grid gap-3 text-sm text-neutral-300 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Source</span>
                    <span className="mt-1 block text-white">{storySource === 'guided' ? 'Guided StoryExperience route' : 'Direct upload route'}</span>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Scenes before upload</span>
                    <span className="mt-1 block text-white">{Number.isFinite(visitedSceneCount) ? visitedSceneCount : 0}</span>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Selected public pain</span>
                    <span className="mt-1 block text-white">
                      {selectedPainAxes.length ? selectedPainAxes.map((candidate) => candidate.label).join(', ') : 'None captured'}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Current upload hypothesis</span>
                    <span className="mt-1 block text-white">{archetype.name} / {axis.label}</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Closest archetype</span>
                <select
                  value={archetypeId}
                  onChange={(event) => setArchetypeId(getTraderArchetype(event.target.value).id)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/50"
                >
                  {TRADER_ARCHETYPES.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>{candidate.name}: {candidate.title}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Dominant pain</span>
                <select
                  value={axisId}
                  onChange={(event) => setAxisId(getFingerprintAxis(event.target.value).id)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300/50"
                >
                  {FINGERPRINT_AXES.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>{candidate.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-5 block rounded-3xl border border-dashed border-white/14 bg-white/[0.025] p-5">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Trade file</span>
              <input
                type="file"
                accept=".csv,.txt,.xlsx"
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
                className="block w-full text-sm text-neutral-300 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
              />
              <span className="mt-3 block text-xs text-neutral-500">
                {fileName ? `Selected: ${fileName}` : 'CSV, TXT, and spreadsheet exports are accepted in the public preview surface.'}
              </span>
            </label>

            <label className="mt-5 block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Or paste a small trade sample</span>
              <textarea
                value={pasteBody}
                onChange={(event) => setPasteBody(event.target.value)}
                rows={6}
                placeholder="Example: date, symbol, side, size, entry, exit, pnl..."
                className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-neutral-600 focus:border-indigo-300/50"
              />
            </label>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-500/25 bg-rose-500/[0.08] p-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-indigo-200"
              >
                Generate Free Report
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => generateReport('sample')}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black"
              >
                Use Sample History
              </button>
            </div>
          </form>

          <div className="rounded-[2rem] border border-amber-500/20 bg-amber-500/[0.05] p-5 text-sm leading-7 text-amber-100/90 md:p-6">
            <strong className="text-amber-100">Boundary:</strong> this public preview is designed to prove the journey.
            The production report must come from normalized trade history and backend-generated artifacts before we claim account-specific analytics.
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link to={addMarketToPath('/pricing', market)} className="text-neutral-400 underline-offset-4 transition hover:text-white hover:underline">
              Skip to paid ladder
            </Link>
            <Link to="/" className="text-neutral-400 underline-offset-4 transition hover:text-white hover:underline">
              Back to story
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
