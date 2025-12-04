import { useState, useEffect } from 'react'

interface Step {
  title: string
  description: string
  icon: string
}

const ONBOARDING_STEPS: Step[] = [
  {
    title: 'See Your Reality',
    description: 'Your Dashboard shows the "Discipline Tax" - money you earned then gave back through emotional trading. This is usually the biggest leak in any account.',
    icon: '💸',
  },
  {
    title: 'Understand Your Edges',
    description: 'The Edge Portfolio shows which of your setups are making money (PRIME), which are break-even (STABLE), and which are bleeding your account (DECAYED).',
    icon: '💎',
  },
  {
    title: 'Get Prescriptions',
    description: 'During drawdowns, we suggest specific constraints based on your patterns: max trades per day, pairs to avoid, and cooldown periods to protect your capital.',
    icon: '💊',
  },
  {
    title: 'Track Your Progress',
    description: 'The Alerts page shows your behavioral patterns over time. Are you improving? Getting worse? The data doesn\'t lie.',
    icon: '📈',
  },
]

const STORAGE_KEY = 'shibuya_onboarding_seen'

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeen = localStorage.getItem(STORAGE_KEY)
    const isDemoMode = localStorage.getItem('shibuya_api_key') === 'shibuya_demo_mode'
    
    // Show modal for demo mode or new users
    if (!hasSeen || isDemoMode) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setIsOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
  }

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) return null

  const step = ONBOARDING_STEPS[currentStep]
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content welcome-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>
        
        <div className="welcome-header">
          <span className="welcome-badge">Welcome to Shibuya</span>
          <h2>Here's what you'll find</h2>
        </div>

        <div className="onboarding-step">
          <span className="step-icon">{step.icon}</span>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>

        <div className="step-indicators">
          {ONBOARDING_STEPS.map((_, idx) => (
            <span 
              key={idx} 
              className={`step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
              onClick={() => setCurrentStep(idx)}
            />
          ))}
        </div>

        <div className="modal-actions">
          {currentStep > 0 && (
            <button className="btn btn-secondary" onClick={handlePrev}>
              ← Back
            </button>
          )}
          <button className="btn btn-primary" onClick={handleNext}>
            {isLastStep ? 'Get Started' : 'Next →'}
          </button>
        </div>

        <p className="skip-link-text">
          <button className="btn-link" onClick={handleClose}>
            Skip tour
          </button>
        </p>
      </div>
    </div>
  )
}
