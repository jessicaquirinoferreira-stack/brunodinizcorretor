import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, MapPin, Share2 } from 'lucide-react';
import { SpotlightCard } from '../motion/PremiumMotion';
import { SafeImage } from '../ui/SafeImage';
import { LeadCaptureForm } from './LeadCaptureForm';
import { PropertyCard } from './PropertyCard';
import { formatBRL } from '../../lib/utils';
import { logAnalyticsEvent, updateDocumentMeta } from '../../lib/analytics';
import type { Empreendimento, Property, SiteSettings } from '../../types';

interface EmpreendimentosListProps {
  empreendimentos: Empreendimento[];
  onSelect: (slug: string) => void;
}

export function EmpreendimentosListView({ empreendimentos, onSelect }: EmpreendimentosListProps) {
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  const filtered = empreendimentos.filter((e) =>
    categoryFilter === 'Todas' ? true : e.category === categoryFilter
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="space-y-3 border-b border-white/10 pb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
          Lançamentos & Residenciais · CRECI-PE 21512
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#F5F2EB]">
          Empreendimentos em Curadoria
        </h1>
        <p className="text-sm sm:text-base text-[#A19E95] max-w-2xl">
          Projetos residenciais selecionados no litoral e regiões estratégicas de Pernambuco, com informações técnicas confirmadas diretamente junto ao corretor.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#131317] border border-white/10 w-fit">
        {['Todas', 'Litoral', 'Médio Padrão', 'Alto Padrão'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-[#C6A15B] text-[#0B0B0D]'
                : 'text-[#A19E95] hover:text-[#F5F2EB]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#131317] p-12 text-center text-sm text-[#A19E95]">
          Nenhum empreendimento cadastrado nessa categoria no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((emp) => (
            <SpotlightCard
              key={emp.id}
              onClick={() => onSelect(emp.slug)}
              className="group cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#16161C]">
                <SafeImage
                  src={emp.coverImage}
                  alt={emp.name}
                  fallbackTitle={emp.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-[#F5F2EB]">
                  <span className="font-mono-tabular text-[#C6A15B]">{emp.code}</span>
                  <span>
                    {emp.category} · {emp.stage}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#A19E95]">
                    <MapPin className="h-3.5 w-3.5 text-[#C6A15B]" />
                    <span>{emp.region}</span>
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-[#F5F2EB] group-hover:text-[#C6A15B] transition-colors">
                    {emp.name}
                  </h2>
                  <p className="text-xs text-[#A19E95] leading-relaxed line-clamp-3">
                    {emp.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#A19E95]">A partir de: </span>
                    <span className="font-mono-tabular font-semibold text-[#F5F2EB]">
                      {formatBRL(emp.priceFrom, emp.priceFromConfirmed)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 font-medium text-[#C6A15B]">
                    Ver empreendimento
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}
    </div>
  );
}

interface EmpreendimentoDetailProps {
  empreendimento: Empreendimento;
  linkedProperties: Property[];
  settings: SiteSettings;
  onNavigate: (path: string) => void;
}

export function EmpreendimentoDetailView({
  empreendimento,
  linkedProperties,
  settings,
  onNavigate,
}: EmpreendimentoDetailProps) {
  const images = Array.from(
    new Set([empreendimento.coverImage, ...(empreendimento.gallery || [])].filter(Boolean))
  );
  const [activeImage, setActiveImage] = useState(images[0] || empreendimento.coverImage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveImage(images[0] || empreendimento.coverImage);
    updateDocumentMeta({
      title: `${empreendimento.name} | ${settings.brandName}`,
      description: empreendimento.description.slice(0, 155),
    });
    logAnalyticsEvent({
      eventType: 'empreendimento_view',
      path: `/empreendimento/${empreendimento.slug}`,
      targetId: empreendimento.id,
    });
  }, [empreendimento.id, empreendimento.slug]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onNavigate('/empreendimentos')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#A19E95] hover:text-[#F5F2EB]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para empreendimentos
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-[#F5F2EB] hover:border-[#C6A15B]/50"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#C6A15B]" /> : <Share2 className="h-3.5 w-3.5" />}
          {copied ? 'Link copiado' : 'Compartilhar empreendimento'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-5">
          <div className="aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-[#131317]">
            <SafeImage
              src={activeImage}
              alt={empreendimento.name}
              fallbackTitle={empreendimento.name}
              className="h-full w-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2.5">
              {images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`aspect-[4/3] overflow-hidden rounded-lg border ${
                    activeImage === img ? 'border-[#C6A15B]' : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt={`${empreendimento.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="pt-4 space-y-4">
            <p className="text-xs text-[#C6A15B]">
              <span className="font-mono-tabular">{empreendimento.code}</span> · {empreendimento.category} · {empreendimento.stage}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#F5F2EB]">
              {empreendimento.name}
            </h1>
            <p className="text-sm text-[#A19E95] flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#C6A15B]" />
              {empreendimento.region}
              {empreendimento.developer ? ` · Incorporação: ${empreendimento.developer}` : ''}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-white/10 bg-[#131317] p-5">
              <div>
                <p className="text-xs text-[#A19E95]">Estágio</p>
                <p className="text-sm font-semibold text-[#F5F2EB] mt-1">{empreendimento.stage}</p>
              </div>
              <div>
                <p className="text-xs text-[#A19E95]">Tipologias / Área</p>
                <p className="text-sm font-semibold text-[#F5F2EB] mt-1">
                  {empreendimento.areaRange || 'A confirmar'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#A19E95]">Valores a partir de</p>
                <p className="font-mono-tabular text-sm font-semibold text-[#F5F2EB] mt-1">
                  {formatBRL(empreendimento.priceFrom, empreendimento.priceFromConfirmed)}
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#A19E95] leading-relaxed whitespace-pre-line">
              {empreendimento.description}
            </p>

            {empreendimento.amenities && empreendimento.amenities.length > 0 && (
              <div className="space-y-2 pt-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#F5F2EB]">
                  Infraestrutura e Diferenciais
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#A19E95]">
                  {empreendimento.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-1 border-b border-white/5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C6A15B]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-[#C6A15B]/30 bg-[#131317] p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#C6A15B] shrink-0 mt-0.5" />
              <p className="text-xs text-[#A19E95]">
                Disponibilidade de unidades, memorial descritivo e tabela comercial estão sujeitos à confirmação direta com Bruno Diniz ({settings.creci}).
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-[#F5F2EB]">
            Receber Dossiê e Tabela Atualizada
          </h2>
          <LeadCaptureForm
            source="empreendimento_detalhe"
            whatsappNumber={settings.whatsappNumber}
            empreendimentoId={empreendimento.id}
            propertyTitle={empreendimento.name}
          />
        </div>
      </div>

      {linkedProperties.length > 0 && (
        <section className="pt-10 border-t border-white/10 space-y-6">
          <h2 className="font-display text-3xl font-semibold text-[#F5F2EB]">
            Unidades Vinculadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {linkedProperties.map((p) => (
              <PropertyCard key={p.id} property={p} onSelect={(slug) => onNavigate(`/imovel/${slug}`)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
