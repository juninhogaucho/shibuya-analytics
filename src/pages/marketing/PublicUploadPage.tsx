import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowRight, FileUp, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PublicJourneySpine } from '../../components/landing/PublicJourneySpine'
import { addMarketToPath, getMarketHomePath, resolveMarket } from '../../lib/market'
import {
  generatePublicTeaserReport,
  getPublicTeaserReportReadiness,
  validatePublicTeaserReportReadiness,
  type PublicTeaserReportReadinessResponse,
} from '../../lib/api/publicReport'
import { appendPublicStoryHandoffParams, readPublicStoryHandoff } from '../../lib/publicStoryHandoff'
import { buildLiveProofReadinessContract } from '../../lib/liveProofReadiness'
import {
  appendDemoLauncherSamplePacketParam,
  buildDemoLauncherSampleReportSession,
  buildPublicReportSession,
  hasDemoLauncherSamplePacketRequest,
  persistPublicReportSession,
  validatePublicPasteSample,
  validatePublicReportInput,
  validatePublicTeaserReportResponse,
} from '../../lib/publicReportSession'
import {
  FINGERPRINT_AXES,
  TRADER_ARCHETYPES,
  getFingerprintAxis,
  getPublicStorySignalMarkers,
  getTraderArchetype,
  type FingerprintAxisId,
  type StoryArchetypeId,
} from '../../lib/storyExperience'

const LIVE_PROOF_STATUS_LABELS = {
  ready: 'READY',
  blocked: 'BLOCKED',
  required: 'REQUIRED',
} as const

const LOCAL_FILE_PREVIEW_BYTES = 32 * 1024
const MIN_BACKEND_TEASER_TRADE_ROWS = 10

interface LocalFileValidationState {
  status: 'idle' | 'validating' | 'passed' | 'blocked'
  message: string
  facts: string[]
  rowCount?: number
  error?: string | null
}

interface PublicReportReadinessState {
  status: 'checking' | 'ready' | 'blocked'
  headline: string
  detail: string
  minTradeRows?: number
  maxFileSizeMb?: number
  blockers: string[]
}

const EMPTY_FILE_VALIDATION: LocalFileValidationState = {
  status: 'idle',
  message: 'CSV, TXT, and spreadsheet exports are accepted in the public preview surface.',
  facts: [],
  error: null,
}

const CHECKING_PUBLIC_REPORT_READINESS: PublicReportReadinessState = {
  status: 'checking',
  headline: 'Checking Medallion report persistence.',
  detail: 'Generate Free Report waits for the backend to prove it can persist and retrieve a public teaser receipt.',
  blockers: [],
}

function summarizePublicReportReadiness(readiness: PublicTeaserReportReadinessResponse): PublicReportReadinessState {
  const readinessError = validatePublicTeaserReportReadiness(readiness)

  if (readinessError) {
    return {
      status: 'blocked',
      headline: 'Medallion public report boundary is blocked.',
      detail: readinessError,
      minTradeRows: readiness.min_trade_rows,
      maxFileSizeMb: readiness.max_file_size_mb,
      blockers: readiness.blockers ?? [],
    }
  }

  return {
    status: 'ready',
    headline: 'Medallion can persist public teaser receipts.',
    detail: `Real free reports require at least ${readiness.min_trade_rows ?? MIN_BACKEND_TEASER_TRADE_ROWS} validated rows and return a persisted backend teaser receipt before the report route opens.`,
    minTradeRows: readiness.min_trade_rows,
    maxFileSizeMb: readiness.max_file_size_mb,
    blockers: [],
  }
}

function summarizePublicReportReadinessFailure(error: unknown): PublicReportReadinessState {
  const message = error instanceof Error ? error.message : 'Medallion public report readiness check failed.'

  return {
    status: 'blocked',
    headline: 'Medallion public report readiness could not be verified.',
    detail: `${message} Generate Free Report will not create a report packet until readiness is proven.`,
    blockers: ['readiness_check_failed'],
  }
}

function getUploadFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.trim().toLowerCase() ?? ''
}

function countTradeRowsFromTable(body: string): number {
  const rows = body
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)

  return Math.max(0, rows.length - 1)
}

function buildPastedTradeFile(body: string): File {
  return new File([body], 'public-teaser-upload.csv', { type: 'text/csv' })
}

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
  const publicStoryHandoff = readPublicStoryHandoff(location.search)
  const shouldUseDemoLauncherSamplePacket = hasDemoLauncherSamplePacketRequest(location.search)
  const signalMarkers = useMemo(
    () => getPublicStorySignalMarkers(publicStoryHandoff?.signalMarkerIds),
    [publicStoryHandoff?.signalMarkerIds],
  )
  const [archetypeId, setArchetypeId] = useState<StoryArchetypeId>(initialArchetype.id)
  const [axisId, setAxisId] = useState<FingerprintAxisId>(initialAxis.id)
  const [fileName, setFileName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileValidation, setFileValidation] = useState<LocalFileValidationState>(EMPTY_FILE_VALIDATION)
  const [pasteBody, setPasteBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [reportGenerating, setReportGenerating] = useState(false)
  const [publicReportReadiness, setPublicReportReadiness] = useState<PublicReportReadinessState>(
    CHECKING_PUBLIC_REPORT_READINESS,
  )

  const archetype = useMemo(() => getTraderArchetype(archetypeId), [archetypeId])
  const axis = useMemo(() => getFingerprintAxis(axisId), [axisId])
  const liveProofGap = useMemo(() => buildLiveProofReadinessContract(), [])
  const selectedPainAxes = useMemo(
    () => selectedPainAxisIds
      .map((candidate) => getFingerprintAxis(candidate))
      .filter((candidate, index, axes) => candidate.id === selectedPainAxisIds[index] && axes.findIndex((axisCandidate) => axisCandidate.id === candidate.id) === index),
    [selectedPainAxisIds],
  )
  const hasStoryHandoff = storySource === 'guided' || visitedSceneCount > 0 || selectedPainAxes.length > 0
  const hasGuidedStoryHandoff = storySource === 'guided'
  const routeIntegrityRows = [
    {
      label: 'Entry status',
      value: hasGuidedStoryHandoff
        ? 'Guided StoryExperience handoff'
        : shouldUseDemoLauncherSamplePacket
          ? 'Controlled demo launcher sample'
          : 'Direct upload recovery route',
      body: hasGuidedStoryHandoff
        ? 'The public story selected the provisional archetype, pain axis, scene count, and website-level markers before this upload step.'
        : shouldUseDemoLauncherSamplePacket
          ? 'The demo launcher explicitly marks this path as a sample packet for continuity, not visitor analytics evidence.'
          : 'No guided public story packet is attached. This route can create a real public report only after Medallion persists a teaser receipt.',
    },
    {
      label: 'Report source label',
      value: hasGuidedStoryHandoff ? 'story-carried' : 'direct-public',
      body: hasGuidedStoryHandoff
        ? 'The next report may say it preserved public-story context, while still refusing account-specific conclusions.'
        : 'The next report must say direct upload recovery, not completed storyline proof.',
    },
    {
      label: 'Safe next click',
      value: hasGuidedStoryHandoff ? 'Generate Guided Sample Report' : `Run story or attach ${MIN_BACKEND_TEASER_TRADE_ROWS}+ rows`,
      body: hasGuidedStoryHandoff
        ? 'Use the guided sample when demo speed matters and the route already carries story context.'
        : 'For a cleaner public demo, return to the story first. The real submit button needs a persisted backend teaser receipt.',
    },
  ]
  const storyHomePath = getMarketHomePath(market)
  const reportPacketContract = [
    'Creates a report handoff with source, market, archetype, dominant pain, story source, scenes viewed, and selected public pain axes.',
    'Stores no raw trade rows in this public preview surface.',
    'Generate Free Report requires a persisted backend teaser receipt; thin/local inputs are blocked instead of becoming report routes.',
  ]
  const predictionSurvivalRows = [
    {
      label: 'Public prediction',
      value: `${archetype.name}: ${archetype.title} / ${axis.label}`,
      body: hasStoryHandoff
        ? `Carried from ${storySource === 'guided' ? 'the guided StoryExperience' : 'direct upload recovery context'} after ${Number.isFinite(visitedSceneCount) ? visitedSceneCount : 0} scene${visitedSceneCount === 1 ? '' : 's'}.`
        : 'Selected on this upload page without a guided story packet.',
    },
    {
      label: 'What survives upload',
      value: selectedPainAxes.length ? selectedPainAxes.map((candidate) => candidate.label).join(', ') : axis.label,
      body: 'Only secret-free metadata survives in this public preview: source, market, archetype, axis, story route, scene count, and public signal markers.',
    },
    {
      label: 'Still locked',
      value: 'Account-specific conclusion',
      body: 'The report can name the private question, but live activation, normalized trade history, generated artifacts, and append history must prove the answer.',
    },
  ]
  const sampleHandoffRows = [
    {
      label: 'Packet source',
      value: shouldUseDemoLauncherSamplePacket ? 'Controlled launcher sample' : 'Local sample history packet',
      body: shouldUseDemoLauncherSamplePacket
        ? 'The shared demo link explicitly marks this as a launcher sample, not visitor evidence.'
        : 'The sample packet is created in this browser for demo continuity only.',
    },
    {
      label: 'Carries forward',
      value: `${market.toUpperCase()} / ${archetype.name} / ${axis.label}`,
      body: `Story ${storySource === 'guided' ? 'guided' : 'direct'}; scenes ${Number.isFinite(visitedSceneCount) ? visitedSceneCount : 0}; pain ${selectedPainAxes.length ? selectedPainAxes.map((candidate) => candidate.label).join(', ') : axis.label}.`,
    },
    {
      label: 'Report unlock path',
      value: 'Free report -> locked insight -> private demo gate',
      body: 'This is the public-to-private route the next page must preserve.',
    },
    {
      label: 'Refuses to claim',
      value: 'No account conclusion',
      body: 'No raw rows, no production normalization, no account-specific conclusion.',
    },
  ]

  const refreshPublicReportReadiness = async (): Promise<string | null> => {
    try {
      const readiness = await getPublicTeaserReportReadiness()
      const nextReadiness = summarizePublicReportReadiness(readiness)
      setPublicReportReadiness(nextReadiness)
      return nextReadiness.status === 'ready' ? null : nextReadiness.detail
    } catch (caughtError) {
      const nextReadiness = summarizePublicReportReadinessFailure(caughtError)
      setPublicReportReadiness(nextReadiness)
      return nextReadiness.detail
    }
  }

  useEffect(() => {
    let cancelled = false

    void getPublicTeaserReportReadiness()
      .then((readiness) => {
        if (!cancelled) {
          setPublicReportReadiness(summarizePublicReportReadiness(readiness))
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setPublicReportReadiness(summarizePublicReportReadinessFailure(caughtError))
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const buildReportSearch = (source: 'upload' | 'sample') => {
    const reportSearchParams = appendDemoLauncherSamplePacketParam(
      appendPublicStoryHandoffParams(
        new URLSearchParams({
          market,
          archetype: archetype.id,
          axis: axis.id,
        }),
        publicStoryHandoff,
      ),
      source === 'sample' && shouldUseDemoLauncherSamplePacket,
    )

    return `?${reportSearchParams.toString()}`
  }

  const getBackendTeaserFile = (): File | null => {
    const pastedTradeRowCount = countTradeRowsFromTable(pasteBody)

    if (selectedFile && fileValidation.status === 'passed' && (fileValidation.rowCount ?? 0) >= MIN_BACKEND_TEASER_TRADE_ROWS) {
      return selectedFile
    }

    if (pastedTradeRowCount >= MIN_BACKEND_TEASER_TRADE_ROWS && !validatePublicPasteSample(pasteBody)) {
      return buildPastedTradeFile(pasteBody)
    }

    return null
  }

  const generateReport = async (source: 'upload' | 'sample') => {
    const validationError = validatePublicReportInput({
      fileName,
      fileValidationError: fileValidation.status === 'blocked' ? fileValidation.error : null,
      fileValidationPassed: fileValidation.status === 'passed',
      pasteBody,
      source,
    })

    if (validationError) {
      setError(validationError)
      return
    }

    if (source === 'upload') {
      const backendTeaserFile = getBackendTeaserFile()

      if (!backendTeaserFile) {
        const validatedRows = Math.max(fileValidation.rowCount ?? 0, countTradeRowsFromTable(pasteBody))
        setError(
          `A real free report now requires at least ${MIN_BACKEND_TEASER_TRADE_ROWS} validated trade rows so Medallion can create a persisted backend teaser receipt. Current validated rows: ${validatedRows}. Use Sample History only for a non-product walkthrough.`,
        )
        return
      }

      setReportGenerating(true)

      try {
        const readinessError = await refreshPublicReportReadiness()
        if (readinessError) {
          setError(`${readinessError} No report packet was created; use Sample History only for a non-product walkthrough.`)
          return
        }

        const backendTeaser = await generatePublicTeaserReport(backendTeaserFile, {
          market,
          storySource,
          archetypeId: archetype.id,
          axisId: axis.id,
          selectedPainAxisIds,
          visitedSceneCount,
          signalMarkerIds: publicStoryHandoff?.signalMarkerIds,
        })
        const receiptError = validatePublicTeaserReportResponse(backendTeaser)

        if (receiptError) {
          setError(receiptError)
          return
        }

        const reportId = backendTeaser.report_id as string
        persistPublicReportSession(
          buildPublicReportSession({
            reportId,
            market,
            archetypeId: archetype.id,
            axisId: axis.id,
            fileName,
            fileValidationFacts: fileValidation.facts,
            pasteBody,
            source,
            storySource,
            selectedPainAxisIds,
            visitedSceneCount,
            signalMarkerIds: publicStoryHandoff?.signalMarkerIds,
            backendTeaser,
          }),
        )

        navigate(`/report/${reportId}${buildReportSearch(source)}`)
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : 'Backend teaser generation failed.'
        setError(`Medallion teaser generation failed: ${message}. No report packet was created; use Sample History only for a non-product walkthrough.`)
      } finally {
        setReportGenerating(false)
      }

      return
    }

    setReportGenerating(true)
    const reportId = 'sample-behavioral-leak-report'

    try {
      persistPublicReportSession(
        source === 'sample' && shouldUseDemoLauncherSamplePacket
          ? buildDemoLauncherSampleReportSession({
              reportId,
              market,
              archetypeId: archetype.id,
              axisId: axis.id,
              storySource,
              selectedPainAxisIds,
              visitedSceneCount,
              signalMarkerIds: publicStoryHandoff?.signalMarkerIds,
            })
          : buildPublicReportSession({
              reportId,
              market,
              archetypeId: archetype.id,
              axisId: axis.id,
              source,
              storySource,
              selectedPainAxisIds,
              visitedSceneCount,
              signalMarkerIds: publicStoryHandoff?.signalMarkerIds,
            }),
      )

      navigate(`/report/${reportId}${buildReportSearch(source)}`)
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Report creation failed.'
      setError(`Report creation failed before navigation: ${message}`)
    } finally {
      setReportGenerating(false)
    }
  }

  const handleFileChange = async (file?: File | null) => {
    const nextFileName = file?.name ?? ''
    setFileName(nextFileName)
    setSelectedFile(file ?? null)
    setError(null)

    if (!file) {
      setFileValidation(EMPTY_FILE_VALIDATION)
      return
    }

    const extension = getUploadFileExtension(file.name)

    if (!['csv', 'txt'].includes(extension)) {
      setFileValidation({
        status: 'blocked',
        message: 'This public preview cannot inspect spreadsheet/binary files. Export CSV/TXT or paste a small trade table below.',
        facts: [
          `Selected local file extension: ${extension || 'unknown'} was not inspected by the public browser preview.`,
          'Use CSV/TXT or a validated pasted table before treating this as an upload-step handoff.',
        ],
        error: 'This public preview cannot inspect spreadsheet/binary files. Export CSV/TXT or paste a small trade table below.',
      })
      return
    }

    setFileValidation({
      status: 'validating',
      message: 'Inspecting the first rows locally. Raw file contents will not be stored.',
      facts: [],
      error: null,
    })

    try {
      const previewText = await file.slice(0, LOCAL_FILE_PREVIEW_BYTES).text()
      const structureError = validatePublicPasteSample(previewText)
      const rowCount = countTradeRowsFromTable(previewText)

      if (structureError) {
        setFileValidation({
          status: 'blocked',
          message: 'Selected file did not pass the local public structure check.',
          facts: [
            `Selected local ${extension.toUpperCase()} file was inspected but did not pass the required public structure check.`,
            'Raw file contents were read only inside this browser session and were not stored in the report packet.',
          ],
          rowCount,
          error: `Selected file did not pass the local public structure check: ${structureError}`,
        })
        return
      }

      setFileValidation({
        status: 'passed',
        message: 'Selected file passed the local public structure check.',
        facts: [
          `Selected local ${extension.toUpperCase()} file passed local structure check: date/time, instrument, direction, and result/price fields detected.`,
          `Trade rows detected in local preview: ${rowCount}.`,
          `Preview bytes inspected locally: ${Math.min(file.size, LOCAL_FILE_PREVIEW_BYTES)} of ${file.size}.`,
          'Raw file contents were read only inside this browser session and were not stored in the report packet.',
        ],
        rowCount,
        error: null,
      })
    } catch {
      setFileValidation({
        status: 'blocked',
        message: 'The selected file could not be read by this browser preview. Export CSV/TXT or paste a small trade table below.',
        facts: [
          'Selected local file could not be inspected by the public browser preview.',
          'Use a validated pasted table before treating this as an upload-step handoff.',
        ],
        error: 'The selected file could not be read by this browser preview. Export CSV/TXT or paste a small trade table below.',
      })
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    void generateReport('upload')
  }

  return (
    <section className="min-h-screen overflow-x-hidden bg-[#030304] px-4 pb-20 pt-14 text-white sm:px-6 md:px-12">
      <div className="mx-0 grid w-full max-w-[22.25rem] min-w-0 gap-10 sm:mx-auto sm:max-w-7xl lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="min-w-0 lg:sticky lg:top-28">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.26em] text-indigo-300">Upload Moment</p>
          <h1 className="break-words font-display text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">
            Upload your trade history. See what the fingerprint gets right.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-300">
            The story page built a provisional mirror. This step is where Shibuya asks for evidence. The real free report
            button now requires enough rows for Medallion to persist a backend teaser receipt before the private answer remains locked.
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

        <div className="min-w-0 space-y-6">
          <PublicJourneySpine
            activeStage="upload"
            detail="This step turns the public hypothesis into either a persisted backend teaser receipt or an explicitly labelled sample packet. It never stores raw trade rows in browser state."
          />

          <form onSubmit={handleSubmit} className="min-w-0 rounded-[2rem] border border-white/10 bg-[#09090B] p-5 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">Provisional signal</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Confirm or reject the page prediction.</h2>
              </div>
              <div className="rounded-2xl border border-indigo-300/20 bg-indigo-300/[0.08] p-3 text-indigo-100">
                <FileUp className="h-5 w-5" />
              </div>
            </div>

            <div className="mb-6 rounded-3xl border border-sky-300/20 bg-sky-300/[0.055] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-200">Upload route integrity</p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {hasGuidedStoryHandoff ? 'Story-first context is attached.' : 'Cold upload is recovery-only.'}
              </h3>
              <p className="mt-3 text-sm leading-6 text-sky-50/75">
                This page can accept a public preview input from several routes, but only the StoryExperience path is the
                canonical public demo. Direct upload stays available so nobody gets stranded; it is labelled weaker on purpose.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {routeIntegrityRows.map((row) => (
                  <article key={row.label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-sky-100">{row.label}</span>
                    <strong className="mt-2 block text-sm text-white">{row.value}</strong>
                    <span className="mt-2 block text-xs leading-5 text-sky-50/65">{row.body}</span>
                  </article>
                ))}
              </div>
              {!hasGuidedStoryHandoff ? (
                <Link
                  to={storyHomePath}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black sm:w-auto"
                >
                  Run StoryExperience First
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
              <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-sky-50/60">
                Route rule: guided story can seed the question; direct upload must earn a persisted backend teaser receipt before it becomes a report route.
                Neither route proves private analytics until live activation, normalization, generated artifacts, and append history exist.
              </p>
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
                    <span className="mt-1 block text-white">{storySource === 'guided' ? 'Guided StoryExperience route' : 'Direct upload recovery route'}</span>
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
                {signalMarkers.length > 0 ? (
                  <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-indigo-200">Why this hypothesis followed you here</p>
                    <div className="mt-3 grid gap-2 text-xs leading-5 text-indigo-50/75 sm:grid-cols-2">
                      {signalMarkers.map((marker) => (
                        <div key={marker.id} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                          <span className="block font-semibold text-white">{marker.label}</span>
                          <span className="mt-1 block">{marker.body}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-indigo-50/55">
                      These are public website markers only. They route the sample report; they do not diagnose the account.
                    </p>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    void generateReport('sample')
                  }}
                  disabled={reportGenerating}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-indigo-200"
                >
                  Generate Guided Sample Report
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-xs leading-5 text-indigo-50/60">
                  Use this for a fast expo handoff. It creates a local sample packet and carries the exact story context into the free report.
                  {shouldUseDemoLauncherSamplePacket ? ' This route is marked as a controlled launcher sample, not visitor evidence.' : ''}
                </p>
              </div>
            ) : null}

            <div className="mb-6 rounded-3xl border border-fuchsia-300/20 bg-fuchsia-300/[0.055] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-200">Sample handoff receipt</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Before the click, this is exactly what the sample report will carry.</h3>
              <p className="mt-3 text-sm leading-6 text-fuchsia-50/75">
                The expo shortcut is allowed to prove continuity through the funnel. It is not allowed to pretend sample
                history produced trader-specific analytics.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {sampleHandoffRows.map((row) => (
                  <article key={row.label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-fuchsia-100">{row.label}</span>
                    <strong className="mt-2 block text-sm text-white">{row.value}</strong>
                    <span className="mt-2 block text-xs leading-5 text-fuchsia-50/65">{row.body}</span>
                  </article>
                ))}
              </div>
              <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-fuchsia-50/60">
                Presenter rule: click sample only when you want to show the journey contract. Live proof still starts after
                activation, normalized upload, generated artifacts, and append history.
              </p>
            </div>

            <div className="mb-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.055] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200">Prediction survival test</p>
              <h3 className="mt-2 text-lg font-semibold text-white">What is allowed to survive from story to report.</h3>
              <p className="mt-3 text-sm leading-6 text-cyan-50/75">
                The upload step should not pretend the public story was analysis. It carries a hypothesis into a backend teaser or sample report packet,
                then forces the private answer to wait for real account evidence.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {predictionSurvivalRows.map((row) => (
                  <article key={row.label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100">{row.label}</span>
                    <strong className="mt-2 block text-sm text-white">{row.value}</strong>
                    <span className="mt-2 block text-xs leading-5 text-cyan-50/65">{row.body}</span>
                  </article>
                ))}
              </div>
              <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-cyan-50/60">
                Survival rule: if a claim requires account-specific proof, it belongs behind activation, upload normalization,
                generated artifacts, and append history.
              </p>
            </div>

            <div className="mb-6 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200">Report packet contract</p>
              <h3 className="mt-2 text-lg font-semibold text-white">What this upload step is allowed to prove.</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-emerald-50/80">
                {reportPacketContract.map((item) => (
                  <li key={item} className="flex gap-3">
                    <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`mb-6 rounded-3xl border p-5 ${
                publicReportReadiness.status === 'ready'
                  ? 'border-emerald-300/20 bg-emerald-300/[0.06]'
                  : publicReportReadiness.status === 'checking'
                    ? 'border-sky-300/20 bg-sky-300/[0.055]'
                    : 'border-rose-300/25 bg-rose-300/[0.06]'
              }`}
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">Backend report boundary</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{publicReportReadiness.headline}</h3>
                </div>
                <span className="w-fit rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/80">
                  {publicReportReadiness.status}
                </span>
              </div>
              <p className="text-sm leading-6 text-white/75">{publicReportReadiness.detail}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <article className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Receipt persistence</span>
                  <strong className="mt-2 block text-sm text-white">
                    {publicReportReadiness.status === 'ready' ? 'Required and proven ready' : 'Not proven ready'}
                  </strong>
                  <span className="mt-2 block text-xs leading-5 text-white/55">A real report route opens only after Medallion returns a persisted teaser receipt.</span>
                </article>
                <article className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Minimum rows</span>
                  <strong className="mt-2 block text-sm text-white">{publicReportReadiness.minTradeRows ?? MIN_BACKEND_TEASER_TRADE_ROWS}</strong>
                  <span className="mt-2 block text-xs leading-5 text-white/55">Below this, the public route stays sample/local only.</span>
                </article>
                <article className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Private proof</span>
                  <strong className="mt-2 block text-sm text-white">Private proof remains locked</strong>
                  <span className="mt-2 block text-xs leading-5 text-white/55">Teaser readiness never proves payment, live upload, generated artifacts, or append history.</span>
                </article>
              </div>
              {publicReportReadiness.blockers.length > 0 ? (
                <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/60">
                  Blockers: {publicReportReadiness.blockers.join(', ')}
                </p>
              ) : null}
            </div>

            <div className="mb-6 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200">Live proof gap ledger</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{liveProofGap.headline}</h3>
                </div>
                <span className="w-fit rounded-full border border-amber-200/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100">
                  {liveProofGap.statusLabel}
                </span>
              </div>
              <p className="text-sm leading-6 text-amber-50/75">
                This ledger is stored into the report packet, so the free report and private handoff can read the same
                missing-evidence contract instead of relying on marketing copy.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {liveProofGap.rows.map((row) => (
                  <article key={row.label} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100">
                      {LIVE_PROOF_STATUS_LABELS[row.status]}
                    </span>
                    <strong className="mt-2 block text-sm text-white">{row.label}</strong>
                    <span className="mt-2 block text-xs leading-5 text-amber-50/65">{row.detail}</span>
                  </article>
                ))}
              </div>
              <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-amber-50/60">
                Live proof gap rule: a public report may carry this ledger forward; it may not mark any required stage complete until current backend evidence proves it.
              </p>
            </div>

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
                onChange={(event) => {
                  void handleFileChange(event.target.files?.[0])
                }}
                className="block w-full text-sm text-neutral-300 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
              />
              <span className="mt-3 block text-xs text-neutral-500">
                {fileName ? `Selected: ${fileName}. ${fileValidation.message}` : fileValidation.message}
              </span>
            </label>

            <label className="mt-5 block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">Or paste a small trade sample</span>
              <textarea
                value={pasteBody}
                onChange={(event) => setPasteBody(event.target.value)}
                rows={6}
                placeholder={'date,symbol,side,size,entry,exit,pnl\n2026-06-18,EURUSD,buy,1,1.0800,1.0830,30'}
                className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-neutral-600 focus:border-indigo-300/50"
              />
              <span className="mt-3 block rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-xs leading-5 text-neutral-400">
                Pasted samples need a header row plus one trade row. Required signal columns: date/time,
                symbol or instrument, side or direction, and pnl or price fields.
              </span>
            </label>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-500/25 bg-rose-500/[0.08] p-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={reportGenerating}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-indigo-200"
              >
                {reportGenerating ? 'Generating Report' : 'Generate Free Report'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  void generateReport('sample')
                }}
                disabled={reportGenerating}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black"
              >
                Use Sample History
              </button>
            </div>
          </form>

          <div className="rounded-[2rem] border border-amber-500/20 bg-amber-500/[0.05] p-5 text-sm leading-7 text-amber-100/90 md:p-6">
            <strong className="text-amber-100">Boundary:</strong> this public preview is designed to prove the journey.
            The real public report starts only after a persisted Medallion teaser receipt. The production report still requires normalized trade history and backend-generated artifacts before we claim account-specific analytics.
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link to={addMarketToPath('/pricing', market)} className="text-neutral-400 underline-offset-4 transition hover:text-white hover:underline">
              Skip to paid ladder
            </Link>
            <Link to={storyHomePath} className="text-neutral-400 underline-offset-4 transition hover:text-white hover:underline">
              Back to story
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
