import type { CSSProperties } from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  style?: CSSProperties
}

export function Skeleton({ 
  width = '100%', 
  height = '1em', 
  borderRadius = '8px',
  className = '',
  style = {}
}: SkeletonProps) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        ...style
      }}
    />
  )
}

interface SkeletonCardProps {
  style?: CSSProperties
  className?: string
}

// Pre-made skeleton patterns for common elements
export function SkeletonCard({ style = {}, className = '' }: SkeletonCardProps) {
  return (
    <div className={`glass-panel skeleton-card ${className}`} style={style}>
      <Skeleton width="40%" height="0.8rem" className="mb-2" />
      <Skeleton width="60%" height="2rem" className="mb-2" />
      <Skeleton width="80%" height="0.9rem" />
    </div>
  )
}

export function SkeletonMetricCard() {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <Skeleton width="50%" height="0.75rem" className="mb-3" />
      <Skeleton width="70%" height="2.5rem" className="mb-2" />
      <Skeleton width="90%" height="0.85rem" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} width="80%" height="0.75rem" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {[1, 2, 3, 4].map(j => (
            <Skeleton key={j} width={`${60 + Math.random() * 30}%`} height="1rem" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonParagraph({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton-paragraph">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === lines - 1 ? '60%' : '100%'} 
          height="1rem"
          className="mb-2"
        />
      ))}
    </div>
  )
}
