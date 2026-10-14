import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';
import express from 'express';
import { createChatApiRouter } from './src/server/chatApi';

function medicalApiPlugin(): Plugin {
  return {
    name: 'medical-api-plugin',
    configureServer(server) {
      // Ensure medilab hero doctor image is available in public directory
      const heroSrc = path.resolve('C:/Users/acer/.gemini/antigravity-ide/brain/4127f41d-0ba2-4850-9782-05969fa4d185/medilab_hero_doctor_1791901678489.jpg');
      const publicImagesDir = path.resolve(__dirname, 'public/images');
      if (fs.existsSync(heroSrc)) {
        try {
          if (!fs.existsSync(publicImagesDir)) {
            fs.mkdirSync(publicImagesDir, { recursive: true });
          }
          fs.copyFileSync(heroSrc, path.join(publicImagesDir, 'medilab_hero_doctor.jpg'));
        } catch (err) {
          console.warn('[Vite] Could not copy hero image:', err);
        }
      }

      const app = express();
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
      app.use(express.json({ limit: '25mb' }));
      app.get('/images/medilab_hero_doctor.jpg', (req, res) => {
        if (fs.existsSync(heroSrc)) {
          res.setHeader('Content-Type', 'image/jpeg');
          res.sendFile(heroSrc);
        } else {
          res.status(404).end();
        }
      });
      app.use('/api', createChatApiRouter());
      server.middlewares.use(app);
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), medicalApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching for database JSON files to prevent reload loops when server writes to db
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/src/server/db/**', '**/medicalDatabase.json', '**/*.json']
      },
    },
  };
});
