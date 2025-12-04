import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { AuthGuard } from '../components/AuthGuard'
import { HomePage } from '../pages/marketing/HomePage'
import { ActivationPage } from '../pages/marketing/ActivationPage'
import { CheckoutPage } from '../pages/marketing/CheckoutPage'
import { TermsPage } from '../pages/marketing/TermsPage'
import { PrivacyPage } from '../pages/marketing/PrivacyPage'
import { DashboardOverviewPage } from '../pages/dashboard/OverviewPage'
import { TradeHistoryPage } from '../pages/dashboard/TradeHistoryPage'
import { AlertsPage } from '../pages/dashboard/AlertsPage'
import { SlumpPrescriptionPage } from '../pages/dashboard/SlumpPrescriptionPage'
import { EdgePortfolioPage } from '../pages/dashboard/EdgePortfolioPage'
import { NotFoundPage } from '../pages/marketing/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        {/* /pricing redirects to landing page pricing section */}
        <Route path="/pricing" element={<HomePage />} />
        <Route path="/activate" element={<ActivationPage />} />
        <Route path="/checkout/:planId" element={<CheckoutPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>

      <Route element={
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      }>
        <Route path="/dashboard" element={<DashboardOverviewPage />} />
        <Route path="/dashboard/history" element={<TradeHistoryPage />} />
        <Route path="/dashboard/alerts" element={<AlertsPage />} />
        <Route path="/dashboard/slump" element={<SlumpPrescriptionPage />} />
        <Route path="/dashboard/edges" element={<EdgePortfolioPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
