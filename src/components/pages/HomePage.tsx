import React from 'react';
import { RoutePath } from '../../types';
import { HeroSection } from '../sections/HeroSection';
import { CoreCapabilitiesSection } from '../sections/CoreCapabilitiesSection';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { AudienceTabsSection } from '../sections/AudienceTabsSection';
import { EmergencySafetySection } from '../sections/EmergencySafetySection';
import { PrivacySecuritySection } from '../sections/PrivacySecuritySection';
import { FaqSection } from '../sections/FaqSection';

interface HomePageProps {
  onOpenAssessment: () => void;
  onNavigate: (route: RoutePath) => void;
  onOpenDownloadModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenAssessment,
  onNavigate
}) => {
  return (
    <div className="space-y-0">
      {/* 1. Hero Section: Heading, 1-Sentence Desc, CTAs, Authentic Healthcare Image */}
      <HeroSection onOpenAssessment={onOpenAssessment} onNavigate={onNavigate} />

      {/* 2. Essential Product Features: 10 Core Capabilities with 1-Sentence Descriptions */}
      <CoreCapabilitiesSection onNavigate={onNavigate} onOpenAssessment={onOpenAssessment} />

      {/* 3. Short How It Works Section: 4-Step Visual Journey */}
      <HowItWorksSection onOpenAssessment={onOpenAssessment} onNavigate={onNavigate} />

      {/* 4. Patient and Doctor Benefits */}
      <AudienceTabsSection onNavigate={onNavigate} onOpenAssessment={onOpenAssessment} />

      {/* 5. Emergency Safety & Clinical Red-Flag Interceptors */}
      <EmergencySafetySection />

      {/* 6. Concise Privacy and Trust Section */}
      <PrivacySecuritySection onNavigate={onNavigate} />

      {/* 7. Essential FAQs */}
      <FaqSection />
    </div>
  );
};

export default HomePage;
