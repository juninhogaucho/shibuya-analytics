import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { AuthGuard } from '../components/AuthGuard'
import { HomePage } from '../pages/marketing/HomePage'
import { PricingPage } from '../pages/marketing/PricingPage'
import { EnterprisePage } from '../pages/marketing/EnterprisePage'
import { ActivationPage } from '../pages/marketing/ActivationPage'
import { CheckoutPage } from '../pages/marketing/CheckoutPage'
import { DashboardOverviewPage } from '../pages/dashboard/OverviewPage'
import { AppendTradesPage } from '../pages/dashboard/AppendTradesPage'
import { AlertsPage } from '../pages/dashboard/AlertsPage'
import { SlumpPrescriptionPage } from '../pages/dashboard/SlumpPrescriptionPage'
import { EdgePortfolioPage } from '../pages/dashboard/EdgePortfolioPage'
import { ShadowBoxingPage } from '../pages/dashboard/ShadowBoxingPage'
import { NotFoundPage } from '../pages/marketing/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/enterprise" element={<EnterprisePage />} />
        <Route path="/activate" element={<ActivationPage />} />
        <Route path="/checkout/:planId" element={<CheckoutPage />} />
      </Route>

      <Route element={
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      }>
        <Route path="/dashboard" element={<DashboardOverviewPage />} />
        <Route path="/dashboard/append" element={<AppendTradesPage />} />
        <Route path="/dashboard/alerts" element={<AlertsPage />} />
        <Route path="/dashboard/slump" element={<SlumpPrescriptionPage />} />
        <Route path="/dashboard/edges" element={<EdgePortfolioPage />} />
        <Route path="/dashboard/shadow-boxing" element={<ShadowBoxingPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
