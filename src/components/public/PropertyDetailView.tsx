import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  MapPin,
  Share2,
} from 'lucide-react';
import { SafeImage } from '../ui/SafeImage';
import { LeadCaptureForm } from './LeadCaptureForm';
import { PropertyCard } from './PropertyCard';
import { formatBRL } from '../../lib/utils';
import { logAnalyticsEvent, updateDocumentMeta } from '../../lib/analytics';
import type { Property, SiteSettings } from '../../types';

interface PropertyDetailViewProps {
  property: Property;
  similarProperties: Property[];
  settings: SiteSettings;
  onNavigate: (path: string) => void;
}

export function PropertyDetailView({
  property,
  similarProperties,
  settings,
  onNavigate,
}: PropertyDetailViewProps) {
  const images = Array.from(
    new Set([property.coverImage, ...(property.gallery || [])].filter(Boolean))
  );
  const [activeImage, setActiveImage] = useState(images[0] || property.coverImage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveImage(images[0] || property.coverImage);
    updateDocumentMeta({
      title: `${property.title} | ${settings.brandName}`,
      description: property.description.slice(0, 155),
    });
    logAnalyticsEvent({
      eventType: 'property_view',
      path: `/imovel/${property.slug}`,
      targetId: property.id,
    });
  }, [property.id, property.slug]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `${property.title} — Bruno Diniz (CRECI-PE 21512)`,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
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
          onClick={() => onNavigate('/comprar')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#A19E95] hover:text-[#F5F2EB] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para imóveis
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-[#F5F2EB] hover:border-[#C6A15B]/50 hover:text-[#C6A15B] transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#C6A15B]" /> : <Share2 className="h-3.5 w-3.5" />}
          {copied ? 'Link copiado' : 'Compartilhar imóvel'}
        </button>
      </div>

      {/* Gallery + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-3">
          <div className="aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-[#131317]">
            <SafeImage
              src={activeImage}
              alt={property.title}
              fallbackTitle={property.title}
              className="h-full w-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`aspect-[4/3] overflow-hidden rounded-lg border transition-all ${
                    activeImage === img
                      ? 'border-[#C6A15B] ring-1 ring-[#C6A15B]'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt={`${property.title} foto ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description & Specs */}
          <div className="pt-6 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#C6A15B]">
                <span className="font-mono-tabular">{property.code}</span>
                <span aria-hidden="true">·</span>
                <span>{property.businessType}</span>
                <span aria-hidden="true">·</span>
                <span>{property.propertyType}</span>
                <span aria-hidden="true">·</span>
                <span>{property.category}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#F5F2EB]">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-[#A19E95]">
                <MapPin className="h-4 w-4 text-[#C6A15B]" />
                <span>
                  {property.neighborhood && property.neighborhood !== 'A confirmar'
                    ? `${property.neighborhood} · ${property.region}`
                    : property.region}
                  {property.address ? ` · ${property.address}` : ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-white/10 bg-[#131317] p-5">
              <div>
                <p className="text-xs text-[#A19E95]">Investimento</p>
                <p className="font-mono-tabular text-base font-semibold text-[#F5F2EB] mt-1">
                  {formatBRL(property.price, property.priceConfirmed)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#A19E95]">Área Privativa</p>
                <p className="font-mono-tabular text-base font-semibold text-[#F5F2EB] mt-1">
                  {property.areaConfirmed && property.areaSqm ? `${property.areaSqm} m²` : 'A confirmar'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#A19E95]">Dormitórios / Suítes</p>
                <p className="font-mono-tabular text-base font-semibold text-[#F5F2EB] mt-1">
                  {property.bedroomsConfirmed && property.bedrooms
                    ? `${property.bedrooms} dorm.${property.suites ? ` (${property.suites} suítes)` : ''}`
                    : 'A confirmar'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#A19E95]">Vagas / Condomínio</p>
                <p className="font-mono-tabular text-base font-semibold text-[#F5F2EB] mt-1">
                  {property.parkingSpots ? `${property.parkingSpots} vagas` : 'A confirmar'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-[#F5F2EB]">
                Sobre o Imóvel
              </h2>
              <p className="text-sm sm:text-base text-[#A19E95] leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {property.features && property.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F2EB]">
                  Destaques e Características
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#A19E95]">
                  {property.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-1 border-b border-white/5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C6A15B]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-[#C6A15B]/30 bg-[#131317] p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#C6A15B] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-[#A19E95]">
                <p className="font-semibold text-[#F5F2EB]">
                  Aviso de Confirmação de Dados ({property.confirmationStatus === 'confirmado' ? 'Ficha confirmada' : 'Sujeito à confirmação'})
                </p>
                <p>
                  {property.confirmationNotes ||
                    'Valores, disponibilidade, metragem, taxa condominial e condições comerciais estão sujeitos à confirmação direta com o corretor Bruno Diniz (CRECI-PE 21512) antes da visita ou proposta.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Lead & Visit Form */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
              Atendimento Direto · {settings.creci}
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#F5F2EB]">
              Agendar Visita ou Confirmar Dados
            </h2>
          </div>

          <LeadCaptureForm
            source="imovel_detalhe"
            whatsappNumber={settings.whatsappNumber}
            propertyId={property.id}
            propertyTitle={`${property.code} — ${property.title}`}
            defaultVisitMode
          />
        </div>
      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className="pt-10 border-t border-white/10 space-y-6">
          <h2 className="font-display text-3xl font-semibold text-[#F5F2EB]">
            Imóveis Semelhantes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.slice(0, 3).map((sim) => (
              <PropertyCard
                key={sim.id}
                property={sim}
                onSelect={(slug) => onNavigate(`/imovel/${slug}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
