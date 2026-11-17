import { GoogleGenAI } from '@google/genai';
import { executeLocalAIMatch } from '../src/lib/aiMatcher';

interface ApiRequest {
  method?: string;
  body?: {
    prompt?: string;
    properties?: any[];
  };
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { prompt, properties } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt de busca é obrigatório.' });
    return;
  }

  const safeProperties = Array.isArray(properties) ? properties : [];

  // Compute robust local match first
  const fallbackResult = executeLocalAIMatch(prompt, safeProperties);

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    res.status(200).json(fallbackResult);
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

    // 4-second timeout to guarantee fast response
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout Gemini')), 4000)
    );

    const response = (await Promise.race([geminiPromise, timeoutPromise])) as any;
    const textOutput = response.text || '';
    const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed && Array.isArray(parsed.matches) && parsed.matches.length > 0) {
      res.status(200).json(parsed);
      return;
    }
    res.status(200).json(fallbackResult);
  } catch {
    res.status(200).json(fallbackResult);
  }
}
