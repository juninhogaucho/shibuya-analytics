import React from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  headerRight?: React.ReactNode
  className?: string
  height?: number
}

export function ChartCard({ title, subtitle, children, headerRight, className = '', height = 200 }: ChartCardProps) {
  return (
    <div className={`glass-panel p-5 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerRight && (
          <div className="flex items-center gap-2">
            {headerRight}
          </div>
        )}
      </div>
      <div style={{ height }}>
        {children}
      </div>
    </div>
  )
}
