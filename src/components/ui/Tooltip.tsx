import { useState, useRef, useEffect, useLayoutEffect, type PropsWithChildren, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

// Use useLayoutEffect on client, useEffect for SSR
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

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

// Info Popup - A click-to-open popup box that never gets cut off
interface InfoPopupProps {
  content: string | React.ReactNode
  title?: string
  size?: number
}

export function InfoPopup({ content, title, size = 14 }: InfoPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLSpanElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Use layout effect for DOM measurements to avoid visual jank
  useIsomorphicLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      
      // Calculate optimal position
      let x = rect.left + rect.width / 2
      let y = rect.top - 10
      
      // Ensure popup doesn't go off-screen
      const popupWidth = 320
      const popupHeight = 200
      
      // Adjust horizontal position
      if (x - popupWidth / 2 < 20) x = popupWidth / 2 + 20
      if (x + popupWidth / 2 > viewportWidth - 20) x = viewportWidth - popupWidth / 2 - 20
      
      // If not enough space above, show below
      if (y - popupHeight < 20) {
        y = rect.bottom + popupHeight / 2 + 20
      }
      
      setPosition({ x, y })
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <>
      <span
        ref={triggerRef}
        className="info-icon"
        style={{ width: size, height: size }}
        tabIndex={0}
        role="button"
        aria-label="More information"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </span>
      
      {isOpen && createPortal(
        <div className="info-popup-overlay" onClick={() => setIsOpen(false)}>
          <div 
            ref={popupRef}
            className="info-popup-box"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -100%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="info-popup-close" 
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            
            {title && <div className="info-popup-title">{title}</div>}
            <div className="info-popup-content">{content}</div>
            
            <div className="info-popup-footer">
              <button className="info-popup-dismiss" onClick={() => setIsOpen(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// Legacy InfoTooltip - now uses InfoPopup for better UX
interface InfoTooltipProps {
  content: string | React.ReactNode
  title?: string
  size?: number
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function InfoTooltip({ content, title, size = 14 }: InfoTooltipProps) {
  // Use the new popup-based system for all info tooltips
  return <InfoPopup content={content} title={title} size={size} />
}
