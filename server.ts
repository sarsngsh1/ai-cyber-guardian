import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Language, ToolType } from './src/types.ts';
import { analyzeContent, isGeminiConfigured } from './server/analyzer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const VALID_TOOLS = new Set<ToolType>(['scam', 'link', 'cyberbullying']);
const VALID_LANGUAGES = new Set<Language>(['en', 'ur', 'sd']);

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  const exportZipPath = path.resolve(
    __dirname,
    'exports',
    'ai-cyber-guardian-github-pages.zip',
  );

  // Stateless health check (exposes no secrets or user data)
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      aiAvailable: isGeminiConfigured(),
      privacyMode: 'stateless-no-storage',
      exportAvailable: fs.existsSync(exportZipPath),
    });
  });

  // Download complete GitHub Pages & source export ZIP
  app.get('/api/export-zip', (_req, res) => {
    if (!fs.existsSync(exportZipPath)) {
      res.status(404).json({ error: 'Export archive not found.' });
      return;
    }
    res.download(exportZipPath, 'ai-cyber-guardian-github-pages.zip');
  });

  // Stateless analysis endpoint — processes input in-memory only, stores nothing
  app.post('/api/analyze', async (req, res) => {
    try {
      const body = req.body as {
        tool?: unknown;
        input?: unknown;
        language?: unknown;
      };

      const tool = typeof body?.tool === 'string' ? (body.tool as ToolType) : null;
      const language =
        typeof body?.language === 'string' && VALID_LANGUAGES.has(body.language as Language)
          ? (body.language as Language)
          : 'en';
      const input = typeof body?.input === 'string' ? body.input.trim() : '';

      if (!tool || !VALID_TOOLS.has(tool)) {
        res.status(400).json({ error: 'Invalid analysis tool requested.' });
        return;
      }

      if (!input || input.length < 3) {
        res.status(400).json({ error: 'Please enter a message or link to analyze.' });
        return;
      }

      if (input.length > 4000) {
        res.status(400).json({ error: 'Input exceeds 4,000 character safety limit.' });
        return;
      }

      const result = await analyzeContent(tool, input, language);
      res.json(result);
    } catch {
      res.status(500).json({ error: 'Unable to complete analysis right now.' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(__dirname, 'dist');

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Cyber Guardian listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
