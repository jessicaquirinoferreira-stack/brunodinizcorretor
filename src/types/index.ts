export type PropertyCategory = 'Litoral' | 'Médio Padrão' | 'Alto Padrão';
export type BusinessType = 'Venda' | 'Locação' | 'Temporada' | 'A confirmar';
export type PropertyType = 'Apartamento' | 'Casa' | 'Cobertura' | 'Flat' | 'Terreno' | 'A confirmar';
export type ConfirmationStatus = 'a_confirmar' | 'confirmado';
export type EmpreendimentoStage = 'Lançamento' | 'Em Construção' | 'Pronto para Morar' | 'A confirmar';

export type PipelineStage =
  | 'novo_lead'
  | 'contato'
  | 'qualificado'
  | 'visita_agendada'
  | 'visita_realizada'
  | 'proposta'
  | 'negociacao'
  | 'fechado'
  | 'perdido';

export type LeadScore = 'quente' | 'morno' | 'frio';
export type VisitStatus = 'solicitada' | 'confirmada' | 'realizada' | 'cancelada';
export type ProposalStatus = 'rascunho' | 'enviada' | 'em_analise' | 'aceita' | 'recusada';
export type TaskPriority = 'alta' | 'media' | 'baixa';

export interface SiteSettings {
  id?: string;
  brandName: string;
  tagline: string;
  creci: string;
  whatsappNumber: string;
  instagramHandle: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  displayFont?: string;
  bodyFont?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  ga4Id?: string;
  gtmId?: string;
  searchConsoleVerification?: string;
  googleAdsId?: string;
  lgpdNotice?: string;
  updatedAt?: unknown;
}

export interface ProfessionalProfile {
  id?: string;
  name: string;
  creci: string;
  headline: string;
  bio: string;
  specialties: string[];
  pillars: string[];
  instagramHandle: string;
  instagramPosts?: number;
  instagramFollowers?: number;
  instagramFollowing?: number;
  whatsapp: string;
  email: string;
  commercialAddress: string;
  experienceYears: string;
  portraitImage: string;
  updatedAt?: unknown;
}

export interface Property {
  id: string;
  code: string;
  slug: string;
  title: string;
  businessType: BusinessType;
  propertyType: PropertyType;
  category: PropertyCategory;
  region: string;
  neighborhood?: string;
  address?: string;
  priceConfirmed: boolean;
  price: number | null;
  condoFeeConfirmed?: boolean;
  condoFee?: number | null;
  areaConfirmed: boolean;
  areaSqm: number | null;
  bedroomsConfirmed: boolean;
  bedrooms: number | null;
  suites?: number | null;
  parkingSpots?: number | null;
  description: string;
  features: string[];
  coverImage: string;
  gallery: string[];
  featured: boolean;
  published: boolean;
  confirmationStatus: ConfirmationStatus;
  confirmationNotes?: string;
  empreendimentoId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Empreendimento {
  id: string;
  code: string;
  slug: string;
  name: string;
  developer?: string;
  category: PropertyCategory;
  region: string;
  stage: EmpreendimentoStage;
  priceFromConfirmed: boolean;
  priceFrom: number | null;
  areaRange?: string;
  description: string;
  amenities: string[];
  coverImage: string;
  gallery: string[];
  featured: boolean;
  published: boolean;
  confirmationStatus: ConfirmationStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  kicker?: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImage: string;
  targetType: 'property' | 'empreendimento' | 'campanha';
  targetId?: string;
  highlights: string[];
  gallery: string[];
  ctaLabel: string;
  whatsappMessage: string;
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: string;
  propertyId?: string;
  propertyTitle?: string;
  empreendimentoId?: string;
  landingPageId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  score: LeadScore;
  scorePoints?: number;
  status: PipelineStage;
  tags: string[];
  lgpdConsent: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  origin?: string;
  budgetRange?: string;
  preferredCategories: string[];
  interestedPropertyIds: string[];
  tags: string[];
  notes?: string;
  leadId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ClientInteraction {
  id: string;
  type: 'ligacao' | 'whatsapp' | 'email' | 'visita' | 'proposta' | 'nota';
  summary: string;
  authorEmail?: string;
  createdAt?: unknown;
}

export interface PipelineDeal {
  id: string;
  title: string;
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  leadId?: string;
  propertyId?: string;
  propertyTitle?: string;
  stage: PipelineStage;
  score: LeadScore;
  estimatedValue: number | null;
  source?: string;
  tags: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Visit {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  propertyId?: string;
  propertyTitle?: string;
  empreendimentoId?: string;
  scheduledDate: string;
  scheduledTime?: string;
  notes?: string;
  reminderSent?: boolean;
  status: VisitStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Proposal {
  id: string;
  clientId?: string;
  clientName: string;
  propertyId?: string;
  propertyTitle: string;
  proposedValue: number;
  paymentTerms?: string;
  documentUrl?: string;
  documentName?: string;
  status: ProposalStatus;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  completed: boolean;
  clientId?: string;
  leadId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  contentType?: string;
  sizeBytes?: number;
  provider: 'vercel_blob' | 'local_asset' | 'external';
  createdAt?: unknown;
}

export interface AnalyticsEvent {
  id: string;
  eventType:
    | 'page_view'
    | 'property_view'
    | 'empreendimento_view'
    | 'landing_view'
    | 'whatsapp_click'
    | 'lead_submit'
    | 'visit_submit';
  path: string;
  targetId?: string;
  source?: string;
  utmSource?: string;
  createdAt?: unknown;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin';
  createdAt?: unknown;
}

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: 'novo_lead', label: 'Novo Lead' },
  { id: 'contato', label: 'Contato' },
  { id: 'qualificado', label: 'Qualificado' },
  { id: 'visita_agendada', label: 'Visita Agendada' },
  { id: 'visita_realizada', label: 'Visita Realizada' },
  { id: 'proposta', label: 'Proposta' },
  { id: 'negociacao', label: 'Negociação' },
  { id: 'fechado', label: 'Fechado' },
  { id: 'perdido', label: 'Perdido' },
];
