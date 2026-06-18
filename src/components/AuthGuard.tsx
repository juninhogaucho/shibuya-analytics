import { Navigate, useLocation } from 'react-router-dom'
import { getWorkspaceAccessState } from '../lib/runtime'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()

  const access = getWorkspaceAccessState()

  if (!access.ok) {
    return <Navigate to={access.redirectPath ?? '/activate'} state={{ from: location, workspaceAccessReason: access.reason }} replace />
  }

  return <>{children}</>
}
