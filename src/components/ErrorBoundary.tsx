import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service in production
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary">
          <div className="glass-panel error-panel" style={{ textAlign: 'center', maxWidth: '500px', margin: '3rem auto' }}>
            <h2>⚠️ Something went wrong</h2>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>
              The application encountered an unexpected error.
            </p>
            {this.state.error && (
              <pre style={{ 
                fontSize: '0.75rem', 
                background: 'rgba(0,0,0,0.2)', 
                padding: '0.75rem',
                borderRadius: '8px',
                textAlign: 'left',
                overflow: 'auto',
                marginBottom: '1rem'
              }}>
                {this.state.error.message}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary"
                onClick={this.handleReset}
              >
                Try Again
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
