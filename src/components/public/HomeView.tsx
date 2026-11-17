import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, ChevronLeft, ChevronRight, Instagram, MessageCircle, Search, Sparkles } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ParallaxMedia,
  RevealSection,
  SplitTextReveal,
  SpotlightCard,
} from '../motion/PremiumMotion';
import { SafeImage } from '../ui/SafeImage';
import { PropertyCard } from './PropertyCard';
import { LeadCaptureForm } from './LeadCaptureForm';
import { buildWhatsAppUrl, formatBRL } from '../../lib/utils';
import { logAnalyticsEvent } from '../../lib/analytics';
import { useTheme } from '../ui/ThemeContext';
import { AIPropertyMatcher } from './AIPropertyMatcher';
import type {
  Empreendimento,
  LandingPage,
  ProfessionalProfile,
  Property,
  SiteSettings,
} from '../../types';

interface HomeViewProps {
  settings: SiteSettings;
  profile: ProfessionalProfile;
  properties: Property[];
  empreendimentos: Empreendimento[];
  landingPage: LandingPage | null;
  onNavigate: (path: string) => void;
  onQuickSearch: (filters: { businessType: string; category: string; region: string }) => void;
}

export function HomeView({
  settings,
  profile,
  properties,
  empreendimentos,
  landingPage,
  onNavigate,
  onQuickSearch,
}: HomeViewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [businessType, setBusinessType] = useState('Todos');
  const [category, setCategory] = useState('Todas');
  const [region, setRegion] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const heroSlides = useMemo(() => {
    const items: { image: string; label: string; category: string; path: string }[] = [];
    const seen = new Set<string>();

    empreendimentos.forEach((emp) => {
      if (emp.coverImage && !seen.has(emp.coverImage)) {
        seen.add(emp.coverImage);
        items.push({
          image: emp.coverImage,
          label: emp.name,
          category: `Empreendimento · ${emp.category}`,
          path: `/empreendimento/${emp.slug}`,
        });
      }
    });

    properties.forEach((prop) => {
      if (prop.coverImage && !seen.has(prop.coverImage)) {
        seen.add(prop.coverImage);
        items.push({
          image: prop.coverImage,
          label: prop.title,
          category: `${prop.code} · ${prop.category}`,
          path: `/imovel/${prop.slug}`,
        });
      }
    });

    if (items.length === 0 && settings.heroImage) {
      items.push({
        image: settings.heroImage,
        label: settings.brandName || 'Bruno Diniz',
        category: settings.creci || 'CRECI-PE 21512',
        path: '/comprar',
      });
    }

    return items;
  }, [properties, empreendimentos, settings.heroImage, settings.brandName, settings.creci]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const activeSlide = heroSlides[slideIndex % Math.max(heroSlides.length, 1)];

  const featuredProperties = properties.filter((p) => p.featured).slice(0, 3);
  const visibleProperties = featuredProperties.length > 0 ? featuredProperties : properties.slice(0, 3);
  const featuredEmps = empreendimentos.slice(0, 2);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch({ businessType, category, region });
  };

  const pillars = [
    {
      index: '01.',
      title: 'Credibilidade no Mercado',
      body: 'Atuação transparente e registro profissional ativo (CRECI-PE 21512), priorizando segurança documental e informações reais confirmadas antes de cada negociação.',
    },
    {
      index: '02.',
      title: 'Resultados Consistentes',
      body: 'Estratégia imobiliária focada em liquidez, seleção criteriosa de imóveis e acompanhamento contínuo desde o primeiro contato até a conclusão.',
    },
    {
      index: '03.',
      title: 'Excelência no Atendimento',
      body: 'Atendimento direto, discreto e consultivo para quem busca imóveis no Litoral, Médio e Alto Padrão em Pernambuco.',
    },
  ];

  return (
    <div className="space-y-0">
      {/* HERO SECTION WITH TRANSITIONING PROPERTY & EMPREENDIMENTO GALLERY */}
      <section className="relative min-h-[84vh] flex items-end pb-14 sm:pb-20 pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#0B0B0D]">
          <AnimatePresence mode="sync">
            {activeSlide && (
              <motion.div
                key={activeSlide.image}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.04 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <SafeImage
                  src={activeSlide.image}
                  alt={activeSlide.label}
                  priority
                  className="h-full w-full object-cover"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/65 to-[#0B0B0D]/30" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0B0B0D]/90 via-[#0B0B0D]/45 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl space-y-6">
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-[#C6A15B]">
              Bruno Diniz · {settings.creci || 'CRECI-PE 21512'} · Especialista em Litoral, Médio e Alto Padrão
            </p>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F5F2EB] leading-[1.06] text-balance">
              <SplitTextReveal text={settings.heroTitle || 'Uma marca à altura de uma trajetória.'} />
            </h1>

            <p className="text-base sm:text-lg text-[#F5F2EB]/85 leading-relaxed max-w-2xl">
              {settings.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={buildWhatsAppUrl(
                  settings.whatsappNumber,
                  'Olá Bruno Diniz, gostaria de receber atendimento personalizado sobre imóveis.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  logAnalyticsEvent({
                    eventType: 'whatsapp_click',
                    path: '/',
                    source: 'hero_primary_cta',
                  })
                }
                className="inline-flex items-center gap-2.5 rounded-lg bg-[#C6A15B] px-6 py-3.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com Bruno Diniz
              </a>

              <button
                type="button"
                onClick={() => onNavigate('/comprar')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/30 backdrop-blur-sm px-6 py-3.5 text-sm font-medium text-[#F5F2EB] hover:border-[#C6A15B]/60 hover:text-[#C6A15B] transition-colors whitespace-nowrap"
              >
                Explorar Imóveis
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {heroSlides.length > 1 && activeSlide && (
            <div className="hidden md:flex flex-col items-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate(activeSlide.path)}
                className="text-right rounded-lg border border-white/15 bg-black/45 backdrop-blur-md px-4 py-2.5 hover:border-[#C6A15B]/50 transition-colors max-w-[280px]"
              >
                <span className="block text-[11px] font-mono-tabular text-[#C6A15B] truncate">
                  {activeSlide.category}
                </span>
                <span className="block text-xs font-medium text-[#F5F2EB] truncate">
                  {activeSlide.label}
                </span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={() =>
                    setSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
                  }
                  className="p-1.5 rounded-full border border-white/15 bg-black/40 text-[#F5F2EB] hover:border-[#C6A15B]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-1.5">
                  {heroSlides.map((s, idx) => (
                    <button
                      key={s.image}
                      type="button"
                      aria-label={`Slide ${idx + 1}`}
                      onClick={() => setSlideIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === slideIndex % heroSlides.length
                          ? 'w-5 bg-[#C6A15B]'
                          : 'w-1.5 bg-white/35 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Próxima foto"
                  onClick={() => setSlideIndex((prev) => (prev + 1) % heroSlides.length)}
                  className="p-1.5 rounded-full border border-white/15 bg-black/40 text-[#F5F2EB] hover:border-[#C6A15B]"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* QUICK SEARCH STRIP */}
      <section className="relative z-20 border-y border-white/10 bg-[#131317]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <form
            onSubmit={handleQuickSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label className="block text-xs text-[#A19E95] mb-1.5">Tipo de Negócio</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
              >
                <option value="Todos">Todos os negócios</option>
                <option value="Venda">Comprar (Venda)</option>
                <option value="Locação">Locação</option>
                <option value="Temporada">Temporada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#A19E95] mb-1.5">Especialidade / Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
              >
                <option value="Todas">Todas as categorias</option>
                <option value="Litoral">Litoral</option>
                <option value="Médio Padrão">Médio Padrão</option>
                <option value="Alto Padrão">Alto Padrão</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#A19E95] mb-1.5">Região em Pernambuco</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Ex.: Boa Viagem, Litoral Sul..."
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F5F2EB] placeholder:text-[#A19E95]/50 focus:border-[#C6A15B] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C6A15B] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors h-[42px]"
            >
              <Search className="h-4 w-4" />
              Buscar Imóveis
            </button>
          </form>
        </div>
      </section>

      {/* AI PROPERTY MATCHMAKER & FUNNEL */}
      <AIPropertyMatcher
        properties={properties}
        settings={settings}
        onNavigate={onNavigate}
      />

      {/* FEATURED PROPERTIES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <RevealSection className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#C6A15B]' : 'text-black font-extrabold'}`}>
              Seleção em Destaque
            </p>
            <h2 className={`font-display text-3xl sm:text-4xl font-bold ${isDark ? 'text-[#F5F2EB]' : 'text-black font-extrabold'}`}>
              Imóveis Selecionados
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/comprar')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#C6A15B] hover:text-[#D8B573] transition-colors whitespace-nowrap"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4" />
          </button>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProperties.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onSelect={(slug) => onNavigate(`/imovel/${slug}`)}
            />
          ))}
        </div>

        <p className="mt-6 text-xs text-[#A19E95]">
          Nota de transparência: imóveis exibidos com dados marcados como &ldquo;A confirmar&rdquo; passam por confirmação direta de disponibilidade, metragem e valores junto ao corretor antes de qualquer proposta.
        </p>
      </section>

      {/* EMPREENDIMENTOS SHOWCASE */}
      {featuredEmps.length > 0 && (
        <section className="border-y border-white/10 bg-[#101014]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
            <RevealSection className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
                  Lançamentos e Residenciais
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F5F2EB]">
                  Empreendimentos Selecionados
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/empreendimentos')}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#C6A15B] hover:text-[#D8B573] transition-colors whitespace-nowrap"
              >
                Todos os empreendimentos
                <ArrowRight className="h-4 w-4" />
              </button>
            </RevealSection>

            <div
              className={
                featuredEmps.length === 1
                  ? 'grid grid-cols-1 gap-6'
                  : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
              }
            >
              {featuredEmps.map((emp) => (
                <SpotlightCard
                  key={emp.id}
                  onClick={() => onNavigate(`/empreendimento/${emp.slug}`)}
                  className="group cursor-pointer"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 h-full items-stretch">
                    <div
                      className={
                        featuredEmps.length === 1
                          ? 'md:col-span-6 relative aspect-[16/10] md:aspect-auto md:min-h-[340px] overflow-hidden bg-[#16161C]'
                          : 'md:col-span-5 relative aspect-[4/3] md:aspect-auto md:min-h-[260px] overflow-hidden bg-[#16161C]'
                      }
                    >
                      <SafeImage
                        src={emp.coverImage}
                        alt={emp.name}
                        fallbackTitle={emp.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/70 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-[#F5F2EB]/90">
                        <span className="font-mono-tabular tracking-wider text-[#C6A15B]">
                          {emp.code}
                        </span>
                        <span>{emp.stage}</span>
                      </div>
                    </div>

                    <div
                      className={
                        featuredEmps.length === 1
                          ? 'md:col-span-6 p-7 sm:p-9 flex flex-col justify-between space-y-6'
                          : 'md:col-span-7 p-6 flex flex-col justify-between space-y-5'
                      }
                    >
                      <div className="space-y-3">
                        <p className="text-xs font-medium tracking-wider uppercase text-[#C6A15B]">
                          {emp.category} · {emp.region}
                        </p>
                        <h3
                          className={
                            featuredEmps.length === 1
                              ? 'font-display text-2xl sm:text-3xl font-semibold text-[#F5F2EB] leading-snug group-hover:text-[#C6A15B] transition-colors'
                              : 'font-display text-xl sm:text-2xl font-semibold text-[#F5F2EB] leading-snug group-hover:text-[#C6A15B] transition-colors'
                          }
                        >
                          {emp.name}
                        </h3>
                        <p className="text-sm text-[#A19E95] leading-relaxed line-clamp-3">
                          {emp.description}
                        </p>
                        {emp.amenities && emp.amenities.length > 0 && (
                          <p className="text-xs text-[#F5F2EB]/75 pt-1">
                            {emp.amenities.slice(0, 3).join(' · ')}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[11px] text-[#A19E95]">
                            {emp.priceFromConfirmed ? 'A partir de' : 'Investimento'}
                          </p>
                          <p className="font-mono-tabular text-base font-semibold text-[#F5F2EB]">
                            {formatBRL(emp.priceFrom, emp.priceFromConfirmed)}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C6A15B] whitespace-nowrap shrink-0">
                          Conhecer empreendimento
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* THE THREE PILLARS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <RevealSection className="max-w-2xl space-y-3 mb-12">
          <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#C6A15B]' : 'text-black font-extrabold'}`}>
            Posicionamento Institucional
          </p>
          <h2 className={`font-display text-3xl sm:text-4xl font-bold ${isDark ? 'text-[#F5F2EB]' : 'text-black font-extrabold'}`}>
            Pilares que sustentam cada negociação
          </h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.index}
              className="rounded-xl border border-white/10 bg-[#131317] p-7 space-y-3"
            >
              <span className="font-mono-tabular text-sm font-medium text-[#C6A15B]">
                {pillar.index}
              </span>
              <h3 className="font-display text-2xl font-semibold text-[#F5F2EB]">
                {pillar.title}
              </h3>
              <p className="text-sm text-[#A19E95] leading-relaxed">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOBRE BRUNO DINIZ SPLIT */}
      <section className="border-y border-white/10 bg-[#101014]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-5">
              <ParallaxMedia className="h-full min-h-[380px] rounded-xl border border-white/10">
                <SafeImage
                  src={profile.portraitImage}
                  alt="Bruno Diniz — Corretor de Imóveis CRECI-PE 21512"
                  className="h-full w-full object-cover"
                />
              </ParallaxMedia>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
                  {profile.creci || 'CRECI-PE 21512'} · Pernambuco
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F5F2EB] text-balance">
                  {profile.name} — Corretor de Imóveis
                </h2>
              </div>

              <p className="text-base text-[#F5F2EB]/90 leading-relaxed">
                {profile.bio}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-white/10">
                <div>
                  <p className="text-xs text-[#A19E95]">Especialidade</p>
                  <p className="text-sm font-medium text-[#F5F2EB] mt-0.5">
                    Litoral, Médio e Alto Padrão
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#A19E95]">Registro</p>
                  <p className="font-mono-tabular text-sm font-medium text-[#C6A15B] mt-0.5">
                    {profile.creci || 'CRECI-PE 21512'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#A19E95]">Instagram Oficial</p>
                  <a
                    href={`https://www.instagram.com/${(profile.instagramHandle || 'brunodiniz.corretordeimoveis').replace('@', '')}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F5F2EB] hover:text-[#C6A15B] mt-0.5"
                  >
                    <Instagram className="h-3.5 w-3.5 text-[#C6A15B]" />
                    {profile.instagramHandle}
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('/sobre')}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-[#F5F2EB] hover:border-[#C6A15B]/50 hover:text-[#C6A15B] transition-colors"
                >
                  Conhecer Trajetória
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href={buildWhatsAppUrl(
                    settings.whatsappNumber,
                    'Olá Bruno Diniz, gostaria de agendar uma conversa consultiva.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#C6A15B] hover:text-[#D8B573]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp direto (81) 99703-9417
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLAGSHIP LANDING PAGE SPOTLIGHT */}
      {landingPage && landingPage.published && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
          <div className="rounded-xl border border-[#C6A15B]/30 bg-gradient-to-br from-[#16161C] via-[#131317] to-[#0B0B0D] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#C6A15B]">
                <Sparkles className="h-4 w-4" />
                <span>{landingPage.kicker || 'Página Especial'}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#F5F2EB]">
                {landingPage.title}
              </h2>
              <p className="text-sm sm:text-base text-[#A19E95] leading-relaxed max-w-2xl">
                {landingPage.heroSubheadline}
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                type="button"
                onClick={() => onNavigate(`/lp/${landingPage.slug}`)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C6A15B] px-6 py-3.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors whitespace-nowrap"
              >
                Acessar Apresentação
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FINAL LEAD & WHATSAPP CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#C6A15B]' : 'text-black font-extrabold'}`}>
              Atendimento Personalizado
            </p>
            <h2 className={`font-display text-3xl sm:text-4xl font-bold text-balance ${isDark ? 'text-[#F5F2EB]' : 'text-black font-extrabold'}`}>
              Encontre o imóvel ideal com atendimento direto.
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-[#A19E95]' : 'text-black font-semibold'}`}>
              Informe o perfil que você procura ou agende um horário para conversarmos sobre oportunidades no Litoral, Médio e Alto Padrão em Pernambuco.
            </p>
            <ul className={`space-y-2.5 pt-2 text-sm ${isDark ? 'text-[#F5F2EB]/85' : 'text-black font-semibold'}`}>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#C6A15B] shrink-0" />
                <span>Confirmação direta de disponibilidade e documentação</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#C6A15B] shrink-0" />
                <span>Visitas agendadas com acompanhamento exclusivo</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-[#C6A15B] shrink-0" />
                <span>Seleção alinhada ao seu objetivo de moradia ou patrimônio</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <LeadCaptureForm
              source="home_contato"
              whatsappNumber={settings.whatsappNumber}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
