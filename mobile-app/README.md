# Medical AI Patient Portal — Native Android Application

This directory contains the complete, standalone **React Native (Expo)** mobile application for the **Medical AI Patient Portal**. It is **not** a WebView wrapper; it is a full native healthcare application with direct access to device hardware (GPS, notifications, camera, local secure storage) connected directly to the shared Medical AI backend.

---

## 🏛 Architecture & Authoritative Shared Backend

Both the **Web Portal** and this **Android Mobile App** are two genuine interfaces of the **exact same clinical system**:

```
 ┌────────────────────────────────────┐       ┌────────────────────────────────────┐
 │         Medical AI Website         │       │     Android Mobile Application     │
 │       (React + TypeScript)         │       │    (React Native + Expo Native)    │
 └─────────────────┬──────────────────┘       └─────────────────┬──────────────────┘
                   │                                            │
                   ▼                                            ▼
          /api/clinical/*, /api/auth/*, /api/chat, /api/emergency/*
                                   │
                                   ▼
        ┌──────────────────────────────────────────────────────────────┐
        │            Authoritative Express Backend Server              │
        │        src/server/clinicalApi.ts, authApi.ts, chatApi.ts     │
        └──────────────────────────────┬───────────────────────────────┘
                                       │
                                       ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                 Authoritative Clinical DB                    │
        │             src/server/db/medicalDatabase.json               │
        │  (Users, Vitals, Medications, Labs, Handoffs, Emergency SOS) │
        └──────────────────────────────────────────────────────────────┘
```

- **Single Source of Truth**: All mutations (vitals logged, doses taken, SOS triggers, profile edits) immediately write to `src/server/db/medicalDatabase.json`.
- **Bidirectional Real-Time Sync**: When a patient marks their medication as taken on their Android smartphone, the web dashboard immediately reflects the dose. When a physician reviews a lab result on the website, it appears under the mobile app's "Reports" tab.
- **Identity Isolation**: The internal Medical AI Patient ID (`MAI-80429`) is strictly isolated from government identity documents. Optional government IDs are masked (`•••• 4821`) and encrypted.

---

## 📱 Mobile Screens & Capabilities

1. **Dashboard Overview (`DashboardOverviewScreen.tsx`)**: Real-time ambulatory vitals summary, active medications, next appointment, and SOS emergency banner.
2. **AI Clinical Assistant Chat (`ChatScreen.tsx`)**: Conversational clinical triage powered by Gemini with urgency detection.
3. **Vitals Monitoring (`VitalsScreen.tsx`)**: Comprehensive vitals tracking (Heart Rate, Blood Pressure, SpO2, Temperature, Glucose) with clinical validation and live logging.
4. **Medications Tracker (`MedicationsScreen.tsx`)**: Active prescription regimen with instructions, doctor attribution, and "Log Taken" adherence tracking.
5. **Emergency SOS System (`EmergencySosScreen.tsx`)**: High-visibility distress beacon with a 3-second abort countdown, real-time GPS coordinates, responder notification, and direct 112 hotline calling.
6. **Digital Patient Pass (`PatientCardScreen.tsx`)**: Interactive 3D flip card displaying patient MRN, blood type, known allergies, QR verification, and emergency contact details.
7. **Medical Reports & Diagnostics (`ReportsScreen.tsx`)**: Verified lab results, diagnostic impressions, category filtering (blood, radiology, cardiology), and offline copies.
8. **Doctor Handoff Briefing (`DoctorHandoffScreen.tsx`)**: Structured SBAR clinical summary packet and patient question checklist ready to share with attending physicians.
9. **Identity Credentials (`IdentityVerificationScreen.tsx`)**: Optional trust validation supporting Aadhaar, Passport, and Driver's License with client-side masking.
10. **Settings & Privacy Center (`SettingsScreen.tsx`)**: Push notification controls, HIPAA privacy disclosures, and live backend IP configuration.
11. **Authentication (`AuthScreen.tsx`)**: Patient sign-in and quick demo access for `Aryan Yadav`.

---

## 📦 How to Build the Downloadable Android APK

### Option A: Cloud APK Build with EAS Build (Recommended — No Android Studio Required)

Expo Application Services (EAS) builds an installable `.apk` in the cloud:

1. In the `mobile-app` directory, install dependencies:
   ```bash
   npm install
   ```
2. Log into your Expo account (free):
   ```bash
   npx eas login
   ```
3. Run the APK build command:
   ```bash
   npx eas build -p android --profile preview
   ```
4. EAS Build compiles the project into a standalone Android APK (`com.medicalai.app`).
5. Once completed, EAS outputs a direct download link and QR code in the terminal.
6. Scan the QR code or download the `.apk` file directly to your Android device!

---

### Option B: Local APK Build using Android SDK & Gradle

If you have Android Studio and the Android SDK installed on your workstation:

1. Navigate to `mobile-app`:
   ```bash
   cd mobile-app
   npm install
   ```
2. Generate the native Android project:
   ```bash
   npx expo prebuild --platform android
   ```
3. Navigate to the generated `android` directory and compile the APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   *(On Windows PowerShell: `.\gradlew assembleRelease`)*
4. The generated release APK will be located at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

---

## 📲 How to Install the APK on a Physical Android Phone

1. Transfer the `.apk` file to your Android phone (via USB cable, Google Drive, WhatsApp, or direct browser download).
2. On your Android phone, tap the downloaded `.apk` file.
3. If prompted with *"Install unknown apps"*, tap **Settings** and enable **"Allow from this source"**.
4. Tap **Install**.
5. Open **Medical AI** from your app drawer.
6. Under Settings, set the **Backend Server URL** to your computer's local Wi-Fi IP address (e.g. `http://192.168.1.15:3000/api`) so the phone can communicate with your running backend server.

---

## 🧪 Testing Cross-Platform Synchronization

To run the automated verification test demonstrating real-time synchronization between the mobile app and website:

```bash
node mobile-app/scripts/test-mobile-sync.cjs
```
