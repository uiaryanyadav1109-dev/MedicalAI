# Website Architecture & Systems Overview

## 1. High-Level Positioning
- **Brand**: Medical AI
- **Positioning**: AI-Assisted Clinical Intelligence & Preliminary Triage
- **Tagline**: Understand your health. Prepare better. Get the right care.
- **Architectural Scope**: Public-facing corporate, product, and educational website. It provides an interactive client-side sandbox demonstrating the platform capabilities while architecturally insulating future private patient/clinician dashboards.

## 2. Information Architecture
The platform is organized into three primary operational flows:
1. **Patient Preparation Flow**: Natural language conversational intake, adaptive question clarification, plain-language laboratory analysis, longitudinal timelines, and appointment preparation.
2. **Clinical Collaboration Flow**: 1-page standardized handoff briefs (Chief Concern, HPI, Pertinent Positives/Negatives, Vitals, Medications, Questions), FHIR-compatible schemas, and zero-payload QR passes.
3. **Clinical Safety & Governance**: Deterministic red-flag interceptors, 5-tier triage taxonomy, non-prescriptive bounds, and zero-diagnostic-certainty enforcement.

## 3. Technology Stack
- **Framework**: React 19 SPA on Vite 8
- **Language**: TypeScript 5.8+ (Strict Mode)
- **Styling**: Tailwind CSS v4 with custom theme tokens
- **Typography**: Plus Jakarta Sans (Headings/Body) paired with JetBrains Mono (Data/Telemetry)
- **Icons**: Lucide React
- **Motion**: Compositor-only transforms & smooth transition curves
