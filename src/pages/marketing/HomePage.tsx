import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import StoryExperience from '../../components/landing/StoryExperience';
import Footer from '../../components/landing/Footer';
import {
  captureAffiliateAttributionFromLocation,
  getPreferredAffiliateCode,
  markAffiliateClickTracked,
  wasAffiliateClickTracked,
} from '../../lib/affiliateAttribution';
import { trackAffiliateClick } from '../../lib/api/checkout';
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
      <Navbar />
      <StoryExperience />
      <Footer />
    </div>
  );
};

export default HomePage;
