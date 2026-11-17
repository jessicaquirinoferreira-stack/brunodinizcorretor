import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { executeLocalAIMatch } from './src/lib/aiMatcher';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  const DEFAULT_BLOB_STORE_ID = 'store_sjvci0CE2mr28sZW';
  const DEFAULT_BLOB_TOKEN = 'vercel_blob_rw_sjvci0CE2mr28sZW_UaoDCgilcsx4zW3otPW0LmPn7QZyii';

  app.use(express.json({ limit: '50mb' }));

  // Healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      vercelBlobConfigured: true,
      blobStoreId: process.env.BLOB_STORE_ID || DEFAULT_BLOB_STORE_ID,
      timestamp: new Date().toISOString(),
    });
  });

  // Vercel Blob server-side upload proxy (keeps BLOB_READ_WRITE_TOKEN off client)
  app.post('/api/blob/upload', async (req, res) => {
    try {
      const { filename, contentType, base64Data } = req.body as {
        filename?: string;
        contentType?: string;
        base64Data?: string;
      };

      if (!filename || !base64Data) {
        res.status(400).json({ error: 'Arquivo e nome são obrigatórios.' });
        return;
      }

      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const token = process.env.BLOB_READ_WRITE_TOKEN || DEFAULT_BLOB_TOKEN;

      if (!token) {
        res.status(503).json({
          error: 'BLOB_READ_WRITE_TOKEN não configurado no servidor.',
          code: 'BLOB_TOKEN_MISSING',
        });
        return;
      }

      const rawBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const buffer = Buffer.from(rawBase64, 'base64');

      const uploadRes = await fetch(`https://blob.vercel-storage.com/bruno-diniz/${Date.now()}-${safeName}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-api-version': '7',
          'content-type': contentType || 'application/octet-stream',
          'x-content-type': contentType || 'application/octet-stream',
        },
        body: buffer,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        res.status(uploadRes.status).json({ error: `Falha no Vercel Blob: ${errText}` });
        return;
      }

      const blobResult = (await uploadRes.json()) as { url: string; pathname?: string };
      res.json({
        url: blobResult.url,
        pathname: blobResult.pathname || safeName,
        sizeBytes: buffer.length,
        provider: 'vercel_blob',
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro interno no upload.',
      });
    }
  });

  // Dynamic robots.txt
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  // Dynamic sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const staticRoutes = [
      '/',
      '/comprar',
      '/litoral',
      '/alto-padrao',
      '/empreendimentos',
      '/sobre',
      '/contato',
      '/lp/litoral-alto-padrao-pernambuco',
    ];
    const now = new Date().toISOString();
    const urls = staticRoutes
      .map(
        (route) => `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n  </url>`
      )
      .join('\n');

    res
      .type('application/xml')
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
  });

  // AI Property Matchmaker Endpoint
  app.post('/api/ai-match', async (req, res) => {
    const { prompt, properties } = (req.body || {}) as {
      prompt?: string;
      properties?: any[];
    };

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt de busca é obrigatório.' });
      return;
    }

    const safeProperties = Array.isArray(properties) ? properties : [];
    const localMatch = executeLocalAIMatch(prompt, safeProperties);

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      res.json(localMatch);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const geminiPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Você é o consultor imobiliário sênior de Bruno Diniz (CRECI-PE 21512), especialista em imóveis de Litoral, Médio e Alto Padrão em Pernambuco.
O cliente enviou o seguinte pedido em linguagem natural: "${prompt}".
Aqui está a lista de imóveis disponíveis em JSON:
${JSON.stringify(
  safeProperties.map((p) => ({
    id: p.id,
    code: p.code,
    title: p.title,
    category: p.category,
    region: p.region,
    bedrooms: p.bedrooms,
    description: p.description,
    features: p.features,
  }))
)}

Analise o pedido do cliente, funile e filtre os imóveis para encontrar o mais compatível ou os mais próximos. Retorne estritamente um objeto JSON válido (sem tags extras markdown):
{
  "matches": [
    { "id": "id-do-imovel", "score": 95, "reason": "Motivo claro e consultivo pelo qual este imóvel atende ao pedido..." }
  ],
  "funnelMessage": "Mensagem consultiva elegante de Bruno Diniz orientando a escolha...",
  "nextQuestions": ["Pergunta de funil 1?", "Pergunta de funil 2?"]
}`,
              },
            ],
          },
        ],
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout Gemini')), 4000)
      );

      const response = (await Promise.race([geminiPromise, timeoutPromise])) as any;
      const textOutput = response.text || '';
      const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed && Array.isArray(parsed.matches) && parsed.matches.length > 0) {
        res.json(parsed);
        return;
      }
      res.json(localMatch);
    } catch {
      res.json(localMatch);
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build não encontrado.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bruno Diniz Imóveis server running on port ${PORT}`);
  });
}

startServer();
