import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import { getSampleWorkspaceOverview } from '../../../lib/sampleWorkspace'
import { ResetProDemoCommandCenter } from '../ResetProDemoCommandCenter'

describe('ResetProDemoCommandCenter', () => {
  test('renders a private demo path with explicit demo boundaries', () => {
    render(
      <MemoryRouter>
        <ResetProDemoCommandCenter market="india" overview={getSampleWorkspaceOverview('reset_pro')} />
      </MemoryRouter>,
    )

    expect(screen.getByText('PRIVATE RESET PRO DEMO')).toBeInTheDocument()
    expect(screen.getByText('3-MINUTE PATH')).toBeInTheDocument()
    expect(screen.getByText('MARKET: INDIA')).toBeInTheDocument()
    expect(screen.getAllByText('DEMO DATA ONLY')[0]).toBeInTheDocument()
    expect(screen.getByText(/Shibuya does not tell the trader what to buy or sell/i)).toBeInTheDocument()
    expect(screen.getByText('RESET PRO LIVING MIRROR')).toBeInTheDocument()
    expect(screen.getByText('Story became the product: fingerprint, mandate, signal, proof loop.')).toBeInTheDocument()
    expect(screen.getByText(/the private workspace should feel like the public fingerprint became operational/i)).toBeInTheDocument()
    expect(screen.getAllByText('Public fingerprint').length).toBeGreaterThan(0)
    expect(screen.getByText('Direct Reset Pro sample fingerprint')).toBeInTheDocument()
    expect(screen.getByText('Next Session Mandate')).toBeInTheDocument()
    expect(screen.getByText('LiveSignal')).toBeInTheDocument()
    expect(screen.getByText('Edge Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Append proof')).toBeInTheDocument()
    expect(screen.getByText(/This living mirror is sample workflow proof/i)).toBeInTheDocument()
    expect(screen.getByText('RESET PRO WORKSPACE STATUS SNAPSHOT')).toBeInTheDocument()
    expect(screen.getByText('Know what is live, what is carried, and what must be proven next.')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO PRIVATE GATE CHECKSUM')).toBeInTheDocument()
    expect(screen.getByText('The workspace must match the locked-insight route it received.')).toBeInTheDocument()
    expect(screen.getAllByText('Not attached').length).toBeGreaterThan(0)
    expect(screen.getByText(/No locked-insight checksum was stored/i)).toBeInTheDocument()
    expect(screen.getByText('Engagement receipt')).toBeInTheDocument()
    expect(screen.getByText(/No local engagement receipt was carried/i)).toBeInTheDocument()
    expect(screen.getByText('Mode: sample-only')).toBeInTheDocument()
    expect(screen.getByText('Reset Pro preview workspace')).toBeInTheDocument()
    expect(screen.getByText('Context carried')).toBeInTheDocument()
    expect(screen.getByText('Direct demo entry')).toBeInTheDocument()
    expect(screen.getByText(/No public report or locked question is attached; frame this as a cold sample workspace/i)).toBeInTheDocument()
    expect(screen.getByText('Next proof required')).toBeInTheDocument()
    expect(screen.getByText(/Live proof starts with activation, real history, generated artifacts/i)).toBeInTheDocument()
    expect(screen.getByText('RESET PRO DEMO DECISION PACKET')).toBeInTheDocument()
    expect(screen.getByText('WARNING: COLD DEMO')).toBeInTheDocument()
    expect(screen.getByText('Open as a generic sample workspace. Do not imply the public journey happened.')).toBeInTheDocument()
    expect(screen.getByText('This is a cold sample workspace. No public story, report, upload, or locked private question is attached.')).toBeInTheDocument()
    expect(screen.getByText('Proceed if')).toBeInTheDocument()
    expect(screen.getByText('Stop if')).toBeInTheDocument()
    expect(screen.getByText('The presenter says this is a generic sample account before showing any metric.')).toBeInTheDocument()
    expect(screen.getByText('Someone asks whether these are the viewer real trades.')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO OPERATOR STRIP')).toBeInTheDocument()
    expect(screen.getByText('One guided path after unlock. No dashboard wandering.')).toBeInTheDocument()
    expect(screen.getByText(/The deeper cards below are supporting evidence/i)).toBeInTheDocument()
    expect(screen.getByText('RESET PRO CLOSE CONTRACT')).toBeInTheDocument()
    expect(screen.getByText('Close on append proof without converting the demo into a live claim.')).toBeInTheDocument()
    expect(screen.getByText(/the last workspace move must send the viewer to the append path/i)).toBeInTheDocument()
    expect(screen.getByText('What this close proves')).toBeInTheDocument()
    expect(screen.getByText('The direct sample workspace can demonstrate the Reset Pro operating loop and end at the upload/append proof path.')).toBeInTheDocument()
    expect(screen.getByText('What remains unproven')).toBeInTheDocument()
    expect(screen.getByText('Live upload, generated backend artifacts, durable account deltas, repeated append history, and trader-specific improvement remain unproven.')).toBeInTheDocument()
    expect(screen.getAllByText('Required next evidence').length).toBeGreaterThan(0)
    expect(screen.getByText('A live activated account must complete first meaningful upload, generated artifact review, and repeat append history.')).toBeInTheDocument()
    expect(screen.getByText('DEMO CLAIM LEDGER')).toBeInTheDocument()
    expect(screen.getByText('What the presenter may say, and what stays forbidden.')).toBeInTheDocument()
    expect(screen.getByText('Allowed claims')).toBeInTheDocument()
    expect(screen.getByText('Forbidden claims')).toBeInTheDocument()
    expect(screen.getByText('This is a controlled sample workspace showing the Reset Pro operating loop.')).toBeInTheDocument()
    expect(screen.getByText('This is a direct private demo without a public report handoff.')).toBeInTheDocument()
    expect(screen.getByText('Do not say the sample account belongs to the visitor.')).toBeInTheDocument()
    expect(screen.getByText('Do not promise profit improvement, challenge pass rates, or drawdown reduction.')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO OBJECTION MAP')).toBeInTheDocument()
    expect(screen.getByText('Fast answers for the questions that can break the demo.')).toBeInTheDocument()
    expect(screen.getByText('Are these the viewer real trades?')).toBeInTheDocument()
    expect(screen.getByText('No. This is a cold sample workspace with no public report or upload packet attached.')).toBeInTheDocument()
    expect(screen.getByText('What would make this live proof?')).toBeInTheDocument()
    expect(screen.getByText('Payment/activation, a real account, normalized trade history, generated backend artifacts, and repeat append history.')).toBeInTheDocument()
    expect(screen.getByText('Is Shibuya telling the trader what to trade?')).toBeInTheDocument()
    expect(screen.getByText('Where should the demo end?')).toBeInTheDocument()
    expect(screen.getByText('Do not end on a performance promise. End on the proof loop and the missing live evidence.')).toBeInTheDocument()
    expect(screen.getByText('PRESENTER ROUTE')).toBeInTheDocument()
    expect(screen.getByText('Run the private demo from this rail first.')).toBeInTheDocument()
    expect(screen.getByText('START HERE')).toBeInTheDocument()
    expect(screen.getAllByText('SHOW NEXT').length).toBeGreaterThanOrEqual(4)
    expect(screen.getByText('CLOSE HERE')).toBeInTheDocument()
    expect(screen.getByText('Direct demo entry only; call out that no public report handoff is attached.')).toBeInTheDocument()
    expect(screen.getByText('End on append-proof. Live improvement claims require account activation and repeated uploads.')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO PROOF LADDER')).toBeInTheDocument()
    expect(screen.getByText('What is context, what is demo, and what still needs live proof.')).toBeInTheDocument()
    expect(screen.getByText('Public recognition')).toBeInTheDocument()
    expect(screen.getByText('No guided public story packet is attached to this demo entry.')).toBeInTheDocument()
    expect(screen.getByText('Report handoff packet')).toBeInTheDocument()
    expect(screen.getByText('No local upload/sample validation packet is attached.')).toBeInTheDocument()
    expect(screen.getByText('Locked private question')).toBeInTheDocument()
    expect(screen.getByText('No locked module or Reset Pro bridge question was carried in.')).toBeInTheDocument()
    expect(screen.getByText('Sample command center')).toBeInTheDocument()
    expect(screen.getByText('The next required proof is a live first upload plus append history.')).toBeInTheDocument()
    expect(screen.getByText('FOUNDER SHOW SEQUENCE')).toBeInTheDocument()
    expect(screen.getByText('Three minutes, no improvising.')).toBeInTheDocument()
    expect(screen.getByText('DEMO READINESS CHECKLIST')).toBeInTheDocument()
    expect(screen.getByText('Before showing the workspace.')).toBeInTheDocument()
    expect(screen.getByText('Public context carried')).toBeInTheDocument()
    expect(screen.getByText(/No public report handoff was found/i)).toBeInTheDocument()
    expect(screen.getByText('Sample boundary visible')).toBeInTheDocument()
    expect(screen.getAllByText('Append-proof exit').length).toBeGreaterThan(0)
    expect(screen.getAllByText('0:00-0:30').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Start from the public recognition moment').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Name the current enemy').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Show intervention surfaces').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Close with the proof loop').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Append Proof' })).toHaveAttribute('href', '/dashboard/upload?market=india')
    expect(screen.getAllByRole('link', { name: /Start Mission HQ/i })[0]).toHaveAttribute('href', '/dashboard?market=india')
    expect(screen.getAllByRole('link', { name: /Close On Append Proof/i })[0]).toHaveAttribute('href', '/dashboard/upload?market=india')
    expect(screen.getAllByRole('link', { name: /Show propOS angle/i })[0]).toHaveAttribute('href', '/dashboard/shadow-boxing?market=india')
    expect(screen.getByText(/Live Reset Pro requires payment, activation, first meaningful upload/i)).toBeInTheDocument()
  })

  test('renders carried report context when the private demo came from a free report', () => {
    render(
      <MemoryRouter>
        <ResetProDemoCommandCenter
          market="india"
          overview={getSampleWorkspaceOverview('reset_pro')}
          origin={{
            source: 'free_report',
            reportId: 'free-report-123',
            archetypeId: 'priya',
            archetypeLabel: 'Priya: Prop evaluation survivor',
            axisId: 'drawdown_pressure',
            axisLabel: 'Drawdown Pressure',
            reportSource: 'sample',
            evidenceLabel: 'Sample history packet',
            validationSummary: 'Demo packet accepted. This proves the public journey transition, not live analytics.',
            storySource: 'guided',
            selectedPainAxisIds: ['drawdown_pressure'],
            selectedPainAxisLabels: ['Drawdown Pressure'],
            visitedSceneCount: 4,
            lockedSectionId: 'highest-cost-state',
            lockedSectionTitle: 'Highest-cost state',
            bridgeHeadline: 'Reset Pro should decide whether pressure changes the account before the breach.',
            bridgeDecisionQuestion: 'Does the trader become a different operator near the drawdown line?',
            bridgeWhyNow: 'Watchlist means the next product step should test pressure behavior, not add another generic chart.',
            bridgeLiveProof: [
              'First meaningful upload normalized by the live backend.',
              'Whether size, exit timing, or re-entry changes when rulebook pressure rises.',
            ],
            bridgePreviewShows: [
              'Sample mandate and pressure map.',
              'How a prop-style drawdown warning becomes a pre-session operating constraint.',
            ],
            privateGateChecksum: 'source=free_report; report=free-report-123; section=highest-cost-state | archetype=priya; axis=drawdown_pressure | story=guided; scene_count=4; pain_axes=drawdown_pressure; signals=mirror_selected,upload_intent | sample route, not live answer',
            engagementReportViewCount: 2,
            engagementLockedSectionClickCount: 1,
            engagementCurrentSectionClickCount: 1,
            engagementPrivateDemoIntentCount: 1,
            engagementBoundary: 'Report engagement is local route continuity only; it does not prove payment, backend normalization, raw trades, or account-specific improvement.',
            unlockReceiptId: 'reset-pro-demo:india:free-report:free-report-123:priya:drawdown-pressure:highest-cost-state',
            unlockBoundary: 'Presenter code opened sample Reset Pro access only; no payment, backend upload, generated artifact, or account-specific conclusion was proven.',
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Carried in from the public report')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO LIVING MIRROR')).toBeInTheDocument()
    expect(screen.getAllByText('Priya: Prop evaluation survivor / Drawdown Pressure').length).toBeGreaterThan(0)
    expect(screen.getByText('Carried from guided after 4 public scenes.')).toBeInTheDocument()
    expect(screen.getByText('Next Session Mandate')).toBeInTheDocument()
    expect(screen.getByText('LiveSignal')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO WORKSPACE STATUS SNAPSHOT')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO PRIVATE GATE CHECKSUM')).toBeInTheDocument()
    expect(screen.getByText('Attached after founder unlock')).toBeInTheDocument()
    expect(screen.getAllByText(/source=free_report; report=free-report-123; section=highest-cost-state/i).length).toBeGreaterThan(0)
    expect(screen.getByText('2 view(s), 1 locked click(s), 1 gate attempt(s)')).toBeInTheDocument()
    expect(screen.getAllByText(/Report engagement is local route continuity only/i).length).toBeGreaterThan(0)
    expect(screen.getByText('Continuity check only')).toBeInTheDocument()
    expect(screen.getByText(/It may not prove a live answer, payment, backend upload/i)).toBeInTheDocument()
    expect(screen.getByText('Context carried')).toBeInTheDocument()
    expect(screen.getAllByText('Sample history packet').length).toBeGreaterThan(0)
    expect(screen.getByText(/Private question attached: Does the trader become a different operator near the drawdown line/i)).toBeInTheDocument()
    expect(screen.getByText('Next proof required')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO DEMO DECISION PACKET')).toBeInTheDocument()
    expect(screen.getByText('GO: CONTEXT CARRIED')).toBeInTheDocument()
    expect(screen.getByText('Open with the carried private question, then show only the sample operating loop.')).toBeInTheDocument()
    expect(screen.getByText(/We are carrying one question forward: Does the trader become a different operator near the drawdown line/i)).toBeInTheDocument()
    expect(screen.getByText('The evidence label is stated out loud: Sample history packet.')).toBeInTheDocument()
    expect(screen.getByText('The locked private question is framed as what live data must prove.')).toBeInTheDocument()
    expect(screen.getByText('The public report context was carried into the demo as routing context.')).toBeInTheDocument()
    expect(screen.getByText('The private workspace can preview the question live data must prove.')).toBeInTheDocument()
    expect(screen.getByText('Do not say Shibuya has analyzed the visitor real trades from this demo.')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO OBJECTION MAP')).toBeInTheDocument()
    expect(screen.getByText('No. The demo carried Sample history packet from the public journey into a sample workspace.')).toBeInTheDocument()
    expect(screen.getByText('End on append proof: the carried private question remains unanswered until the next real upload can confirm or reject it.')).toBeInTheDocument()
    expect(screen.getByText('Connect the public pain to the private module')).toBeInTheDocument()
    expect(screen.getAllByText(/The report handed us one question/i).length).toBeGreaterThan(0)
    expect(screen.getByText('Origin report: free-report-123')).toBeInTheDocument()
    expect(screen.getByText('Receipt id: reset-pro-demo:india:free-report:free-report-123:priya:drawdown-pressure:highest-cost-state')).toBeInTheDocument()
    expect(screen.getByText(/Presenter code opened sample Reset Pro access only/i)).toBeInTheDocument()
    expect(screen.getByText('Public archetype: Priya: Prop evaluation survivor')).toBeInTheDocument()
    expect(screen.getByText('Predicted axis: Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText('Public packet source: sample')).toBeInTheDocument()
    expect(screen.getByText('Handoff evidence: Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Validation note: Demo packet accepted/i)).toBeInTheDocument()
    expect(screen.getByText('Story handoff: guided')).toBeInTheDocument()
    expect(screen.getByText('Story scenes before upload: 4')).toBeInTheDocument()
    expect(screen.getByText('Public pain axes: Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getAllByText('Private gate checksum: source=free_report; report=free-report-123; section=highest-cost-state | archetype=priya; axis=drawdown_pressure | story=guided; scene_count=4; pain_axes=drawdown_pressure; signals=mirror_selected,upload_intent | sample route, not live answer').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Engagement receipt: 2 report view(s), 1 locked click(s), 1 gate attempt(s)').length).toBeGreaterThan(0)
    expect(screen.getByText('Engagement boundary: Report engagement is local route continuity only; it does not prove payment, backend normalization, raw trades, or account-specific improvement.')).toBeInTheDocument()
    expect(screen.getByText('Requested private insight: Highest-cost state')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO BRIDGE RECEIVED')).toBeInTheDocument()
    expect(screen.getByText('Reset Pro should decide whether pressure changes the account before the breach.')).toBeInTheDocument()
    expect(screen.getAllByText('Does the trader become a different operator near the drawdown line?').length).toBeGreaterThan(0)
    expect(screen.getByText('QUESTION TO PROVE')).toBeInTheDocument()
    expect(screen.getByText('Live Reset Pro must prove')).toBeInTheDocument()
    expect(screen.getByText('Private demo may show')).toBeInTheDocument()
    expect(screen.getByText('Whether size, exit timing, or re-entry changes when rulebook pressure rises.')).toBeInTheDocument()
    expect(screen.getByText('How a prop-style drawdown warning becomes a pre-session operating constraint.')).toBeInTheDocument()
    expect(screen.getByText('Bridge question: Does the trader become a different operator near the drawdown line?')).toBeInTheDocument()
    expect(screen.getByText('Use carried public context as the opening brief, not as account proof.')).toBeInTheDocument()
    expect(screen.getByText('RESET PRO CLOSE CONTRACT')).toBeInTheDocument()
    expect(screen.getByText('The public report context can travel into a controlled Reset Pro sample workflow and end at the upload/append proof path.')).toBeInTheDocument()
    expect(screen.getByText('A live activated account must append real history before answering: Does the trader become a different operator near the drawdown line?')).toBeInTheDocument()
    expect(screen.getAllByText('Show the surface as sample workflow answering the carried private question.').length).toBeGreaterThan(0)
    expect(screen.getByText('RESET PRO PROOF LADDER')).toBeInTheDocument()
    expect(screen.getByText('Story handoff: guided; scenes 4; axes Drawdown Pressure.')).toBeInTheDocument()
    expect(screen.getByText('Sample history packet from sample.')).toBeInTheDocument()
    expect(screen.getAllByText('Does the trader become a different operator near the drawdown line?').length).toBeGreaterThan(1)
    expect(screen.getByText('The question is allowed in a demo. The answer is locked until live proof exists.')).toBeInTheDocument()
    expect(screen.getByText('This proves product structure, not account-specific trader truth.')).toBeInTheDocument()
    expect(screen.getAllByText(/Report, archetype, axis, evidence label/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/not proof that the sample account belongs to the visitor/i).length).toBeGreaterThan(0)
  })
})
