import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import {
  ParallaxMedia,
  RevealSection,
  SplitTextReveal,
  SpotlightCard,
} from '../motion/PremiumMotion';
import { SafeImage } from '../ui/SafeImage';
import { LeadCaptureForm } from './LeadCaptureForm';
import { buildWhatsAppUrl, formatBRL } from '../../lib/utils';
import { logAnalyticsEvent, updateDocumentMeta } from '../../lib/analytics';
import { OFFICIAL_LOGO_URL } from '../../lib/seedData';
import type { Empreendimento, LandingPage, Property, SiteSettings } from '../../types';

interface FlagshipLandingPageViewProps {
  landingPage: LandingPage;
  linkedProperty?: Property;
  linkedEmpreendimento?: Empreendimento;
  settings: SiteSettings;
  onNavigate: (path: string) => void;
}

export function FlagshipLandingPageView({
  landingPage,
  linkedProperty,
  linkedEmpreendimento,
  settings,
  onNavigate,
}: FlagshipLandingPageViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(
    landingPage.gallery?.[0] || landingPage.heroImage
  );

  useEffect(() => {
    updateDocumentMeta({
      title: landingPage.seoTitle || landingPage.title,
      description: landingPage.seoDescription || landingPage.heroSubheadline,
    });
    logAnalyticsEvent({
      eventType: 'landing_view',
      path: `/lp/${landingPage.slug}`,
      targetId: landingPage.id,
    });
  }, [landingPage.id, landingPage.slug]);

  const galleryImages = Array.from(
    new Set([landingPage.heroImage, ...(landingPage.gallery || [])].filter(Boolean))
  );

  return (
    <div className="bg-[#0B0B0D] text-[#F5F2EB]">
      {/* Architectural Hero */}
      <section className="relative min-h-[88vh] flex items-end pb-16 pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src={landingPage.heroImage}
            alt={landingPage.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/60 to-[#0B0B0D]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D]/90 via-[#0B0B0D]/40 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={settings.logoUrl || OFFICIAL_LOGO_URL}
                alt={`${settings.brandName || 'Bruno Diniz'} — Logotipo Oficial`}
                referrerPolicy="no-referrer"
                className="h-11 sm:h-12 w-auto max-w-[150px] object-contain brightness-110 contrast-110 drop-shadow-[0_2px_12px_rgba(255,255,255,0.22)]"
              />
              <span className="font-display text-2xl sm:text-3xl font-semibold tracking-[0.04em] text-[#F5F2EB]">
                {settings.brandName || 'Bruno Diniz'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2 text-xs text-[#F5F2EB]/80 hover:text-[#C6A15B] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao site principal
            </button>
          </div>

          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{landingPage.kicker || `Bruno Diniz · ${settings.creci}`}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.06] text-balance">
              <SplitTextReveal text={landingPage.heroHeadline} />
            </h1>

            <p className="text-base sm:text-lg text-[#F5F2EB]/85 leading-relaxed max-w-2xl">
              {landingPage.heroSubheadline}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#lp-conversao"
                className="inline-flex items-center gap-2 rounded-lg bg-[#C6A15B] px-6 py-3.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors"
              >
                {landingPage.ctaLabel || 'Solicitar Atendimento Exclusivo'}
              </a>

              <a
                href={buildWhatsAppUrl(
                  settings.whatsappNumber,
                  landingPage.whatsappMessage ||
                    `Olá Bruno Diniz, vim pela página ${landingPage.title} e gostaria de atendimento.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  logAnalyticsEvent({
                    eventType: 'whatsapp_click',
                    path: `/lp/${landingPage.slug}`,
                    targetId: landingPage.id,
                    source: 'landing_page_hero',
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-black/40 backdrop-blur-sm px-6 py-3.5 text-sm font-medium text-[#F5F2EB] hover:border-[#C6A15B]"
              >
                <MessageCircle className="h-4 w-4 text-[#C6A15B]" />
                Conversar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <RevealSection className="max-w-2xl space-y-2 mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
            Diferenciais da Seleção
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">
            {landingPage.title}
          </h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(landingPage.highlights || []).map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
            >
              <SpotlightCard className="p-6 h-full flex items-start gap-4">
                <span className="font-mono-tabular text-sm font-semibold text-[#C6A15B] shrink-0">
                  0{idx + 1}.
                </span>
                <p className="text-base text-[#F5F2EB]/90 leading-relaxed">{item}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Parallax & Interactive Gallery */}
      {galleryImages.length > 0 && (
        <section className="border-y border-white/10 bg-[#101014] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-8">
                <ParallaxMedia className="h-[420px] sm:h-[520px] rounded-xl border border-white/10">
                  <SafeImage
                    src={selectedPhoto}
                    alt={landingPage.title}
                    className="h-full w-full object-cover"
                  />
                </ParallaxMedia>
              </div>

              <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest text-[#C6A15B]">
                    Galeria Arquitetônica
                  </p>
                  <h3 className="font-display text-3xl font-semibold">
                    Estética, luz natural e vista mar.
                  </h3>
                  <p className="text-sm text-[#A19E95] leading-relaxed">
                    Explore os ângulos selecionados. Para plantas, metragens exatas e condições comerciais confirmadas, solicite o dossiê atualizado com Bruno Diniz.
                  </p>
                </div>

                {(linkedProperty || linkedEmpreendimento) && (
                  <div className="rounded-xl border border-white/10 bg-[#131317] p-5 space-y-2">
                    <p className="text-xs text-[#C6A15B]">
                      {linkedProperty ? `Imóvel ${linkedProperty.code}` : `Empreendimento ${linkedEmpreendimento?.code}`}
                    </p>
                    <p className="font-display text-xl font-semibold">
                      {linkedProperty?.title || linkedEmpreendimento?.name}
                    </p>
                    <p className="text-xs text-[#A19E95]">
                      Investimento:{' '}
                      <span className="font-mono-tabular text-[#F5F2EB]">
                        {linkedProperty
                          ? formatBRL(linkedProperty.price, linkedProperty.priceConfirmed)
                          : formatBRL(
                              linkedEmpreendimento?.priceFrom,
                              linkedEmpreendimento?.priceFromConfirmed
                            )}
                      </span>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.map((img, i) => (
                    <button
                      key={`${img}-${i}`}
                      type="button"
                      onClick={() => setSelectedPhoto(img)}
                      className={`aspect-square rounded-lg overflow-hidden border transition-all ${
                        selectedPhoto === img
                          ? 'border-[#C6A15B] ring-1 ring-[#C6A15B]'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <SafeImage src={img} alt={`Galeria ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Conversion Form Section */}
      <section id="lp-conversao" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
              Atendimento Privado · {settings.creci}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-balance">
              Receba o dossiê confirmado ou agende sua visita.
            </h2>
            <p className="text-sm sm:text-base text-[#A19E95] leading-relaxed">
              Preencha seus dados ao lado para atendimento consultivo direto com Bruno Diniz. Credibilidade no mercado, resultados consistentes e excelência no atendimento.
            </p>
            <div className="space-y-3 pt-2 text-sm text-[#F5F2EB]/85">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#C6A15B]" />
                <span>Confirmação real de valores, área e disponibilidade</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#C6A15B]" />
                <span>Tratamento de dados em conformidade com a LGPD</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <LeadCaptureForm
              source={`landing_page_${landingPage.slug}`}
              whatsappNumber={settings.whatsappNumber}
              landingPageId={landingPage.id}
              propertyId={linkedProperty?.id}
              empreendimentoId={linkedEmpreendimento?.id}
              propertyTitle={landingPage.title}
              ctaLabel={landingPage.ctaLabel}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
