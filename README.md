# <img src="https://img.shields.io/badge/MedicalAI-AI%20Healthcare-0EA5E9?style=for-the-badge&logo=heart&logoColor=white" alt="MedicalAI" />

### AI-Assisted Clinical Intelligence & Preliminary Triage

<p align="center">
  <img src="https://img.shields.io/badge/Smarter_Care-Better_Access-0D9488?style=for-the-badge" alt="Smarter Care, Better Access" />
  <img src="https://img.shields.io/badge/AI-Powered-2563EB?style=for-the-badge" alt="AI Powered" />
  <img src="https://img.shields.io/badge/Healthcare-Innovation-14B8A6?style=for-the-badge" alt="Healthcare Innovation" />
</p>

<p align="center">
  An AI-assisted healthcare platform designed to make preliminary health information more accessible, support triage workflows, and organize patient information through a unified web and mobile experience.
</p>

<p align="center">
  <a href="https://github.com/uiaryanyadav1109-dev/MedicalAI">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repository" />
  </a>
  <a href="https://medicalai-1.onrender.com/">
    <img src="https://img.shields.io/badge/Live-Demo-0D9488?style=for-the-badge&logo=render&logoColor=white" alt="Live Demo" />
  </a>
</p>

---

## 🔵 01. The Problem

Healthcare information can be difficult to understand and access. Language barriers, scattered patient information, and limited access to preliminary guidance can make navigating healthcare more challenging.

- 🌐 Language differences can make health information harder to understand.
- 📂 Patient information may be scattered across different sources.
- 💬 Users may need help understanding basic health information before consulting a professional.
- ♿ Digital healthcare tools need to be accessible and easy to use.

## 🟢 02. Our Solution

MedicalAI brings together AI-assisted health conversations, patient-oriented interfaces, doctor-facing workflows, and multilingual accessibility in one platform.

Our goal is to explore how AI and full-stack development can support healthcare accessibility while keeping qualified medical professionals central to healthcare decisions.

## 🩺 03. Key Features

| Feature | Description |
|---|---|
| 🤖 AI Medical Chatbot | AI-assisted preliminary health information |
| 👤 Patient Portal | Patient-facing information and profile workflows |
| 🩺 Doctor Portal | A dedicated doctor-oriented interface |
| 🌐 Multilingual Support | Language support targeting English, Hindi, Bengali, and Hinglish |
| 🔊 Voice Assistance | Read-aloud functionality for accessibility |
| 🪪 Patient QR Codes | Patient identification and information-sharing workflows |
| 🚨 Emergency Workflow | Interface for emergency-related features |
| 📱 Mobile Support | Android and iOS project components |

<p align="center">
  <img src="https://img.shields.io/badge/Accessibility-14B8A6?style=flat-square" alt="Accessibility" />
  <img src="https://img.shields.io/badge/AI_Integration-2563EB?style=flat-square" alt="AI Integration" />
  <img src="https://img.shields.io/badge/Full_Stack-0F172A?style=flat-square" alt="Full Stack" />
</p>

*Feature availability depends on the current implementation and configuration. AI guidance does not replace professional medical care.*

---

## 🏗️ 04. System Architecture

```mermaid
flowchart TD
    A["Patient / Doctor"] --> B["React + TypeScript Frontend"]
    B --> C["Node.js + Express Backend"]
    C --> D["Chat API"]
    D --> E["Google Gemini API"]
    C --> F["Firebase Services"]
    B --> G["QR and Voice Features"]
    B --> H["Mobile Application"]

    classDef user fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A
    classDef frontend fill:#CCFBF1,stroke:#0D9488,color:#134E4A
    classDef backend fill:#E0E7FF,stroke:#4F46E5,color:#312E81
    classDef service fill:#DCFCE7,stroke:#16A34A,color:#14532D

    class A user
    class B,G,H frontend
    class C,D backend
    class E,F service
```

## 🔄 05. Application Flow

```mermaid
flowchart TD
    A(["Open MedicalAI"]) --> B{"Authenticated?"}
    B -- No --> C["Sign In / Register"]
    C --> D["Open Dashboard"]
    B -- Yes --> D

    D --> E{"Choose Feature"}
    E --> F["AI Medical Chat"]
    E --> G["Patient Information"]
    E --> H["Doctor Portal"]
    E --> I["QR / Emergency Workflow"]

    F --> J["Review Information"]
    G --> J
    H --> J
    I --> J

    classDef start fill:#0D9488,stroke:#115E59,color:#FFFFFF
    classDef decision fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A
    classDef action fill:#F0FDFA,stroke:#14B8A6,color:#134E4A

    class A start
    class B,E decision
    class C,D,F,G,H,I,J action
```

## 💻 06. Technology Stack

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-0F172A?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
</p>

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express.js |
| AI | Google Gemini API |
| Authentication & data | Firebase, where configured |
| UI & animations | Tailwind CSS, Lucide React, Motion |
| QR codes | QRCode / React QR Code |
| Version control | Git and GitHub |
| Deployment | Render configuration |
| Mobile | Android and iOS project components |

## 📁 07. Project Structure

```text
MedicalAI/
├── src/             # Application source code
├── public/          # Static assets
├── docs/            # Documentation
├── scripts/         # Utility scripts
├── android/         # Android project
├── ios/             # iOS project
├── mobile-app/      # Mobile-related files
├── server.ts        # Express server entry point
├── package.json     # Dependencies and scripts
├── vite.config.ts   # Vite configuration
├── Dockerfile       # Container configuration
└── render.yaml      # Render deployment configuration
```

## ⚙️ 08. Run Locally

**Prerequisites:** Node.js, npm, Git, and the required AI/Firebase configuration.

**1. Clone the repository**

```powershell
git clone https://github.com/uiaryanyadav1109-dev/MedicalAI.git
cd MedicalAI
```

**2. Install dependencies**

```powershell
npm ci
```

**3. Configure environment variables**

```powershell
Copy-Item .env.example .env
```

Add the required environment variables to `.env`. Never commit secret API keys to GitHub.

**4. Start the development server**

```powershell
npm run dev
```

**5. Build and start the production-style application**

```powershell
npm run build
npm start
```

Check the `/health` endpoint on the configured backend URL to verify server health.

*Note: These commands assume the repository's `package.json` defines the listed scripts. Follow the repository configuration if any script differs.*

## 🧩 09. Challenges

- 🔌 Connecting AI services to the backend.
- 🔐 Configuring authentication and Firebase services.
- 🌐 Supporting multilingual and voice interactions.
- 📱 Coordinating web and mobile functionality.
- 🧪 Testing features and fixing issues within a limited hackathon timeframe.

## 🚀 10. Future Scope

- Stronger role-based security and audit logs.
- Improved multilingual voice support.
- More comprehensive automated testing.
- Reliable, consent-based emergency communication.
- Further mobile optimization and deployment.

---

## 🛡️ Medical Disclaimer

MedicalAI provides AI-assisted health information and preliminary triage support. It does not replace professional diagnosis or treatment. In an emergency, contact local emergency services.

<p align="center">
  <img src="https://img.shields.io/badge/Built_with-AI_%26_Innovation-2563EB?style=for-the-badge" alt="Built with AI and Innovation" />
</p>

<h3 align="center">💙 MedicalAI — Smarter Care, Better Access.</h3>

<p align="center">
  <a href="https://github.com/uiaryanyadav1109-dev/MedicalAI">⭐ Explore the Repository</a>
  &nbsp;•&nbsp;
  <a href="https://medicalai-1.onrender.com/">🌐 Try the Live Demo</a>
</p>
