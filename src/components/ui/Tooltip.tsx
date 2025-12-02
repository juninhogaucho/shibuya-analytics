import { useState, useRef, type PropsWithChildren, type CSSProperties } from 'react'

interface TooltipProps extends PropsWithChildren {
  content: string | React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export function Tooltip({ children, content, position = 'top', delay = 200 }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const show = () => {
    timeoutRef.current = window.setTimeout(() => setVisible(true), delay)
  }

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  const positionStyles: Record<string, CSSProperties> = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' },
  }

  return (
    <span 
      className="tooltip-wrapper"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span 
          className="tooltip-content"
          style={positionStyles[position]}
          role="tooltip"
        >
          {content}
          <span className={`tooltip-arrow tooltip-arrow--${position}`} />
        </span>
      )}
    </span>
  )
}

// Info icon that triggers tooltip
interface InfoTooltipProps {
  content: string | React.ReactNode
  size?: number
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function InfoTooltip({ content, size = 14, position = 'top' }: InfoTooltipProps) {
  return (
    <Tooltip content={content} position={position}>
      <span 
        className="info-icon" 
        style={{ width: size, height: size }}
        tabIndex={0}
        role="button"
        aria-label="More information"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </span>
    </Tooltip>
  )
}
