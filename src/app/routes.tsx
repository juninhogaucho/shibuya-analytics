import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { AuthGuard } from '../components/AuthGuard'
import HomePage from '../pages/marketing/HomePage'
import { SolutionsPage } from '../pages/marketing/SolutionsPage'
import { ActivationPage } from '../pages/marketing/ActivationPage'
import { LoginPage } from '../pages/marketing/LoginPage'
import CheckoutPage from '../pages/checkout/CheckoutPage'
import CheckoutSuccessPage from '../pages/checkout/CheckoutSuccessPage'
import { TermsPage } from '../pages/marketing/TermsPage'
import { PrivacyPage } from '../pages/marketing/PrivacyPage'
import { DashboardOverviewPage } from '../pages/dashboard/OverviewPage'
import { TradeHistoryPage } from '../pages/dashboard/TradeHistoryPage'
import { AlertsPage } from '../pages/dashboard/AlertsPage'
import { SlumpPrescriptionPage } from '../pages/dashboard/SlumpPrescriptionPage'
import { EdgePortfolioPage } from '../pages/dashboard/EdgePortfolioPage'
import { ShadowBoxingPage } from '../pages/dashboard/ShadowBoxingPage'
import { AppendTradesPage } from '../pages/dashboard/AppendTradesPage'
import { NotFoundPage } from '../pages/marketing/NotFoundPage'
import PricingPage from '../pages/marketing/PricingPage'

export function AppRoutes() {
  return (
    <Routes>
      {/* HomePage has its own Navbar/Footer - render standalone */}
      <Route path="/" element={<HomePage />} />
      
      <Route element={<PublicLayout />}>
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/activate" element={<ActivationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkout/:plan" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
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
        <Route path="/dashboard/shadow-boxing" element={<ShadowBoxingPage />} />
        <Route path="/dashboard/upload" element={<AppendTradesPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
