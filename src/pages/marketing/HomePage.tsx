import React from 'react';
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
  return (
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
  );
};

export default HomePage;
