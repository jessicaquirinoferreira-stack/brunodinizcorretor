import React, { useState } from 'react';
import { Sparkles, Send, ArrowRight, CheckCircle2, MessageCircle, Bot, SlidersHorizontal, ChevronRight, RefreshCw } from 'lucide-react';
import { Property, SiteSettings } from '../../types';
import { SafeImage } from '../ui/SafeImage';
import { buildWhatsAppUrl, formatBRL } from '../../lib/utils';
import { useTheme } from '../ui/ThemeContext';
import { executeLocalAIMatch, AIMatchResponse } from '../../lib/aiMatcher';
import { DEFAULT_PROPERTIES } from '../../lib/seedData';

interface AIPropertyMatcherProps {
  properties: Property[];
  settings: SiteSettings;
  onNavigate: (path: string) => void;
}

export function AIPropertyMatcher({ properties, settings, onNavigate }: AIPropertyMatcherProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [funnelMessage, setFunnelMessage] = useState('');
  const [nextQuestions, setNextQuestions] = useState<string[]>([]);
  const [matchedResults, setMatchedResults] = useState<{ property: Property; score: number; reason: string }[] | null>(null);
  const [error, setError] = useState('');

  const effectiveProperties = properties && properties.length > 0 ? properties : DEFAULT_PROPERTIES;

  const suggestions = [
    'Apartamento de Alto Padrão frente mar em Pernambuco',
    'Cobertura com terraço panorâmico e vista oceano',
    'Residencial de luxo com lazer completo',
    'Imóvel com entrega garantida e documentação regular',
  ];

  const handleMatch = async (textToSearch: string) => {
    if (!textToSearch.trim()) return;
    setLoading(true);
    setError('');

    try {
      let data: AIMatchResponse | null = null;

      // 1. Try server endpoint (Vercel Serverless Function or local server)
      try {
        const minimalProps = effectiveProperties.map((p) => ({
          id: p.id,
          code: p.code,
          title: p.title,
          category: p.category,
          region: p.region,
          bedrooms: p.bedrooms,
          description: p.description,
          features: p.features,
        }));

        const res = await fetch('/api/ai-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: textToSearch, properties: minimalProps }),
        });

        if (res.ok) {
          data = (await res.json()) as AIMatchResponse;
        }
      } catch {
        // Fallback directly to client matching engine
      }

      // 2. If server didn't respond or returned empty, executeLocalAIMatch directly
      if (!data || !data.matches || data.matches.length === 0) {
        data = executeLocalAIMatch(textToSearch, effectiveProperties);
      }

      setFunnelMessage(data.funnelMessage);
      setNextQuestions(data.nextQuestions || []);

      const mapped = (data.matches || [])
        .map((m) => {
          const property = effectiveProperties.find((p) => p.id === m.id);
          return property ? { property, score: m.score, reason: m.reason } : null;
        })
        .filter(Boolean) as { property: Property; score: number; reason: string }[];

      mapped.sort((a, b) => b.score - a.score);
      setMatchedResults(mapped.length > 0 ? mapped : null);
    } catch (err) {
      // Last line of defense: execute local matcher
      const fallback = executeLocalAIMatch(textToSearch, effectiveProperties);
      setFunnelMessage(fallback.funnelMessage);
      setNextQuestions(fallback.nextQuestions);
      const mapped = (fallback.matches || [])
        .map((m) => {
          const property = effectiveProperties.find((p) => p.id === m.id);
          return property ? { property, score: m.score, reason: m.reason } : null;
        })
        .filter(Boolean) as { property: Property; score: number; reason: string }[];
      setMatchedResults(mapped);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className={`rounded-2xl border p-8 sm:p-12 relative overflow-hidden transition-colors shadow-2xl ${
        isDark 
          ? 'bg-gradient-to-br from-[#16161C] via-[#101014] to-[#0B0B0D] border-[#C6A15B]/30' 
          : 'bg-gradient-to-br from-white via-[#FAFAFA] to-[#F3F3F7] border-black/15 shadow-xl'
      }`}>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C6A15B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C6A15B]/15 text-[#C6A15B] border border-[#C6A15B]/30">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Matchmaker Inteligente · IA Bruno Diniz</span>
          </div>
          <h2 className={`font-display text-3xl sm:text-5xl font-bold tracking-tight ${isDark ? 'text-[#F5F2EB]' : 'text-black'}`}>
            Encontre o imóvel exato com nossa Inteligência Artificial
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-[#A19E95]' : 'text-neutral-700 font-medium'}`}>
            Descreva em linguagem natural o que você procura (ex: localização, número de quartos, estilo, vista mar). Nossa IA funila e filtra o portfólio em segundos para revelar o match perfeito.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <div className={`flex flex-col sm:flex-row items-center rounded-xl border p-2 shadow-inner transition-all ${
            isDark ? 'bg-[#0B0B0D] border-white/15 focus-within:border-[#C6A15B]' : 'bg-white border-black/20 focus-within:border-[#C6A15B]'
          }`}>
            <div className="flex items-center pl-3 w-full sm:w-auto text-[#C6A15B]">
              <Bot className="h-5 w-5 shrink-0" />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMatch(prompt)}
              placeholder="Ex: Procuro apartamento frente mar com 3 suítes..."
              className={`w-full bg-transparent px-3 py-3 text-sm focus:outline-none ${
                isDark ? 'text-[#F5F2EB] placeholder:text-neutral-600' : 'text-black placeholder:text-neutral-400 font-medium'
              }`}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => handleMatch(prompt)}
              className="w-full sm:w-auto mt-2 sm:mt-0 inline-flex items-center justify-center gap-2 rounded-lg bg-[#C6A15B] px-6 py-3 text-sm font-bold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Filtrando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Buscar com IA
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className={`text-xs font-bold ${isDark ? 'text-[#A19E95]' : 'text-neutral-700'}`}>Sugestões:</span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(sug);
                  handleMatch(sug);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  isDark 
                    ? 'border-white/10 bg-[#131317] text-[#F5F2EB]/80 hover:border-[#C6A15B] hover:text-[#C6A15B]' 
                    : 'border-black/10 bg-white text-neutral-800 hover:border-[#C6A15B] hover:text-black font-medium'
                }`}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold">
            {error}
          </div>
        )}

        {matchedResults && (
          <div className="mt-12 max-w-5xl mx-auto space-y-8 relative z-10 animate-fade-in">
            {funnelMessage && (
              <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#131317] border-[#C6A15B]/30 text-[#F5F2EB]' : 'bg-white border-[#C6A15B]/40 text-black shadow-md'}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#C6A15B]/15 text-[#C6A15B] shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-base font-bold text-[#C6A15B]">Análise do Consultor IA</h3>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-[#F5F2EB]/90' : 'text-neutral-900 font-semibold'}`}>{funnelMessage}</p>
                  </div>
                </div>

                {nextQuestions.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#C6A15B]/20 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#C6A15B]">Refinar Funil (Clique para filtrar mais):</p>
                    <div className="flex flex-wrap gap-2">
                      {nextQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => {
                            const newPrompt = `${prompt} — ${q}`;
                            setPrompt(newPrompt);
                            handleMatch(newPrompt);
                          }}
                          className={`text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                            isDark 
                              ? 'border-white/15 bg-[#0B0B0D] text-[#F5F2EB] hover:border-[#C6A15B]' 
                              : 'border-black/20 bg-neutral-100 text-black font-semibold hover:border-[#C6A15B]'
                          }`}
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-[#C6A15B]" />
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`font-display text-xl font-bold ${isDark ? 'text-[#F5F2EB]' : 'text-black'}`}>
                  Imóveis Filtrados & Recomendados ({matchedResults.length})
                </h3>
                <span className="text-xs font-mono-tabular font-bold text-[#C6A15B]">Ordenado por Aderência (Match %)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchedResults.map(({ property, score, reason }) => (
                  <div
                    key={property.id}
                    className={`rounded-xl border overflow-hidden flex flex-col justify-between transition-all group ${
                      isDark ? 'border-white/10 bg-[#131317] hover:border-[#C6A15B]/50' : 'border-black/15 bg-white shadow-md hover:border-[#C6A15B]'
                    }`}
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
                        <SafeImage
                          src={property.coverImage}
                          alt={property.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-[#0B0B0D]/80 backdrop-blur-md border border-[#C6A15B]/50 px-3 py-1 rounded-full text-xs font-mono-tabular font-bold text-[#C6A15B]">
                          {score}% Match IA
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-mono-tabular text-white font-bold">
                          {property.code}
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#C6A15B]">
                          {property.category} · {property.region}
                        </p>
                        <h4 className={`font-display text-lg font-bold leading-snug ${isDark ? 'text-[#F5F2EB]' : 'text-black'}`}>
                          {property.title}
                        </h4>
                        <p className={`text-xs leading-relaxed p-3 rounded-lg border ${
                          isDark ? 'bg-[#0B0B0D] border-white/10 text-[#A19E95]' : 'bg-neutral-50 border-black/10 text-neutral-800 font-medium'
                        }`}>
                          <strong className="text-[#C6A15B]">Por que este imóvel:</strong> {reason}
                        </p>
                      </div>
                    </div>

                    <div className={`p-6 pt-0 flex items-center justify-between gap-4 border-t mt-4 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                      <div>
                        <p className={`text-[11px] ${isDark ? 'text-[#A19E95]' : 'text-neutral-500'}`}>Investimento</p>
                        <p className={`font-mono-tabular text-sm font-bold ${isDark ? 'text-[#F5F2EB]' : 'text-black'}`}>
                          {formatBRL(property.price, property.priceConfirmed)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigate(`/imovel/${property.slug}`)}
                          className={`text-xs font-bold px-3.5 py-2 rounded-lg border transition-colors ${
                            isDark ? 'border-white/20 text-[#F5F2EB] hover:border-[#C6A15B]' : 'border-black/20 text-black hover:border-[#C6A15B]'
                          }`}
                        >
                          Ver Detalhes
                        </button>
                        <a
                          href={buildWhatsAppUrl(
                            settings.whatsappNumber,
                            `Olá Bruno, vi o imóvel ${property.code} (${property.title}) através do Matchmaker IA e gostaria de confirmar disponibilidade e detalhes.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C6A15B] text-xs font-bold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
