import React from 'react';
import CursorSurface from '../components/CursorSurface';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import MetricsStrip from '../components/MetricsStrip';
import FeaturesSection from '../components/FeaturesSection';
import ShowcaseSection from '../components/ShowcaseSection';
import HowItWorks from '../components/HowItWorks';
import AboutUsSection from '../components/AboutUsSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import './LandingPage.css';

function LandingPage({ isAuthenticated }) {
  return (
    <CursorSurface className="landing-page" variant="landing">
      <div className="landing-shell">
        <Navbar isAuthenticated={isAuthenticated} />
        <HeroSection isAuthenticated={isAuthenticated} />
        <MetricsStrip />
        <FeaturesSection />
        <ShowcaseSection />
        <HowItWorks />
        <AboutUsSection />
        <CTASection isAuthenticated={isAuthenticated} />
        <Footer />
      </div>
    </CursorSurface>
  );
}

export default LandingPage;
