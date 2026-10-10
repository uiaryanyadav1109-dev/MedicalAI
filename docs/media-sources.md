# Media Sources & Asset Licenses

This document registers all visual media, typography, iconography, and graphic asset sources used within the Medical AI application, in strict accordance with clinical integrity and license transparency requirements.

## 1. Iconography
- **Asset**: Lucide Icons (React SVG Icons)
- **Source**: [Lucide Project](https://lucide.dev/)
- **License**: ISC License / Open Source
- **Usage**: Standard interface navigation, clinical alerts, status markers, vital sign glyphs.

## 2. Typography
- **Asset**: Plus Jakarta Sans & JetBrains Mono
- **Source**: Google Fonts
- **License**: SIL Open Font License 1.1
- **Usage**: Primary clinical UI text, monospace medical records, and ID numbers.

## 3. Patient Identity & Profile Images
- **Policy**: **STRICT ANTI-AI GENERATION POLICY ENFORCED**. No AI-generated fake human faces, fictitious doctors, or synthetic patient photographs are utilized.
- **Implementation**: 
  1. **User-Uploaded Photography**: Patients may upload their genuine photograph via the local device File API (`image/png`, `image/jpeg`, `image/webp`). Stored securely in client-scoped session/local state without third-party server exposure.
  2. **Neutral Clinical Monogram Placeholders**: When no user photo is uploaded, a deterministic neutral initials avatar (e.g. `AY` for Aryan Yadav, `AM` for Alex Morgan) rendered with clean clinical contrast is displayed.
- **License**: User-provided content under HIPAA/GDPR fair use and personal access controls.

## 4. Machine-Readable QR Generation
- **Library**: `qrcode` (Node & Browser standard QR Code generator)
- **License**: MIT License
- **Usage**: Generating genuine ISO/IEC 18004 compliant 2D barcodes encoding ephemeral cryptographic sharing URLs (`/share/:token`) for emergency first responders and attending physicians.
