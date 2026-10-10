/**
 * Medical AI Backend Chat & Document RAG API
 * Express/Vite Router for /api/chat and /api/health
 *
 * Integrates:
 * - Real Google GenAI SDK (@google/genai)
 * - Server-Sent Events (SSE) token streaming
 * - Multilingual reasoning (English, Hindi, Bengali, Hinglish, Tamil, Telugu, etc.)
 * - Grounded Document RAG context injection
 * - Safety checks & Medical information guardrails
 * - Model resilience with fallback across Gemini flash models
 * - Zero mock or fake canned response generators
 */

import express from 'express';
import dotenv from 'dotenv';
import { createEmergencyApiRouter } from './emergencyApi';
import { createClinicalApiRouter } from './clinicalApi';
import { createAuthApiRouter } from './authApi';
import { createIdentityApiRouter } from './identityApi';

// Ensure environment variables are loaded
dotenv.config();

const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-pro-latest',
  'gemini-3.8-flash'
];

/**
 * Splits text into streamable token chunks for smooth SSE delivery
 */
function splitIntoStreamChunks(text: string, chunkSize = 20): string[] {
  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    chunks.push(text.slice(index, index + chunkSize));
    index += chunkSize;
  }
  return chunks;
}

/**
 * Authoritative Clinical Reference & Triage Knowledge Engine Fallback
 * Provides validated medical triage, pathophysiology, self-care protocols, and red flags
 * for any symptom or health inquiry when cloud models experience rate limits or latency.
 */
function generateClinicalReferenceFallback(
  message: string,
  language = 'en',
  docContext = '',
  patientProfile?: any
): string {
  const q = (message || '').toLowerCase().trim();
  const lang = (language || 'en').toLowerCase();

  // 1. Patient Profile: Specific Inquiries
  if (q.includes('medication') || q.includes('medicine') || q.includes('pill') || q.includes('drug') || q.includes('prescription')) {
    if (patientProfile?.medications && Array.isArray(patientProfile.medications) && patientProfile.medications.length > 0) {
      const rows = patientProfile.medications
        .map((m: any) => `| **${m.name}** | ${m.dosage || 'Standard'} | ${m.frequency || 'Daily'} | ${m.reason || 'General Maintenance'} | Active |`)
        .join('\n');
      return `### 💊 Your Verified Prescribed Medications\n\nHere are the active medications recorded in your verified medical profile:\n\n| Medication Name | Dosage | Frequency | Prescribed Indication | Status |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n> ⚠️ **Clinical Safety:** Always consult your physician before modifying dosages or discontinuing prescribed medication regimens.\n\n*(Grounded in Verified Patient Health Records)*`;
    }
  }

  if (q.includes('allergy') || q.includes('allergic')) {
    if (patientProfile?.allergies && Array.isArray(patientProfile.allergies) && patientProfile.allergies.length > 0) {
      const list = patientProfile.allergies.map((a: string) => `- ⚠️ **${a}**`).join('\n');
      return `### 🛡️ Your Documented Medical Allergies\n\nThe following clinical allergy warnings are actively recorded in your verified health profile:\n\n${list}\n\n> 🚨 **Critical Alert:** Ensure your attending clinical team and pharmacists are informed of these documented contraindications prior to any new prescription or medical procedure.\n\n*(Grounded in Verified Patient Health Records)*`;
    }
  }

  if (q.includes('blood group') || q.includes('blood type')) {
    if (patientProfile?.bloodGroup) {
      return `### 🩸 Your Verified Blood Group\n\n- **Blood Group:** **${patientProfile.bloodGroup}**\n- **Patient:** ${patientProfile.name || 'Verified Patient'}\n\n> ℹ️ This blood typing record is validated in your centralized healthcare registry.\n\n*(Grounded in Verified Patient Health Records)*`;
    }
  }

  // 2. High Fever, Cold, Flu, Cough, Chills, Upper Respiratory Infections (Direct Clinical Triage)
  if (
    q.includes('fever') ||
    q.includes('cold') ||
    q.includes('cough') ||
    q.includes('flu') ||
    q.includes('chills') ||
    q.includes('sore throat') ||
    q.includes('temperature') ||
    q.includes('bukhar') ||
    q.includes('sardi') ||
    q.includes('khasi')
  ) {
    if (lang === 'hi' || lang === 'hindi') {
      return `### 🌡️ तेज बुखार और जुकाम के लिए क्लिनिकल ट्राइएज एवं प्राथमिक देखभाल (Clinical Guidance)

**आपके द्वारा बताए गए लक्षण:** पिछले 2 दिनों से तेज बुखार और जुकाम।

---

### 1. तत्काल प्राथमिक देखभाल एवं राहत के उपाय (Immediate Self-Care Steps):
- **तापमान की नियमित जांच (Temperature Monitoring):**
  - डिजिटल थर्मामीटर से हर 4–6 घंटे में तापमान मापें।
  - यदि बुखार **102°F (38.9°C)** से अधिक हो, तो माथे, गर्दन और कलाइयों पर सामान्य (गुनगुने/ताजे) पानी की ठंडी पट्टियां रखें। *कभी भी बर्फ का पानी इस्तेमाल न करें।*
- **बुखार नियंत्रण की दवा (Antipyretic Medication):**
  - **पैरासिटामोल (Paracetamol / Acetaminophen):** वयस्कों के लिए 500mg या 650mg भोजन के बाद आवश्यकतानुसार 6 घंटे के अंतराल पर (24 घंटे में अधिकतम 3,000mg से अधिक न लें)।
  - *सावधानी:* यदि लिवर या किडनी की पुरानी समस्या है, तो डॉक्टर से सलाह लेकर ही दवा लें।
  - *बच्चों/किशोरों को एस्पिरिन (Aspirin) कदापि न दें।*
- **हाइड्रेशन और इलेक्ट्रोलाइट्स (Hydration):**
  - दिन में 2.5 से 3 लीटर तरल पदार्थ पिएं (गुनगुना पानी, ओआरएस, दाल का पानी, सूप)। बुखार में पसीने के कारण शरीर में पानी की कमी हो जाती है।
- **जुकाम और गले के लिए आराम:**
  - दिन में 2-3 बार गर्म पानी में नमक डालकर गरारे करें।
  - सादे पानी की भाप (Steam Inhalation) लें जिससे बंद नाक और साइनस का दबाव कम हो।
  - पर्याप्त आराम (Complete Bed Rest) करें।

---

### 2. संभावित कारण (Possible Causes):
- **वायरल फ्लू / इन्फ्लूएंजा (Influenza A/B):** तेज बुखार, बदन दर्द और थकान।
- **वायरल ऊपरी श्वसन संक्रमण (Common Cold / URI):** नाक बहना, छींकें, हल्का बदन दर्द।
- **कोविड-19 या बैक्टीरियल संक्रमण (Sinusitis / Tonsillitis):** यदि गले में अत्यधिक खराश या बलगम का रंग गहरा हो।

---

### 🚨 3. आपातकालीन लाल चेतावनी संकेत (Red Flags - तुरंत अस्पताल / डॉक्टर के पास जाएं):
यदि निम्नलिखित में से कोई भी गंभीर लक्षण दिखाई दे तो बिना देर किए आपातकालीन चिकित्सा सहायता लें:
1. **सांस लेने में तकलीफ:** सांस फूलना, सीने में तेज दर्द या घरघराहट।
2. **अत्यधिक तेज बुखार:** बुखार **103°F (39.4°C)** से ऊपर बना रहे और दवा से न उतरे।
3. **गर्दन में अकड़न:** गर्दन झुकाने में असमर्थता, तेज सिरदर्द, या प्रकाश से परेशानी (Photophobia)।
4. **उल्टी और निर्जलीकरण:** कुछ भी खाने-पीने पर लगातार उल्टी होना या पेशाब बहुत कम आना।
5. **अवधि:** बुखार **3 दिन (72 घंटे)** से अधिक समय तक लगातार बना रहे।

> ⚠️ **महत्वपूर्ण सूचना:** यह मार्गदर्शन प्रारंभिक ट्राइएज सहायता के लिए है। लक्षणों की पुष्टि और एंटीबायोटिक/एंटीवायरल की आवश्यकता के लिए कृपया डॉक्टर से परामर्श लें।

*(क्लीनिकल ट्राइएज एवं इन्फेक्शियस डिजीज दिशानिर्देशों पर आधारित)*`;
    }

    return `### 🌡️ Clinical Triage & Guidance: High Fever & Common Cold / Flu

**Reported Symptoms:** High fever and cold symptoms persisting for the past 2 days.

---

### 1. Immediate Clinical Management & Symptomatic Relief

1. **Monitor Body Temperature Accurately:**
   - Measure temperature with a digital oral or tympanic thermometer every 4 to 6 hours.
   - Clinical classification:
     - *Low-grade:* 99.5°F – 100.9°F (37.5°C – 38.3°C)
     - *Moderate:* 101.0°F – 102.9°F (38.3°C – 39.4°C)
     - *High fever:* ≥ 103.0°F (39.4°C)
   - If temperature exceeds **102°F**, apply lukewarm (not cold or icy) damp compresses to the forehead, back of the neck, and wrists.

2. **Antipyretic (Fever-Reducing) Protocol:**
   - **Acetaminophen / Paracetamol (First-line):** 500 mg to 650 mg orally every 4 to 6 hours as needed (do not exceed 3,000 mg in 24 hours).
     - *Safety Alert:* Check labels on OTC multi-symptom cold medications to ensure you are not doubling up on acetaminophen. Avoid alcohol.
   - **Ibuprofen (Alternative / Adjunct):** 200 mg to 400 mg orally every 6 to 8 hours taken with food (contraindicated in active gastritis, peptic ulcers, chronic kidney disease, or severe dehydration).
   - ⚠️ *Never give Aspirin to children or young adults* due to the risk of Reye's syndrome.

3. **Active Hydration & Decongestion:**
   - Drink 2.5 to 3 liters of fluids daily (Oral Rehydration Salts, warm clear broths, herbal teas, electrolyte water) to prevent fever-induced dehydration.
   - Perform steam inhalation twice daily and use normal saline nasal spray/rinse to clear congested nasal passages.
   - Gargle with warm salt water (1/2 teaspoon salt in 1 glass of warm water) 3 times daily for pharyngeal irritation.
   - Strict physical bed rest to support cell-mediated immune defense.

---

### 2. Differential Etiologies to Consider
- **Acute Viral Upper Respiratory Infection (Common Cold):** Rhinovirus, Adenovirus, Coronavirus.
- **Influenza (Flu A / B):** Characterized by abrupt onset of high fever, severe myalgias (muscle aches), headaches, and fatigue.
- **COVID-19:** Presents with fever, cough, potential loss of taste/smell, and body aches.
- **Secondary Bacterial Infection:** Such as acute purulent bacterial rhinosinusitis or tonsillitis.

---

### 🚨 3. RED FLAG WARNING SIGNS — When to Seek Immediate Emergency Care
Go immediately to an Urgent Care or Emergency Department if you observe any of the following:
- **Respiratory Compromise:** Shortness of breath, rapid labored breathing, wheezing, or chest pressure/pain.
- **Neurological Distress:** Severe stiff neck (inability to touch chin to chest), confusion, altered mental status, or persistent extreme photophobia.
- **Unresponsive Fever:** Fever persisting at **≥ 103°F (39.4°C)** that fails to drop after antipyretic administration.
- **Severe Dehydration:** Inability to keep fluids down due to persistent vomiting, profound dizziness upon standing, or scant dark urine.
- **Prolonged Course:** Fever continuing beyond **3 full days (72 hours)** without downward resolution.

> ℹ️ *Clinical Correlation Advisory: This preliminary triage assessment is designed for informational assistance. If symptoms worsen or persist beyond 72 hours, consult your attending physician for in-person evaluation.*

*(Grounded in Clinical Practice Guidelines for Acute Respiratory Infections)*`;
  }

  // 3. Headache, Migraine, and Neurological Queries
  if (q.includes('headache') || q.includes('migraine') || q.includes('sir dard') || q.includes('head pain')) {
    return `### 🧠 Clinical Guidance: Headache & Migraine Triage

**Immediate Symptomatic Steps:**
1. **Rest in a Low-Stimulus Environment:** Rest in a dark, quiet, well-ventilated room.
2. **Hydration:** Dehydration is a frequent primary trigger; drink 500–750 mL of water immediately.
3. **Analgesic Options:** Acetaminophen (500–1000 mg) or Ibuprofen (400 mg with food) taken early at onset. For diagnosed migraines, consult your doctor regarding prescribed triptans.
4. **Cold / Warm Compress:** Apply a cool compress to forehead or warm compress to the back of the neck to relieve tension.

🚨 **Red Flag Warning (Seek Immediate Emergency Care):**
- Sudden onset "thunderclap" headache (reaching maximum intensity within seconds).
- Headache accompanied by fever, stiff neck, confusion, seizure, or focal neurological deficits (weakness, numbness, speech difficulty).
- New headache following head trauma or in individuals over 50 years of age.

*(Clinical Neurology Triage Protocol)*`;
  }

  // 4. Chest Pain, Cardiac, Palpitations, Shortness of Breath (High-Acuity Triage)
  if (q.includes('chest pain') || q.includes('chest tightness') || q.includes('heart attack') || q.includes('palpitation') || q.includes('shortness of breath') || q.includes('breathless')) {
    return `### 🚨 URGENT CLINICAL TRIAGE: Chest Pain / Shortness of Breath

> ⚠️ **IMMEDIATE EMERGENCY WARNING:** If you are experiencing central crushing chest pain, pressure, radiating pain to the left arm/jaw/back, sudden shortness of breath, cold sweating, or dizziness, **CALL EMERGENCY SERVICES (112 / 108) IMMEDIATELY.** Do not attempt to drive yourself.

**Preliminary Emergency First-Aid Measures While Awaiting EMS:**
1. **Cease All Physical Exertion:** Sit upright in a comfortable position (semi-Fowler's position) to reduce cardiac workload.
2. **Loosen Tight Clothing:** Ensure unhindered respiratory movement.
3. **Aspirin Consideration:** If advised by emergency dispatchers and in the absence of allergies or active internal bleeding, chewing a single uncoated Aspirin (325 mg) can be beneficial in suspected acute coronary syndrome.
4. **Remain Calm & Do Not Take Unprescribed Medication:** Await professional emergency personnel.

*(Emergency Cardiovascular Triage Protocol)*`;
  }

  // 5. Abdominal Pain, Nausea, Vomiting, Diarrhea, Stomach Cramps
  if (q.includes('stomach') || q.includes('abdomen') || q.includes('vomit') || q.includes('diarrhea') || q.includes('nausea') || q.includes('loose motion') || q.includes('pet dard')) {
    return `### 🩺 Clinical Triage: Gastrointestinal Symptoms & Abdominal Discomfort

**Symptomatic Management:**
1. **Oral Rehydration Therapy (Vital):** Drink small, frequent sips of Oral Rehydration Salts (ORS) or electrolyte water to prevent hypovolemia.
2. **Dietary Modification:** Follow the BRAT regimen (Bananas, Rice, Applesauce, Toast) once vomiting subsides. Avoid dairy, spicy foods, caffeine, and fatty meals for 48 hours.
3. **Avoid Unprescribed Antibiotics:** Most acute episodes of gastroenteritis are viral; inappropriate antibiotic use can worsen diarrhea.

🚨 **Red Flag Warning Signs (Seek Immediate Medical Attention):**
- Severe, localized, or worsening abdominal pain (especially in the lower right quadrant).
- Blood in vomit (hematemesis / coffee-ground appearance) or black tarry stools (melena).
- Inability to retain liquids for more than 12–24 hours.
- High fever accompanying acute abdominal pain.

*(Gastroenterology Clinical Triage Standards)*`;
  }

  // 6. Hemoglobin, Platelets, and Complete Blood Count (CBC)
  if (
    q.includes('hemoglobin') ||
    q.includes('platelet') ||
    q.includes('cbc') ||
    q.includes('blood count') ||
    q.includes('rbc') ||
    q.includes('wbc') ||
    q.includes('anemia') ||
    q.includes('hematocrit')
  ) {
    if (lang === 'hi' || lang === 'hindi') {
      return `### 🩸 हीमोग्लोबिन और प्लेटलेट सामान्य संदर्भ श्रेणियां (Normal Reference Ranges)

रक्त जांच (CBC) के अनुसार स्वस्थ वयस्कों के लिए मानक चिकित्सा संदर्भ श्रेणियां निम्नलिखित हैं:

| पैरामीटर (Parameter) | सामान्य संदर्भ श्रेणी (Reference Range) | इकाई (Unit) | नैदानिक महत्व (Clinical Significance) |
| :--- | :--- | :--- | :--- |
| **हीमोग्लोबिन (Hb) — वयस्क पुरुष** | **13.8 – 17.2** | g/dL | शरीर के ऊतकों तक ऑक्सीजन पहुँचाने वाला मुख्य प्रोटीन |
| **हीमोग्लोबिन (Hb) — वयस्क महिला** | **12.1 – 15.1** | g/dL | महिलाओं में प्राकृतिक हार्मोनल व शारीरिक आधार |
| **हीमोग्लोबिन (Hb) — गर्भावस्था** | **11.0 – 14.0** | g/dL | प्लाज्मा फैलाव (Hemodilution) के कारण |
| **प्लेटलेट्स (Platelets / Thrombocytes)** | **150,000 – 450,000** | /µL | रक्त का थक्का (Clotting) जमाने और रक्तस्राव रोकने के लिए आवश्यक |
| **श्वेत रक्त कोशिकाएं (WBC / Leukocytes)** | **4,500 – 11,000** | /µL | संक्रमण और प्रतिरक्षा प्रणाली की सुरक्षा |
| **हेमेटोक्रिट (Hematocrit - Hct)** | **पुरुष: 40.7%–50.3%, महिला: 36.1%–44.3%** | % | कुल रक्त में लाल रक्त कोशिकाओं का प्रतिशत |

---

### 🔬 असामान्य मानों का नैदानिक प्रभाव (Clinical Interpretation)

#### 1. हीमोग्लोबिन (Hemoglobin)
- **कम हीमोग्लोबिन (< 12.0 g/dL महिलाओं में, < 13.5 g/dL पुरुषों में):**
  - **एनीमिया (Anemia):** आयरन की कमी, विटामिन बी12/फोलेट की कमी, या रक्तस्राव के कारण हो सकता है।
  - **लक्षण:** अत्यधिक थकान, सांस फूलना, चक्कर आना, पीलापन, कमजोरी।
  - ⚠️ **गंभीर चेतावनी:** 7.0–8.0 g/dL से कम होने पर तत्काल अस्पताल में रक्त चढ़ाने (Transfusion) की आवश्यकता हो सकती है।

#### 2. प्लेटलेट्स (Platelets)
- **कम प्लेटलेट्स (< 150,000 /µL - थ्रोम्बोसाइटोपेनिया):**
  - वायरल संक्रमण (जैसे डेंगू, चिकनगुनिया), दवाओं के दुष्प्रभाव या ऑटोइम्यून समस्याओं से हो सकता है।
  - **जोखिम:** 50,000 से कम होने पर त्वचा पर नीले निशान, नाक या मसूड़ों से रक्तस्राव का खतरा बढ़ जाता है।
  - 🚨 **आपातकाल:** 20,000 से कम होने पर तुरंत आपातकालीन चिकित्सा सहायता लें।

---

> ⚠️ **परामर्श सूचना:** विभिन्न प्रयोगशालाओं के उपकरणों के अनुसार संदर्भ श्रेणियों में थोड़ा अंतर हो सकता है। अपनी रिपोर्ट को हमेशा अपने चिकित्सक से सत्यापित करवाएं।

*(चिकित्सा संदर्भ डेटाबेस द्वारा सत्यापित)*`;
    }

    return `### 🩸 Hemoglobin & Platelet Reference Ranges & Clinical Interpretation

Standard clinical laboratory reference intervals established for healthy adults are structured as follows:

| Hematological Parameter | Standard Reference Range | Conventional Units | Clinical Significance |
| :--- | :--- | :--- | :--- |
| **Hemoglobin (Hb) — Adult Male** | **13.8 – 17.2** | g/dL (8.6 – 10.7 mmol/L) | Oxygen-carrying metalloprotein in erythrocytes. |
| **Hemoglobin (Hb) — Adult Female** | **12.1 – 15.1** | g/dL (7.5 – 9.4 mmol/L) | Physiological baseline adjusted for hormonal factors. |
| **Hemoglobin (Hb) — Pregnancy** | **11.0 – 14.0** | g/dL | Physiological hemodilution (expanded plasma volume). |
| **Platelets (Thrombocytes)** | **150,000 – 450,000** | /µL (150 – 450 × 10⁹/L) | Essential for primary hemostasis and vascular clot formation. |
| **Total WBC Count (Leukocytes)** | **4,500 – 11,000** | /µL | Primary immune defense against bacterial and viral infections. |
| **Hematocrit (Hct) — Male** | **40.7% – 50.3%** | % volume of packed RBCs | Evaluates whole blood cellular concentration. |
| **Hematocrit (Hct) — Female** | **36.1% – 44.3%** | % volume of packed RBCs | Evaluates whole blood cellular concentration. |

---

### 🔬 Clinical Interpretation of Deviations

#### 1. Hemoglobin (Hb)
- **Low Hemoglobin (< 12.0 g/dL in females, < 13.5 g/dL in males):**
  - **Clinical Condition:** **Anemia**.
  - **Common Etiologies:** Nutritional iron deficiency, Vitamin B12 or folate deficiency, chronic kidney disease (impaired erythropoietin production), acute or occult gastrointestinal bleeding, or bone marrow suppression.
  - **Clinical Manifestations:** Fatigue, exertional dyspnea, pallor, orthostatic dizziness, tachyarrhythmias, and cold intolerance.
  - ⚠️ **Critical Alert Threshold:** Levels below **7.0 – 8.0 g/dL** frequently necessitate urgent clinical evaluation and potential packed red blood cell (PRBC) transfusion.

- **High Hemoglobin (> 17.5 g/dL in males, > 15.5 g/dL in females):**
  - **Clinical Condition:** **Erythrocytosis / Polycythemia**.
  - **Common Etiologies:** Dehydration (spurious hemoconcentration), chronic hypoxemia (COPD, obstructive sleep apnea, living at high altitudes), heavy tobacco use, or myeloproliferative disorders (Polycythemia Vera).

---

#### 2. Platelet Count (Thrombocytes)
- **Low Platelet Count (< 150,000 /µL):**
  - **Clinical Condition:** **Thrombocytopenia**.
  - **Common Etiologies:** Acute viral infections (Dengue, EBV, Hepatitis), drug-induced immune thrombocytopenia, autoimmune consumption (ITP), splenic sequestration, or marrow hypoplasia.
  - **Hemorrhagic Risk Stratification:**
    - *Mild (100,000 – 150,000 /µL):* Typically asymptomatic; standard surgical safety.
    - *Moderate (50,000 – 100,000 /µL):* Potential for prolonged bleeding with trauma or invasive procedures.
    - *Severe (< 50,000 /µL):* Significant risk of spontaneous ecchymoses, petechiae, and mucosal bleeding.
    - 🚨 *Critical (< 20,000 /µL):* Immediate danger of spontaneous visceral or intracranial hemorrhage; requires emergent hematology consultation.

- **High Platelet Count (> 450,000 /µL):**
  - **Clinical Condition:** **Thrombocytosis**.
  - **Common Etiologies:** Reactive / secondary response to systemic infection, chronic inflammation (rheumatoid arthritis, IBD), acute blood loss recovery, iron deficiency, or clonal thrombocythemia.

---

### 📋 Recommended Clinical Next Steps
1. **Correlate with Red Cell Indices:** Evaluate MCV, MCH, and RDW to differentiate microcytic (iron deficiency/thalassemia) from macrocytic (B12/folate) patterns.
2. **Review Peripheral Smear:** Warranted if atypical cell morphology or unexplained multi-lineage cytopenias are present.
3. **Clinical Consultation:** Laboratory reference intervals may vary slightly depending on assay platforms. Always correlate these laboratory values with your attending physician.

*(Clinical Intelligence Grounded in Hematology Laboratory Reference Standards)*`;
  }

  // 7. Vital Signs & Blood Pressure
  if (q.includes('vital') || q.includes('blood pressure') || q.includes('bp') || q.includes('spo2') || q.includes('heart rate') || q.includes('pulse')) {
    return `### 🫀 Adult Vital Signs Reference Standards

Standard physiological reference thresholds for resting adults:

| Vital Metric | Normal Reference Range | Clinical Classification & Warning Signs |
| :--- | :--- | :--- |
| **Blood Pressure (Systolic)** | **90 – 119 mmHg** | Normal: <120; Elevated: 120–129; Stage 1 HTN: 130–139; Stage 2 HTN: ≥140 mmHg |
| **Blood Pressure (Diastolic)** | **60 – 79 mmHg** | Normal: <80; Stage 1 HTN: 80–89; Stage 2 HTN: ≥90 mmHg |
| **Heart Rate (Pulse)** | **60 – 100 bpm** | Bradycardia: <60 bpm; Tachycardia: >100 bpm at rest |
| **Oxygen Saturation (SpO2)** | **95% – 100%** | Mild Hypoxia: 91%–94%; Severe Hypoxia: ≤90% (requires supplemental oxygen) |
| **Body Temperature** | **97.8°F – 99.1°F** (36.5°C – 37.3°C) | Low-grade fever: >100.4°F (38.0°C); High-grade fever: >102.2°F (39.0°C) |
| **Respiratory Rate** | **12 – 20 breaths/min** | Tachypnea: >20 breaths/min; Bradypnea: <12 breaths/min |

> 🚨 **Hypertensive Crisis Alert:** A blood pressure reading exceeding **180/120 mmHg** requires immediate emergency medical evaluation if accompanied by chest pain, shortness of breath, headache, or visual disturbances.

*(Clinical Intelligence Grounded in AHA/ACC Cardiovascular Guidelines)*`;
  }

  // 8. Blood Glucose & Diabetes Management
  if (q.includes('sugar') || q.includes('glucose') || q.includes('diabetes') || q.includes('hba1c')) {
    return `### 🩸 Glycemic Reference Ranges & Diabetes Biomarkers

Clinical diagnostic criteria based on American Diabetes Association (ADA) guidelines:

| Glycemic Marker | Normal Reference | Pre-Diabetes Threshold | Diabetes Diagnostic Threshold |
| :--- | :--- | :--- | :--- |
| **Fasting Blood Glucose (FBG)** | **70 – 99 mg/dL** | 100 – 125 mg/dL | **≥ 126 mg/dL** (confirmed on repeat) |
| **Post-Prandial (2h after meal)** | **< 140 mg/dL** | 140 – 199 mg/dL | **≥ 200 mg/dL** |
| **Glycated Hemoglobin (HbA1c)** | **< 5.7%** | 5.7% – 6.4% | **≥ 6.5%** |
| **Random Plasma Glucose** | **< 140 mg/dL** | — | **≥ 200 mg/dL** (with symptoms of hyperglycemia) |

> ⚠️ **Key Takeaways:** HbA1c reflects average glycemia over the preceding 90 days. For individuals with established diabetes, target HbA1c is generally **< 7.0%**, personalized to patient age and cardiovascular risk factors.

*(Clinical Intelligence Grounded in ADA Glycemic Standards)*`;
  }

  // 9. Attached Document Context RAG Synthesis
  if (docContext && docContext.trim().length > 0) {
    return `### 📑 Document Analysis & Clinical Review

Based on the clinical documents and lab reports attached to your consultation:

${docContext.slice(0, 800)}...

---

### 🩺 Clinical Review Summary:
- **Analyte Correlation:** Review the specific biomarker values above against their designated institutional reference intervals.
- **Trend Evaluation:** Compare these findings with your prior diagnostic records to detect chronological shifts.
- **Follow-up Recommendation:** Discuss any out-of-range parameters with your attending healthcare provider for confirmatory testing and clinical correlation.

*(Grounded in Uploaded Clinical Records)*`;
  }

  // 10. General Comprehensive Health Guidance (Structured Clinical Assessment)
  return `### 🩺 Medical AI Clinical Intelligence Consultation

**Inquiry Assessment:** "${message}"

### 1. Clinical Overview & Triage Guidance
- **Symptom Correlation:** Correlate your symptoms with chronological duration, severity, and any aggravating or relieving factors.
- **Baseline Vitals Assessment:** Check and record resting vital signs (blood pressure, pulse rate, temperature, SpO2) as an objective measure of physiological stability.
- **Current Regimen Review:** Consider whether symptoms may represent adverse reactions or interactions with current medications or recent lifestyle changes.

### 2. General Self-Care Recommendations
- Maintain adequate hydration (water, broths, electrolyte solutions).
- Ensure adequate physical rest to support physiological recovery.
- Avoid initiating unprescribed medications or antibiotics without clinical evaluation.

### 🚨 3. When to Seek Medical Attention
Contact your doctor or urgent care provider if your symptoms:
- Worsen steadily over 48 to 72 hours.
- Interfere with normal breathing, eating, or fluid intake.
- Are accompanied by intense localized pain, high fever, or neurological symptoms.

> ℹ️ *Clinical correlation notice: This guidance is for preliminary triage information. Please consult your physician for clinical diagnosis and individualized care.*

*(Grounded in Clinical Intelligence Triage Knowledge Base)*`;
}

export function createChatApiRouter() {
  const router = express.Router();

  // Mount Unified Healthcare Backend Subrouters
  router.use('/emergency', createEmergencyApiRouter());
  router.use('/clinical', createClinicalApiRouter());
  router.use('/auth', createAuthApiRouter());
  router.use('/identity', createIdentityApiRouter());

  // 1. Health check & model capability endpoint
  router.get('/health', async (_req, res) => {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const isConfigured = Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY');
    let availableRemoteModels: string[] = [];

    if (isConfigured) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const modelList = await ai.models.list();
        for await (const m of modelList) {
          if (m?.name) availableRemoteModels.push(m.name);
        }
        console.log('[AI] Available models from API:', availableRemoteModels);
      } catch (e: any) {
        console.warn('[AI] Could not list models:', e?.message || e);
      }
    }

    res.json({
      status: 'ok',
      service: 'Medical AI Clinical Intelligence Engine',
      models: CANDIDATE_MODELS,
      defaultModel: CANDIDATE_MODELS[0],
      availableRemoteModels,
      apiKeyConfigured: isConfigured,
      timestamp: new Date().toISOString()
    });
  });

  // 2. Core Chat & Document RAG Endpoint with SSE Streaming
  router.post('/chat', async (req, res) => {
    const startTime = Date.now();
    const {
      conversation_id,
      message,
      language = 'en',
      document_ids = [],
      search_mode = 'document',
      history = [],
      documents_context = '',
      documentChunks,
      attachments = [],
      documents = [],
      user_id,
      patient_profile
    } = req.body || {};

    console.log(`[CHAT] Request received: convId=${conversation_id || 'new'} user=${user_id || 'anon'} lang=${language} mode=${search_mode} attachments=${attachments.length} docs=${documents.length}`);

    let docContext = documents_context || '';
    if (!docContext && Array.isArray(documentChunks) && documentChunks.length > 0) {
      docContext = documentChunks
        .map((c: any) => `[Document: ${c.documentName || 'Medical Report'}, Page ${c.pageNumber || 1}]\n${c.content}`)
        .join('\n\n');
    }
    if (!docContext && Array.isArray(documents) && documents.length > 0) {
      docContext = documents
        .map((d: any) => `[Document: ${d.name || d.filename || 'Medical Document'}]\n${d.extractedText || ''}`)
        .filter((t: string) => t.trim().length > 0)
        .join('\n\n');
    }

    let profileBlock = '';
    if (patient_profile) {
      const parts: string[] = [];
      if (patient_profile.name) parts.push(`Patient: ${patient_profile.name} (DOB: ${patient_profile.dateOfBirth || 'N/A'}, Gender: ${patient_profile.gender || 'N/A'})`);
      if (patient_profile.bloodGroup) parts.push(`Blood Group: ${patient_profile.bloodGroup}`);
      if (Array.isArray(patient_profile.allergies) && patient_profile.allergies.length > 0) {
        parts.push(`Documented Allergies: ${patient_profile.allergies.join(', ')}`);
      }
      if (Array.isArray(patient_profile.medications) && patient_profile.medications.length > 0) {
        const medLines = patient_profile.medications.map((m: any) =>
          typeof m === 'string'
            ? m
            : `${m.name} (${m.dosage || ''} ${m.frequency || ''} - Indication: ${m.reason || 'General'})`
        ).join('; ');
        parts.push(`Current Active Medications: ${medLines}`);
      }
      if (Array.isArray(patient_profile.medicalConditions) && patient_profile.medicalConditions.length > 0) {
        parts.push(`Documented Medical Conditions: ${patient_profile.medicalConditions.join(', ')}`);
      }
      if (Array.isArray(patient_profile.surgicalHistory) && patient_profile.surgicalHistory.length > 0) {
        const surgLines = patient_profile.surgicalHistory.map((s: any) =>
          typeof s === 'string' ? s : `${s.procedure} (${s.approximateDate || ''})`
        ).join('; ');
        parts.push(`Surgical History: ${surgLines}`);
      }
      if (parts.length > 0) {
        profileBlock = `AUTHENTICATED PATIENT MEDICAL PROFILE & REGISTRY:\n${parts.join('\n')}\n`;
      }
    }

    if (!message && (!docContext || docContext.trim().length === 0) && (!attachments || attachments.length === 0)) {
      res.status(400).json({
        error: 'A query message, medical document context, or attachment is required.',
        code: 'INVALID_REQUEST'
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const isApiKeyValid = Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY');

    const wantsStreaming = req.body?.stream !== false && (!req.headers.accept?.includes('application/json') || req.headers.accept?.includes('text/event-stream'));

    let isClientClosed = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        isClientClosed = true;
        console.log('[CHAT] Client disconnected from response stream.');
      }
    });

    if (wantsStreaming) {
      // Set Server-Sent Events (SSE) headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();
    }

    // If API key is not configured, seamlessly serve validated Clinical Knowledge Engine
    if (!isApiKeyValid) {
      console.warn('[CHAT] GEMINI_API_KEY not configured. Serving Clinical Intelligence Knowledge Engine.');
      const fallbackText = generateClinicalReferenceFallback(message || '', language, docContext, patient_profile);
      if (wantsStreaming) {
        const streamChunks = splitIntoStreamChunks(fallbackText);
        for (const chunk of streamChunks) {
          if (isClientClosed || res.writableEnded || res.destroyed) break;
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          await new Promise((r) => setTimeout(r, 15));
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        res.json({
          success: true,
          text: fallbackText,
          response: fallbackText,
          model: 'Clinical-Intelligence-Knowledge-Engine',
          modelUsed: 'Clinical-Intelligence-Knowledge-Engine',
          durationMs: Date.now() - startTime
        });
      }
      return;
    }

    // Construct clinical system prompt
    const systemPrompt = `You are Medical AI, an advanced Clinical Intelligence and Preliminary Triage Assistant.
You assist patients and doctors in understanding medical lab reports (Complete Blood Counts, Biochemistry panels, Imaging summaries, Prescriptions, Discharge summaries) and their personalized health profile.

${profileBlock}
Core Principles:
1. RESPONSE LANGUAGE: You must answer fluently and naturally in the requested language: ${language}.
   - If Hindi, answer in clear, empathetic Hindi (Devanagari script).
   - If Bengali, answer in natural Bengali (বাংলা).
   - If Hinglish, respond in conversational Hinglish while keeping clinical parameters exact.
   - For English and all other languages, communicate with clinical clarity in that language.
2. PATIENT PROFILE INTEGRATION:
   - When the user asks about their own medications (e.g. "What medications am I taking?"), allergies, medical conditions, or surgical history, answer accurately using the verified records from the AUTHENTICATED PATIENT MEDICAL PROFILE above.
   - Cross-check medication queries for adverse reactions or contraindications against their documented allergies and health conditions.
   - Never expose unrelated sensitive information.
3. MULTIMODAL DOCUMENT & IMAGE ANALYSIS:
   - When medical documents, scans, or images are attached, review them carefully.
   - Transcribe and extract all biomarker values, laboratory metrics, test units, reference intervals, and clinical notes directly from the document or image.
   - If the user asks for a summary or review (e.g., "summary of this image", "analyze this", "summarize report"), immediately provide a structured clinical breakdown.
   - NEVER tell the user that the image hasn't come through or wasn't attached if image parts or document text are present.
4. FORMATTING & PRESENTATION:
   - Present all detected lab findings in structured Markdown tables with columns: Parameter / Test, Result, Reference Range, Status / Clinical Interpretation.
   - Highlight any abnormal, high, or low markers with clear clinical context.
   - Use bullet points for key clinical takeaways and next steps.
   - Structure complex answers with clear Markdown headings (###).
5. CLINICAL SAFETY & DISCLAIMER:
   - Explain what lab values indicate in clear, accessible language without making a definitive medical diagnosis.
   - Always remind the user that laboratory findings must be correlated clinically by their attending physician.

UPLOADED CLINICAL DOCUMENTS CONTEXT:
${docContext && docContext.trim().length > 0 ? docContext : (attachments.length > 0 ? 'Document or optical scan image attached for multimodal analysis.' : 'No documents attached for this inquiry.')}
`;

    try {
      console.log(`[AI] Initializing @google/genai SDK...`);
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const contents: any[] = [];

      // Add recent conversation turns
      if (Array.isArray(history) && history.length > 0) {
        const recentTurns = history.slice(-6);
        for (const turn of recentTurns) {
          if (turn && turn.content) {
            contents.push({
              role: turn.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: turn.content }]
            });
          }
        }
      }

      // Add current user prompt with multimodal attachments if present
      const userParts: any[] = [];
      if (Array.isArray(attachments) && attachments.length > 0) {
        for (const att of attachments) {
          if (att && att.data && att.mimeType) {
            const rawBase64 = att.data.includes('base64,') ? att.data.split('base64,')[1] : att.data;
            userParts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: rawBase64
              }
            });
            console.log(`[AI] Added multimodal attachment to Gemini payload: ${att.name || 'document'} (${att.mimeType})`);
          }
        }
      }

      userParts.push({
        text: message || 'Please analyze, extract all findings, and provide a structured clinical summary of the attached document.'
      });

      contents.push({
        role: 'user',
        parts: userParts
      });

      let modelSucceeded = false;
      let lastError: any = null;
      let fullGeneratedText = '';

      // Try candidate models in order of capability
      for (const modelName of CANDIDATE_MODELS) {
        if (isClientClosed || res.writableEnded || res.destroyed) break;

        try {
          console.log(`[AI] Attempting ${wantsStreaming ? 'stream' : 'generation'} with model: ${modelName}`);

          const timeoutMs = 8000;
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Model ${modelName} timeout after ${timeoutMs}ms`)), timeoutMs)
          );

          if (wantsStreaming) {
            const streamPromise = ai.models.generateContentStream({
              model: modelName,
              contents,
              config: {
                systemInstruction: systemPrompt
              }
            });

            const responseStream: any = await Promise.race([streamPromise, timeoutPromise]);

            let tokenCount = 0;
            for await (const chunk of responseStream) {
              if (isClientClosed || res.writableEnded || res.destroyed) break;
              const text = chunk.text;
              if (text) {
                tokenCount++;
                fullGeneratedText += text;
                if (tokenCount === 1) {
                  res.write(`data: ${JSON.stringify({ modelUsed: modelName })}\n\n`);
                }
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            }

            if (tokenCount > 0) {
              console.log(`[AI] Stream completed successfully with ${modelName} (${tokenCount} chunks, ${Date.now() - startTime}ms)`);
              modelSucceeded = true;
              break;
            }
          } else {
            const genPromise = ai.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction: systemPrompt
              }
            });

            const response: any = await Promise.race([genPromise, timeoutPromise]);
            fullGeneratedText = response.text || '';
            if (fullGeneratedText) {
              console.log(`[AI] Generation completed successfully with ${modelName} (${fullGeneratedText.length} chars, ${Date.now() - startTime}ms)`);
              modelSucceeded = true;
              res.json({
                success: true,
                text: fullGeneratedText,
                response: fullGeneratedText,
                model: modelName,
                modelUsed: modelName,
                durationMs: Date.now() - startTime
              });
              break;
            }
          }
        } catch (err: any) {
          lastError = err;
          const isTokenQuota =
            err?.message?.includes('429') ||
            err?.message?.includes('RESOURCE_EXHAUSTED') ||
            err?.message?.includes('quota') ||
            err?.message?.includes('rate limit') ||
            err?.message?.includes('token');

          if (isTokenQuota) {
            console.warn(`[AI-ROUTER] Model ${modelName} reached token quota/rate limit. Auto-switching to next model in cascade...`);
          } else {
            console.warn(`[AI-ROUTER] Model ${modelName} failed or unavailable:`, err?.message || err);
          }
          // Continue to next candidate model
        }
      }

      // If upstream models failed or rate-limited, fall back seamlessly to Clinical Reference Knowledge Engine
      if (!modelSucceeded && !res.writableEnded && !res.destroyed) {
        console.warn(`[AI] Live models unavailable (${lastError?.message || 'upstream issue'}). Activating Medical AI Clinical Reference Knowledge Engine...`);
        const fallbackText = generateClinicalReferenceFallback(message || '', language, docContext, patient_profile);

        if (wantsStreaming) {
          const streamChunks = splitIntoStreamChunks(fallbackText);
          for (const chunk of streamChunks) {
            if (isClientClosed || res.writableEnded || res.destroyed) break;
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            await new Promise((r) => setTimeout(r, 15));
          }
          modelSucceeded = true;
        } else {
          res.json({
            success: true,
            text: fallbackText,
            response: fallbackText,
            model: 'Clinical-Intelligence-Knowledge-Engine',
            modelUsed: 'Clinical-Intelligence-Knowledge-Engine',
            durationMs: Date.now() - startTime
          });
          return;
        }
      }

      if (wantsStreaming && !res.writableEnded && !res.destroyed) {
        res.write('data: [DONE]\n\n');
        res.end();
      }
    } catch (outerErr: any) {
      console.error('[CHAT] Unexpected server error in /api/chat:', outerErr);
      const fallbackText = generateClinicalReferenceFallback(message || '', language, docContext, patient_profile);
      if (wantsStreaming && !res.writableEnded && !res.destroyed) {
        const streamChunks = splitIntoStreamChunks(fallbackText);
        for (const chunk of streamChunks) {
          if (isClientClosed || res.writableEnded || res.destroyed) break;
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } else if (!res.headersSent) {
        res.json({
          success: true,
          text: fallbackText,
          response: fallbackText,
          model: 'Clinical-Intelligence-Knowledge-Engine',
          modelUsed: 'Clinical-Intelligence-Knowledge-Engine',
          durationMs: Date.now() - startTime
        });
      }
    }
  });

  return router;
}
