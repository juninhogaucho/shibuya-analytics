import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/routes'
import { AppProviders } from './app/providers'

function App() {
  return (
    <div className="app-shell">
      <AppProviders>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProviders>
    </div>
  )
}

export default App
