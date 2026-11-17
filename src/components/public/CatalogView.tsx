import React, { useMemo, useState } from 'react';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import type { Property } from '../../types';

interface CatalogViewProps {
  properties: Property[];
  initialCategory?: string;
  initialBusinessType?: string;
  initialRegion?: string;
  pageTitle: string;
  pageSubtitle: string;
  onSelectProperty: (slug: string) => void;
}

export function CatalogView({
  properties,
  initialCategory = 'Todas',
  initialBusinessType = 'Todos',
  initialRegion = '',
  pageTitle,
  pageSubtitle,
  onSelectProperty,
}: CatalogViewProps) {
  const [searchText, setSearchText] = useState(initialRegion);
  const [businessType, setBusinessType] = useState(initialBusinessType);
  const [category, setCategory] = useState(initialCategory);
  const [propertyType, setPropertyType] = useState('Todos');
  const [priceBracket, setPriceBracket] = useState('Todas');
  const [minBedrooms, setMinBedrooms] = useState('0');
  const [minArea, setMinArea] = useState('0');
  const [minParking, setMinParking] = useState('0');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return properties
      .filter((p) => {
        if (businessType !== 'Todos' && p.businessType !== businessType) return false;
        if (category !== 'Todas' && p.category !== category) return false;
        if (propertyType !== 'Todos' && p.propertyType !== propertyType) return false;
        if (featuredOnly && !p.featured) return false;

        if (searchText.trim()) {
          const q = searchText.toLowerCase();
          const haystack = `${p.title} ${p.region} ${p.neighborhood || ''} ${p.code} ${p.description}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }

        if (priceBracket !== 'Todas') {
          if (!p.priceConfirmed || p.price === null) return false;
          if (priceBracket === 'ate_800k' && p.price > 800000) return false;
          if (priceBracket === '800k_1500k' && (p.price < 800000 || p.price > 1500000)) return false;
          if (priceBracket === '1500k_3000k' && (p.price < 1500000 || p.price > 3000000)) return false;
          if (priceBracket === 'acima_3000k' && p.price < 3000000) return false;
        }

        const reqBeds = Number(minBedrooms);
        if (reqBeds > 0 && (!p.bedroomsConfirmed || !p.bedrooms || p.bedrooms < reqBeds)) {
          return false;
        }

        const reqArea = Number(minArea);
        if (reqArea > 0 && (!p.areaConfirmed || !p.areaSqm || p.areaSqm < reqArea)) {
          return false;
        }

        const reqParking = Number(minParking);
        if (reqParking > 0 && (!p.parkingSpots || p.parkingSpots < reqParking)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          return Number(b.featured) - Number(a.featured);
        }
        if (sortBy === 'price_asc') {
          const pa = a.priceConfirmed && a.price ? a.price : Number.MAX_SAFE_INTEGER;
          const pb = b.priceConfirmed && b.price ? b.price : Number.MAX_SAFE_INTEGER;
          return pa - pb;
        }
        if (sortBy === 'price_desc') {
          const pa = a.priceConfirmed && a.price ? a.price : -1;
          const pb = b.priceConfirmed && b.price ? b.price : -1;
          return pb - pa;
        }
        return a.code.localeCompare(b.code);
      });
  }, [
    properties,
    businessType,
    category,
    propertyType,
    featuredOnly,
    searchText,
    priceBracket,
    minBedrooms,
    minArea,
    minParking,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchText('');
    setBusinessType('Todos');
    setCategory('Todas');
    setPropertyType('Todos');
    setPriceBracket('Todas');
    setMinBedrooms('0');
    setMinArea('0');
    setMinParking('0');
    setFeaturedOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="space-y-3 border-b border-white/10 pb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-[#C6A15B]">
          Catálogo Imobiliário · CRECI-PE 21512
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#F5F2EB]">
          {pageTitle}
        </h1>
        <p className="text-sm sm:text-base text-[#A19E95] max-w-2xl">
          {pageSubtitle}
        </p>
      </div>

      {/* Category Quick Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#131317] border border-white/10">
          {['Todas', 'Litoral', 'Médio Padrão', 'Alto Padrão'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                category === cat
                  ? 'bg-[#C6A15B] text-[#0B0B0D]'
                  : 'text-[#A19E95] hover:text-[#F5F2EB]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-[#F5F2EB]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#C6A15B]" />
            Filtros
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#131317] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
          >
            <option value="featured">Ordenar: Destaques</option>
            <option value="price_asc">Menor valor confirmado</option>
            <option value="price_desc">Maior valor confirmado</option>
            <option value="code">Código do imóvel</option>
          </select>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className={`${
          mobileFiltersOpen ? 'block' : 'hidden lg:block'
        } rounded-xl border border-white/10 bg-[#131317] p-5 space-y-4`}
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5F2EB]">
            <Filter className="h-3.5 w-3.5 text-[#C6A15B]" />
            Refinar Busca
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-[#A19E95] hover:text-[#C6A15B] inline-flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Região / Palavra-chave</label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-[#A19E95] absolute left-3 top-3" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Região, bairro ou código"
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] pl-8 pr-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Negócio</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
            >
              <option value="Todos">Todos</option>
              <option value="Venda">Venda</option>
              <option value="Locação">Locação</option>
              <option value="Temporada">Temporada</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Tipo de Imóvel</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
            >
              <option value="Todos">Todos os tipos</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Cobertura">Cobertura</option>
              <option value="Flat">Flat</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Faixa de Valor (Confirmados)</label>
            <select
              value={priceBracket}
              onChange={(e) => setPriceBracket(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
            >
              <option value="Todas">Todas (inclui a confirmar)</option>
              <option value="ate_800k">Até R$ 800 mil</option>
              <option value="800k_1500k">R$ 800 mil a R$ 1,5 mi</option>
              <option value="1500k_3000k">R$ 1,5 mi a R$ 3 mi</option>
              <option value="acima_3000k">Acima de R$ 3 mi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Dormitórios mínimos</label>
            <select
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
            >
              <option value="0">Indiferente</option>
              <option value="2">2+ dormitórios</option>
              <option value="3">3+ dormitórios</option>
              <option value="4">4+ dormitórios</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Área mínima</label>
            <select
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
            >
              <option value="0">Indiferente</option>
              <option value="80">80+ m²</option>
              <option value="120">120+ m²</option>
              <option value="200">200+ m²</option>
              <option value="300">300+ m²</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Vagas mínimas</label>
            <select
              value={minParking}
              onChange={(e) => setMinParking(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
            >
              <option value="0">Indiferente</option>
              <option value="1">1+ vaga</option>
              <option value="2">2+ vagas</option>
              <option value="3">3+ vagas</option>
            </select>
          </div>

          <div className="flex items-end pb-1">
            <label className="inline-flex items-center gap-2 text-xs text-[#F5F2EB] cursor-pointer">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="rounded border-white/20 bg-[#0B0B0D] accent-[#C6A15B]"
              />
              Apenas imóveis em destaque
            </label>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#A19E95]">
        <span>
          Exibindo <strong className="text-[#F5F2EB] tabular-nums">{filtered.length}</strong> imóvel(is)
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#131317] p-12 text-center space-y-4">
          <p className="font-display text-2xl text-[#F5F2EB]">
            Nenhum imóvel encontrado com esses filtros
          </p>
          <p className="text-sm text-[#A19E95] max-w-md mx-auto">
            Alguns imóveis possuem ficha técnica em confirmação direta com o corretor. Limpe os filtros para ver todo o portfólio ou solicite uma busca personalizada.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg bg-[#C6A15B] px-5 py-2.5 text-xs font-semibold text-[#0B0B0D] hover:bg-[#D8B573]"
          >
            Mostrar todos os imóveis
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      )}
    </div>
  );
}
