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
    expect(screen.getByText('RESET PRO OPERATOR STRIP')).toBeInTheDocument()
    expect(screen.getByText('One guided path after unlock. No dashboard wandering.')).toBeInTheDocument()
    expect(screen.getByText(/The deeper cards below are supporting evidence/i)).toBeInTheDocument()
    expect(screen.getByText('DEMO CLAIM LEDGER')).toBeInTheDocument()
    expect(screen.getByText('What the presenter may say, and what stays forbidden.')).toBeInTheDocument()
    expect(screen.getByText('Allowed claims')).toBeInTheDocument()
    expect(screen.getByText('Forbidden claims')).toBeInTheDocument()
    expect(screen.getByText('This is a controlled sample workspace showing the Reset Pro operating loop.')).toBeInTheDocument()
    expect(screen.getByText('This is a direct private demo without a public report handoff.')).toBeInTheDocument()
    expect(screen.getByText('Do not say the sample account belongs to the visitor.')).toBeInTheDocument()
    expect(screen.getByText('Do not promise profit improvement, challenge pass rates, or drawdown reduction.')).toBeInTheDocument()
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
            archetypeLabel: 'Priya: Prop evaluation survivor',
            axisLabel: 'Drawdown Pressure',
            reportSource: 'sample',
            evidenceLabel: 'Sample history packet',
            validationSummary: 'Demo packet accepted. This proves the public journey transition, not live analytics.',
            storySource: 'guided',
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
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Carried in from the public report')).toBeInTheDocument()
    expect(screen.getByText('The public report context was carried into the demo as routing context.')).toBeInTheDocument()
    expect(screen.getByText('The private workspace can preview the question live data must prove.')).toBeInTheDocument()
    expect(screen.getByText('Do not say Shibuya has analyzed the visitor real trades from this demo.')).toBeInTheDocument()
    expect(screen.getByText('Connect the public pain to the private module')).toBeInTheDocument()
    expect(screen.getAllByText(/The report handed us one question/i).length).toBeGreaterThan(0)
    expect(screen.getByText('Origin report: free-report-123')).toBeInTheDocument()
    expect(screen.getByText('Public archetype: Priya: Prop evaluation survivor')).toBeInTheDocument()
    expect(screen.getByText('Predicted axis: Drawdown Pressure')).toBeInTheDocument()
    expect(screen.getByText('Public packet source: sample')).toBeInTheDocument()
    expect(screen.getByText('Handoff evidence: Sample history packet')).toBeInTheDocument()
    expect(screen.getByText(/Validation note: Demo packet accepted/i)).toBeInTheDocument()
    expect(screen.getByText('Story handoff: guided')).toBeInTheDocument()
    expect(screen.getByText('Story scenes before upload: 4')).toBeInTheDocument()
    expect(screen.getByText('Public pain axes: Drawdown Pressure')).toBeInTheDocument()
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
