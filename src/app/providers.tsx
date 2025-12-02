import { type PropsWithChildren, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '../context/ThemeContext'
import { ErrorBoundary } from '../components/ErrorBoundary'

let queryClient: QueryClient | null = null

const getClient = () => {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
          staleTime: 60 * 1000,
        },
      },
    })
  }
  return queryClient
}

export function AppProviders({ children }: PropsWithChildren) {
  const client = useMemo(() => getClient(), [])
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
