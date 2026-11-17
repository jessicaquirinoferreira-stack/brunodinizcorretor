import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { LeadScore } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140) || 'item';
}

export function generateFirestoreId(prefix = 'doc'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const ts = Date.now().toString(36);
  return `${prefix}-${ts}-${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function formatBRL(value: number | null | undefined, confirmed = true): string {
  if (!confirmed || value === null || value === undefined || Number.isNaN(value)) {
    return 'A confirmar';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  const clean = (phoneDigits || '5581997039417').replace(/\D/g, '');
  const withCountry = clean.startsWith('55') ? clean : `55${clean}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function sanitizeStr(val: string | undefined | null, maxLen: number): string {
  if (!val) return '';
  return val.trim().slice(0, maxLen);
}

export function calculateLeadScore(params: {
  email?: string;
  message?: string;
  propertyId?: string;
  empreendimentoId?: string;
  landingPageId?: string;
  isVisitRequest?: boolean;
}): { score: LeadScore; points: number; autoTags: string[] } {
  let points = 30;
  const autoTags: string[] = [];

  if (params.isVisitRequest) {
    points += 35;
    autoTags.push('Pedido de Visita');
  }
  if (params.propertyId) {
    points += 20;
    autoTags.push('Imóvel Específico');
  }
  if (params.empreendimentoId) {
    points += 15;
    autoTags.push('Empreendimento');
  }
  if (params.landingPageId) {
    points += 15;
    autoTags.push('Landing Page');
  }
  if (params.email && params.email.includes('@')) {
    points += 10;
  }
  if (params.message && params.message.trim().length > 25) {
    points += 10;
  }

  let score: LeadScore = 'frio';
  if (points >= 70) {
    score = 'quente';
  } else if (points >= 45) {
    score = 'morno';
  }

  return { score, points: Math.min(points, 100), autoTags };
}

export function formatDateTimeBR(val: unknown): string {
  if (!val) return '—';
  try {
    if (typeof val === 'object' && val !== null && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format((val as { toDate: () => Date }).toDate());
    }
    if (typeof val === 'string') {
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(val));
    }
    return '—';
  } catch {
    return '—';
  }
}
