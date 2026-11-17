import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '12mb' }));

  // Healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      vercelBlobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
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
      const token = process.env.BLOB_READ_WRITE_TOKEN;

      if (!token) {
        res.status(503).json({
          error: 'BLOB_READ_WRITE_TOKEN não configurado no servidor. Configure a variável de ambiente na Vercel ou use uma URL externa / imagem da biblioteca.',
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
