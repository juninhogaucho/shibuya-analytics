import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import StatsGrid from './components/landing/StatsGrid';
import Methodology from './components/landing/Methodology';
import HowItWorks from './components/landing/HowItWorks';
import DashboardPreview from './components/landing/DashboardPreview';
import PricingPage from './pages/marketing/PricingPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import CheckoutSuccessPage from './pages/checkout/CheckoutSuccessPage';
import { TermsPage } from './pages/marketing/TermsPage';
import { PrivacyPage } from './pages/marketing/PrivacyPage';
import FAQ from './components/landing/FAQ';
import Footer from './components/landing/Footer';
import Preloader from './components/landing/Preloader';
import WaitlistPopup from './components/landing/WaitlistPopup';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardOverviewPage } from './pages/dashboard/OverviewPage';
import { TradeHistoryPage } from './pages/dashboard/TradeHistoryPage';
import { AlertsPage } from './pages/dashboard/AlertsPage';
import { SlumpPrescriptionPage } from './pages/dashboard/SlumpPrescriptionPage';
import { EdgePortfolioPage } from './pages/dashboard/EdgePortfolioPage';
import { AnimatePresence } from 'framer-motion';

const Home = () => {
  const [showWaitlist, setShowWaitlist] = useState(false);

  return (
    <div className="min-h-screen relative font-sans bg-[#030304] selection:bg-indigo-500/30">
      <Navbar />
      <main>
        <Hero />
        <StatsGrid />
        <Methodology />
        <HowItWorks />
        <DashboardPreview />
        <FAQ />
      </main>
      <Footer />
      <WaitlistPopup isOpen={showWaitlist} onClose={() => setShowWaitlist(false)} />
    </div>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      {!loading && (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={
            <div className="min-h-screen relative font-sans bg-[#030304] selection:bg-indigo-500/30">
              <Navbar />
              <PricingPage />
              <Footer />
            </div>
          } />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverviewPage />} />
            <Route path="history" element={<TradeHistoryPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="slump" element={<SlumpPrescriptionPage />} />
            <Route path="edges" element={<EdgePortfolioPage />} />
          </Route>
          <Route path="/checkout/:plan" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/terms" element={
            <div className="min-h-screen relative font-sans bg-[#030304] selection:bg-indigo-500/30">
              <Navbar />
              <TermsPage />
              <Footer />
            </div>
          } />
          <Route path="/privacy" element={
            <div className="min-h-screen relative font-sans bg-[#030304] selection:bg-indigo-500/30">
              <Navbar />
              <PrivacyPage />
              <Footer />
            </div>
          } />
        </Routes>
      )}
    </>
  );
};

export default App;