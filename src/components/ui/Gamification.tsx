interface BadgeProps {
  type: 'streak' | 'achievement' | 'level' | 'milestone'
  label: string
  value?: string | number
  icon?: string
  color?: 'gold' | 'silver' | 'bronze' | 'primary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export function Badge({ 
  type, 
  label, 
  value, 
  icon, 
  color = 'primary',
  size = 'md',
  animated = false 
}: BadgeProps) {
  const colorClasses = {
    gold: 'badge--gold',
    silver: 'badge--silver',
    bronze: 'badge--bronze',
    primary: 'badge--primary',
    success: 'badge--success',
    danger: 'badge--danger',
  }

  const sizeClasses = {
    sm: 'badge--sm',
    md: 'badge--md',
    lg: 'badge--lg',
  }

  return (
    <div className={`
      gamification-badge 
      badge--${type}
      ${colorClasses[color]}
      ${sizeClasses[size]}
      ${animated ? 'badge--animated' : ''}
    `}>
      {icon && <span className="badge-icon">{icon}</span>}
      <div className="badge-content">
        <span className="badge-label">{label}</span>
        {value !== undefined && <span className="badge-value">{value}</span>}
      </div>
    </div>
  )
}

// Streak counter with fire animation
interface StreakCounterProps {
  days: number
  best: number
  label?: string
}

export function StreakCounter({ days, best, label = 'Discipline Streak' }: StreakCounterProps) {
  const isOnFire = days >= 5
  const isNewRecord = days >= best && days > 0

  return (
    <div className={`streak-counter ${isOnFire ? 'on-fire' : ''} ${isNewRecord ? 'new-record' : ''}`}>
      <div className="streak-flame">
        {isOnFire ? '🔥' : '📊'}
      </div>
      <div className="streak-info">
        <span className="streak-days">{days}</span>
        <span className="streak-label">{label}</span>
      </div>
      <div className="streak-best">
        <span className="best-label">Best</span>
        <span className="best-value">{best}</span>
      </div>
      {isNewRecord && (
        <div className="streak-celebration">
          <span className="celebration-badge">🏆 NEW RECORD!</span>
        </div>
      )}
    </div>
  )
}

// Progress ring for achievements
interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  showPercent?: boolean
}

export function ProgressRing({ 
  progress, 
  size = 80, 
  strokeWidth = 8,
  color = 'var(--color-primary)',
  label,
  showPercent = true
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring">
        <circle
          className="progress-ring-bg"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-ring-fill"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
      </svg>
      <div className="progress-ring-content">
        {showPercent && <span className="progress-percent">{Math.round(progress)}%</span>}
        {label && <span className="progress-label">{label}</span>}
      </div>
    </div>
  )
}

// Achievement unlock notification
interface AchievementUnlockProps {
  title: string
  description: string
  icon: string
  onDismiss?: () => void
}

export function AchievementUnlock({ title, description, icon, onDismiss }: AchievementUnlockProps) {
  return (
    <div className="achievement-unlock">
      <div className="achievement-glow" />
      <div className="achievement-content">
        <span className="achievement-icon">{icon}</span>
        <div className="achievement-text">
          <span className="achievement-title">{title}</span>
          <span className="achievement-desc">{description}</span>
        </div>
        {onDismiss && (
          <button className="achievement-dismiss" onClick={onDismiss}>×</button>
        )}
      </div>
    </div>
  )
}

// Level indicator
interface LevelIndicatorProps {
  level: number
  xp: number
  xpToNext: number
  title: string
}

export function LevelIndicator({ level, xp, xpToNext, title }: LevelIndicatorProps) {
  const progress = (xp / xpToNext) * 100

  return (
    <div className="level-indicator">
      <div className="level-badge">
        <span className="level-number">{level}</span>
      </div>
      <div className="level-info">
        <span className="level-title">{title}</span>
        <div className="level-progress">
          <div className="level-bar">
            <div className="level-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="level-xp">{xp}/{xpToNext} XP</span>
        </div>
      </div>
    </div>
  )
}
