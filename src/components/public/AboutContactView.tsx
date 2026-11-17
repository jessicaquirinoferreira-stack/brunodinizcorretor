import React from 'react';
import { Award, CheckCircle2, Compass, FileCheck2, Globe2, Instagram, MapPin, MessageCircle, ShieldCheck, Star, Trophy, Users } from 'lucide-react';
import { SafeImage } from '../ui/SafeImage';
import { LeadCaptureForm } from './LeadCaptureForm';
import { buildWhatsAppUrl } from '../../lib/utils';
import { ABOUT_IMAGE } from '../../lib/seedData';
import { useTheme } from '../ui/ThemeContext';
import type { ProfessionalProfile, SiteSettings } from '../../types';

interface AboutViewProps {
  profile: ProfessionalProfile;
  settings: SiteSettings;
  onNavigate: (path: string) => void;
}

export function AboutView({ profile, settings, onNavigate }: AboutViewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const milestones = [
    { year: '2023', title: 'Entrada no Mercado & Litoral', desc: 'Entrei no mercado em 2023, sempre atuando com foco e dedicação no litoral pernambucano.' },
    { year: '2024', title: 'Médio e Alto Padrão', desc: 'Passei a atuar no mercado de médio e alto padrão com assessoria consultiva personalizada e criteriosa.' },
    { year: '2025', title: 'Campeão de Diretoria e Equipe', desc: 'Fui campeão de diretoria e equipe, me destacando no meio de 400 corretores com resultados consistentes.' },
    { year: 'Hoje', title: 'Marca de Referência & Inovação', desc: 'Uma marca à altura de uma trajetória. Atendimento consultivo exclusivo com credibilidade, tecnologia e excelência.' },
  ];

  const credentials = [
    { title: 'Registro CRECI-PE 21512', subtitle: 'Atuação regular e auditada no Conselho Regional de Corretores de Imóveis de Pernambuco.' },
    { title: 'Assessoria Jurídica e Documental', subtitle: 'Conferência rigorosa de certidões, ônus reais e regularidade registral antes de qualquer proposta.' },
    { title: 'Seleção Exclusiva de Luxo', subtitle: 'Seleção criteriosa baseada em arquitetura contemporânea, localização privilegiada e liquidez.' },
    { title: 'Atendimento Consultivo Sob Medida', subtitle: 'Sigilo, discrição e acompanhamento integral em todas as etapas da negociação.' },
  ];

  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-24 transition-colors duration-300 ${isDark ? 'text-[#F5F2EB]' : 'text-[#1A1A1E]'}`}>
      {/* HERO / PROFILE INTRO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <div className={`w-full overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-[#101014] shadow-2xl' : 'border-black/10 bg-white shadow-xl'}`}>
            <div className="w-full flex items-center justify-center p-2">
              <SafeImage
                src={profile.portraitImage || ABOUT_IMAGE}
                alt={profile.name}
                priority
                className="w-full h-auto max-h-[640px] object-contain object-center rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-widest bg-[#C6A15B]/15 text-[#C6A15B]">
              <Trophy className="h-3.5 w-3.5" />
              Corretor Especialista · {profile.creci}
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-lg text-[#C6A15B] font-medium font-display italic">
              {settings.tagline || 'Uma marca à altura de uma trajetória.'}
            </p>
          </div>

          <p className={`text-base sm:text-lg leading-relaxed whitespace-pre-line ${isDark ? 'text-[#F5F2EB]/90' : 'text-[#333338]'}`}>
            {profile.bio}
          </p>

          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-5 border-y py-6 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
            <div>
              <p className={`text-xs ${isDark ? 'text-[#A19E95]' : 'text-[#6B7280]'}`}>Registro Profissional</p>
              <p className="font-mono-tabular text-base font-semibold text-[#C6A15B] mt-1">
                {profile.creci}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-[#A19E95]' : 'text-[#6B7280]'}`}>Especialidades</p>
              <p className="text-sm font-semibold mt-1">
                {(profile.specialties || ['Litoral', 'Médio Padrão', 'Alto Padrão']).join(' · ')}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-[#A19E95]' : 'text-[#6B7280]'}`}>Presença Digital</p>
              <p className="font-mono-tabular text-sm font-semibold mt-1">
                {profile.instagramPosts ?? 131} posts · {profile.instagramFollowers ?? 562} seguidores
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className={`rounded-xl border p-4 transition-colors ${isDark ? 'border-white/10 bg-[#131317]' : 'border-black/10 bg-white shadow-sm'}`}>
              <p className="font-semibold text-[#C6A15B]">E-mail Profissional</p>
              <p className={`mt-1 ${isDark ? 'text-[#F5F2EB]' : 'text-[#1A1A1E]'}`}>{profile.email || 'brunodinizcorretordeimoveis@gmail.com'}</p>
            </div>
            <div className={`rounded-xl border p-4 transition-colors ${isDark ? 'border-white/10 bg-[#131317]' : 'border-black/10 bg-white shadow-sm'}`}>
              <p className="font-semibold text-[#C6A15B]">Área de Atuação Principal</p>
              <p className={`mt-1 ${isDark ? 'text-[#F5F2EB]' : 'text-[#1A1A1E]'}`}>{profile.commercialAddress || 'Pernambuco — Litoral, Boa Viagem e Alto Padrão'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-3">
            <button
              type="button"
              onClick={() => onNavigate('/contato')}
              className="rounded-xl bg-[#C6A15B] px-6 py-3.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors shadow-lg shadow-[#C6A15B]/20"
            >
              Agendar Atendimento Consultivo
            </button>
            <a
              href={`https://www.instagram.com/${(profile.instagramHandle || 'brunodiniz.corretordeimoveis').replace('@', '')}/`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-medium transition-colors ${isDark ? 'border-white/15 bg-white/5 hover:border-[#C6A15B]' : 'border-black/15 bg-black/5 hover:border-[#C6A15B]'}`}
            >
              <Instagram className="h-4 w-4 text-[#C6A15B]" />
              {profile.instagramHandle}
            </a>
          </div>
        </div>
      </div>

      {/* ROBUST PILLARS & CORE VALUES */}
      <div className="space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
            Pilares Estratégicos
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-semibold">
            Os Fundamentos de uma Trajetória de Sucesso
          </h2>
          <p className={`text-sm sm:text-base ${isDark ? 'text-[#A19E95]' : 'text-[#6B7280]'}`}>
            Cada negociação é conduzida com rigor técnico, absoluto respeito ao cliente e profundo conhecimento do mercado imobiliário pernambucano.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(profile.pillars || [
            'Credibilidade no Mercado',
            'Resultados Consistentes',
            'Excelência no Atendimento',
          ]).map((pillar, idx) => {
            const icons = [Award, Trophy, Star];
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-8 space-y-4 transition-all duration-300 hover:border-[#C6A15B]/50 hover:-translate-y-1 ${
                  isDark
                    ? 'border-white/10 bg-gradient-to-br from-[#16161C] to-[#101014] shadow-xl'
                    : 'border-black/10 bg-gradient-to-br from-white to-[#FAFAFA] shadow-lg'
                }`}
              >
                <div className="h-12 w-12 rounded-xl bg-[#C6A15B]/15 flex items-center justify-center text-[#C6A15B]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-semibold">{pillar}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-[#A19E95]' : 'text-[#6B7280]'}`}>
                  {idx === 0 && 'Transparência documental absoluta, verificação rigorosa de titularidade e garantia de segurança jurídica em todas as transações.'}
                  {idx === 1 && 'Histórico comprovado de negociações bem-sucedidas, avaliações precisas de mercado e liquidez ágil para proprietários e compradores.'}
                  {idx === 2 && 'Atendimento personalizado, escuta ativa das necessidades do cliente e suporte contínuo antes, durante e após a aquisição.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* TIMELINE / TRAJECTORY MILESTONES */}
      <div className="space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
            Evolução e Experiência
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-semibold">
            Marcos da Carreira Imobiliária
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-6 space-y-3 relative overflow-hidden ${
                isDark ? 'border-white/10 bg-[#121216]' : 'border-black/10 bg-white shadow-md'
              }`}
            >
              <span className="font-mono-tabular text-3xl font-bold text-[#C6A15B]">
                {m.year}
              </span>
              <h3 className="font-display text-xl font-semibold">{m.title}</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#A19E95]' : 'text-[#6B7280]'}`}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CREDENTIALS & DIFFERENTIALS GRID */}
      <div className={`rounded-3xl border p-8 sm:p-12 space-y-8 ${isDark ? 'border-white/10 bg-[#111116]' : 'border-black/10 bg-[#F5F2EB]/40'}`}>
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
            Padrão Profissional
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">
            Por que confiar em Bruno Diniz?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {credentials.map((cred, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-lg bg-[#C6A15B]/20 flex items-center justify-center text-[#C6A15B] shrink-0 mt-1">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-xl font-semibold">{cred.title}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#A19E95]' : 'text-[#6B7280]'}`}>
                  {cred.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ContactViewProps {
  profile: ProfessionalProfile;
  settings: SiteSettings;
}

export function ContactView({ profile, settings }: ContactViewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 transition-colors duration-300 ${isDark ? 'text-[#F5F2EB]' : 'text-[#1A1A1E]'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
              Contato & Agendamento · {settings.creci}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold">
              Fale com {profile.name}
            </h1>
            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-[#A19E95]' : 'text-[#6B7280]'}`}>
              Atendimento direto para agendamento de visitas, confirmação de fichas técnicas e consultoria imobiliária em Litoral, Médio e Alto Padrão.
            </p>
          </div>

          <div className={`space-y-4 rounded-2xl border p-6 text-sm ${isDark ? 'border-white/10 bg-[#131317]' : 'border-black/10 bg-white shadow-lg'}`}>
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">WhatsApp Oficial</p>
                <a
                  href={buildWhatsAppUrl(
                    settings.whatsappNumber,
                    'Olá Bruno Diniz, gostaria de conversar sobre um imóvel.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C6A15B] hover:underline font-mono-tabular"
                >
                  (81) 99703-9417
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Instagram className="h-5 w-5 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Instagram</p>
                <a
                  href={`https://www.instagram.com/${(settings.instagramHandle || 'brunodiniz.corretordeimoveis').replace('@', '')}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors ${isDark ? 'text-[#A19E95] hover:text-[#F5F2EB]' : 'text-[#6B7280] hover:text-[#1A1A1E]'}`}
                >
                  {profile.instagramHandle}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Área de Atuação</p>
                <p className={isDark ? 'text-[#A19E95]' : 'text-[#6B7280]'}>
                  {profile.commercialAddress || 'Pernambuco — Litoral, Médio e Alto Padrão'}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              <ShieldCheck className="h-5 w-5 text-[#C6A15B] shrink-0 mt-0.5" />
              <p className={`text-xs ${isDark ? 'text-[#A19E95]' : 'text-[#6B7280]'}`}>
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
