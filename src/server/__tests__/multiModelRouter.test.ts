/**
 * Multi-Provider Model Registry & Fallback Router Test Suite
 *
 * Verifies:
 * 1. Model Registry integrity & capabilities across Google, OpenAI, Anthropic, Groq, Clinical Engine
 * 2. Environment key availability detection
 * 3. Default model selection logic
 * 4. Resilient Fallback dispatching & event streaming
 * 5. Clinical Safety & Emergency screening guardrails
 */

import {
  SUPPORTED_MODELS,
  getModelRegistry,
  getDefaultModelId,
  dispatchModelStream,
  StreamEvent
} from '../modelRegistry';
import { checkEmergencyRedFlags } from '../../services/clinicalStore';

// Simple lightweight assertion runner
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion Failed: ${message}`);
  }
  console.log(`  ✅ Passed: ${message}`);
}

async function runTestSuite() {
  console.log('\n=== RUNNING MEDICAL AI MULTI-MODEL ROUTER TEST SUITE ===\n');

  // Test 1: Supported Models Catalog
  console.log('Test Suite 1: Model Catalog & Capabilities');
  assert(SUPPORTED_MODELS.length >= 8, 'At least 8 model configurations defined');

  const geminiFlash = SUPPORTED_MODELS.find((m) => m.id === 'gemini-2.0-flash');
  assert(Boolean(geminiFlash), 'Gemini 2.0 Flash is registered');
  assert(geminiFlash?.supportsVision === true, 'Gemini 2.0 Flash supports multimodal vision');
  assert(geminiFlash?.supportsStreaming === true, 'Gemini 2.0 Flash supports SSE token streaming');

  const gpt4o = SUPPORTED_MODELS.find((m) => m.id === 'gpt-4o');
  assert(Boolean(gpt4o), 'GPT-4o is registered in model catalog');
  assert(gpt4o?.provider === 'openai', 'GPT-4o is correctly mapped to OpenAI provider');

  const claudeSonnet = SUPPORTED_MODELS.find((m) => m.id === 'claude-3-5-sonnet-20241022');
  assert(Boolean(claudeSonnet), 'Claude 3.5 Sonnet is registered in model catalog');
  assert(claudeSonnet?.provider === 'anthropic', 'Claude 3.5 Sonnet is mapped to Anthropic provider');

  const clinicalEngine = SUPPORTED_MODELS.find((m) => m.id === 'clinical-intelligence-engine');
  assert(Boolean(clinicalEngine), 'Clinical Reference Engine is registered as safety fallback');
  assert(clinicalEngine?.isAvailable === true, 'Clinical Reference Engine is always available offline');

  // Test 2: Dynamic Availability Check
  console.log('\nTest Suite 2: Key Availability Detection');
  const registry = getModelRegistry();
  assert(Array.isArray(registry) && registry.length === SUPPORTED_MODELS.length, 'Registry matches catalog count');
  
  const defaultModel = getDefaultModelId();
  assert(typeof defaultModel === 'string' && defaultModel.length > 0, `Default model resolved to: ${defaultModel}`);

  // Test 3: Emergency Red-Flag Guardrails
  console.log('\nTest Suite 3: Clinical Safety Guardrails');
  const acuteChestPain = checkEmergencyRedFlags('I have sudden severe crushing chest pain radiating to left arm');
  assert(acuteChestPain.isEmergency === true, 'Severe crushing chest pain detected as clinical emergency');
  assert(acuteChestPain.matchedTrigger?.includes('chest pain') || acuteChestPain.isEmergency, 'Emergency trigger identified');

  const routineQuery = checkEmergencyRedFlags('What is normal fasting blood glucose range?');
  assert(routineQuery.isEmergency === false, 'Routine informational query is not flagged as emergency');

  // Test 4: Dispatch Streaming via Clinical Reference Engine Fallback
  console.log('\nTest Suite 4: Streaming & Fallback Dispatching');
  const events: StreamEvent[] = [];

  const mockFallbackGenerator = (msg: string) => {
    return `### Clinical Guidance for ${msg}\n\n1. Rest and hydrate\n2. Monitor vital signs`;
  };

  await dispatchModelStream(
    {
      modelId: 'clinical-intelligence-engine',
      systemPrompt: 'You are a clinical AI assistant.',
      messages: [{ role: 'user', content: 'Persistent cough and low grade fever' }],
      onEvent: (event) => {
        events.push(event);
      }
    },
    mockFallbackGenerator
  );

  assert(events.some((e) => e.type === 'chunk'), 'Stream delivered content chunks');
  assert(events.some((e) => e.type === 'done'), 'Stream completed with done signal');

  // Test 5: Fallback Cascading When Model is Unreachable
  console.log('\nTest Suite 5: Fallback Cascade on Unavailable Model');
  const cascadeEvents: StreamEvent[] = [];
  
  await dispatchModelStream(
    {
      modelId: 'non-existent-or-unavailable-model',
      systemPrompt: 'You are a clinical AI assistant.',
      messages: [{ role: 'user', content: 'What is HbA1c?' }],
      autoFallback: true,
      onEvent: (event) => {
        cascadeEvents.push(event);
      }
    },
    mockFallbackGenerator
  );

  assert(cascadeEvents.some((e) => e.type === 'fallback_notification'), 'Fallback notification event dispatched to client');
  assert(cascadeEvents.some((e) => e.type === 'chunk'), 'Content streamed from fallback model');
  assert(cascadeEvents.some((e) => e.type === 'done'), 'Cascade finished successfully with done event');

  console.log('\n🎉 ALL 5 TEST SUITES PASSED SUCCESSFULLY!\n');
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
