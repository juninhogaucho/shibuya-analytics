import { useEffect, useState } from 'react'
import { getDashboardAlerts } from '../../lib/api'
import { SkeletonCard, Skeleton } from '../../components/ui/Skeleton'
import type { AlertItem } from '../../lib/types'

function getAlertIcon(type: AlertItem['type']) {
  switch (type) {
    case 'crucial_moment':
      return '🚨'
    case 'slump_warning':
      return '⚠️'
    case 'margin_of_safety':
      return '🛡️'
    default:
      return 'ℹ️'
  }
}

function getSeverityClass(severity: AlertItem['severity']) {
  switch (severity) {
    case 'high':
      return 'alert-high'
    case 'medium':
      return 'alert-medium'
    case 'low':
      return 'alert-low'
    default:
      return 'alert-info'
  }
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function AlertsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setLoading(true)
        setError(null)
        const response = await getDashboardAlerts()
        setAlerts(response.alerts)
        setUnreadCount(response.unread_count)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alerts')
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  if (loading) {
    return (
      <section className="alerts">
        <header>
          <p className="badge">⏳ Loading...</p>
          <Skeleton style={{ width: '200px', height: '2rem', marginBottom: '0.5rem', borderRadius: '6px' }} />
          <Skeleton style={{ width: '350px', height: '1rem', borderRadius: '4px' }} />
        </header>
        <div className="grid-responsive two" style={{ marginTop: '2rem' }}>
          <SkeletonCard style={{ height: '160px' }} />
          <SkeletonCard style={{ height: '160px' }} />
          <SkeletonCard style={{ height: '160px' }} />
          <SkeletonCard style={{ height: '160px' }} />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="alerts">
        <div className="error-panel glass-panel">
          <h3>⚠️ Unable to load alerts</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </section>
    )
  }

  return (
    <section className="alerts">
      <p className="badge">
        Alerts {unreadCount > 0 && <span className="unread-badge">{unreadCount} new</span>}
      </p>
      <h1>Non real-time alerts and prescriptions</h1>
      <p className="text-muted">
        Alerts trigger after each batch upload or during the Sunday coach window so you act before tilt compounds.
      </p>
      
      {alerts.length === 0 ? (
        <div className="glass-panel empty-state">
          <p>No alerts yet. Upload trades to receive coaching insights.</p>
        </div>
      ) : (
        <div className="grid-responsive two">
          {alerts.map((alert) => (
            <article 
              key={alert.id} 
              className={`glass-panel ${getSeverityClass(alert.severity)} ${alert.acknowledged ? 'acknowledged' : ''}`}
            >
              <div className="alert-header">
                <h3>
                  <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                  {alert.title}
                </h3>
                <span className="text-muted">{formatTimestamp(alert.timestamp)}</span>
              </div>
              <p>{alert.body}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
