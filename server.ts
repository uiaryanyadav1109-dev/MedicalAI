import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createChatApiRouter } from './src/server/chatApi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  next();
});

// JSON body parsing with large limit for clinical report uploads / images
app.use(express.json({ limit: '25mb' }));

// Mount full-stack clinical & triage backend API
app.use('/api', createChatApiRouter());

// Serve compiled static assets from Vite dist/
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Healthcheck endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback: any other request serves index.html
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Production Server] Medical AI running at http://0.0.0.0:${PORT}`);
});
