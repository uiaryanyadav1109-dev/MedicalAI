# Component Architecture

The codebase follows a modular hierarchy separating layouts, interactive sandboxes, marketing sections, and page compositions:

```
src/
├── types/
│   └── index.ts               # Shared interfaces (RoutePath, TriageCategory, LabResultItem, etc.)
├── data/
│   ├── features.ts            # Product feature roster & matrix data
│   ├── reports.ts             # Illustrative CBC laboratory panel sample
│   ├── timeline.ts            # Illustrative historical patient narrative & vitals
│   ├── triage.ts              # 5-tier clinical triage taxonomy
│   └── faq.ts                 # 12 medical & platform FAQ items
├── services/
│   └── authService.ts         # Centralized authentication service, validation & criteria checks
├── components/
│   ├── auth/
│   │   ├── AuthHeader.tsx     # Simplified 1-row header for auth pages
│   │   ├── AuthFooter.tsx     # Minimal legal & security footer for auth pages
│   │   ├── AuthVisualPanel.tsx# Left-side healthcare architecture visual panel (desktop)
│   │   └── GoogleOAuthModal.tsx # Google OAuth configuration status dialog
│   ├── layout/
│   │   ├── Navbar.tsx         # Sticky top-bar strictly following 3-zone contract
│   │   ├── Footer.tsx         # Global footer with legal notices & medical disclaimer
│   │   └── MedicalDisclaimerBanner.tsx # Prominent dismissible top banner
│   ├── ui/
│   │   └── SectionHeader.tsx  # Editorial section header with balanced typography
│   ├── interactive/
│   │   ├── AssessmentDemoModal.tsx     # 4-step preliminary triage assessment sandbox
│   │   ├── ConsultationPreview.tsx     # Interactive conversational intake simulation
│   │   ├── ReportAnalyzerPreview.tsx   # Interactive CBC laboratory translator
│   │   ├── VitalsChartPreview.tsx      # SVG trend graphs for blood pressure & pulse
│   │   ├── TimelinePreview.tsx         # Chronological health narrative with category filters
│   │   ├── DoctorHandoffPreview.tsx    # 1-page clinical HPI summary with copy/review
│   │   ├── VoiceWaveformPreview.tsx    # Multimodal acoustic voice intake stream
│   │   ├── MultilingualSelector.tsx    # English, Hindi, Bengali, Hinglish switcher
│   │   ├── QrSharePreview.tsx          # Ephemeral tokenized QR sharing with expiry
│   │   ├── DigitalPatientIdPreview.tsx # Digital patient credential preview
│   │   └── TriageScalePreview.tsx      # Interactive 5-tier care timing breakdown
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── TrustStrip.tsx
│   │   ├── ProblemSolutionSection.tsx
│   │   ├── CoreCapabilitiesSection.tsx
│   │   ├── EmergencySafetySection.tsx
│   │   ├── MedicationIntelligenceSection.tsx
│   │   ├── SafetyLimitsSection.tsx
│   │   ├── EvidenceSection.tsx
│   │   ├── PrivacySecuritySection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── FeatureMatrixSection.tsx
│   │   ├── AudienceTabsSection.tsx
│   │   ├── FaqSection.tsx
│   │   └── FinalCtaSection.tsx
│   └── pages/                 # Full-page compositions for all 16 routes
└── App.tsx                    # Root routing shell & modal controller
```
