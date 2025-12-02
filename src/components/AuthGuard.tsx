import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../lib/api'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  
  if (!isAuthenticated()) {
    // Redirect to activation page, preserving the intended destination
    return <Navigate to="/activate" state={{ from: location }} replace />
  }
  
  return <>{children}</>
}
