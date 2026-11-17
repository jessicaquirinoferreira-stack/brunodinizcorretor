import heroImg from '../assets/images/hero_litoral_recife_1794918252593.jpg';
import villaImg from '../assets/images/property_mansao_praia_1794918253248.jpg';
import penthouseImg from '../assets/images/property_cobertura_mar_1794918254496.jpg';
import apartmentImg from '../assets/images/property_apartamento_alto_1794918254467.jpg';
import empreendimentoImg from '../assets/images/empreendimento_residencial_1794918256399.jpg';
import brunoPortraitImg from '../assets/images/bruno_diniz_oficial.jpg';
import officialLogoImg from '../assets/images/logotipo_chrome_bruno_diniz.png';
import sofiaAvatarImg from '../assets/images/assistente_virtual_sofia_1794920380628.jpg';

import type {
  Empreendimento,
  LandingPage,
  MediaAsset,
  ProfessionalProfile,
  Property,
  SiteSettings,
} from '../types';

export const HERO_IMAGE = heroImg;
export const VILLA_IMAGE = villaImg;
export const PENTHOUSE_IMAGE = penthouseImg;
export const APARTMENT_IMAGE = apartmentImg;
export const EMPREENDIMENTO_IMAGE = empreendimentoImg;
export const ABOUT_IMAGE = brunoPortraitImg;
export const OFFICIAL_LOGO_URL = officialLogoImg;
export const SOFIA_AVATAR_IMAGE = sofiaAvatarImg;

const LOCAL_ASSET_MAP: Record<string, string> = {
  '/src/assets/images/hero_litoral_recife_1794918252593.jpg': heroImg,
  '/src/assets/images/property_mansao_praia_1794918253248.jpg': villaImg,
  '/src/assets/images/property_cobertura_mar_1794918254496.jpg': penthouseImg,
  '/src/assets/images/property_apartamento_alto_1794918254467.jpg': apartmentImg,
  '/src/assets/images/empreendimento_residencial_1794918256399.jpg': empreendimentoImg,
  '/src/assets/images/sobre_estudio_imobiliario_1794918256314.jpg': brunoPortraitImg,
  '/src/assets/images/bruno_diniz_oficial.jpg': brunoPortraitImg,
  '/src/assets/images/logotipo_chrome_bruno_diniz.png': officialLogoImg,
  '/src/assets/images/assistente_virtual_sofia_1794920380628.jpg': sofiaAvatarImg,
  'https://i.postimg.cc/DyBBc46M/558197039417-s-whatsapp-net-2A384B9E0CFD95BD51A4.jpg': brunoPortraitImg,
  'https://i.postimg.cc/3xrpnLNF/Logotipo-Chrome-Bruno-Diniz-Imoveis.png': officialLogoImg,
};

export function resolveLocalAssetUrl(url?: string | null): string {
  if (!url) return '';
  return LOCAL_ASSET_MAP[url] || url;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'default',
  brandName: 'Bruno Diniz',
  tagline: 'Uma marca à altura de uma trajetória',
  creci: 'CRECI-PE 21512',
  whatsappNumber: '5581997039417',
  instagramHandle: 'brunodiniz.corretordeimoveis',
  logoUrl: OFFICIAL_LOGO_URL,
  primaryColor: '#F5F2EB',
  accentColor: '#C6A15B',
  backgroundColor: '#0B0B0D',
  displayFont: 'Cormorant Garamond',
  bodyFont: 'Plus Jakarta Sans',
  heroTitle: 'Uma marca à altura de uma trajetória.',
  heroSubtitle:
    'Especialista em imóveis de Litoral, Médio e Alto Padrão em Pernambuco. Atendimento consultivo pautado por credibilidade, resultados consistentes e excelência.',
  heroImage: HERO_IMAGE,
  seoTitle: 'Bruno Diniz | Imóveis Litoral, Médio e Alto Padrão',
  seoDescription:
    'Corretor de Imóveis em Pernambuco (CRECI-PE 21512). Especialista em Litoral, Médio e Alto Padrão. Credibilidade no mercado, resultados consistentes e excelência.',
  ga4Id: '',
  gtmId: '',
  searchConsoleVerification: '',
  googleAdsId: '',
  lgpdNotice:
    'Seus dados são tratados exclusivamente para atendimento imobiliário personalizado por Bruno Diniz (CRECI-PE 21512), em conformidade com a Lei Geral de Proteção de Dados (LGPD).',
};

export const DEFAULT_PROFESSIONAL_PROFILE: ProfessionalProfile = {
  id: 'bruno-diniz',
  name: 'Bruno Diniz',
  creci: 'CRECI-PE 21512',
  headline: 'Uma marca à altura de uma trajetória. Especialista em Litoral, Médio e Alto Padrão.',
  bio: 'Sou Bruno Diniz, Corretor de Imóveis (CRECI-PE 21512). Especialista em imóveis de Litoral, Médio e Alto Padrão. Trabalho com credibilidade, resultados consistentes e excelência no atendimento para ajudar você a encontrar o imóvel ideal.',
  specialties: ['Litoral', 'Médio Padrão', 'Alto Padrão'],
  pillars: [
    'Credibilidade no Mercado',
    'Resultados Consistentes',
    'Excelência no Atendimento',
  ],
  instagramHandle: '@brunodiniz.corretordeimoveis',
  instagramPosts: 131,
  instagramFollowers: 562,
  instagramFollowing: 312,
  whatsapp: '5581997039417',
  email: '',
  commercialAddress: '',
  experienceYears: '',
  portraitImage: ABOUT_IMAGE,
};

export const DEFAULT_PROPERTIES: Property[] = [
  {
    id: 'prop-bd-001',
    code: 'BD-001',
    slug: 'residencia-frente-mar-vista-atlantica',
    title: 'Apartamento Frente Mar — Seleção Litoral Pernambuco',
    businessType: 'Venda',
    propertyType: 'Apartamento',
    category: 'Litoral',
    region: 'Litoral de Pernambuco',
    neighborhood: 'A confirmar',
    address: 'A confirmar com o corretor',
    priceConfirmed: false,
    price: null,
    condoFeeConfirmed: false,
    condoFee: null,
    areaConfirmed: false,
    areaSqm: null,
    bedroomsConfirmed: false,
    bedrooms: null,
    suites: null,
    parkingSpots: null,
    description:
      'Imóvel litorâneo selecionado com ambientes integrados, iluminação natural abundante e vista ampla para o mar. Ficha técnica completa, metragem exata e condição comercial disponíveis sob confirmação direta com Bruno Diniz.',
    features: ['Vista Mar Panorâmica', 'Ambientes Amplos', 'Acabamento Contemporâneo', 'Iluminação Natural'],
    coverImage: HERO_IMAGE,
    gallery: [HERO_IMAGE, PENTHOUSE_IMAGE, APARTMENT_IMAGE],
    featured: true,
    published: true,
    confirmationStatus: 'a_confirmar',
    confirmationNotes: 'Valores, metragem, dormitórios e localização exata sujeitos à confirmação do corretor.',
  },
  {
    id: 'prop-bd-002',
    code: 'BD-002',
    slug: 'casa-contemporanea-litoral-alto-padrao',
    title: 'Casa Contemporânea Beira-Mar — Alto Padrão',
    businessType: 'Venda',
    propertyType: 'Casa',
    category: 'Alto Padrão',
    region: 'Litoral de Pernambuco',
    neighborhood: 'A confirmar',
    address: 'A confirmar com o corretor',
    priceConfirmed: false,
    price: null,
    condoFeeConfirmed: false,
    condoFee: null,
    areaConfirmed: false,
    areaSqm: null,
    bedroomsConfirmed: false,
    bedrooms: null,
    suites: null,
    parkingSpots: null,
    description:
      'Projeto arquitetônico litorâneo de alto padrão com integração entre área social, lazer privativo e fachada contemporânea. Informações específicas de área, suítes e investimento são confirmadas diretamente no atendimento.',
    features: ['Arquitetura Contemporânea', 'Área de Lazer Privativa', 'Integração Interna e Externa'],
    coverImage: VILLA_IMAGE,
    gallery: [VILLA_IMAGE, HERO_IMAGE],
    featured: true,
    published: true,
    confirmationStatus: 'a_confirmar',
    confirmationNotes: 'Ficha técnica completa sujeita à confirmação antes de fechamento.',
  },
  {
    id: 'prop-bd-003',
    code: 'BD-003',
    slug: 'cobertura-terraco-gourmet-vista-mar',
    title: 'Cobertura com Terraço Panorâmico Vista Mar',
    businessType: 'Venda',
    propertyType: 'Cobertura',
    category: 'Alto Padrão',
    region: 'Recife e Litoral',
    neighborhood: 'A confirmar',
    address: 'A confirmar com o corretor',
    priceConfirmed: false,
    price: null,
    condoFeeConfirmed: false,
    condoFee: null,
    areaConfirmed: false,
    areaSqm: null,
    bedroomsConfirmed: false,
    bedrooms: null,
    suites: null,
    parkingSpots: null,
    description:
      'Cobertura selecionada com terraço aberto para o oceano, layout pensado para convivência sofisticada e qualidade de vida no litoral pernambucano. Disponibilidade e dados técnicos confirmados via atendimento consultivo.',
    features: ['Terraço Panorâmico', 'Vista Mar', 'Projeto Luminotécnico'],
    coverImage: PENTHOUSE_IMAGE,
    gallery: [PENTHOUSE_IMAGE, HERO_IMAGE],
    featured: true,
    published: true,
    confirmationStatus: 'a_confirmar',
    confirmationNotes: 'Valores, condomínio e metragem a confirmar.',
  },
  {
    id: 'prop-bd-004',
    code: 'BD-004',
    slug: 'apartamento-medio-alto-padrao-interiores-sofisticados',
    title: 'Apartamento Médio e Alto Padrão — Interiores Sofisticados',
    businessType: 'Venda',
    propertyType: 'Apartamento',
    category: 'Médio Padrão',
    region: 'Pernambuco',
    neighborhood: 'A confirmar',
    address: 'A confirmar com o corretor',
    priceConfirmed: false,
    price: null,
    condoFeeConfirmed: false,
    condoFee: null,
    areaConfirmed: false,
    areaSqm: null,
    bedroomsConfirmed: false,
    bedrooms: null,
    suites: null,
    parkingSpots: null,
    description:
      'Unidade com marcenaria planejada, ilha gourmet e ambientes integrados com excelente aproveitamento de luz. Consulte o corretor Bruno Diniz para confirmação de planta, andar e condições.',
    features: ['Cozinha Integrada', 'Sala Ampla', 'Acabamento Refinado'],
    coverImage: APARTMENT_IMAGE,
    gallery: [APARTMENT_IMAGE, PENTHOUSE_IMAGE],
    featured: false,
    published: true,
    confirmationStatus: 'a_confirmar',
    confirmationNotes: 'Dados técnicos e valor sujeitos à confirmação.',
  },
];

export const DEFAULT_EMPREENDIMENTOS: Empreendimento[] = [
  {
    id: 'emp-bd-001',
    code: 'EMP-001',
    slug: 'residencial-mar-pernambuco-selecao',
    name: 'Empreendimento Residencial Vista Mar — Seleção Pernambuco',
    developer: 'A confirmar',
    category: 'Alto Padrão',
    region: 'Litoral de Pernambuco',
    stage: 'A confirmar',
    priceFromConfirmed: false,
    priceFrom: null,
    areaRange: 'A confirmar',
    description:
      'Empreendimento residencial com arquitetura contemporânea voltada para o litoral, áreas comuns equipadas e foco em qualidade de vida. Estágio da obra, tipologias e tabela vigentes são confirmados diretamente com Bruno Diniz.',
    amenities: ['Fachada Contemporânea', 'Áreas de Convivência', 'Localização Litorânea'],
    coverImage: EMPREENDIMENTO_IMAGE,
    gallery: [EMPREENDIMENTO_IMAGE, HERO_IMAGE, PENTHOUSE_IMAGE],
    featured: true,
    published: true,
    confirmationStatus: 'a_confirmar',
  },
];

export const DEFAULT_LANDING_PAGE: LandingPage = {
  id: 'lp-flagship-01',
  slug: 'litoral-alto-padrao-pernambuco',
  title: 'Coleção Litoral & Alto Padrão Pernambuco',
  kicker: 'Seleção Exclusiva · CRECI-PE 21512',
  heroHeadline: 'Viver o litoral de Pernambuco com credibilidade e alto padrão.',
  heroSubheadline:
    'Receba atendimento consultivo direto com Bruno Diniz para acessar imóveis selecionados de Litoral, Médio e Alto Padrão, com transparência total sobre disponibilidade e documentação.',
  heroImage: HERO_IMAGE,
  targetType: 'campanha',
  targetId: 'emp-bd-001',
  highlights: [
    'Seleção personalizada em imóveis de Litoral, Médio e Alto Padrão',
    'Atendimento consultivo direto com o corretor Bruno Diniz (CRECI-PE 21512)',
    'Transparência documental e confirmação técnica antes de cada visita',
    'Agendamento ágil de visitas presenciais ou apresentação privada',
  ],
  gallery: [HERO_IMAGE, VILLA_IMAGE, PENTHOUSE_IMAGE, EMPREENDIMENTO_IMAGE],
  ctaLabel: 'Solicitar Atendimento Exclusivo',
  whatsappMessage:
    'Olá Bruno, vim pela página especial Litoral & Alto Padrão e gostaria de receber informações confirmadas.',
  seoTitle: 'Coleção Litoral & Alto Padrão | Bruno Diniz CRECI-PE 21512',
  seoDescription:
    'Seleção exclusiva de imóveis de Litoral, Médio e Alto Padrão em Pernambuco com Bruno Diniz (CRECI-PE 21512).',
  published: true,
};

export const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  { id: 'media-01', name: 'Sala Vista Mar — Litoral Recife', url: HERO_IMAGE, contentType: 'image/jpeg', provider: 'local_asset' },
  { id: 'media-02', name: 'Casa Contemporânea Praia', url: VILLA_IMAGE, contentType: 'image/jpeg', provider: 'local_asset' },
  { id: 'media-03', name: 'Cobertura Terraço Vista Mar', url: PENTHOUSE_IMAGE, contentType: 'image/jpeg', provider: 'local_asset' },
  { id: 'media-04', name: 'Apartamento Alto Padrão Interiores', url: APARTMENT_IMAGE, contentType: 'image/jpeg', provider: 'local_asset' },
  { id: 'media-05', name: 'Empreendimento Residencial Litoral', url: EMPREENDIMENTO_IMAGE, contentType: 'image/jpeg', provider: 'local_asset' },
  { id: 'media-06', name: 'Estúdio Consultivo Bruno Diniz', url: ABOUT_IMAGE, contentType: 'image/jpeg', provider: 'local_asset' },
  { id: 'media-07', name: 'Logotipo Oficial Chrome Bruno Diniz', url: OFFICIAL_LOGO_URL, contentType: 'image/png', provider: 'local_asset' },
];
