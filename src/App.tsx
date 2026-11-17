/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ThemeProvider, useTheme } from './components/ui/ThemeContext';
import { ScrollProgressBar } from './components/motion/PremiumMotion';
import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';
import { HomeView } from './components/public/HomeView';
import { CatalogView } from './components/public/CatalogView';
import { PropertyDetailView } from './components/public/PropertyDetailView';
import {
  EmpreendimentoDetailView,
  EmpreendimentosListView,
} from './components/public/EmpreendimentosView';
import { FlagshipLandingPageView } from './components/public/FlagshipLandingPageView';
import { AboutView, ContactView } from './components/public/AboutContactView';
import { LgpdBanner } from './components/public/LgpdBanner';
import { FloatingConcierge } from './components/public/FloatingConcierge';
import { CinematicIntro } from './components/public/CinematicIntro';
import {
  fetchProfessionalProfile,
  fetchPublishedEmpreendimentos,
  fetchPublishedLandingPages,
  fetchPublishedProperties,
  fetchSiteSettings,
} from './lib/firestoreService';
import {
  ABOUT_IMAGE,
  APARTMENT_IMAGE,
  DEFAULT_EMPREENDIMENTOS,
  DEFAULT_LANDING_PAGE,
  DEFAULT_PROFESSIONAL_PROFILE,
  DEFAULT_PROPERTIES,
  DEFAULT_SITE_SETTINGS,
  EMPREENDIMENTO_IMAGE,
  HERO_IMAGE,
  OFFICIAL_LOGO_URL,
  PENTHOUSE_IMAGE,
  SOFIA_AVATAR_IMAGE,
  VILLA_IMAGE,
} from './lib/seedData';

const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
import {
  injectExternalTracking,
  logAnalyticsEvent,
  updateDocumentMeta,
} from './lib/analytics';
import type {
  Empreendimento,
  LandingPage,
  ProfessionalProfile,
  Property,
  SiteSettings,
} from './types';

function MainAppContent() {
  const [path, setPath] = useState<string>(() => window.location.pathname || '/');
  const [showIntro, setShowIntro] = useState<boolean>(
    () => !window.location.pathname.startsWith('/admin')
  );
  const [quickFilters, setQuickFilters] = useState({
    businessType: 'Todos',
    category: 'Todas',
    region: '',
  });

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [profile, setProfile] = useState<ProfessionalProfile>(DEFAULT_PROFESSIONAL_PROFILE);
  const [properties, setProperties] = useState<Property[]>(DEFAULT_PROPERTIES);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>(DEFAULT_EMPREENDIMENTOS);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([DEFAULT_LANDING_PAGE]);

  const { theme } = useTheme();

  const loadPublicData = async () => {
    const [s, p, props, emps, lps] = await Promise.all([
      fetchSiteSettings(),
      fetchProfessionalProfile(),
      fetchPublishedProperties(),
      fetchPublishedEmpreendimentos(),
      fetchPublishedLandingPages(),
    ]);
    setSettings(s);
    setProfile(p);
    setProperties(props);
    setEmpreendimentos(emps);
    setLandingPages(lps);
    injectExternalTracking(s);
  };

  useEffect(() => {
    loadPublicData();

    const criticalImages = [
      OFFICIAL_LOGO_URL,
      HERO_IMAGE,
      EMPREENDIMENTO_IMAGE,
      VILLA_IMAGE,
      PENTHOUSE_IMAGE,
      APARTMENT_IMAGE,
      ABOUT_IMAGE,
      SOFIA_AVATAR_IMAGE,
    ];
    criticalImages.forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!path.startsWith('/admin')) {
      logAnalyticsEvent({ eventType: 'page_view', path });
    }
    if (path === '/') {
      updateDocumentMeta({
        title: settings.seoTitle || 'Bruno Diniz | Imóveis Litoral, Médio e Alto Padrão',
        description:
          settings.seoDescription ||
          'Corretor de Imóveis em Pernambuco (CRECI-PE 21512). Especialista em imóveis de Litoral, Médio e Alto Padrão.',
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [path, settings.seoTitle, settings.seoDescription]);

  const navigate = (nextPath: string) => {
    if (nextPath !== path) {
      window.history.pushState({}, '', nextPath);
      setPath(nextPath);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuickSearch = (filters: {
    businessType: string;
    category: string;
    region: string;
  }) => {
    setQuickFilters(filters);
    navigate('/comprar');
  };

  const renderAppView = () => {
    if (path.startsWith('/admin')) {
      return (
        <Suspense
          fallback={
            <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0B0B0D] text-[#A19E95]' : 'bg-[#F8F9FA] text-[#6B7280]'} flex items-center justify-center text-sm`}>
              Carregando painel administrativo...
            </div>
          }
        >
          <AdminDashboard
            onNavigate={navigate}
            onSiteDataChanged={loadPublicData}
          />
        </Suspense>
      );
    }

    if (path.startsWith('/lp/')) {
      const slug = path.replace('/lp/', '').replace(/\/$/, '');
      const lp =
        landingPages.find((item) => item.slug === slug) ||
        landingPages[0] ||
        DEFAULT_LANDING_PAGE;
      const linkedProperty =
        lp.targetType === 'property'
          ? properties.find((p) => p.id === lp.targetId)
          : undefined;
      const linkedEmpreendimento =
        lp.targetType === 'empreendimento' || lp.targetType === 'campanha'
          ? empreendimentos.find((e) => e.id === lp.targetId)
          : undefined;

      return (
        <>
          <ScrollProgressBar />
          <FlagshipLandingPageView
            landingPage={lp}
            linkedProperty={linkedProperty}
            linkedEmpreendimento={linkedEmpreendimento}
            settings={settings}
            onNavigate={navigate}
          />
          <Footer settings={settings} profile={profile} onNavigate={navigate} />
          <FloatingConcierge settings={settings} profile={profile} onNavigate={navigate} />
          <LgpdBanner />
        </>
      );
    }

    const renderPublicContent = () => {
      if (path === '/comprar') {
        return (
          <CatalogView
            key={`comprar-${quickFilters.category}-${quickFilters.businessType}-${quickFilters.region}`}
            properties={properties}
            initialBusinessType={quickFilters.businessType}
            initialCategory={quickFilters.category}
            initialRegion={quickFilters.region}
            pageTitle="Comprar Imóveis em Pernambuco"
            pageSubtitle="Acervo selecionado de imóveis no Litoral, Médio e Alto Padrão com confirmação técnica direta com o corretor Bruno Diniz."
            onSelectProperty={(slug) => navigate(`/imovel/${slug}`)}
          />
        );
      }

      if (path === '/litoral') {
        return (
          <CatalogView
            key="litoral"
            properties={properties}
            initialCategory="Litoral"
            pageTitle="Especialidade Litoral"
            pageSubtitle="Imóveis frente mar, beira-mar e opções litorâneas em Pernambuco com atendimento consultivo."
            onSelectProperty={(slug) => navigate(`/imovel/${slug}`)}
          />
        );
      }

      if (path === '/alto-padrao') {
        return (
          <CatalogView
            key="alto-padrao"
            properties={properties}
            initialCategory="Alto Padrão"
            pageTitle="Imóveis de Médio e Alto Padrão"
            pageSubtitle="Residências, coberturas e apartamentos selecionados pelo padrão arquitetônico e localização."
            onSelectProperty={(slug) => navigate(`/imovel/${slug}`)}
          />
        );
      }

      if (path === '/empreendimentos') {
        return (
          <EmpreendimentosListView
            empreendimentos={empreendimentos}
            onSelect={(slug) => navigate(`/empreendimento/${slug}`)}
          />
        );
      }

      if (path.startsWith('/empreendimento/')) {
        const slug = path.replace('/empreendimento/', '').replace(/\/$/, '');
        const emp =
          empreendimentos.find((e) => e.slug === slug) || empreendimentos[0];
        if (!emp) {
          return (
            <EmpreendimentosListView
              empreendimentos={empreendimentos}
              onSelect={(s) => navigate(`/empreendimento/${s}`)}
            />
          );
        }
        const linked = properties.filter((p) => p.empreendimentoId === emp.id);
        return (
          <EmpreendimentoDetailView
            empreendimento={emp}
            linkedProperties={linked}
            settings={settings}
            onNavigate={navigate}
          />
        );
      }

      if (path.startsWith('/imovel/')) {
        const slug = path.replace('/imovel/', '').replace(/\/$/, '');
        const prop = properties.find((p) => p.slug === slug) || properties[0];
        if (!prop) {
          return (
            <CatalogView
              properties={properties}
              pageTitle="Imóveis"
              pageSubtitle="Seleção de imóveis em Pernambuco."
              onSelectProperty={(s) => navigate(`/imovel/${s}`)}
            />
          );
        }
        const similar = properties.filter(
          (p) => p.id !== prop.id && (p.category === prop.category || p.businessType === prop.businessType)
        );
        return (
          <PropertyDetailView
            property={prop}
            similarProperties={similar}
            settings={settings}
            onNavigate={navigate}
          />
        );
      }

      if (path === '/sobre') {
        return (
          <AboutView profile={profile} settings={settings} onNavigate={navigate} />
        );
      }

      if (path === '/contato') {
        return <ContactView profile={profile} settings={settings} />;
      }

      return (
        <HomeView
          settings={settings}
          profile={profile}
          properties={properties}
          empreendimentos={empreendimentos}
          landingPage={landingPages[0] || DEFAULT_LANDING_PAGE}
          onNavigate={navigate}
          onQuickSearch={handleQuickSearch}
        />
      );
    };

    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0B0B0D] text-[#F5F2EB]' : 'bg-[#FAFAFA] text-[#1A1A1E]'}`}>
        <ScrollProgressBar />
        <Navbar
          currentPath={path}
          onNavigate={navigate}
          settings={settings}
        />
        <main className="flex-1">{renderPublicContent()}</main>
        <Footer
          settings={settings}
          profile={profile}
          onNavigate={navigate}
        />
        <FloatingConcierge
          settings={settings}
          profile={profile}
          onNavigate={navigate}
        />
        <LgpdBanner />
      </div>
    );
  };

  return (
    <ErrorBoundary>
      {!path.startsWith('/admin') && (
        <CinematicIntro
          visible={showIntro}
          onComplete={() => setShowIntro(false)}
          brokerName={profile.name}
          creci={profile.creci}
          tagline={settings.tagline}
        />
      )}
      {renderAppView()}
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainAppContent />
    </ThemeProvider>
  );
}
