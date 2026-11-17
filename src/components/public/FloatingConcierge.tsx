import React, { useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { buildWhatsAppUrl } from '../../lib/utils';
import { logAnalyticsEvent } from '../../lib/analytics';
import { SOFIA_AVATAR_IMAGE } from '../../lib/seedData';
import type { ProfessionalProfile, SiteSettings } from '../../types';

const SOFIA_AVATAR = SOFIA_AVATAR_IMAGE;

interface ChatMessage {
  id: string;
  sender: 'sofia' | 'user';
  text: string;
  showSocialLinks?: boolean;
  quickRoute?: { label: string; path: string };
}

interface FloatingConciergeProps {
  settings: SiteSettings;
  profile: ProfessionalProfile;
  onNavigate: (path: string) => void;
}

function OfficialWhatsAppIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.002 2.667C8.636 2.667 2.668 8.636 2.668 16c0 2.352.615 4.652 1.783 6.678L2.56 29.59l7.084-1.856A13.27 13.27 0 0 0 16.002 29.333c7.365 0 13.333-5.968 13.333-13.333S23.367 2.667 16.002 2.667Zm0 24.442c-2.055 0-4.072-.552-5.83-1.596l-.418-.248-4.203 1.101 1.122-4.098-.273-.434A11.06 11.06 0 0 1 4.892 16c0-6.126 4.984-11.11 11.11-11.11 6.126 0 11.11 4.984 11.11 11.11 0 6.126-4.984 11.109-11.11 11.109Zm6.095-8.322c-.334-.167-1.976-.975-2.283-1.087-.306-.111-.529-.167-.752.167-.223.334-.863 1.087-1.058 1.31-.195.223-.39.251-.724.084-.334-.167-1.41-.52-2.686-1.658-.993-.885-1.663-1.978-1.858-2.312-.195-.334-.021-.515.146-.681.15-.15.334-.39.501-.585.167-.195.223-.334.334-.557.111-.223.056-.418-.028-.585-.084-.167-.752-1.811-1.031-2.48-.271-.651-.547-.563-.752-.573-.195-.01-.418-.012-.64-.012-.223 0-.585.084-.891.418-.306.334-1.17 1.143-1.17 2.787 0 1.644 1.198 3.232 1.365 3.455.167.223 2.357 3.599 5.71 5.046.798.344 1.421.55 1.906.704.801.255 1.53.219 2.106.133.643-.096 1.976-.808 2.255-1.588.278-.78.278-1.449.195-1.588-.084-.14-.306-.223-.64-.39Z" />
    </svg>
  );
}

function OfficialInstagramIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm9.65 1.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
    </svg>
  );
}

export function FloatingConcierge({ settings, profile, onNavigate }: FloatingConciergeProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'sofia',
      text: `Olá! Sou a Sofia, assistente de atendimento do corretor ${profile.name} (${profile.creci}). Posso tirar dúvidas rápidas ou conectar você às nossas redes oficiais.`,
      showSocialLinks: true,
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const instagramHandle = (settings.instagramHandle || 'brunodiniz.corretordeimoveis').replace('@', '');
  const instagramUrl = `https://www.instagram.com/${instagramHandle}/`;
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Olá Bruno Diniz, vim pelo site e gostaria de conversar sobre imóveis.'
  );

  const buildReply = (question: string): Omit<ChatMessage, 'id' | 'sender'> => {
    const q = question.toLowerCase();

    if (q.includes('visita') || q.includes('agendar') || q.includes('horário')) {
      return {
        text: 'Você pode agendar sua visita diretamente na página do imóvel ou na aba Contato, e o Bruno confirma pessoalmente o melhor horário pelo WhatsApp.',
        showSocialLinks: true,
        quickRoute: { label: 'Ir para Contato e Visitas', path: '/contato' },
      };
    }

    if (q.includes('litoral') || q.includes('praia') || q.includes('mar')) {
      return {
        text: 'Bruno Diniz é especialista em imóveis de Litoral em Pernambuco. Temos uma seleção dedicada frente mar e beira-mar que você pode explorar agora.',
        showSocialLinks: true,
        quickRoute: { label: 'Ver Imóveis no Litoral', path: '/litoral' },
      };
    }

    if (q.includes('alto') || q.includes('médio') || q.includes('comprar') || q.includes('imóve')) {
      return {
        text: 'Trabalhamos com portfólio selecionado de Litoral, Médio e Alto Padrão, além de empreendimentos exclusivos. Para valores e fichas atualizadas, o atendimento é feito diretamente pelo WhatsApp.',
        showSocialLinks: true,
        quickRoute: { label: 'Explorar Catálogo', path: '/comprar' },
      };
    }

    if (q.includes('empreendimento') || q.includes('lançamento')) {
      return {
        text: 'Você pode conferir os empreendimentos disponíveis no catálogo e solicitar o dossiê completo diretamente com o Bruno.',
        showSocialLinks: true,
        quickRoute: { label: 'Ver Empreendimentos', path: '/empreendimentos' },
      };
    }

    if (q.includes('creci') || q.includes('quem') || q.includes('bruno') || q.includes('sobre')) {
      return {
        text: `Bruno Diniz atua com registro ${profile.creci}, focado em credibilidade no mercado, resultados consistentes e excelência no atendimento. Acompanhe também as novidades diárias no Instagram @${instagramHandle}.`,
        showSocialLinks: true,
        quickRoute: { label: 'Sobre Bruno Diniz', path: '/sobre' },
      };
    }

    if (q.includes('preço') || q.includes('valor') || q.includes('condomínio') || q.includes('metragem')) {
      return {
        text: 'Para garantir total transparência, valores e dados técnicos marcados como "A confirmar" são validados em tempo real pelo Bruno Diniz antes da visita. Chame no WhatsApp para confirmação imediata!',
        showSocialLinks: true,
      };
    }

    return {
      text: `Posso encaminhar você diretamente para o atendimento do Bruno Diniz (${profile.creci}) no WhatsApp ou para acompanhar nosso portfólio oficial no Instagram @${instagramHandle}.`,
      showSocialLinks: true,
    };
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };
    const replyData = buildReply(trimmed);
    const botMsg: ChatMessage = {
      id: `s-${Date.now() + 1}`,
      sender: 'sofia',
      ...replyData,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');

    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, 60);
  };

  const quickPrompts = [
    'Imóveis no Litoral',
    'Como agendar visita?',
    'CRECI e redes sociais',
    'Confirmar valores',
  ];

  return (
    <>
      {/* RIGHT SIDE: Official Floating Instagram & WhatsApp Buttons */}
      <div className="fixed right-4 sm:right-6 bottom-5 z-40 flex flex-col items-end gap-3">
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram oficial de Bruno Diniz"
          title="Instagram @brunodiniz.corretordeimoveis"
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-lg shadow-black/40 ring-1 ring-white/20 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
        >
          <OfficialInstagramIcon className="h-5 w-5" />
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar no WhatsApp com Bruno Diniz"
          title="WhatsApp oficial (81) 99703-9417"
          onClick={() =>
            logAnalyticsEvent({
              eventType: 'whatsapp_click',
              path: window.location.pathname,
              source: 'floating_whatsapp_right',
            })
          }
          className="group flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 ring-1 ring-white/20 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
        >
          <OfficialWhatsAppIcon className="h-7 w-7" />
        </a>
      </div>

      {/* LEFT SIDE: Humanized Virtual Assistant (Sofia) */}
      <div className="fixed left-4 sm:left-6 bottom-5 z-40 flex flex-col items-start gap-3">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-[310px] sm:w-[355px] rounded-2xl border border-white/15 bg-[#131317] shadow-2xl shadow-black/70 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#1A1A20] px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={SOFIA_AVATAR}
                    alt="Sofia — Assistente Virtual de Bruno Diniz"
                    className="h-10 w-10 rounded-full object-cover border border-[#C6A15B]/60 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F5F2EB] truncate">
                      Sofia · Atendimento
                    </p>
                    <p className="text-[11px] text-[#C6A15B] truncate">
                      Concierge {profile.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar assistente"
                  className="p-1.5 rounded-lg text-[#A19E95] hover:bg-white/10 hover:text-[#F5F2EB]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages */}
              <div
                ref={listRef}
                className="max-h-72 overflow-y-auto p-4 space-y-3 bg-[#0B0B0D]"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#C6A15B] text-[#0B0B0D] font-medium'
                          : 'bg-[#17171D] text-[#F5F2EB] border border-white/10'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {msg.quickRoute && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            onNavigate(msg.quickRoute!.path);
                          }}
                          className="mt-2 block text-[11px] font-semibold text-[#C6A15B] hover:underline"
                        >
                          {msg.quickRoute.label} →
                        </button>
                      )}

                      {msg.showSocialLinks && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              logAnalyticsEvent({
                                eventType: 'whatsapp_click',
                                path: window.location.pathname,
                                source: 'sofia_assistant',
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-md bg-[#25D366]/15 border border-[#25D366]/40 px-2.5 py-1 text-[11px] font-medium text-[#4ADE80] hover:bg-[#25D366]/25"
                          >
                            <OfficialWhatsAppIcon className="h-3 w-3" />
                            WhatsApp
                          </a>
                          <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md bg-white/5 border border-white/15 px-2.5 py-1 text-[11px] font-medium text-[#F5F2EB] hover:border-[#C6A15B]/50"
                          >
                            <OfficialInstagramIcon className="h-3 w-3 text-[#E1306C]" />
                            Instagram
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Suggestions */}
              <div className="px-3 py-2 bg-[#131317] border-t border-white/10 flex gap-1.5 overflow-x-auto">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="shrink-0 rounded-md border border-white/10 bg-[#0B0B0D] px-2.5 py-1 text-[11px] text-[#A19E95] hover:border-[#C6A15B]/50 hover:text-[#F5F2EB] whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2 border-t border-white/10 bg-[#131317] p-2.5"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua dúvida..."
                  className="flex-1 rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB] placeholder:text-[#A19E95]/60 focus:border-[#C6A15B] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Enviar mensagem"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#C6A15B] text-[#0B0B0D] hover:bg-[#D8B573]"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Abrir atendimento com Sofia"
          className="group flex items-center gap-2.5 rounded-full border border-[#C6A15B]/45 bg-[#131317]/95 backdrop-blur-md pl-1.5 pr-4 py-1.5 shadow-xl shadow-black/50 hover:border-[#C6A15B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
        >
          <img
            src={SOFIA_AVATAR}
            alt="Sofia — Assistente de Atendimento"
            className="h-9 w-9 rounded-full object-cover border border-[#C6A15B]/60 shrink-0"
          />
          <div className="text-left leading-tight">
            <span className="block text-xs font-semibold text-[#F5F2EB] whitespace-nowrap">
              Sofia
            </span>
            <span className="block text-[10px] text-[#C6A15B] whitespace-nowrap">
              Tire suas dúvidas
            </span>
          </div>
        </button>
      </div>
    </>
  );
}
