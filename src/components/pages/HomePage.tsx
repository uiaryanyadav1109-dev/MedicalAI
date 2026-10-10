import React from 'react';
import { RoutePath } from '../../types';
import { HeroSection } from '../sections/HeroSection';
import { TrustStrip } from '../sections/TrustStrip';
import { ProblemSolutionSection } from '../sections/ProblemSolutionSection';
import { CoreCapabilitiesSection } from '../sections/CoreCapabilitiesSection';
import { ClinicalIntelligenceShowcase } from '../sections/ClinicalIntelligenceShowcase';
import { EmergencySafetySection } from '../sections/EmergencySafetySection';
import { AudienceTabsSection } from '../sections/AudienceTabsSection';
import { EvidenceSection } from '../sections/EvidenceSection';
import { FaqSection } from '../sections/FaqSection';
import { DownloadAppSection } from '../sections/DownloadAppSection';
import { FinalCtaSection } from '../sections/FinalCtaSection';

interface HomePageProps {
  onOpenAssessment: () => void;
  onNavigate: (route: RoutePath) => void;
  onOpenDownloadModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenAssessment,
  onNavigate,
  onOpenDownloadModal
}) => {
  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <HeroSection onOpenAssessment={onOpenAssessment} onNavigate={onNavigate} />

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3. Problem / Solution Comparison */}
      <ProblemSolutionSection />

      {/* 4. Core Capabilities Overview */}
      <CoreCapabilitiesSection onNavigate={onNavigate} onOpenAssessment={onOpenAssessment} />

      {/* 5. Interactive Clinical Intelligence Showcase */}
      <ClinicalIntelligenceShowcase onNavigate={onNavigate} onOpenAssessment={onOpenAssessment} />

      {/* 6. Emergency Safety Section (Prominent Red Flag Interceptor) */}
      <EmergencySafetySection />

      {/* 7. Designed for Both Patients & Clinicians */}
      <AudienceTabsSection onNavigate={onNavigate} onOpenAssessment={onOpenAssessment} />

      {/* 8. Download Our Native Android Mobile App with Live QR */}
      <DownloadAppSection onOpenDownloadModal={onOpenDownloadModal} />

      {/* 9. Clinical Evidence & Governance */}
      <EvidenceSection />

      {/* 10. Frequently Asked Questions */}
      <FaqSection />

      {/* 11. Final Call to Action */}
      <FinalCtaSection onOpenAssessment={onOpenAssessment} onNavigate={onNavigate} />
    </div>
  );
};
