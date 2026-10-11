// Step-by-step verification script for Medical AI Chatbot & Voice Endpoints
const http = require('http');

function postChat(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk.toString();
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, data: rawData });
        });
      }
    );

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

function getHealth() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000/api/health', (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, data: raw }));
    }).on('error', reject);
  });
}

function parseSSEData(rawSSE) {
  if (!rawSSE) return '';
  try {
    const directJson = JSON.parse(rawSSE);
    if (directJson.text) return directJson.text;
  } catch {}

  const lines = rawSSE.split('\n');
  let accumulated = '';
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload);
        const piece = json.text || json.chunk || json.content || '';
        accumulated += piece;
      } catch (e) {
        // ignore raw text chunk
      }
    }
  }
  return accumulated;
}

async function runStep(stepNum, name, testFn) {
  console.log(`\n======================================================`);
  console.log(`[STEP ${stepNum}] ${name}`);
  console.log(`======================================================`);
  try {
    const result = await testFn();
    console.log(`>>> RESULT: SUCCESS`);
    return result;
  } catch (err) {
    console.error(`>>> RESULT: FAILED:`, err.message || err);
    throw err;
  }
}

async function main() {
  const targetStep = process.argv[2] ? parseInt(process.argv[2], 10) : null;

  const steps = [
    {
      num: 1,
      name: 'Verify API Health Endpoint (/api/health)',
      fn: async () => {
        const res = await getHealth();
        console.log('Status Code:', res.statusCode);
        console.log('Response:', res.data);
        if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
        const parsed = JSON.parse(res.data);
        if (parsed.status !== 'ok') throw new Error('Health check status not ok');
      }
    },
    {
      num: 2,
      name: 'Test Conversational Query ("Hello")',
      fn: async () => {
        const res = await postChat({
          message: 'Hello',
          language: 'en',
          searchMode: 'general'
        });
        console.log('Status Code:', res.statusCode);
        const text = parseSSEData(res.data);
        console.log('AI Response:\n', text.trim().slice(0, 300) + '...');
        if (!text || text.length < 5) throw new Error('Empty AI response');
      }
    },
    {
      num: 3,
      name: 'Test Medical Explanation Query ("What is hemoglobin?")',
      fn: async () => {
        const res = await postChat({
          message: 'What is hemoglobin?',
          language: 'en',
          searchMode: 'general'
        });
        console.log('Status Code:', res.statusCode);
        const text = parseSSEData(res.data);
        console.log('AI Response:\n', text.trim().slice(0, 350) + '...');
        if (!text.toLowerCase().includes('hemoglobin') && !text.toLowerCase().includes('protein')) {
          throw new Error('Response does not explain hemoglobin');
        }
      }
    },
    {
      num: 4,
      name: 'Test Multilingual Hindi Query ("मेरा Hb क्या होता है?")',
      fn: async () => {
        const res = await postChat({
          message: 'मेरा Hb क्या होता है?',
          language: 'hi',
          searchMode: 'general'
        });
        console.log('Status Code:', res.statusCode);
        const text = parseSSEData(res.data);
        console.log('AI Hindi Response:\n', text.trim().slice(0, 300) + '...');
        if (!text || text.length < 10) throw new Error('Empty Hindi response');
      }
    },
    {
      num: 5,
      name: 'Test Multilingual Bengali Query ("আমার রক্তের রিপোর্টটা বুঝিয়ে বলো")',
      fn: async () => {
        const res = await postChat({
          message: 'আমার রক্তের রিপোর্টটা বুঝিয়ে বলো',
          language: 'bn',
          searchMode: 'general'
        });
        console.log('Status Code:', res.statusCode);
        const text = parseSSEData(res.data);
        console.log('AI Bengali Response:\n', text.trim().slice(0, 300) + '...');
        if (!text || text.length < 10) throw new Error('Empty Bengali response');
      }
    },
    {
      num: 6,
      name: 'Test Hinglish Query ("Mera blood report explain karo")',
      fn: async () => {
        const res = await postChat({
          message: 'Mera blood report explain karo',
          language: 'hi',
          searchMode: 'general'
        });
        console.log('Status Code:', res.statusCode);
        const text = parseSSEData(res.data);
        console.log('AI Hinglish Response:\n', text.trim().slice(0, 300) + '...');
        if (!text || text.length < 10) throw new Error('Empty Hinglish response');
      }
    },
    {
      num: 7,
      name: 'Test Document RAG Query ("What is my hemoglobin level?") with Blood Report Chunks',
      fn: async () => {
        const res = await postChat({
          message: 'What is my hemoglobin level?',
          language: 'en',
          searchMode: 'document',
          documentChunks: [
            {
              id: 'chk-cbc-01',
              documentName: 'Complete_Blood_Count_Oct2026.pdf',
              pageNumber: 1,
              content: 'Patient Name: Demo Patient. Test: Hemoglobin (Hb). Result: 10.8 g/dL. Reference Range: 13.0 - 17.0 g/dL. Interpretation: Mild microcytic anemia.'
            }
          ]
        });
        console.log('Status Code:', res.statusCode);
        const text = parseSSEData(res.data);
        console.log('AI Document-Grounded Response:\n', text.trim());
        if (!text.includes('10.8')) {
          throw new Error('Response did not cite the exact 10.8 g/dL value from the document chunk');
        }
      }
    },
    {
      num: 8,
      name: 'Test Multi-Document Comparison Query with 2 Report Chunks',
      fn: async () => {
        const res = await postChat({
          message: 'Compare my current and previous blood reports.',
          language: 'en',
          searchMode: 'document',
          documentChunks: [
            {
              id: 'chk-curr-01',
              documentName: 'Current_CBC_Oct2026.pdf',
              pageNumber: 1,
              content: 'Current CBC Report: Hemoglobin is 10.8 g/dL, Platelets: 210,000 /uL.'
            },
            {
              id: 'chk-prev-01',
              documentName: 'Previous_CBC_Jun2026.pdf',
              pageNumber: 1,
              content: 'Previous CBC Report: Hemoglobin was 9.4 g/dL, Platelets: 195,000 /uL.'
            }
          ]
        });
        console.log('Status Code:', res.statusCode);
        const text = parseSSEData(res.data);
        console.log('AI Comparison Response:\n', text.trim().slice(0, 450) + '...');
        if (!text.includes('10.8') || !text.includes('9.4')) {
          throw new Error('Comparison did not include values from both documents (10.8 and 9.4)');
        }
      }
    }
  ];

  for (const step of steps) {
    if (targetStep !== null && step.num !== targetStep) continue;
    await runStep(step.num, step.name, step.fn);
  }

  console.log('\n======================================================');
  console.log('ALL VERIFICATION STEPS COMPLETED SUCCESSFULLY!');
  console.log('======================================================\n');
}

main().catch(() => process.exit(1));
