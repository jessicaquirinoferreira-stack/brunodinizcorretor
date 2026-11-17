import React from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { SpotlightCard } from '../motion/PremiumMotion';
import { SafeImage } from '../ui/SafeImage';
import { formatBRL } from '../../lib/utils';
import type { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  onSelect: (slug: string) => void;
}

export function PropertyCard({ property, onSelect }: PropertyCardProps) {
  const specs: string[] = [];
  if (property.areaConfirmed && property.areaSqm) {
    specs.push(`${property.areaSqm} m²`);
  }
  if (property.bedroomsConfirmed && property.bedrooms) {
    specs.push(`${property.bedrooms} dorm.`);
  }
  if (property.parkingSpots) {
    specs.push(`${property.parkingSpots} vagas`);
  }

  return (
    <SpotlightCard
      onClick={() => onSelect(property.slug)}
      className="group cursor-pointer flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#16161C]">
        <SafeImage
          src={property.coverImage}
          alt={property.title}
          fallbackTitle={property.title}
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-[#F5F2EB]/90">
          <span className="font-mono-tabular tracking-wider text-[#C6A15B]">
            {property.code}
          </span>
          <span>
            {property.category} · {property.businessType}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-[#A19E95]">
            <MapPin className="h-3.5 w-3.5 text-[#C6A15B] shrink-0" />
            <span className="truncate">
              {property.neighborhood && property.neighborhood !== 'A confirmar'
                ? `${property.neighborhood} · ${property.region}`
                : property.region}
            </span>
          </div>

          <h3 className="font-display text-xl font-semibold text-[#F5F2EB] leading-snug group-hover:text-[#C6A15B] transition-colors">
            {property.title}
          </h3>

          <p className="text-xs text-[#A19E95] leading-relaxed line-clamp-2">
            {property.description}
          </p>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#A19E95]">
              {property.priceConfirmed ? 'Valor confirmado' : 'Investimento'}
            </p>
            <p className="font-mono-tabular text-base font-semibold text-[#F5F2EB]">
              {formatBRL(property.price, property.priceConfirmed)}
            </p>
            {specs.length > 0 ? (
              <p className="text-xs text-[#A19E95] mt-0.5">{specs.join(' · ')}</p>
            ) : (
              <p className="text-xs text-[#A19E95]/80 mt-0.5">
                Metragem e ficha a confirmar
              </p>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#C6A15B] whitespace-nowrap shrink-0">
            Ver detalhes
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}
