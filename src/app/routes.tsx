import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { AuthGuard } from '../components/AuthGuard'

const HomePage = lazy(() => import('../pages/marketing/HomePage'))
const SolutionsPage = lazy(() => import('../pages/marketing/SolutionsPage').then((module) => ({ default: module.SolutionsPage })))
const PartnersPage = lazy(() => import('../pages/marketing/PartnersPage').then((module) => ({ default: module.PartnersPage })))
const ActivationPage = lazy(() => import('../pages/marketing/ActivationPage').then((module) => ({ default: module.ActivationPage })))
const LoginPage = lazy(() => import('../pages/marketing/LoginPage').then((module) => ({ default: module.LoginPage })))
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage'))
const CheckoutSuccessPage = lazy(() => import('../pages/checkout/CheckoutSuccessPage'))
const TermsPage = lazy(() => import('../pages/marketing/TermsPage').then((module) => ({ default: module.TermsPage })))
const PrivacyPage = lazy(() => import('../pages/marketing/PrivacyPage').then((module) => ({ default: module.PrivacyPage })))
const DashboardOverviewPage = lazy(() => import('../pages/dashboard/OverviewPage').then((module) => ({ default: module.DashboardOverviewPage })))
const TradeHistoryPage = lazy(() => import('../pages/dashboard/TradeHistoryPage').then((module) => ({ default: module.TradeHistoryPage })))
const AlertsPage = lazy(() => import('../pages/dashboard/AlertsPage').then((module) => ({ default: module.AlertsPage })))
const SlumpPrescriptionPage = lazy(() => import('../pages/dashboard/SlumpPrescriptionPage').then((module) => ({ default: module.SlumpPrescriptionPage })))
const EdgePortfolioPage = lazy(() => import('../pages/dashboard/EdgePortfolioPage').then((module) => ({ default: module.EdgePortfolioPage })))
const ShadowBoxingPage = lazy(() => import('../pages/dashboard/ShadowBoxingPage').then((module) => ({ default: module.ShadowBoxingPage })))
const AppendTradesPage = lazy(() => import('../pages/dashboard/AppendTradesPage').then((module) => ({ default: module.AppendTradesPage })))
const NotFoundPage = lazy(() => import('../pages/marketing/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))
const PricingPage = lazy(() => import('../pages/marketing/PricingPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
      <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300">
        Loading Shibuya
      </div>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route element={<PublicLayout />}>
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/activate" element={<ActivationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/checkout/:plan" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>

        <Route
          element={(
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          )}
        >
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
    </Suspense>
  )
}
