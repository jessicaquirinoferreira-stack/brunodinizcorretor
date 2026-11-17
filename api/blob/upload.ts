interface ApiRequest {
  method?: string;
  body?: {
    filename?: string;
    contentType?: string;
    base64Data?: string;
  };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
}

const DEFAULT_BLOB_TOKEN = 'vercel_blob_rw_sjvci0CE2mr28sZW_UaoDCgilcsx4zW3otPW0LmPn7QZyii';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { filename, contentType, base64Data } = req.body || {};

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

    const uploadRes = await fetch(
      `https://blob.vercel-storage.com/bruno-diniz/${Date.now()}-${safeName}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-api-version': '7',
          'content-type': contentType || 'application/octet-stream',
          'x-content-type': contentType || 'application/octet-stream',
        },
        body: buffer,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      res.status(uploadRes.status).json({ error: `Falha no Vercel Blob: ${errText}` });
      return;
    }

    const blobResult = (await uploadRes.json()) as { url: string; pathname?: string };
    res.status(200).json({
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
}
