import React, { useState } from 'react';
import {
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  bootstrapInitialFirestoreData,
  deleteEmpreendimento,
  deleteMediaAsset,
  deleteProperty,
  saveAdminUser,
  saveEmpreendimento,
  saveFlagshipLandingPage,
  saveMediaAsset,
  saveProfessionalProfile,
  saveProperty,
  saveSiteSettings,
} from '../../lib/firestoreService';
import { DEFAULT_LANDING_PAGE, HERO_IMAGE } from '../../lib/seedData';
import { formatBRL, slugify } from '../../lib/utils';
import { SafeImage } from '../ui/SafeImage';
import { compressImageFile } from '../../lib/imageCompressor';
import type {
  AdminUser,
  BusinessType,
  ConfirmationStatus,
  Empreendimento,
  EmpreendimentoStage,
  LandingPage,
  MediaAsset,
  ProfessionalProfile,
  Property,
  PropertyCategory,
  PropertyType,
  SiteSettings,
} from '../../types';

// --- PROPERTIES CRUD ---

export function PropertiesAdminPanel({
  properties,
  empreendimentos,
  onRefresh,
}: {
  properties: Property[];
  empreendimentos: Empreendimento[];
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState<Partial<Property> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const startNew = () => {
    setEditing({
      code: `BD-${Math.floor(100 + Math.random() * 899)}`,
      title: '',
      businessType: 'Venda',
      propertyType: 'Apartamento',
      category: 'Alto Padrão',
      region: 'Litoral de Pernambuco',
      neighborhood: 'A confirmar',
      address: 'A confirmar',
      priceConfirmed: false,
      price: null,
      areaConfirmed: false,
      areaSqm: null,
      bedroomsConfirmed: false,
      bedrooms: null,
      suites: null,
      parkingSpots: null,
      description: '',
      features: [],
      coverImage: HERO_IMAGE,
      gallery: [HERO_IMAGE],
      featured: false,
      published: true,
      confirmationStatus: 'a_confirmar',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await saveProperty(editing);
      setEditing(null);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#A19E95]">
          Cadastre, edite, destaque ou marque os dados como confirmados ou a confirmar.
        </p>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#C6A15B] px-4 py-2 text-xs font-semibold text-[#0B0B0D] hover:bg-[#D8B573]"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo Imóvel
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="rounded-xl border border-[#C6A15B]/30 bg-[#131317] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-semibold text-[#F5F2EB]">
              {editing.id ? 'Editar Imóvel' : 'Novo Imóvel'}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-xs text-[#A19E95] hover:text-[#F5F2EB]"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Código *</label>
              <input
                type="text"
                required
                value={editing.code || ''}
                onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-[#A19E95] mb-1">Título *</label>
              <input
                type="text"
                required
                value={editing.title || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    title: e.target.value,
                    slug: editing.id ? editing.slug : slugify(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Slug URL</label>
              <input
                type="text"
                value={editing.slug || ''}
                onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Negócio</label>
              <select
                value={editing.businessType || 'Venda'}
                onChange={(e) => setEditing({ ...editing, businessType: e.target.value as BusinessType })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              >
                <option value="Venda">Venda</option>
                <option value="Locação">Locação</option>
                <option value="Temporada">Temporada</option>
                <option value="A confirmar">A confirmar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Categoria</label>
              <select
                value={editing.category || 'Alto Padrão'}
                onChange={(e) => setEditing({ ...editing, category: e.target.value as PropertyCategory })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              >
                <option value="Litoral">Litoral</option>
                <option value="Médio Padrão">Médio Padrão</option>
                <option value="Alto Padrão">Alto Padrão</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Tipo</label>
              <select
                value={editing.propertyType || 'Apartamento'}
                onChange={(e) => setEditing({ ...editing, propertyType: e.target.value as PropertyType })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              >
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Cobertura">Cobertura</option>
                <option value="Flat">Flat</option>
                <option value="Terreno">Terreno</option>
                <option value="A confirmar">A confirmar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Região *</label>
              <input
                type="text"
                required
                value={editing.region || ''}
                onChange={(e) => setEditing({ ...editing, region: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Empreendimento vinculado</label>
              <select
                value={editing.empreendimentoId || ''}
                onChange={(e) => setEditing({ ...editing, empreendimentoId: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              >
                <option value="">Nenhum</option>
                {empreendimentos.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Confirmed specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 pt-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-[#F5F2EB]">
                <input
                  type="checkbox"
                  checked={Boolean(editing.priceConfirmed)}
                  onChange={(e) => setEditing({ ...editing, priceConfirmed: e.target.checked })}
                  className="accent-[#C6A15B]"
                />
                Valor confirmado (R$)
              </label>
              <input
                type="number"
                disabled={!editing.priceConfirmed}
                value={editing.price ?? ''}
                onChange={(e) => setEditing({ ...editing, price: e.target.value ? Number(e.target.value) : null })}
                placeholder="Ex.: 1850000"
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB] disabled:opacity-40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-[#F5F2EB]">
                <input
                  type="checkbox"
                  checked={Boolean(editing.areaConfirmed)}
                  onChange={(e) => setEditing({ ...editing, areaConfirmed: e.target.checked })}
                  className="accent-[#C6A15B]"
                />
                Área confirmada (m²)
              </label>
              <input
                type="number"
                disabled={!editing.areaConfirmed}
                value={editing.areaSqm ?? ''}
                onChange={(e) => setEditing({ ...editing, areaSqm: e.target.value ? Number(e.target.value) : null })}
                placeholder="Ex.: 180"
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB] disabled:opacity-40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-[#F5F2EB]">
                <input
                  type="checkbox"
                  checked={Boolean(editing.bedroomsConfirmed)}
                  onChange={(e) => setEditing({ ...editing, bedroomsConfirmed: e.target.checked })}
                  className="accent-[#C6A15B]"
                />
                Dormitórios confirmados
              </label>
              <input
                type="number"
                disabled={!editing.bedroomsConfirmed}
                value={editing.bedrooms ?? ''}
                onChange={(e) => setEditing({ ...editing, bedrooms: e.target.value ? Number(e.target.value) : null })}
                placeholder="Ex.: 4"
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB] disabled:opacity-40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#A19E95] mb-1 flex items-center justify-between">
                <span>Imagem de Capa (URL ou Dispositivo)</span>
                <label className="cursor-pointer text-[11px] text-[#C6A15B] hover:underline inline-flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  {uploadingMedia ? 'Comprimindo...' : 'Enviar do Dispositivo'}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadingMedia(true);
                        try {
                          const compressed = await compressImageFile(file);
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const res = await fetch('/api/blob/upload', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                filename: compressed.name,
                                contentType: compressed.type,
                                base64Data: reader.result,
                              }),
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setEditing({ ...editing, coverImage: data.url });
                            } else {
                              const err = await res.json();
                              alert(err.error || 'Erro no upload.');
                            }
                            setUploadingMedia(false);
                          };
                          reader.readAsDataURL(compressed);
                        } catch {
                          alert('Erro ao processar arquivo.');
                          setUploadingMedia(false);
                        }
                      }
                    }}
                  />
                </label>
              </label>
              <input
                type="text"
                value={editing.coverImage || ''}
                onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Status de Confirmação</label>
              <select
                value={editing.confirmationStatus || 'a_confirmar'}
                onChange={(e) => setEditing({ ...editing, confirmationStatus: e.target.value as ConfirmationStatus })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              >
                <option value="a_confirmar">A confirmar com corretor</option>
                <option value="confirmado">Dados confirmados</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Descrição</label>
            <textarea
              rows={3}
              value={editing.description || ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>

          {/* ANEXOS ILIMITADOS / GALERIA DE FOTOS E VÍDEOS */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#F5F2EB]">
                  Fotos e Vídeos do Imóvel ({editing.gallery?.length || 0} anexos)
                </label>
                <p className="text-[11px] text-[#A19E95]">
                  Anexos ilimitados do dispositivo com compressão inteligente para o Vercel Blob sem perder qualidade.
                </p>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#C6A15B] px-3 py-1.5 text-xs font-semibold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingMedia ? 'Comprimindo & Enviando...' : 'Anexar do Dispositivo'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    setUploadingMedia(true);
                    try {
                      const newUrls: string[] = [];
                      for (const f of files) {
                        const compressed = await compressImageFile(f);
                        const b64 = await new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result as string);
                          reader.readAsDataURL(compressed);
                        });
                        const res = await fetch('/api/blob/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            filename: compressed.name,
                            contentType: compressed.type,
                            base64Data: b64,
                          }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          if (data.url) newUrls.push(data.url);
                        }
                      }
                      if (newUrls.length > 0) {
                        const updated = [...(editing.gallery || []), ...newUrls];
                        setEditing({
                          ...editing,
                          gallery: updated,
                          coverImage: editing.coverImage || updated[0],
                        });
                      }
                    } catch {
                      alert('Erro ao enviar fotos/vídeos.');
                    } finally {
                      setUploadingMedia(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>

            {editing.gallery && editing.gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
                {editing.gallery.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10 bg-[#0B0B0D] aspect-video">
                    {url.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i) ? (
                      <video src={url} className="w-full h-full object-cover" muted />
                    ) : (
                      <SafeImage src={url} alt={`Anexo ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      <button
                        type="button"
                        title="Definir como capa"
                        onClick={() => setEditing({ ...editing, coverImage: url })}
                        className={`p-1 rounded text-[10px] ${editing.coverImage === url ? 'bg-[#C6A15B] text-black font-bold' : 'bg-black/80 text-white hover:text-[#C6A15B]'}`}
                      >
                        {editing.coverImage === url ? 'Capa' : 'Set Capa'}
                      </button>
                      <button
                        type="button"
                        title="Remover anexo"
                        onClick={() => {
                          const updated = (editing.gallery || []).filter((_, i) => i !== idx);
                          setEditing({ ...editing, gallery: updated });
                        }}
                        className="p-1 rounded bg-red-600/80 text-white hover:bg-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-white/10 text-center text-xs text-[#A19E95]">
                Nenhuma foto ou vídeo anexado ainda. Clique em "Anexar do Dispositivo" para enviar múltiplos arquivos simultaneamente.
              </div>
            )}
          </div>


          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-5 text-xs">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editing.featured)}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  className="accent-[#C6A15B]"
                />
                Destacar na Home
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.published !== false}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                  className="accent-[#C6A15B]"
                />
                Publicado no site
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#C6A15B] px-5 py-2.5 text-xs font-semibold text-[#0B0B0D]"
            >
              {saving ? 'Salvando...' : 'Salvar Imóvel'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/10 bg-[#131317] p-4 flex gap-4">
            <div className="w-28 h-24 shrink-0 rounded-lg overflow-hidden bg-[#0B0B0D]">
              <SafeImage src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="font-mono-tabular text-[#C6A15B]">{p.code}</span>
                <span className="text-[#A19E95]">
                  {p.published ? 'Publicado' : 'Rascunho'} · {p.confirmationStatus === 'confirmado' ? 'Confirmado' : 'A confirmar'}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#F5F2EB] truncate">{p.title}</p>
              <p className="text-xs text-[#A19E95]">
                {p.category} · {formatBRL(p.price, p.priceConfirmed)}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  className="inline-flex items-center gap-1 rounded border border-white/10 px-2.5 py-1 text-[11px] text-[#F5F2EB] hover:border-[#C6A15B]"
                >
                  <Edit3 className="h-3 w-3" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteProperty(p.id);
                    onRefresh();
                  }}
                  className="inline-flex items-center gap-1 rounded border border-white/10 px-2.5 py-1 text-[11px] text-[#A19E95] hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- EMPREENDIMENTOS CRUD ---

export function EmpreendimentosAdminPanel({
  empreendimentos,
  onRefresh,
}: {
  empreendimentos: Empreendimento[];
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState<Partial<Empreendimento> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const startNew = () => {
    setEditing({
      code: `EMP-${Math.floor(100 + Math.random() * 899)}`,
      name: '',
      developer: 'A confirmar',
      category: 'Alto Padrão',
      region: 'Litoral de Pernambuco',
      stage: 'A confirmar',
      priceFromConfirmed: false,
      priceFrom: null,
      areaRange: 'A confirmar',
      description: '',
      amenities: [],
      coverImage: HERO_IMAGE,
      gallery: [HERO_IMAGE],
      featured: true,
      published: true,
      confirmationStatus: 'a_confirmar',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await saveEmpreendimento(editing);
      setEditing(null);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#A19E95]">
          Adicione, edite ou remova empreendimentos exibidos no site institucional.
        </p>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#C6A15B] px-4 py-2 text-xs font-semibold text-[#0B0B0D] hover:bg-[#D8B573]"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo Empreendimento
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="rounded-xl border border-[#C6A15B]/30 bg-[#131317] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-semibold text-[#F5F2EB]">
              {editing.id ? 'Editar Empreendimento' : 'Novo Empreendimento'}
            </h3>
            <button type="button" onClick={() => setEditing(null)} className="text-xs text-[#A19E95]">
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Código *</label>
              <input
                type="text"
                required
                value={editing.code || ''}
                onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-[#A19E95] mb-1">Nome do Empreendimento *</label>
              <input
                type="text"
                required
                value={editing.name || ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    name: e.target.value,
                    slug: editing.id ? editing.slug : slugify(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Categoria</label>
              <select
                value={editing.category || 'Alto Padrão'}
                onChange={(e) => setEditing({ ...editing, category: e.target.value as PropertyCategory })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              >
                <option value="Litoral">Litoral</option>
                <option value="Médio Padrão">Médio Padrão</option>
                <option value="Alto Padrão">Alto Padrão</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Estágio</label>
              <select
                value={editing.stage || 'A confirmar'}
                onChange={(e) => setEditing({ ...editing, stage: e.target.value as EmpreendimentoStage })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              >
                <option value="Lançamento">Lançamento</option>
                <option value="Em Construção">Em Construção</option>
                <option value="Pronto para Morar">Pronto para Morar</option>
                <option value="A confirmar">A confirmar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Região *</label>
              <input
                type="text"
                required
                value={editing.region || ''}
                onChange={(e) => setEditing({ ...editing, region: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Incorporadora</label>
              <input
                type="text"
                value={editing.developer || ''}
                onChange={(e) => setEditing({ ...editing, developer: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Faixa de Metragem</label>
              <input
                type="text"
                value={editing.areaRange || ''}
                onChange={(e) => setEditing({ ...editing, areaRange: e.target.value })}
                placeholder="Ex.: 95m² a 180m² ou A confirmar"
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A19E95] mb-1 flex items-center justify-between">
                <span>Imagem de Capa (URL ou Dispositivo)</span>
                <label className="cursor-pointer text-[11px] text-[#C6A15B] hover:underline inline-flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  {uploadingMedia ? 'Comprimindo...' : 'Enviar do Dispositivo'}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadingMedia(true);
                        try {
                          const compressed = await compressImageFile(file);
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const res = await fetch('/api/blob/upload', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                filename: compressed.name,
                                contentType: compressed.type,
                                base64Data: reader.result,
                              }),
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setEditing({ ...editing, coverImage: data.url });
                            } else {
                              const err = await res.json();
                              alert(err.error || 'Erro no upload.');
                            }
                            setUploadingMedia(false);
                          };
                          reader.readAsDataURL(compressed);
                        } catch {
                          alert('Erro ao processar arquivo.');
                          setUploadingMedia(false);
                        }
                      }
                    }}
                  />
                </label>
              </label>
              <input
                type="text"
                value={editing.coverImage || ''}
                onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Descrição</label>
            <textarea
              rows={3}
              value={editing.description || ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>

          {/* ANEXOS ILIMITADOS / GALERIA DE FOTOS E VÍDEOS */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#F5F2EB]">
                  Fotos e Vídeos do Empreendimento ({editing.gallery?.length || 0} anexos)
                </label>
                <p className="text-[11px] text-[#A19E95]">
                  Anexos ilimitados do dispositivo com compressão inteligente para o Vercel Blob sem perder qualidade.
                </p>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#C6A15B] px-3 py-1.5 text-xs font-semibold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingMedia ? 'Comprimindo & Enviando...' : 'Anexar do Dispositivo'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    setUploadingMedia(true);
                    try {
                      const newUrls: string[] = [];
                      for (const f of files) {
                        const compressed = await compressImageFile(f);
                        const b64 = await new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result as string);
                          reader.readAsDataURL(compressed);
                        });
                        const res = await fetch('/api/blob/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            filename: compressed.name,
                            contentType: compressed.type,
                            base64Data: b64,
                          }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          if (data.url) newUrls.push(data.url);
                        }
                      }
                      if (newUrls.length > 0) {
                        const updated = [...(editing.gallery || []), ...newUrls];
                        setEditing({
                          ...editing,
                          gallery: updated,
                          coverImage: editing.coverImage || updated[0],
                        });
                      }
                    } catch {
                      alert('Erro ao enviar fotos/vídeos.');
                    } finally {
                      setUploadingMedia(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>

            {editing.gallery && editing.gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
                {editing.gallery.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10 bg-[#0B0B0D] aspect-video">
                    {url.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i) ? (
                      <video src={url} className="w-full h-full object-cover" muted />
                    ) : (
                      <SafeImage src={url} alt={`Anexo ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      <button
                        type="button"
                        title="Definir como capa"
                        onClick={() => setEditing({ ...editing, coverImage: url })}
                        className={`p-1 rounded text-[10px] ${editing.coverImage === url ? 'bg-[#C6A15B] text-black font-bold' : 'bg-black/80 text-white hover:text-[#C6A15B]'}`}
                      >
                        {editing.coverImage === url ? 'Capa' : 'Set Capa'}
                      </button>
                      <button
                        type="button"
                        title="Remover anexo"
                        onClick={() => {
                          const updated = (editing.gallery || []).filter((_, i) => i !== idx);
                          setEditing({ ...editing, gallery: updated });
                        }}
                        className="p-1 rounded bg-red-600/80 text-white hover:bg-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-white/10 text-center text-xs text-[#A19E95]">
                Nenhuma foto ou vídeo anexado ainda. Clique em "Anexar do Dispositivo" para enviar múltiplos arquivos simultaneamente.
              </div>
            )}
          </div>


          <div className="flex items-center justify-between pt-2">
            <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={editing.published !== false}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                className="accent-[#C6A15B]"
              />
              Publicado no site
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#C6A15B] px-5 py-2.5 text-xs font-semibold text-[#0B0B0D]"
            >
              {saving ? 'Salvando...' : 'Salvar Empreendimento'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {empreendimentos.map((emp) => (
          <div key={emp.id} className="rounded-xl border border-white/10 bg-[#131317] p-4 flex gap-4">
            <div className="w-28 h-24 shrink-0 rounded-lg overflow-hidden bg-[#0B0B0D]">
              <SafeImage src={emp.coverImage} alt={emp.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-[11px] font-mono-tabular text-[#C6A15B]">
                {emp.code} · {emp.stage}
              </p>
              <p className="text-sm font-semibold text-[#F5F2EB] truncate">{emp.name}</p>
              <p className="text-xs text-[#A19E95]">{emp.region} · {emp.category}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditing(emp)}
                  className="inline-flex items-center gap-1 rounded border border-white/10 px-2.5 py-1 text-[11px] text-[#F5F2EB] hover:border-[#C6A15B]"
                >
                  <Edit3 className="h-3 w-3" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteEmpreendimento(emp.id);
                    onRefresh();
                  }}
                  className="inline-flex items-center gap-1 rounded border border-white/10 px-2.5 py-1 text-[11px] text-[#A19E95] hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- FLAGSHIP LANDING PAGE (EXACTLY 1 EXCLUSIVE PREMIUM LANDING PAGE) ---

export function LandingPageAdminPanel({
  landingPages,
  properties,
  empreendimentos,
  onNavigate,
  onRefresh,
}: {
  landingPages: LandingPage[];
  properties: Property[];
  empreendimentos: Empreendimento[];
  onNavigate: (path: string) => void;
  onRefresh: () => void;
}) {
  const current = landingPages[0] || DEFAULT_LANDING_PAGE;
  const [form, setForm] = useState<LandingPage>(current);
  const [highlightsText, setHighlightsText] = useState((current.highlights || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveFlagshipLandingPage({
        ...form,
        id: 'lp-flagship-01',
        highlights: highlightsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 12),
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#C6A15B]/30 bg-[#131317] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#C6A15B]">
            <Sparkles className="h-4 w-4" />
            <span>Landing Page Premium Exclusiva (1 página ativa por projeto)</span>
          </div>
          <p className="text-xs text-[#A19E95]">
            Configure e publique uma experiência cinematográfica com parallax, cards interativos e captura de leads dedicada ao imóvel ou empreendimento escolhido.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate(`/lp/${form.slug}`)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#C6A15B]/50 px-4 py-2 text-xs font-semibold text-[#C6A15B] hover:bg-[#C6A15B]/10 whitespace-nowrap"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Visualizar Landing Page
        </button>
      </div>

      <form onSubmit={handleSave} className="rounded-xl border border-white/10 bg-[#131317] p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Título da Campanha / Página *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Slug URL (/lp/...)</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Vincular a</label>
            <select
              value={form.targetType}
              onChange={(e) =>
                setForm({ ...form, targetType: e.target.value as LandingPage['targetType'] })
              }
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            >
              <option value="campanha">Campanha Institucional</option>
              <option value="property">Imóvel Específico</option>
              <option value="empreendimento">Empreendimento Específico</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Item Selecionado</label>
            <select
              value={form.targetId || ''}
              onChange={(e) => setForm({ ...form, targetId: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            >
              <option value="">Nenhum item específico</option>
              {form.targetType === 'property' &&
                properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.title}
                  </option>
                ))}
              {form.targetType !== 'property' &&
                empreendimentos.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.code} — {emp.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#A19E95] mb-1">Headline Principal do Hero *</label>
          <input
            type="text"
            required
            value={form.heroHeadline}
            onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
        </div>

        <div>
          <label className="block text-xs text-[#A19E95] mb-1">Subheadline</label>
          <textarea
            rows={2}
            value={form.heroSubheadline}
            onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Imagem Hero (URL)</label>
            <input
              type="text"
              value={form.heroImage}
              onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Texto do Botão CTA</label>
            <input
              type="text"
              value={form.ctaLabel}
              onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#A19E95] mb-1">Destaques (1 por linha)</label>
          <textarea
            rows={4}
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">SEO Title</label>
            <input
              type="text"
              value={form.seoTitle || ''}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">SEO Description</label>
            <input
              type="text"
              value={form.seoDescription || ''}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="accent-[#C6A15B]"
            />
            Landing Page Publicada
          </label>
          <div className="flex items-center gap-3">
            {savedNotice && <span className="text-xs text-[#C6A15B]">Salvo e publicado!</span>}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#C6A15B] px-5 py-2.5 text-xs font-semibold text-[#0B0B0D]"
            >
              {saving ? 'Salvando...' : 'Salvar Landing Page'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// --- MEDIA LIBRARY (VERCEL BLOB) ---

export function MediaAdminPanel({
  media,
  onRefresh,
}: {
  media: MediaAsset[];
  onRefresh: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [extName, setExtName] = useState('');
  const [extUrl, setExtUrl] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadMsg('');
    try {
      const compressed = await compressImageFile(file);
      const reader = new FileReader();
      reader.onload = async () => {
        const res = await fetch('/api/blob/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: compressed.name,
            contentType: compressed.type,
            base64Data: reader.result,
          }),
        });
        const data = (await res.json()) as { url?: string; error?: string; sizeBytes?: number };
        if (res.ok && data.url) {
          await saveMediaAsset({
            name: file.name,
            url: data.url,
            contentType: compressed.type,
            sizeBytes: data.sizeBytes || compressed.size,
            provider: 'vercel_blob',
          });
          setUploadMsg('Arquivo comprimido e enviado para o Vercel Blob com sucesso.');
          onRefresh();
        } else {
          setUploadMsg(data.error || 'Erro no upload para Vercel Blob.');
        }
        setUploading(false);
      };
      reader.readAsDataURL(compressed);
    } catch {
      setUploadMsg('Erro ao processar arquivo.');
      setUploading(false);
    }
  };

  const handleAddExternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extName.trim() || !extUrl.trim()) return;
    await saveMediaAsset({
      name: extName,
      url: extUrl,
      provider: 'external',
    });
    setExtName('');
    setExtUrl('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#131317] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F5F2EB]">Upload para Vercel Blob Storage</h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono-tabular text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Conectado (store_sjvci0CE2mr28sZW)
            </span>
          </div>
          <p className="text-xs text-[#A19E95]">
            Envie fotos, vídeos ou documentos diretamente do seu dispositivo. As imagens são comprimidas automaticamente preservando a qualidade máxima.
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#C6A15B] px-4 py-2.5 text-xs font-semibold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors">
            <Upload className="h-4 w-4" />
            {uploading ? 'Comprimindo & Enviando...' : 'Selecionar Arquivos do Dispositivo'}
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf"
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                for (const file of files) {
                  await handleFileUpload(file);
                }
              }}
            />
          </label>
          {uploadMsg && <p className="text-xs text-[#C6A15B]">{uploadMsg}</p>}
        </div>

        <form onSubmit={handleAddExternal} className="rounded-xl border border-white/10 bg-[#131317] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#F5F2EB]">Cadastrar Mídia por URL</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={extName}
              onChange={(e) => setExtName(e.target.value)}
              placeholder="Nome da mídia"
              className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
            <input
              type="text"
              required
              value={extUrl}
              onChange={(e) => setExtUrl(e.target.value)}
              placeholder="https://..."
              className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-[#F5F2EB] hover:border-[#C6A15B]"
          >
            Adicionar à Biblioteca
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((m) => (
          <div key={m.id} className="rounded-xl border border-white/10 bg-[#131317] overflow-hidden flex flex-col">
            <div className="aspect-[4/3] bg-[#0B0B0D]">
              <SafeImage src={m.url} alt={m.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-3 space-y-2 text-xs">
              <p className="font-medium text-[#F5F2EB] truncate">{m.name}</p>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(m.url);
                    setCopiedId(m.id);
                    setTimeout(() => setCopiedId(''), 2000);
                  }}
                  className="inline-flex items-center gap-1 text-[#C6A15B] hover:underline"
                >
                  {copiedId === m.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedId === m.id ? 'Copiado' : 'Copiar URL'}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteMediaAsset(m.id);
                    onRefresh();
                  }}
                  className="text-[#A19E95] hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SETTINGS, PROFILE & ADMIN USERS ---

export function SettingsAdminPanel({
  settings,
  profile,
  adminUsers,
  onRefresh,
}: {
  settings: SiteSettings;
  profile: ProfessionalProfile;
  adminUsers: AdminUser[];
  onRefresh: () => void;
}) {
  const [siteForm, setSiteForm] = useState<SiteSettings>(settings);
  const [profForm, setProfForm] = useState<ProfessionalProfile>(profile);
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('brunodinizcorretordeimoveis@gmail.com');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await saveSiteSettings(siteForm);
      await saveProfessionalProfile(profForm);
      setMsg('Configurações institucionais e SEO atualizadas no Firestore.');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSaving(true);
    try {
      await bootstrapInitialFirestoreData();
      setMsg('Dados iniciais verificados e sincronizados no Firestore.');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUid.trim() || !newAdminEmail.trim()) return;
    await saveAdminUser(newAdminUid.trim(), { email: newAdminEmail.trim(), displayName: 'Administrador' });
    setNewAdminUid('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#131317] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F2EB]">Sincronização Inicial do Banco</h3>
          <p className="text-xs text-[#A19E95]">
            Garante que as coleções iniciais de Bruno Diniz estejam gravadas no Firestore.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSeed}
          disabled={saving}
          className="rounded-lg border border-[#C6A15B]/50 px-4 py-2 text-xs font-semibold text-[#C6A15B] hover:bg-[#C6A15B]/10"
        >
          Popular / Sincronizar Dados Iniciais
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="rounded-xl border border-white/10 bg-[#131317] p-6 space-y-5">
        <h3 className="font-display text-2xl font-semibold text-[#F5F2EB]">
          Identidade Visual, Marca & SEO
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Nome da Marca</label>
            <input
              type="text"
              value={siteForm.brandName}
              onChange={(e) => setSiteForm({ ...siteForm, brandName: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">CRECI</label>
            <input
              type="text"
              value={siteForm.creci}
              onChange={(e) => setSiteForm({ ...siteForm, creci: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">WhatsApp Oficial</label>
            <input
              type="text"
              value={siteForm.whatsappNumber}
              onChange={(e) => setSiteForm({ ...siteForm, whatsappNumber: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-[#A19E95] mb-1">Frase Principal (Tagline)</label>
            <input
              type="text"
              value={siteForm.tagline}
              onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Cor Dourada (Accent)</label>
            <input
              type="text"
              value={siteForm.accentColor || '#C6A15B'}
              onChange={(e) => setSiteForm({ ...siteForm, accentColor: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Google Analytics 4 (G-XXXX)</label>
            <input
              type="text"
              value={siteForm.ga4Id || ''}
              onChange={(e) => setSiteForm({ ...siteForm, ga4Id: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Google Tag Manager (GTM-XXXX)</label>
            <input
              type="text"
              value={siteForm.gtmId || ''}
              onChange={(e) => setSiteForm({ ...siteForm, gtmId: e.target.value })}
              placeholder="GTM-XXXXXXX"
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Search Console Verification</label>
            <input
              type="text"
              value={siteForm.searchConsoleVerification || ''}
              onChange={(e) => setSiteForm({ ...siteForm, searchConsoleVerification: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Google Ads Conversion ID</label>
            <input
              type="text"
              value={siteForm.googleAdsId || ''}
              onChange={(e) => setSiteForm({ ...siteForm, googleAdsId: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
        </div>

        <h3 className="font-display text-2xl font-semibold text-[#F5F2EB] pt-3 border-t border-white/10">
          Perfil Profissional (Campos Pendentes Editáveis)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">E-mail Comercial</label>
            <input
              type="email"
              value={profForm.email || ''}
              onChange={(e) => setProfForm({ ...profForm, email: e.target.value })}
              placeholder="Definir e-mail oficial"
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Endereço Comercial</label>
            <input
              type="text"
              value={profForm.commercialAddress || ''}
              onChange={(e) => setProfForm({ ...profForm, commercialAddress: e.target.value })}
              placeholder="Definir endereço quando desejado"
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Tempo de Experiência</label>
            <input
              type="text"
              value={profForm.experienceYears || ''}
              onChange={(e) => setProfForm({ ...profForm, experienceYears: e.target.value })}
              placeholder="Definir quando confirmado"
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#A19E95] mb-1">Texto Institucional (Sobre)</label>
          <textarea
            rows={3}
            value={profForm.bio}
            onChange={(e) => setProfForm({ ...profForm, bio: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
        </div>

        <div className="flex items-center justify-between">
          {msg ? <span className="text-xs text-[#C6A15B]">{msg}</span> : <span />}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#C6A15B] px-5 py-2.5 text-xs font-semibold text-[#0B0B0D]"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>

      {/* Admin Users RBAC */}
      <div className="rounded-xl border border-white/10 bg-[#131317] p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#F5F2EB]">Administradores Autorizados (UID Firebase)</h3>
        <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            required
            value={newAdminUid}
            onChange={(e) => setNewAdminUid(e.target.value)}
            placeholder="UID do usuário no Firebase Auth"
            className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
          <input
            type="email"
            required
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="brunodinizcorretordeimoveis@gmail.com"
            className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#C6A15B] px-4 py-2 text-xs font-semibold text-[#0B0B0D]"
          >
            Autorizar UID Admin
          </button>
        </form>
        <div className="space-y-1.5 text-xs text-[#A19E95]">
          {adminUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between border-b border-white/5 pb-1">
              <span>{u.email}</span>
              <span className="font-mono-tabular text-[11px]">{u.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
