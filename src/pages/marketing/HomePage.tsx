import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from '../../components/landing/Preloader';
import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import StatsGrid from '../../components/landing/StatsGrid';
import Methodology from '../../components/landing/Methodology';
import HowItWorks from '../../components/landing/HowItWorks';
import DashboardPreview from '../../components/landing/DashboardPreview';
import FAQ from '../../components/landing/FAQ';
import Footer from '../../components/landing/Footer';
import CustomCursor from '../../components/landing/CustomCursor';

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already seen preloader in this session
    const hasSeenPreloader = sessionStorage.getItem('shibuya_preloader_shown');
    if (hasSeenPreloader) {
      setIsLoading(false);
    }
  }, []);

  const handlePreloaderComplete = () => {
    sessionStorage.setItem('shibuya_preloader_shown', 'true');
    setIsLoading(false);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader key="preloader" onComplete={handlePreloaderComplete} />}
      </AnimatePresence>
      
      {!isLoading && (
        <div className="min-h-screen bg-[#050505] text-white landing-page">
          <CustomCursor />
          <Navbar />
          <Hero />
          <StatsGrid />
          <Methodology />
          <HowItWorks />
          <DashboardPreview />
          <FAQ />
          <Footer />
        </div>
      )}
    </>
  );
};

export default HomePage;
