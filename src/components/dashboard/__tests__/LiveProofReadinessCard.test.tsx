import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { LiveProofReadinessCard } from '../LiveProofReadinessCard'

describe('LiveProofReadinessCard', () => {
  test('renders the live proof contract and required evidence stages', () => {
    render(<LiveProofReadinessCard title="Before activation can become live proof." />)

    expect(screen.getByText('LIVE PROOF READINESS')).toBeInTheDocument()
    expect(screen.getByText('Before activation can become live proof.')).toBeInTheDocument()
    expect(screen.getByText('Backend target')).toBeInTheDocument()
    expect(screen.getByText('Activation')).toBeInTheDocument()
    expect(screen.getByText('First meaningful upload')).toBeInTheDocument()
    expect(screen.getByText('Append history')).toBeInTheDocument()
    expect(screen.getByText(/This contract separates the sample demo from the live evidence path/i)).toBeInTheDocument()
    expect(screen.getByText(/Sample routes, URL context, and presenter codes/i)).toBeInTheDocument()
  })

  test('renders live append proof only from generated account receipts', () => {
    render(
      <LiveProofReadinessCard
        title="Workspace proof state"
        apiBaseUrl="https://api.shibuya.test"
        backendConfigured
        mode="live"
        profileCompleted
        sessionMeta={{
          market: 'global',
          tier: 'reset_pro',
          offerKind: 'reset_pro_live',
          caseStatus: 'baseline_ready',
          uploadReceiptHistory: [
            {
              upload_transport: 'paste',
              trades_uploaded: 18,
              report_snapshot_id: 'snap_live_018',
              report_id: 'report_live_018',
              artifact_status: 'generated',
              append_count: 1,
              request_id: 'req_live_018',
            },
            {
              upload_transport: 'csv',
              trades_uploaded: 21,
              report_snapshot_id: 'snap_live_019',
              report_id: 'report_live_019',
              artifact_status: 'generated',
              append_count: 2,
              request_id: 'req_live_019',
            },
          ],
        }}
      />,
    )

    expect(screen.getByText('Workspace proof state')).toBeInTheDocument()
    expect(screen.getByText('APPEND PROOF READY')).toBeInTheDocument()
    expect(screen.getByText('Append proof is available from generated upload evidence.')).toBeInTheDocument()
    expect(screen.getAllByText('READY').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText(/latest upload response returned generated artifact snap_live_019/i)).toBeInTheDocument()
    expect(screen.getByText(/2 generated receipt\(s\) are available/i)).toBeInTheDocument()
  })
})
