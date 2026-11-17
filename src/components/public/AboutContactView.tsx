import React from 'react';
import { Award, Instagram, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { SafeImage } from '../ui/SafeImage';
import { LeadCaptureForm } from './LeadCaptureForm';
import { buildWhatsAppUrl } from '../../lib/utils';
import { ABOUT_IMAGE } from '../../lib/seedData';
import type { ProfessionalProfile, SiteSettings } from '../../types';

interface AboutViewProps {
  profile: ProfessionalProfile;
  settings: SiteSettings;
  onNavigate: (path: string) => void;
}

export function AboutView({ profile, settings, onNavigate }: AboutViewProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5">
          <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#101014]">
            <div className="w-full flex items-center justify-center">
              <SafeImage
                src={profile.portraitImage || ABOUT_IMAGE}
                alt={profile.name}
                priority
                className="w-full h-auto max-h-[620px] object-contain object-center block"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
              Sobre o Corretor · {profile.creci}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#F5F2EB]">
              {profile.name}
            </h1>
            <p className="text-base text-[#C6A15B] font-medium">
              {settings.tagline || 'Uma marca à altura de uma trajetória.'}
            </p>
          </div>

          <p className="text-base text-[#F5F2EB]/90 leading-relaxed whitespace-pre-line">
            {profile.bio}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-white/10 py-5">
            <div>
              <p className="text-xs text-[#A19E95]">Registro Profissional</p>
              <p className="font-mono-tabular text-sm font-semibold text-[#F5F2EB] mt-1">
                {profile.creci}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#A19E95]">Especialidades</p>
              <p className="text-sm font-semibold text-[#F5F2EB] mt-1">
                {(profile.specialties || ['Litoral', 'Médio Padrão', 'Alto Padrão']).join(' · ')}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#A19E95]">Presença Digital</p>
              <p className="font-mono-tabular text-sm font-semibold text-[#F5F2EB] mt-1">
                {profile.instagramPosts ?? 131} posts · {profile.instagramFollowers ?? 562} seguidores
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#A19E95]">
            <div className="rounded-lg border border-white/10 bg-[#131317] p-4">
              <p className="text-[#F5F2EB] font-medium">E-mail Profissional</p>
              <p className="mt-1">{profile.email || 'A confirmar / editável no painel administrativo'}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#131317] p-4">
              <p className="text-[#F5F2EB] font-medium">Endereço Comercial</p>
              <p className="mt-1">{profile.commercialAddress || 'Atendimento consultivo em Pernambuco (editável no painel)'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/contato')}
              className="rounded-lg bg-[#C6A15B] px-5 py-3 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors"
            >
              Agendar Atendimento
            </button>
            <a
              href={`https://www.instagram.com/${(profile.instagramHandle || 'brunodiniz.corretordeimoveis').replace('@', '')}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-[#F5F2EB] hover:border-[#C6A15B]"
            >
              <Instagram className="h-4 w-4 text-[#C6A15B]" />
              {profile.instagramHandle}
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(profile.pillars || [
          'Credibilidade no Mercado',
          'Resultados Consistentes',
          'Excelência no Atendimento',
        ]).map((pillar, idx) => (
          <div key={idx} className="rounded-xl border border-white/10 bg-[#131317] p-6 space-y-2">
            <Award className="h-5 w-5 text-[#C6A15B]" />
            <h2 className="font-display text-2xl font-semibold text-[#F5F2EB]">{pillar}</h2>
            <p className="text-sm text-[#A19E95] leading-relaxed">
              Compromisso permanente em cada etapa da jornada de compra, venda ou investimento em Pernambuco.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ContactViewProps {
  profile: ProfessionalProfile;
  settings: SiteSettings;
}

export function ContactView({ profile, settings }: ContactViewProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
              Contato & Agendamento · {settings.creci}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#F5F2EB]">
              Fale com {profile.name}
            </h1>
            <p className="text-sm sm:text-base text-[#A19E95] leading-relaxed">
              Atendimento direto para agendamento de visitas, confirmação de fichas técnicas e consultoria imobiliária em Litoral, Médio e Alto Padrão.
            </p>
          </div>

          <div className="space-y-4 rounded-xl border border-white/10 bg-[#131317] p-6 text-sm">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#F5F2EB]">WhatsApp Oficial</p>
                <a
                  href={buildWhatsAppUrl(
                    settings.whatsappNumber,
                    'Olá Bruno Diniz, gostaria de conversar sobre um imóvel.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C6A15B] hover:underline"
                >
                  (81) 99703-9417
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Instagram className="h-5 w-5 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#F5F2EB]">Instagram</p>
                <a
                  href={`https://www.instagram.com/${(settings.instagramHandle || 'brunodiniz.corretordeimoveis').replace('@', '')}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A19E95] hover:text-[#F5F2EB]"
                >
                  {profile.instagramHandle}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#F5F2EB]">Área de Atuação</p>
                <p className="text-[#A19E95]">
                  {profile.commercialAddress || 'Pernambuco — Litoral, Médio e Alto Padrão'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-white/10">
              <ShieldCheck className="h-5 w-5 text-[#C6A15B] shrink-0 mt-0.5" />
              <p className="text-xs text-[#A19E95]">
                Atendimento em conformidade com a LGPD. Registro profissional ativo {settings.creci}.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <LeadCaptureForm
            source="pagina_contato"
            whatsappNumber={settings.whatsappNumber}
          />
        </div>
      </div>
    </div>
  );
}
