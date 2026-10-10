# Search Engine Optimization (SEO) & Structured Data

## 1. Title & Meta Descriptions
- **Primary Title**: `Medical AI — AI-Assisted Clinical Intelligence & Preliminary Triage`
- **Primary Meta Description**: `Understand your health. Prepare better. Get the right care. Medical AI provides preliminary triage, clinical interview context, report analysis, and doctor handoff preparation.`

## 2. Social Graph Metadata
- **OpenGraph**:
  - `og:type`: `website`
  - `og:site_name`: `Medical AI`
  - `og:title`: `Medical AI — AI-Assisted Clinical Intelligence & Preliminary Triage`
  - `og:description`: `Understand your health. Prepare better. Get the right care. Medical AI helps organize health context, analyze reports, and prepare for doctor visits.`
- **Twitter Card**:
  - `twitter:card`: `summary_large_image`
  - `twitter:title`: `Medical AI — AI-Assisted Clinical Intelligence & Preliminary Triage`

## 3. Schema.org Structured Data (JSON-LD)
Embedded directly in `<head>` via index.html:
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Medical AI",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "All",
  "description": "AI-assisted clinical intelligence, preliminary triage, medical report analysis, and structured doctor handoffs.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```
