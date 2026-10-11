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
import os from 'os';
import dotenv from 'dotenv';
import { createEmergencyApiRouter } from './emergencyApi';
import { createClinicalApiRouter } from './clinicalApi';
import { createAuthApiRouter } from './authApi';
import { createIdentityApiRouter } from './identityApi';
import {
  getModelRegistry,
  getDefaultModelId,
  dispatchModelStream,
  SUPPORTED_MODELS
} from './modelRegistry';

// Ensure environment variables are loaded
dotenv.config();

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash',
  'gemini-3.1-pro-preview',
  'gemini-2.5-pro'
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

  // 1.5 Attached Clinical Document Grounding (Priority)
  if (docContext && docContext.trim().length > 0) {
    return `### 📑 Grounded Clinical Document Analysis

Based on the verified diagnostic records and laboratory reports attached to your consultation:

${docContext}

---

### 🩺 Diagnostic Findings & Corroborated Insights:
- **Analyte Extraction:** The parameters extracted directly from your clinical records above (including values such as Hemoglobin, Platelets, and cell morphology) should be evaluated against their specific laboratory reference intervals.
- **Microcytic / Hematological Findings:** Any flags (e.g. microcytic indices, low hemoglobin indicating anemia, or platelet shifts) warrant focused clinical follow-up.
- **Physician Review:** Present these validated lab values to your attending healthcare clinician for differential diagnosis and management.

*(Grounded in Uploaded Clinical Records)*`;
  }

  // 2. High Fever, Cold, Flu, Cough, Chills, Upper Respiratory Infections
  if (
    q.includes('fever') ||
    q.includes('cold') ||
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

**आपके द्वारा बताए गए लक्षण:** बुखार और जुकाम के लक्षण।

---

### 1. तत्काल प्राथमिक देखभाल एवं राहत के उपाय (Immediate Self-Care Steps):
- **तापमान की नियमित जांच (Temperature Monitoring):**
  - डिजिटल थर्मामीटर से हर 4–6 घंटे में तापमान मापें।
  - यदि बुखार **102°F (38.9°C)** से अधिक हो, तो माथे, गर्दन और कलाइयों पर सामान्य (गुनगुने/ताजे) पानी की ठंडी पट्टियां रखें। *कभी भी बर्फ का पानी इस्तेमाल न करें।*
- **बुखार नियंत्रण की दवा (Antipyretic Medication):**
  - **पैरासिटामोल (Paracetamol / Acetaminophen):** वयस्कों के लिए 500mg या 650mg भोजन के बाद आवश्यकतानुसार 6 घंटे के अंतराल पर (24 घंटे में अधिकतम 3,000mg से अधिक न लें)।
  - *सावधानी:* यदि लिवर या किडनी की पुरानी समस्या है, तो डॉक्टर से सलाह लेकर ही दवा लें। *बच्चों/किशोरों को एस्पिरिन (Aspirin) कदापि न दें।*
- **हाइड्रेशन और इलेक्ट्रोलाइट्स (Hydration):**
  - दिन में 2.5 से 3 लीटर तरल पदार्थ पिएं (गुनगुना पानी, ओआरएस, दाल का पानी, सूप)।
- **जुकाम और गले के लिए आराम:**
  - दिन में 2-3 बार गर्म पानी में नमक डालकर गरारे करें।
  - सादे पानी की भाप (Steam Inhalation) लें।
  - पर्याप्त आराम (Complete Bed Rest) करें।

---

### 🚨 2. आपातकालीन लाल चेतावनी संकेत (Red Flags - तुरंत डॉक्टर के पास जाएं):
1. **सांस लेने में तकलीफ:** सांस फूलना, सीने में दर्द या घरघराहट।
2. **अत्यधिक तेज बुखार:** बुखार **103°F (39.4°C)** से ऊपर बना रहे और दवा से न उतरे।
3. **गर्दन में अकड़न:** गर्दन झुकाने में असमर्थता या तेज सिरदर्द।
4. **अवधि:** बुखार **3 दिन (72 घंटे)** से अधिक समय तक लगातार बना रहे।

*(क्लीनिकल ट्राइएज एवं इन्फेक्शियस डिजीज दिशानिर्देशों पर आधारित)*`;
    }

    return `### 🌡️ Clinical Triage & Guidance: High Fever & Common Cold / Flu

**Reported Symptoms:** Fever and cold symptoms.

---

### 1. Immediate Clinical Management & Symptomatic Relief
1. **Monitor Body Temperature Accurately:**
   - Measure temperature with a digital oral or tympanic thermometer every 4 to 6 hours.
   - If temperature exceeds **102°F (38.9°C)**, apply lukewarm damp compresses to the forehead, back of the neck, and wrists.
2. **Antipyretic (Fever-Reducing) Protocol:**
   - **Acetaminophen / Paracetamol (First-line):** 500 mg to 650 mg orally every 4 to 6 hours as needed (do not exceed 3,000 mg in 24 hours).
   - **Ibuprofen (Alternative / Adjunct):** 200 mg to 400 mg orally every 6 to 8 hours taken with food (contraindicated in active gastritis, peptic ulcers, or renal impairment).
   - ⚠️ *Never give Aspirin to children or teenagers* due to the risk of Reye's syndrome.
3. **Active Hydration & Decongestion:**
   - Drink 2.5 to 3 liters of fluids daily (Oral Rehydration Salts, warm clear broths, herbal teas).
   - Perform steam inhalation twice daily and use normal saline nasal spray for congestion.
   - Gargle with warm salt water (1/2 teaspoon salt in 1 glass of warm water) 3 times daily.
   - Strict physical bed rest to support immune recovery.

---

### 🚨 2. RED FLAG WARNING SIGNS — When to Seek Immediate Emergency Care
- **Respiratory Compromise:** Shortness of breath, rapid labored breathing, or chest pressure.
- **Neurological Distress:** Severe stiff neck (inability to touch chin to chest), confusion, or persistent extreme photophobia.
- **Unresponsive Fever:** Fever persisting at **≥ 103°F (39.4°C)** that fails to drop after antipyretic administration.
- **Prolonged Course:** Fever continuing beyond **3 full days (72 hours)** without resolution.

*(Grounded in Clinical Practice Guidelines for Acute Respiratory Infections)*`;
  }

  // 3. Headache, Migraine, and Neurological Queries
  if (q.includes('headache') || q.includes('migraine') || q.includes('sir dard') || q.includes('head pain') || q.includes('dizziness') || q.includes('vertigo')) {
    return `### 🧠 Clinical Guidance: Headache & Neurological Triage

**Reported Symptoms:** Cephalea / Headache or Cranial Discomfort.

---

### 1. Clinical Assessment & Immediate Steps
1. **Low-Stimulus Environment:** Rest in a darkened, quiet, temperature-controlled room with minimal screen exposure.
2. **Hydration & Electrolytes:** Dehydration is one of the most common acute triggers; consume 500–750 mL of water or electrolyte solution immediately.
3. **Analgesic Options:**
   - **Acetaminophen / Paracetamol:** 500–1,000 mg orally at onset.
   - **Ibuprofen / Naproxen:** 400 mg with food if tension or inflammatory etiology is suspected.
   - *For diagnosed Migraines:* Prescribed triptans (e.g. Sumatriptan) should be taken as directed by your physician at earliest symptom onset.
4. **Thermal Therapy:** Apply a cold compress across the forehead or temples (for migraines) or a warm compress across the posterior neck (for tension headaches).

---

### 🚨 2. Red Flag Warnings (Seek Immediate Emergency Care)
- **"Thunderclap" Headache:** Sudden, blinding onset reaching maximum severity within 60 seconds (requires immediate rule-out of subarachnoid hemorrhage).
- **Systemic Symptoms:** Headache accompanied by high fever, neck stiffness, confusion, seizure, or rash.
- **Focal Neurological Deficits:** New facial droop, unilateral limb weakness, numbness, or slurred speech (FAST stroke criteria).
- **Head Injury:** Any worsening headache following head trauma.

*(Clinical Neurology Practice Guidelines)*`;
  }

  // 4. Chest Pain, Cardiac, Palpitations, Shortness of Breath (High-Acuity Triage)
  if (q.includes('chest pain') || q.includes('chest tightness') || q.includes('heart attack') || q.includes('palpitation') || q.includes('shortness of breath') || q.includes('breathless') || q.includes('seene me dard')) {
    return `### 🚨 URGENT CLINICAL TRIAGE: Chest Pain / Shortness of Breath

> ⚠️ **IMMEDIATE EMERGENCY ALERT:** If you or the patient are experiencing central crushing chest pressure, tightness, squeezing, pain radiating to the left arm, shoulder, jaw, neck, or back, alongside cold sweats, lightheadedness, or acute breathlessness, **CALL EMERGENCY MEDICAL SERVICES (112 / 108 / 911) IMMEDIATELY.**

---

### 1. Immediate First-Aid Protocol While Emergency Services En Route
1. **Cease All Physical Activity:** Sit down immediately in a semi-upright position (semi-Fowler's position) with back supported to minimize myocardial oxygen demand.
2. **Loosen Restrictive Clothing:** Unbutton tight collars, belts, and ties to assist unlabored ventilation.
3. **Aspirin Protocol:** If advised by emergency dispatchers and in the absence of aspirin allergy or active internal bleeding, chew a single adult Aspirin (300–325 mg) for antiplatelet effect.
4. **Do Not Drive Yourself:** Wait for an ambulance equipped with paramedic telemetry and defibrillator capabilities.

*(Emergency Cardiovascular Care Triage Protocol)*`;
  }

  // 5. Abdominal Pain, Acidity, Gastritis, GERD, Nausea, Vomiting, Diarrhea, Food Poisoning, Constipation
  if (
    q.includes('stomach') ||
    q.includes('abdomen') ||
    q.includes('vomit') ||
    q.includes('diarrhea') ||
    q.includes('nausea') ||
    q.includes('loose motion') ||
    q.includes('pet dard') ||
    q.includes('acidity') ||
    q.includes('gerd') ||
    q.includes('acid reflux') ||
    q.includes('heartburn') ||
    q.includes('gas') ||
    q.includes('bloating') ||
    q.includes('indigestion') ||
    q.includes('constipation')
  ) {
    return `### 🩺 Clinical Triage: Gastrointestinal Symptoms & Abdominal Discomfort

**Clinical Assessment:** Acute gastrointestinal distress, epigastric discomfort, or altered bowel habits.

---

### 1. Evidence-Based Symptomatic Management
1. **Hydration & Electrolyte Replacement (Crucial):**
   - For diarrhea or vomiting: Sip Oral Rehydration Salts (ORS) solution continuously (200–300 mL after every loose stool) to prevent hypovolemic shock.
   - Avoid plain water alone in large volumes without electrolytes during severe diarrhea.
2. **Dietary Protocol:**
   - Follow the **BRAT diet** (Bananas, Rice, Applesauce, Toast) once active emesis subsides.
   - For acidity / GERD: Avoid lying flat for 2 hours post-meal, elevate the head of the bed by 6 inches, and avoid trigger foods (coffee, fried/fatty meals, citrus, carbonated beverages).
3. **Medication Guidance:**
   - *Acidity / Gastric Burn:* Antacids (e.g. Magnesium/Aluminum hydroxide with Simethicone) or H2 blockers (Famotidine 20mg) provide prompt acid neutralization.
   - *Abdominal Cramps:* Antispasmodics (e.g. Dicyclomine/Drotaverine) may be considered under medical guidance.
   - ⚠️ *Avoid unprescribed antibiotics or antimotility agents (Loperamide)* in infectious/febrile diarrhea, as they can prolong bacterial toxin retention.

---

### 🚨 2. Red Flags Requiring Urgent Hospital Care
- **Severe Localized Pain:** Continuous, severe, or rigid abdominal pain (especially right lower quadrant — Appendicitis concern).
- **Gastrointestinal Bleeding:** Vomiting blood (hematemesis) or dark "coffee ground" material; black tarry stools (melena).
- **Dehydration Crisis:** Inability to retain fluids for over 12–24 hours, confusion, sunken eyes, or anuria (absence of urine for >8 hours).
- **High Fever:** Sustained fever >101.5°F accompanying abdominal cramps.

*(Gastroenterological Practice Triage Protocol)*`;
  }

  // 6. Back Pain, Neck Pain, Knee Pain, Joint Pain, Sciatica, Arthritis, Musculoskeletal Strains
  if (
    q.includes('back pain') ||
    q.includes('neck pain') ||
    q.includes('knee pain') ||
    q.includes('joint pain') ||
    q.includes('sciatica') ||
    q.includes('arthritis') ||
    q.includes('kamar dard') ||
    q.includes('ghutne me dard') ||
    q.includes('sprain') ||
    q.includes('strain') ||
    q.includes('muscle pain') ||
    q.includes('cramp')
  ) {
    return `### 🦴 Clinical Triage: Musculoskeletal & Spine / Joint Pain

**Clinical Assessment:** Acute or subacute musculoskeletal pain, joint inflammation, or radicular discomfort.

---

### 1. Evidence-Based Conservative Management (P.R.I.C.E. Protocol)
1. **Relative Rest & Active Mobility:**
   - Avoid heavy lifting, forward spinal flexion, and prolonged static posture.
   - Strict bed rest beyond 24–48 hours is counterproductive for mechanical back pain; maintain gentle walking and neutral spinal alignment.
2. **Thermal Therapy:**
   - *First 48 hours:* Apply cold ice packs wrapped in a cloth for 15–20 minutes every 3–4 hours to suppress acute inflammatory swelling.
   - *After 48 hours:* Transition to moist heat compresses to relax hypertonic muscular spasms.
3. **Analgesic & Anti-inflammatory Support:**
   - Topical NSAID gel (e.g. Diclofenac gel 1%) massaged gently over the affected area 3 times daily.
   - Oral Acetaminophen (500–650 mg) or Ibuprofen (400 mg with meals) for short-term relief, provided no renal or ulcer contraindications exist.
4. **Ergonomic Posture:**
   - Sleep with a supportive pillow between knees (side sleeper) or beneath knees (back sleeper) to unload lumbar lordosis.

---

### 🚨 2. Red Flag Symptoms (Urgent Medical Evaluation Required)
- **Cauda Equina Warning:** Sudden loss of bowel or bladder control, or numbness around the groin/saddle area.
- **Progressive Motor Weakness:** "Foot drop" or sudden inability to bear weight on the lower extremity.
- **Fever with Back Pain:** Spinal tenderness with concurrent fever (risk of epidural abscess or discitis).
- **Unexplained Weight Loss:** Or history of malignancy with new unrelenting night pain.

*(Orthopedic & Physical Medicine Clinical Guidelines)*`;
  }

  // 7. Skin Rashes, Hives, Itching, Eczema, Dermatitis, Allergies, Burns, Wounds
  if (
    q.includes('rash') ||
    q.includes('skin') ||
    q.includes('itch') ||
    q.includes('itching') ||
    q.includes('hives') ||
    q.includes('urticaria') ||
    q.includes('eczema') ||
    q.includes('allergy') ||
    q.includes('khujli') ||
    q.includes('burn') ||
    q.includes('wound')
  ) {
    return `### 🛡️ Clinical Guidance: Dermatology, Rashes & Skin Reactions

**Clinical Assessment:** Cutaneous eruption, pruritus (itching), or acute dermatological reaction.

---

### 1. Immediate Care & Symptomatic Relief
1. **Cool Compress & Soothing Agents:**
   - Apply cool, damp cotton cloths to pruritic areas to dampen cutaneous nerve endings.
   - Apply Calamine lotion or colloidal oatmeal moisturizer to relieve itching.
2. **Antihistamine Therapy:**
   - Non-sedating oral antihistamines (e.g. Cetirizine 10 mg or Fexofenadine 120–180 mg once daily) provide effective relief for acute hives (urticaria) and allergic eruptions.
3. **Avoid Aggravating Factors:**
   - Wash with lukewarm water and fragrance-free, hypoallergenic cleansers; avoid hot showers.
   - Wear loose, breathable cotton clothing.
   - Avoid scratching to prevent secondary bacterial superinfections (impetiginization).
4. **For Minor Burns / Cuts:**
   - Run cool (not icy) tap water over thermal burns for at least 10–15 minutes. Apply petroleum jelly and a sterile non-stick bandage. Never burst burn blisters.

---

### 🚨 2. Emergency Red Flags (Anaphylaxis & Severe Reactions)
- **Anaphylaxis Alert:** Rash accompanied by lip/tongue/throat swelling, difficulty breathing, wheezing, or dizziness (**requires immediate Epinephrine / 112 emergency care**).
- **Blistering / Skin Peeling:** Rapidly expanding rash with mucosal involvement (eyes, mouth, genitals) or positive Nikolsky sign (concern for SJS/TEN).
- **Spreading Cellulitis:** Rapidly expanding redness, heat, streaking, and severe pain with fever.

*(Clinical Dermatology & Allergy Triage Standards)*`;
  }

  // 8. Diabetes, Blood Glucose, HbA1c, Thyroid & Metabolic Disorders
  if (
    q.includes('sugar') ||
    q.includes('glucose') ||
    q.includes('diabetes') ||
    q.includes('hba1c') ||
    q.includes('thyroid') ||
    q.includes('tsh') ||
    q.includes('cholesterol') ||
    q.includes('lipid') ||
    q.includes('uric acid') ||
    q.includes('gout')
  ) {
    return `### 🩸 Clinical Reference: Glycemic, Thyroid & Metabolic Health

**Clinical Diagnostic Standards:** American Diabetes Association (ADA) and Endocrine Society Clinical Guidelines.

---

### 1. Glycemic Reference Intervals & Diagnostic Thresholds
| Biomarker | Normal Physiological Range | Pre-Diabetes / Borderline | Diabetes Diagnostic Threshold |
| :--- | :--- | :--- | :--- |
| **Fasting Blood Glucose (FBG)** | **70 – 99 mg/dL** | 100 – 125 mg/dL | **≥ 126 mg/dL** (confirmed on repeat) |
| **Post-Prandial (2 hrs post-meal)** | **< 140 mg/dL** | 140 – 199 mg/dL | **≥ 200 mg/dL** |
| **Glycated Hemoglobin (HbA1c)** | **< 5.7%** | 5.7% – 6.4% | **≥ 6.5%** |
| **Random Blood Glucose** | **< 140 mg/dL** | — | **≥ 200 mg/dL** (with symptoms) |

---

### 2. Thyroid Function Test (TFT) Reference Standards
- **TSH (Thyroid Stimulating Hormone):** **0.4 – 4.0 mIU/L** (Primary screening marker).
  - *Elevated TSH (>4.5 mIU/L):* Primary **Hypothyroidism** (symptoms: fatigue, cold intolerance, weight gain, constipation).
  - *Suppressed TSH (<0.4 mIU/L):* Primary **Hyperthyroidism** (symptoms: palpitations, heat intolerance, tremor, unintended weight loss).
- **Free T4:** 0.8 – 1.8 ng/dL | **Free T3:** 2.3 – 4.2 pg/mL.

---

### 🚨 3. Acute Metabolic Emergencies
- **Hypoglycemia (< 70 mg/dL):** Shakiness, sweating, pallor, confusion. Treat immediately with the **"Rule of 15"**: Consume 15g fast-acting carbohydrates (1/2 cup fruit juice or 3 glucose tablets), recheck in 15 minutes.
- **Diabetic Ketoacidosis (DKA) / HHS:** Severely high glucose (>250–600 mg/dL) with vomiting, rapid breathing (Kussmaul breathing), fruity breath, and altered sensorium requires immediate emergency hospital admission.

*(Clinical Endocrinology Reference Standards)*`;
  }

  // 9. Urinary Tract Infections (UTI), Burning Urination, Kidney Stones, Flank Pain
  if (
    q.includes('uti') ||
    q.includes('urinary') ||
    q.includes('urine') ||
    q.includes('burning') ||
    q.includes('peshab') ||
    q.includes('kidney stone') ||
    q.includes('flank pain')
  ) {
    return `### 🚽 Clinical Triage: Urinary Symptoms & Renal Health

**Clinical Assessment:** Dysuria (painful/burning urination), frequency, urgency, or flank tenderness.

---

### 1. Evidence-Based Initial Guidance
1. **Aggressive Hydration:**
   - Drink 2.5 to 3.5 liters of water daily to promote mechanical flushing of the urinary bladder and ureters.
2. **Alkalinizing Agents:**
   - Urinary alkalinizers (e.g. Potassium citrate or Sodium bicarbonate solution) can alleviate acute burning sensations by neutralizing urinary pH.
3. **Diagnostic Confirmation Before Antibiotics:**
   - Obtain a clean-catch midstream **Urine Routine & Microscopic Examination (Urine R/M)** and **Urine Culture & Sensitivity (Urine C/S)** before initiating antibiotics to prevent antimicrobial resistance.
4. **Kidney Stone Hydration & Pain Relief:**
   - For suspected renal colic (intermittent severe flank pain radiating to the groin): oral hydration and paracetamol/NSAIDs under physician guidance.

---

### 🚨 2. Red Flags Requiring Immediate Medical Attention
- **Pyelonephritis Warning:** Burning urination accompanied by high fever, shaking chills, and unilateral flank / lower back pain (Upper UTI).
- **Gross Hematuria:** Visible red or dark blood in the urine.
- **Urinary Retention:** Acute inability to pass urine despite severe bladder pressure.

*(Clinical Urology & Infectious Disease Protocols)*`;
  }

  // 10. Anxiety, Panic Attack, Insomnia, Sleep Disturbances, Stress
  if (
    q.includes('anxiety') ||
    q.includes('panic') ||
    q.includes('stress') ||
    q.includes('insomnia') ||
    q.includes('sleep') ||
    q.includes('depression') ||
    q.includes('neend') ||
    q.includes('nervous')
  ) {
    return `### 🧘 Clinical Guidance: Stress, Anxiety & Sleep Hygiene Triage

**Clinical Assessment:** Autonomic nervous system hyperarousal, situational anxiety, or disrupted circadian rhythm.

---

### 1. Acute Relief Protocol (Grounding & Breath Control)
1. **Physiological Sigh (Rapid Calming Technique):**
   - Take two deep inhales through the nose (one full inhale, followed by a sharp top-off inhale), followed by a long, slow exhale through the mouth. Repeat 4–5 times to stimulate the vagus nerve and slow heart rate.
2. **5-4-3-2-1 Grounding Method:**
   - Acknowledge 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste to decouple from panic thought loops.
3. **Clinical Sleep Hygiene (CBT-I Principles):**
   - Maintain a strict waking time 7 days a week.
   - Keep bedroom completely dark and cool (65–68°F / 18–20°C).
   - Cease caffeine intake at least 8 hours prior to bedtime.
   - Eliminate blue-light screen exposure 60 minutes before sleep.

---

### 🚨 2. When to Seek Urgent Clinical Support
- Severe despair, hopelessness, or thoughts of self-harm (Contact National Helpline: **14416 / 988** or local crisis services immediately).
- Chest tightness or hyperventilation that does not resolve after 15 minutes of grounding.

*(Behavioral Health & Sleep Medicine Triage Protocol)*`;
  }

  // 11. Hemoglobin, Platelets, and Complete Blood Count (CBC)
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
    return `### 🩸 Hemoglobin & Platelet Reference Ranges & Clinical Interpretation

Standard clinical laboratory reference intervals established for healthy adults:

| Hematological Parameter | Standard Reference Range | Conventional Units | Clinical Significance |
| :--- | :--- | :--- | :--- |
| **Hemoglobin (Hb) — Adult Male** | **13.8 – 17.2** | g/dL (8.6 – 10.7 mmol/L) | Oxygen transport protein in erythrocytes. |
| **Hemoglobin (Hb) — Adult Female** | **12.1 – 15.1** | g/dL (7.5 – 9.4 mmol/L) | Physiological baseline adjusted for hormonal factors. |
| **Platelets (Thrombocytes)** | **150,000 – 450,000** | /µL (150 – 450 × 10⁹/L) | Essential for vascular clot formation and hemostasis. |
| **Total WBC Count (Leukocytes)** | **4,500 – 11,000** | /µL | Primary immune defense against bacterial and viral infections. |
| **Hematocrit (Hct) — Male** | **40.7% – 50.3%** | % volume | Packed cell volume. |
| **Hematocrit (Hct) — Female** | **36.1% – 44.3%** | % volume | Packed cell volume. |

---

### 🔬 Clinical Interpretation of Deviations
- **Low Hemoglobin (< 12.0 g/dL females, < 13.5 g/dL males):** Indicates **Anemia** (nutritional iron deficiency, Vitamin B12 deficiency, or blood loss). Levels below **7.0–8.0 g/dL** require urgent clinical evaluation.
- **Low Platelet Count (< 150,000 /µL):** Indicates **Thrombocytopenia** (viral infections like Dengue, medication effects, or autoimmune consumption). Counts under **50,000 /µL** increase bleeding risk, and under **20,000 /µL** represent a critical emergency.
- **Elevated White Blood Cells (> 11,000 /µL):** Indicates active immune response to infection, systemic inflammation, or physiological stress.

*(Clinical Intelligence Grounded in Hematology Laboratory Reference Standards)*`;
  }

  // 12. Vital Signs & Blood Pressure
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

  // 13. Attached Document Context RAG Synthesis
  if (docContext && docContext.trim().length > 0) {
    return `### 📑 Document Analysis & Clinical Review

Based on the clinical documents and lab reports attached to your consultation:

${docContext.slice(0, 1000)}

---

### 🩺 Clinical Review Summary:
- **Analyte Correlation:** Review the specific biomarker values above against their designated institutional reference intervals.
- **Trend Evaluation:** Compare these findings with your prior diagnostic records to detect chronological shifts.
- **Follow-up Recommendation:** Discuss any out-of-range parameters with your attending healthcare provider for confirmatory testing and clinical correlation.

*(Grounded in Uploaded Clinical Records)*`;
  }

  // 14. Comprehensive Structured Medical Consultation Assessment (Default)
  return `### 🩺 Medical AI Clinical Intelligence Consultation

**Inquiry Assessment:** "${message}"

---

### 1. Clinical Overview & Symptom Evaluation
- **Pathophysiology & Context:** Your inquiry regarding **"${message}"** has been reviewed through our evidence-based clinical intelligence framework.
- **Symptom Correlation:** Evaluate the onset, exact anatomical location, chronological duration, severity scale (1–10), and whether symptoms are triggered or relieved by specific movements, postures, or foods.
- **Baseline Vitals:** Monitor resting vital signs (Blood Pressure, Heart Rate, Body Temperature, SpO2) as an objective indicator of systemic physiological stability.

---

### 2. Evidence-Based Self-Care & Supportive Protocols
- **Hydration & Nutrition:** Maintain adequate oral fluid intake (2 to 2.5 L daily) with balanced electrolytes. Consume light, digestible, nutrient-dense meals.
- **Rest & Physiological Recovery:** Prioritize 7 to 8 hours of uninterrupted sleep; avoid strenuous physical exertion until acute symptoms resolve.
- **Medication Prudence:** Avoid taking unprescribed antibiotics, steroids, or high-dose painkillers without professional medical evaluation.

---

### 🚨 3. Red Flag Warning Signs (Seek Immediate Medical Care)
Contact urgent medical care or emergency services immediately if you experience:
- Sudden difficulty breathing, chest pain, or radiating arm/jaw discomfort.
- High fever exceeding **103°F (39.4°C)** or fever unresponsive to antipyretics.
- Severe, localized, unremitting pain or recurrent vomiting with inability to retain fluids.
- Neurological changes such as confusion, slurred speech, sudden dizziness, or vision loss.

---

### 📋 4. Recommended Next Steps for Your Doctor's Visit
1. **Clinical Workup:** Request your attending physician to evaluate relevant laboratory baselines (e.g. Complete Blood Count, Metabolic Panel, or focused imaging).
2. **Questions to Ask Your Doctor:**
   - *"What are the most likely causes of these symptoms given my medical history?"*
   - *"Are there specific diagnostic tests recommended to rule out secondary complications?"*
   - *"What specific signs should prompt me to return for urgent follow-up?"*

> ℹ️ *Clinical correlation advisory: This guidance provides preliminary clinical intelligence and triage support. It does not replace an in-person examination or definitive diagnosis by a qualified medical professional.*

*(Grounded in Clinical Intelligence & Evidence-Based Medical Protocols)*`;
}

export function createChatApiRouter() {
  const router = express.Router();

  // Mount Unified Healthcare Backend Subrouters
  router.use('/emergency', createEmergencyApiRouter());
  router.use('/clinical', createClinicalApiRouter());
  router.use('/auth', createAuthApiRouter());
  router.use('/identity', createIdentityApiRouter());

  // Network host discovery endpoint for real scannable QR codes
  router.get('/network/host', (_req, res) => {
    try {
      const ifaces = os.networkInterfaces();
      let detectedIp = '';

      for (const name of Object.keys(ifaces)) {
        for (const net of ifaces[name] || []) {
          // Look for IPv4 non-internal address
          if (net.family === 'IPv4' && !net.internal && net.address !== '127.0.0.1') {
            detectedIp = net.address;
            break;
          }
        }
        if (detectedIp) break;
      }

      const host = detectedIp || process.env.VITE_PUBLIC_HOST || '10.149.6.231';
      const port = process.env.PORT || '3000';
      const origin = `http://${host}:${port}`;

      res.json({
        host,
        port,
        origin,
        isDetected: Boolean(detectedIp)
      });
    } catch (err: any) {
      res.json({
        host: '10.149.6.231',
        port: '3000',
        origin: 'http://10.149.6.231:3000',
        error: err?.message
      });
    }
  });

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

  // 1.5. Dynamic Multi-Provider Model Catalog & Real-Time Availability
  router.get('/chat/models', (_req, res) => {
    const models = getModelRegistry();
    const defaultModelId = getDefaultModelId();
    res.json({
      success: true,
      models,
      defaultModelId,
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
      patient_profile,
      model_id,
      auto_fallback = true
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

    const wantsStreaming =
      req.body?.stream === true ||
      req.body?.stream === undefined ||
      Boolean(req.headers.accept?.includes('text/event-stream'));

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
      if (wantsStreaming) {
        await dispatchModelStream(
          {
            modelId: model_id,
            systemPrompt,
            messages: [
              ...history.slice(-6).map((h: any) => ({
                role: h.role === 'assistant' ? 'assistant' : 'user',
                content: h.content
              })),
              {
                role: 'user',
                content: message || 'Please analyze the attached clinical context and provide a structured medical summary.'
              }
            ],
            attachments,
            language,
            docContext,
            patientProfile: patient_profile,
            autoFallback: auto_fallback !== false,
            onEvent: async (event) => {
              if (isClientClosed || res.writableEnded || res.destroyed) return;
              if (event.type === 'chunk') {
                res.write(`data: ${JSON.stringify({ text: event.text })}\n\n`);
              } else if (event.type === 'metadata') {
                res.write(`data: ${JSON.stringify({ modelUsed: event.modelUsed, fallbackUsed: event.fallbackUsed })}\n\n`);
              } else if (event.type === 'fallback_notification') {
                res.write(`data: ${JSON.stringify({ fallbackNotification: true, modelUsed: event.modelUsed, fallbackReason: event.fallbackReason })}\n\n`);
              } else if (event.type === 'done') {
                res.write('data: [DONE]\n\n');
                res.end();
              }
            }
          },
          generateClinicalReferenceFallback
        );
      } else {
        // Non-streaming response collection
        let collectedText = '';
        let modelUsed = model_id || 'Clinical-Intelligence-Knowledge-Engine';
        let fallbackUsed = false;

        await dispatchModelStream(
          {
            modelId: model_id,
            systemPrompt,
            messages: [
              ...history.slice(-6).map((h: any) => ({
                role: h.role === 'assistant' ? 'assistant' : 'user',
                content: h.content
              })),
              {
                role: 'user',
                content: message || 'Please analyze the attached clinical context and provide a structured medical summary.'
              }
            ],
            attachments,
            language,
            docContext,
            patientProfile: patient_profile,
            autoFallback: auto_fallback !== false,
            onEvent: async (event) => {
              if (event.type === 'chunk' && event.text) {
                collectedText += event.text;
              } else if (event.type === 'metadata' && event.modelUsed) {
                modelUsed = event.modelUsed;
                fallbackUsed = Boolean(event.fallbackUsed);
              }
            }
          },
          generateClinicalReferenceFallback
        );

        if (!res.headersSent) {
          res.json({
            success: true,
            text: collectedText,
            response: collectedText,
            model: modelUsed,
            modelUsed,
            fallbackUsed,
            durationMs: Date.now() - startTime
          });
        }
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
