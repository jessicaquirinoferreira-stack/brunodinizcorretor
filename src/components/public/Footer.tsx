import React, { useState } from 'react';
import { Instagram, Lock, MessageCircle, ShieldCheck, X } from 'lucide-react';
import { buildWhatsAppUrl } from '../../lib/utils';
import { logAnalyticsEvent } from '../../lib/analytics';
import { OFFICIAL_LOGO_URL } from '../../lib/seedData';
import type { ProfessionalProfile, SiteSettings } from '../../types';

interface FooterProps {
  settings: SiteSettings;
  profile: ProfessionalProfile;
  onNavigate: (path: string) => void;
}

export function Footer({ settings, profile, onNavigate }: FooterProps) {
  const [lgpdOpen, setLgpdOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const logoSrc = settings.logoUrl || OFFICIAL_LOGO_URL;

  return (
    <footer className="border-t border-white/10 bg-[#08080A] text-[#A19E95]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              {!logoError && logoSrc && (
                <img
                  src={logoSrc}
                  alt={`${settings.brandName || 'Bruno Diniz'} — Logotipo Oficial`}
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="h-14 sm:h-16 w-auto max-w-[190px] object-contain object-left brightness-110 contrast-110 drop-shadow-[0_2px_14px_rgba(255,255,255,0.2)]"
                />
              )}
              {!logoError && logoSrc && (
                <span className="hidden sm:block h-10 w-px bg-white/15" aria-hidden="true" />
              )}
              <div>
                <p className="font-display text-2xl sm:text-3xl font-semibold tracking-[0.04em] text-[#F5F2EB] leading-tight">
                  {settings.brandName || 'Bruno Diniz'}
                </p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#C6A15B] mt-0.5">
                  Corretor de Imóveis
                </p>
              </div>
            </div>
            <p className="text-sm text-[#C6A15B] font-medium">
              {settings.tagline || 'Uma marca à altura de uma trajetória.'}
            </p>
            <p className="text-sm leading-relaxed max-w-md">
              Corretor de Imóveis · {settings.creci || 'CRECI-PE 21512'}. Especialista em imóveis de Litoral, Médio e Alto Padrão em Pernambuco.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#F5F2EB]/80">
              <a
                href={buildWhatsAppUrl(
                  settings.whatsappNumber,
                  'Olá Bruno Diniz, gostaria de atendimento imobiliário.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  logAnalyticsEvent({
                    eventType: 'whatsapp_click',
                    path: window.location.pathname,
                    source: 'footer',
                  })
                }
                className="inline-flex items-center gap-1.5 hover:text-[#C6A15B] transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#C6A15B]" />
                WhatsApp (81) 99703-9417
              </a>
              <span aria-hidden="true">·</span>
              <a
                href={`https://www.instagram.com/${(settings.instagramHandle || 'brunodiniz.corretordeimoveis').replace('@', '')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#C6A15B] transition-colors"
              >
                <Instagram className="h-3.5 w-3.5 text-[#C6A15B]" />
                @{ (settings.instagramHandle || 'brunodiniz.corretordeimoveis').replace('@', '') }
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F2EB]">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Início', path: '/' },
                { label: 'Comprar Imóveis', path: '/comprar' },
                { label: 'Especialidade Litoral', path: '/litoral' },
                { label: 'Alto Padrão', path: '/alto-padrao' },
                { label: 'Empreendimentos', path: '/empreendimentos' },
                { label: 'Sobre Bruno Diniz', path: '/sobre' },
                { label: 'Contato e Visitas', path: '/contato' },
              ].map((link) => (
                <li key={link.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.path)}
                    className="hover:text-[#F5F2EB] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F2EB]">
              Institucional e LGPD
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span>{profile.creci || 'CRECI-PE 21512'}</span>
              </li>
              <li>
                <span>{profile.commercialAddress || 'Atendimento consultivo em Pernambuco'}</span>
              </li>
              <li>
                <a
                  href={`mailto:${profile.email || 'brunodinizcorretordeimoveis@gmail.com'}`}
                  className="hover:text-[#C6A15B] transition-colors"
                >
                  {profile.email || 'brunodinizcorretordeimoveis@gmail.com'}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLgpdOpen(true)}
                  className="inline-flex items-center gap-1.5 hover:text-[#F5F2EB] transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#C6A15B]" />
                  Política de Privacidade (LGPD)
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            © {new Date().getFullYear()} {settings.brandName || 'Bruno Diniz'} — {settings.creci || 'CRECI-PE 21512'}. Todos os direitos reservados.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/admin')}
            className="inline-flex items-center gap-1.5 text-[#A19E95]/75 hover:text-[#C6A15B] transition-colors"
          >
            <Lock className="h-3 w-3" />
            Painel Admin
          </button>
        </div>
      </div>

      {/* LGPD Modal */}
      {lgpdOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-w-lg w-full rounded-xl border border-white/10 bg-[#131317] p-6 sm:p-8 space-y-4 text-[#F5F2EB]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">
                Privacidade e Conformidade LGPD
              </h3>
              <button
                type="button"
                onClick={() => setLgpdOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-[#A19E95] leading-relaxed">
              {settings.lgpdNotice}
            </p>
            <p className="text-xs text-[#A19E95] leading-relaxed">
              As informações enviadas através dos formulários de interesse ou agendamento de visita são utilizadas exclusivamente para retorno comercial, qualificação de atendimento e confirmação de disponibilidade dos imóveis consultados. Você pode solicitar atualização ou exclusão dos seus dados a qualquer momento diretamente pelo WhatsApp oficial (81) 99703-9417.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setLgpdOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#C6A15B] text-[#0B0B0D] text-xs font-semibold hover:bg-[#D8B573]"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
