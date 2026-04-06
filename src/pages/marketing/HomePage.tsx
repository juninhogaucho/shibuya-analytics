import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import ProofStack from '../../components/landing/ProofStack';
import StatsGrid from '../../components/landing/StatsGrid';
import { EngineShowcase } from '../../components/landing/EngineShowcase';
import Methodology from '../../components/landing/Methodology';
import HowItWorks from '../../components/landing/HowItWorks';
import DashboardPreview from '../../components/landing/DashboardPreview';
import FAQ from '../../components/landing/FAQ';
import Footer from '../../components/landing/Footer';
import CustomCursor from '../../components/landing/CustomCursor';
import {
  captureAffiliateAttributionFromLocation,
  getPreferredAffiliateCode,
  markAffiliateClickTracked,
  wasAffiliateClickTracked,
} from '../../lib/affiliateAttribution';
import { trackAffiliateClick } from '../../lib/api';
import { persistMarket, resolveMarket } from '../../lib/market';

const HomePage: React.FC = () => {
  const location = useLocation()
  const market = resolveMarket(location.pathname, location.search)

  useEffect(() => {
    persistMarket(market)
    const attribution = captureAffiliateAttributionFromLocation(location.pathname, location.search)
    const affiliateCode = getPreferredAffiliateCode(attribution)

    if (!affiliateCode || wasAffiliateClickTracked(affiliateCode)) {
      return
    }

    void trackAffiliateClick(affiliateCode)
      .then(() => {
        markAffiliateClickTracked(affiliateCode)
      })
      .catch(() => undefined)
  }, [location.pathname, location.search, market])

  return (
    <div className="min-h-screen bg-[#050505] text-white landing-page">
      <CustomCursor />
      <Navbar />
      <Hero />
      <ProofStack />
      <StatsGrid />
      <EngineShowcase />
      <Methodology />
      <HowItWorks />
      <DashboardPreview />
      <FAQ />
      <Footer />
    </div>
  );
};

export default HomePage;
