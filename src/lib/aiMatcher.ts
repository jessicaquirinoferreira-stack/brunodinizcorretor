import { Property } from '../types';

export interface MatchResultItem {
  id: string;
  score: number;
  reason: string;
}

export interface AIMatchResponse {
  matches: MatchResultItem[];
  funnelMessage: string;
  nextQuestions: string[];
}

// Normalized token cleanup
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function executeLocalAIMatch(prompt: string, properties: Property[]): AIMatchResponse {
  if (!properties || properties.length === 0) {
    return {
      matches: [],
      funnelMessage: 'Nenhum imóvel disponível no catálogo no momento para comparação.',
      nextQuestions: ['Deseja falar diretamente com o corretor Bruno Diniz via WhatsApp?'],
    };
  }

  const cleanPrompt = normalize(prompt);
  const words = cleanPrompt.split(/[\s,.-]+/).filter((w) => w.length >= 2);

  // Common intent detectors
  const wantsBeach = cleanPrompt.includes('mar') || cleanPrompt.includes('praia') || cleanPrompt.includes('litoral') || cleanPrompt.includes('beira');
  const wantsLuxury = cleanPrompt.includes('alto') || cleanPrompt.includes('luxo') || cleanPrompt.includes('mansao') || cleanPrompt.includes('cobertura');
  const wantsHouse = cleanPrompt.includes('casa') || cleanPrompt.includes('residencia') || cleanPrompt.includes('villa');
  const wantsApartment = cleanPrompt.includes('ap') || cleanPrompt.includes('apartamento') || cleanPrompt.includes('flat');
  const wantsPenthouse = cleanPrompt.includes('cobertura') || cleanPrompt.includes('terraco') || cleanPrompt.includes('rooftop');
  const wantsMedium = cleanPrompt.includes('medio') || cleanPrompt.includes('acessivel') || cleanPrompt.includes('investimento');

  // Detect bedrooms
  const bedroomMatch = cleanPrompt.match(/(\d+)\s*(quarto|dormitorio|suite)/i);
  const requestedBedrooms = bedroomMatch ? parseInt(bedroomMatch[1], 10) : null;

  const scoredList = properties.map((prop) => {
    let score = 45; // baseline interest score
    const reasons: string[] = [];

    const searchable = normalize(
      `${prop.title} ${prop.description || ''} ${prop.category} ${prop.propertyType || ''} ${prop.region} ${prop.neighborhood || ''} ${(prop.features || []).join(' ')}`
    );

    // Direct word matches
    let matchedWordCount = 0;
    for (const w of words) {
      if (searchable.includes(w)) {
        matchedWordCount++;
        score += 8;
      }
    }

    if (matchedWordCount > 0) {
      reasons.push(`Correspondência com os termos "${words.filter((w) => searchable.includes(w)).slice(0, 3).join(', ')}"`);
    }

    // Coastal / beach preference
    if (wantsBeach) {
      if (prop.category === 'Litoral' || searchable.includes('mar') || searchable.includes('praia')) {
        score += 25;
        reasons.push('Localização privilegiada com vista ou proximidade da praia em Pernambuco');
      }
    }

    // Luxury / Alto Padrão preference
    if (wantsLuxury) {
      if (prop.category === 'Alto Padrão' || searchable.includes('luxo') || searchable.includes('alto padrao')) {
        score += 20;
        reasons.push('Padrão construtivo e acabamento de alto nível');
      }
    }

    // Penthouse / Cobertura
    if (wantsPenthouse) {
      if (prop.propertyType === 'Cobertura' || searchable.includes('cobertura') || searchable.includes('terraco')) {
        score += 30;
        reasons.push('Tipologia cobertura com terraço panorâmico exclusivo');
      }
    }

    // House / Casa
    if (wantsHouse) {
      if (prop.propertyType === 'Casa' || searchable.includes('casa')) {
        score += 25;
        reasons.push('Imóvel residencial formato casa com privacidade e área livre');
      }
    }

    // Apartment
    if (wantsApartment && !wantsPenthouse) {
      if (prop.propertyType === 'Apartamento' || searchable.includes('apartamento')) {
        score += 15;
        reasons.push('Apartamento com planta funcional e infraestrutura completa');
      }
    }

    // Bedrooms check
    if (requestedBedrooms !== null) {
      if (prop.bedrooms && prop.bedrooms >= requestedBedrooms) {
        score += 20;
        reasons.push(`Atende aos ${requestedBedrooms} dormitórios desejados (${prop.bedrooms} quartos confirmados)`);
      } else if (!prop.bedroomsConfirmed) {
        score += 8;
        reasons.push('Dormitórios personalizáveis mediante confirmação com o corretor');
      }
    }

    // Featured bias (recommended by Bruno Diniz)
    if (prop.featured) {
      score += 5;
    }

    // Clamp score between 30 and 99%
    const finalScore = Math.min(99, Math.max(35, Math.round(score)));

    const compositeReason = reasons.length > 0
      ? reasons.join('. ') + '.'
      : `Excelente opção no perfil ${prop.category} na região de ${prop.region}.`;

    return {
      id: prop.id,
      score: finalScore,
      reason: compositeReason,
    };
  });

  // Sort descending by score
  scoredList.sort((a, b) => b.score - a.score);

  // Generate friendly contextual funnel message
  let funnelMessage = `Analisamos seu pedido com base nos critérios de moradia e investimento. Filtramos o portfólio de Bruno Diniz (CRECI-PE 21512) identificando os imóveis mais alinhados às suas preferências.`;

  if (wantsBeach && wantsLuxury) {
    funnelMessage = `Localizamos excelentes opções de alto padrão no litoral pernambucano, selecionando unidades com arquitetura contemporânea e alta liquidez.`;
  } else if (wantsPenthouse) {
    funnelMessage = `Filtramos coberturas e unidades com terraço panorâmico ideais para quem busca exclusividade e vista ampla para o oceano.`;
  } else if (wantsHouse) {
    funnelMessage = `Priorizamos residências com amplos espaços integrados e privacidade no litoral de Pernambuco.`;
  }

  // Dynamic next funnel questions
  const nextQuestions: string[] = [];
  if (!wantsBeach) nextQuestions.push('Deseja ver opções à beira-mar ou frente ao oceano?');
  if (!wantsLuxury) nextQuestions.push('Prefere opções de Alto Padrão ou Médio Padrão?');
  if (requestedBedrooms === null) nextQuestions.push('Quantos quartos ou suítes você necessita?');
  nextQuestions.push('Deseja agendar uma visita presencial com Bruno Diniz?');
  nextQuestions.push('Prefere receber a lâmina técnica completa no WhatsApp?');

  return {
    matches: scoredList,
    funnelMessage,
    nextQuestions: nextQuestions.slice(0, 3),
  };
}
