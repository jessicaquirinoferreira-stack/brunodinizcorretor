import React, { useState } from 'react';
import { Menu, MessageCircle, X } from 'lucide-react';
import { buildWhatsAppUrl, cn } from '../../lib/utils';
import { logAnalyticsEvent } from '../../lib/analytics';
import { OFFICIAL_LOGO_URL } from '../../lib/seedData';
import type { SiteSettings } from '../../types';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  settings: SiteSettings;
}

export function Navbar({ currentPath, onNavigate, settings }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const logoSrc = settings.logoUrl || OFFICIAL_LOGO_URL;

  const navItems = [
    { label: 'Início', path: '/' },
    { label: 'Comprar', path: '/comprar' },
    { label: 'Litoral', path: '/litoral' },
    { label: 'Empreendimentos', path: '/empreendimentos' },
    { label: 'Sobre', path: '/sobre' },
    { label: 'Contato', path: '/contato' },
  ];

  const handleLinkClick = (path: string) => {
    setMobileOpen(false);
    onNavigate(path);
  };

  const handleWhatsAppClick = () => {
    logAnalyticsEvent({
      eventType: 'whatsapp_click',
      path: currentPath,
      source: 'header_cta',
    });
    window.open(
      buildWhatsAppUrl(
        settings.whatsappNumber,
        'Olá Bruno Diniz, gostaria de conversar sobre imóveis em Pernambuco.'
      ),
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0B0D]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-20">
        {/* Zone 1: Official Chrome Logo + Editorial Wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick('/')}
          aria-label={settings.brandName || 'Bruno Diniz Imóveis'}
          className="flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B] rounded-md py-1 group"
        >
          {!logoError && logoSrc && (
            <img
              src={logoSrc}
              alt={`${settings.brandName || 'Bruno Diniz'} — Logotipo Oficial`}
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="h-11 sm:h-12 w-auto max-w-[140px] object-contain brightness-110 contrast-110 drop-shadow-[0_2px_12px_rgba(255,255,255,0.22)] shrink-0"
            />
          )}
          <span className="font-display text-xl sm:text-2xl font-semibold tracking-[0.04em] text-[#F5F2EB] group-hover:text-[#C6A15B] transition-colors whitespace-nowrap">
            {settings.brandName || 'Bruno Diniz'}
          </span>
        </button>

        {/* Zone 2: Clean single-line text nav links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7" aria-label="Navegação principal">
          {navItems.map((item) => {
            const active =
              item.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleLinkClick(item.path)}
                className={cn(
                  'relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]',
                  active
                    ? 'text-[#C6A15B]'
                    : 'text-[#F5F2EB]/80 hover:text-[#F5F2EB]'
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C6A15B]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action CTA + mobile trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#C6A15B] px-4 py-2 text-xs font-semibold text-[#0B0B0D] whitespace-nowrap shrink-0 hover:bg-[#D8B573] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Fale comigo
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 text-[#F5F2EB] hover:border-[#C6A15B]/50 transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0B0B0D] px-4 py-5 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => handleLinkClick(item.path)}
              className={cn(
                'block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                currentPath === item.path
                  ? 'bg-[#1A1A20] text-[#C6A15B]'
                  : 'text-[#F5F2EB]/85 hover:bg-[#131317]'
              )}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleLinkClick('/alto-padrao')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#F5F2EB]/85 hover:bg-[#131317]"
          >
            Alto Padrão
          </button>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#C6A15B] px-4 py-3 text-sm font-semibold text-[#0B0B0D]"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('/admin')}
              className="w-full text-center py-2 text-xs text-[#A19E95] hover:text-[#F5F2EB]"
            >
              Painel Administrativo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
