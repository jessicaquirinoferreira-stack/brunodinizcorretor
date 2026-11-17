import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import {
  BarChart3,
  Building,
  Building2,
  Calendar,
  ExternalLink,
  FileText,
  FolderOpen,
  Kanban,
  LogOut,
  Settings,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import {
  bootstrapInitialFirestoreData,
  fetchAllAdminCollections,
  fetchProfessionalProfile,
  fetchSiteSettings,
} from '../../lib/firestoreService';
import {
  DEFAULT_PROFESSIONAL_PROFILE,
  DEFAULT_SITE_SETTINGS,
  OFFICIAL_LOGO_URL,
} from '../../lib/seedData';
import { AdminLogin } from './AdminLogin';
import {
  ClientsPanel,
  LeadsPanel,
  OverviewPanel,
  PipelinePanel,
  ProposalsPanel,
  VisitsTasksPanel,
} from './CrmViews';
import {
  EmpreendimentosAdminPanel,
  LandingPageAdminPanel,
  MediaAdminPanel,
  PropertiesAdminPanel,
  SettingsAdminPanel,
} from './CmsViews';
import type {
  AdminUser,
  AnalyticsEvent,
  Client,
  Empreendimento,
  LandingPage,
  Lead,
  MediaAsset,
  PipelineDeal,
  ProfessionalProfile,
  Property,
  Proposal,
  SiteSettings,
  Task,
  Visit,
} from '../../types';

type AdminTab =
  | 'overview'
  | 'pipeline'
  | 'leads'
  | 'clients'
  | 'visits'
  | 'proposals'
  | 'properties'
  | 'empreendimentos'
  | 'landing_page'
  | 'media'
  | 'settings';

export function AdminDashboard({
  onNavigate,
  onSiteDataChanged,
}: {
  onNavigate: (path: string) => void;
  onSiteDataChanged: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);
  const [authErrorNotice, setAuthErrorNotice] = useState('');

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [profile, setProfile] = useState<ProfessionalProfile>(DEFAULT_PROFESSIONAL_PROFILE);
  const [properties, setProperties] = useState<Property[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pipeline, setPipeline] = useState<PipelineDeal[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const loadData = async () => {
    setLoading(true);
    setAuthErrorNotice('');
    try {
      await bootstrapInitialFirestoreData();
      const [s, p, all] = await Promise.all([
        fetchSiteSettings(),
        fetchProfessionalProfile(),
        fetchAllAdminCollections(),
      ]);
      setSettings(s);
      setProfile(p);
      setProperties(all.properties);
      setEmpreendimentos(all.empreendimentos);
      setLandingPages(all.landingPages);
      setLeads(all.leads);
      setClients(all.clients);
      setPipeline(all.pipeline);
      setVisits(all.visits);
      setProposals(all.proposals);
      setTasks(all.tasks);
      setMedia(all.media);
      setAnalytics(all.analytics);
      setAdminUsers(all.adminUsers);
      onSiteDataChanged();
    } catch {
      setAuthErrorNotice(
        `A conta autenticada (${auth.currentUser?.email || 'usuário'}) não possui permissão de administrador nas regras do Firestore. Se você entrou com brunodinizcorretordeimoveis@gmail.com, primeiro acesse com Google (jonasweb2rj@gmail.com) e autorize o UID (${auth.currentUser?.uid || ''}) em Configurações > Administradores.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser) {
        loadData();
      }
    });
    return () => unsub();
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#A19E95] flex items-center justify-center text-sm">
        Verificando sessão...
      </div>
    );
  }

  if (!user || authErrorNotice) {
    return (
      <AdminLogin
        onBackToSite={() => onNavigate('/')}
        authErrorNotice={authErrorNotice}
      />
    );
  }

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Visão Geral & Analytics', icon: BarChart3 },
    { id: 'pipeline', label: 'Pipeline (Kanban)', icon: Kanban },
    { id: 'leads', label: 'Leads Capturados', icon: UserCheck },
    { id: 'clients', label: 'Fichas de Clientes', icon: Users },
    { id: 'visits', label: 'Agenda & Follow-ups', icon: Calendar },
    { id: 'proposals', label: 'Propostas & Docs', icon: FileText },
    { id: 'properties', label: 'Imóveis', icon: Building2 },
    { id: 'empreendimentos', label: 'Empreendimentos', icon: Building },
    { id: 'landing_page', label: 'Landing Page Premium', icon: Sparkles },
    { id: 'media', label: 'Mídia (Vercel Blob)', icon: FolderOpen },
    { id: 'settings', label: 'Configurações & SEO', icon: Settings },
  ];

  const activeLabel = navItems.find((n) => n.id === activeTab)?.label || 'Painel';

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F5F2EB] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0E0E12] p-4 flex flex-col justify-between gap-6">
        <div className="space-y-6">
          <div className="px-2 pt-1 space-y-1.5">
            <div className="flex items-center gap-2.5">
              <img
                src={settings.logoUrl || OFFICIAL_LOGO_URL}
                alt="Bruno Diniz Imóveis"
                referrerPolicy="no-referrer"
                className="h-10 w-auto max-w-[110px] object-contain brightness-110 contrast-110 drop-shadow-[0_2px_10px_rgba(255,255,255,0.18)] shrink-0"
              />
              <span className="font-display text-xl font-semibold tracking-[0.03em] text-[#F5F2EB] leading-none">
                {settings.brandName || 'Bruno Diniz'}
              </span>
            </div>
            <p className="text-[11px] text-[#C6A15B] font-mono-tabular">
              CRM · CRECI-PE 21512
            </p>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#C6A15B] text-[#0B0B0D] font-semibold'
                      : 'text-[#A19E95] hover:bg-white/5 hover:text-[#F5F2EB]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block border-t border-white/10 pt-4 px-2 space-y-2 text-xs">
          <p className="text-[#A19E95] truncate">{user.email}</p>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Workspace Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-white/10 bg-[#0B0B0D] px-6 flex items-center justify-between gap-4">
          <div className="text-xs text-[#A19E95] truncate">
            <span>Painel Administrativo</span>
            <span className="mx-2">/</span>
            <span className="text-[#F5F2EB] font-medium">{activeLabel}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-[#F5F2EB] hover:border-[#C6A15B] whitespace-nowrap"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#C6A15B]" />
              Ver Site Público
            </button>
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="lg:hidden rounded-lg border border-white/15 p-1.5 text-red-400"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {loading ? (
            <div className="py-20 text-center text-xs text-[#A19E95]">
              Carregando dados do Firestore...
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewPanel
                  leads={leads}
                  pipeline={pipeline}
                  visits={visits}
                  proposals={proposals}
                  properties={properties}
                  analytics={analytics}
                />
              )}
              {activeTab === 'pipeline' && (
                <PipelinePanel deals={pipeline} onRefresh={loadData} />
              )}
              {activeTab === 'leads' && (
                <LeadsPanel
                  leads={leads}
                  whatsappNumber={settings.whatsappNumber}
                  onRefresh={loadData}
                />
              )}
              {activeTab === 'clients' && (
                <ClientsPanel
                  clients={clients}
                  adminEmail={user.email || ''}
                  onRefresh={loadData}
                />
              )}
              {activeTab === 'visits' && (
                <VisitsTasksPanel
                  visits={visits}
                  tasks={tasks}
                  onRefresh={loadData}
                />
              )}
              {activeTab === 'proposals' && (
                <ProposalsPanel proposals={proposals} onRefresh={loadData} />
              )}
              {activeTab === 'properties' && (
                <PropertiesAdminPanel
                  properties={properties}
                  empreendimentos={empreendimentos}
                  onRefresh={loadData}
                />
              )}
              {activeTab === 'empreendimentos' && (
                <EmpreendimentosAdminPanel
                  empreendimentos={empreendimentos}
                  onRefresh={loadData}
                />
              )}
              {activeTab === 'landing_page' && (
                <LandingPageAdminPanel
                  landingPages={landingPages}
                  properties={properties}
                  empreendimentos={empreendimentos}
                  onNavigate={onNavigate}
                  onRefresh={loadData}
                />
              )}
              {activeTab === 'media' && (
                <MediaAdminPanel media={media} onRefresh={loadData} />
              )}
              {activeTab === 'settings' && (
                <SettingsAdminPanel
                  settings={settings}
                  profile={profile}
                  adminUsers={adminUsers}
                  onRefresh={loadData}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
