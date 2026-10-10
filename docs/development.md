# Development & Integration Guide

## 1. Local Development
```bash
# Start development server on port 3000
npm run dev

# Build production assets
npm run build

# Type check and lint
npx tsc --noEmit
```

## 2. Connecting Private Dashboards (Future Phase)
This website is architected to serve as the public front door. Future private modules should integrate via the following entry points:
- **Patient Dashboard**: Connected via `/signin` with `portalType === 'patient'`. Will surface private health timelines, encrypted medical lockers, and appointment booking.
- **Clinician Dashboard**: Connected via `/signin` with `portalType === 'clinician'`. Will consume FHIR intake bundles, verify QR passes, and export HPI summaries directly into Electronic Medical Record (EMR) software.
- **API Boundaries**: Use server-side proxy routes under `/api/*` for authentication tokens, ensuring no credentials or secret keys are exposed to the client bundle.
