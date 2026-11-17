import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckSquare,
  FileText,
  MessageCircle,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  addClientInteraction,
  convertLeadToClientAndDeal,
  deleteLeadAdmin,
  deletePipelineDeal,
  deleteTask,
  fetchClientInteractions,
  saveClient,
  savePipelineDeal,
  saveProposal,
  saveTask,
  saveVisitAdmin,
  updateLeadAdmin,
} from '../../lib/firestoreService';
import { buildWhatsAppUrl, formatBRL, formatDateTimeBR } from '../../lib/utils';
import {
  PIPELINE_STAGES,
  type AnalyticsEvent,
  type Client,
  type ClientInteraction,
  type Lead,
  type LeadScore,
  type PipelineDeal,
  type PipelineStage,
  type Proposal,
  type Property,
  type Task,
  type Visit,
} from '../../types';

// --- 1. OVERVIEW & ANALYTICS ---

export function OverviewPanel({
  leads,
  pipeline,
  visits,
  proposals,
  properties,
  analytics,
}: {
  leads: Lead[];
  pipeline: PipelineDeal[];
  visits: Visit[];
  proposals: Proposal[];
  properties: Property[];
  analytics: AnalyticsEvent[];
}) {
  const hotLeads = leads.filter((l) => l.score === 'quente').length;
  const scheduledVisits = visits.filter((v) => v.status === 'solicitada' || v.status === 'confirmada').length;
  const closedDeals = pipeline.filter((d) => d.stage === 'fechado').length;
  const conversionRate = leads.length > 0 ? Math.round((closedDeals / leads.length) * 100) : 0;
  const forecastValue = pipeline
    .filter((d) => d.stage !== 'perdido')
    .reduce((acc, d) => acc + (d.estimatedValue || 0), 0);

  const sourcesCount = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l) => {
      const key = l.utmSource || l.source || 'direto';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  const kpis = [
    { label: 'Leads Capturados', value: String(leads.length), sub: `${hotLeads} quentes` },
    { label: 'Visitas Ativas', value: String(scheduledVisits), sub: `${visits.length} no total` },
    { label: 'Propostas Emitidas', value: String(proposals.length), sub: `${properties.length} imóveis no acervo` },
    { label: 'Taxa de Conversão', value: `${conversionRate}%`, sub: `Previsão ${formatBRL(forecastValue, forecastValue > 0)}` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-white/10 bg-[#131317] p-5 space-y-1">
            <p className="text-xs text-[#A19E95]">{k.label}</p>
            <p className="font-mono-tabular text-2xl font-semibold text-[#F5F2EB]">{k.value}</p>
            <p className="text-xs text-[#C6A15B]">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-[#131317] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#F5F2EB]">Origem dos Leads & UTMs</h3>
          {sourcesCount.length === 0 ? (
            <p className="text-xs text-[#A19E95]">Nenhum lead capturado ainda.</p>
          ) : (
            <div className="space-y-2.5">
              {sourcesCount.map(([src, count]) => (
                <div key={src} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-[#F5F2EB]">{src}</span>
                  <span className="font-mono-tabular text-[#C6A15B]">{count} leads</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#131317] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#F5F2EB]">Eventos Recentes do Site</h3>
          {analytics.length === 0 ? (
            <p className="text-xs text-[#A19E95]">Aguardando acessos e interações no site público.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-auto">
              {analytics.slice(0, 12).map((evt) => (
                <div key={evt.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-1.5">
                  <span className="text-[#F5F2EB] truncate max-w-[60%]">
                    {evt.eventType} · {evt.path}
                  </span>
                  <span className="font-mono-tabular text-[#A19E95]">
                    {formatDateTimeBR(evt.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 2. KANBAN PIPELINE ---

export function PipelinePanel({
  deals,
  onRefresh,
}: {
  deals: PipelineDeal[];
  onRefresh: () => void;
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClient.trim()) return;
    setSaving(true);
    try {
      await savePipelineDeal({
        title: newTitle,
        clientName: newClient,
        stage: 'novo_lead',
        score: 'morno',
        estimatedValue: newValue ? Number(newValue) : null,
        tags: ['CRM Manual'],
      });
      setNewTitle('');
      setNewClient('');
      setNewValue('');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const moveStage = async (deal: PipelineDeal, stage: PipelineStage) => {
    await savePipelineDeal({ ...deal, stage });
    onRefresh();
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleCreate} className="rounded-xl border border-white/10 bg-[#131317] p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-[#A19E95] mb-1">Negócio / Imóvel</label>
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ex.: Cobertura Boa Viagem"
            className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#A19E95] mb-1">Cliente</label>
          <input
            type="text"
            required
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            placeholder="Nome do cliente"
            className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#A19E95] mb-1">Valor Estimado (R$)</label>
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Opcional"
            className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C6A15B] px-4 py-2 text-xs font-semibold text-[#0B0B0D] hover:bg-[#D8B573] h-[34px]"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo Negócio
        </button>
      </form>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="w-72 shrink-0 rounded-xl border border-white/10 bg-[#131317] p-3 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-semibold text-[#F5F2EB]">{stage.label}</span>
                <span className="font-mono-tabular text-xs text-[#C6A15B]">{stageDeals.length}</span>
              </div>

              <div className="space-y-2.5">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-lg border border-white/10 bg-[#0B0B0D] p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-[#F5F2EB] leading-snug">
                        {deal.title}
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          await deletePipelineDeal(deal.id);
                          onRefresh();
                        }}
                        className="text-[#A19E95] hover:text-red-400"
                        title="Remover negócio"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#A19E95]">
                      {deal.clientName} · Score: <span className="text-[#C6A15B] capitalize">{deal.score}</span>
                    </p>
                    {deal.estimatedValue ? (
                      <p className="font-mono-tabular text-xs text-[#F5F2EB]">
                        {formatBRL(deal.estimatedValue, true)}
                      </p>
                    ) : null}
                    <select
                      value={deal.stage}
                      onChange={(e) => moveStage(deal, e.target.value as PipelineStage)}
                      className="w-full rounded border border-white/10 bg-[#131317] px-2 py-1 text-[11px] text-[#F5F2EB]"
                    >
                      {PIPELINE_STAGES.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          Mover: {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <p className="text-[11px] text-[#A19E95]/60 py-4 text-center">Vazio</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- 3. LEADS ---

export function LeadsPanel({
  leads,
  whatsappNumber,
  onRefresh,
}: {
  leads: Lead[];
  whatsappNumber: string;
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('todos');

  const filtered = leads.filter((l) => {
    if (scoreFilter !== 'todos' && l.score !== scoreFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return `${l.name} ${l.phone} ${l.email || ''} ${l.source}`.toLowerCase().includes(q);
    }
    return true;
  });

  const handleScoreChange = async (lead: Lead, score: LeadScore) => {
    await updateLeadAdmin(lead.id, { score });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 text-[#A19E95] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lead por nome, telefone ou origem"
            className="w-full rounded-lg border border-white/10 bg-[#131317] pl-8 pr-3 py-2 text-xs text-[#F5F2EB]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#131317] border border-white/10">
          {['todos', 'quente', 'morno', 'frio'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScoreFilter(s)}
              className={`px-3 py-1.5 rounded text-xs capitalize ${
                scoreFilter === s ? 'bg-[#C6A15B] text-[#0B0B0D] font-semibold' : 'text-[#A19E95]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#131317] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 text-[#A19E95]">
            <tr>
              <th className="px-4 py-3 font-medium">Lead</th>
              <th className="px-4 py-3 font-medium">Contato</th>
              <th className="px-4 py-3 font-medium">Origem / UTM</th>
              <th className="px-4 py-3 font-medium">Qualificação</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((lead) => (
              <tr key={lead.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#F5F2EB]">{lead.name}</p>
                  <p className="text-[11px] text-[#A19E95] truncate max-w-[220px]">
                    {lead.propertyTitle || lead.message || 'Contato geral'}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-mono-tabular text-[#F5F2EB]">{lead.phone}</p>
                  {lead.email && <p className="text-[11px] text-[#A19E95]">{lead.email}</p>}
                </td>
                <td className="px-4 py-3 text-[#A19E95]">
                  <span>{lead.source}</span>
                  {lead.utmSource && <span className="block text-[11px]">utm: {lead.utmSource}</span>}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={lead.score}
                    onChange={(e) => handleScoreChange(lead, e.target.value as LeadScore)}
                    className="rounded border border-white/10 bg-[#0B0B0D] px-2 py-1 text-xs text-[#F5F2EB] capitalize"
                  >
                    <option value="quente">Quente</option>
                    <option value="morno">Morno</option>
                    <option value="frio">Frio</option>
                  </select>
                </td>
                <td className="px-4 py-3 font-mono-tabular text-[#A19E95]">
                  {formatDateTimeBR(lead.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <a
                      href={buildWhatsAppUrl(
                        lead.phone || whatsappNumber,
                        `Olá ${lead.name}, aqui é Bruno Diniz (CRECI-PE 21512) retornando seu contato.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded border border-white/10 text-[#C6A15B] hover:bg-white/5"
                      title="Chamar no WhatsApp"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        await convertLeadToClientAndDeal(lead);
                        onRefresh();
                      }}
                      className="inline-flex items-center gap-1 rounded bg-[#C6A15B]/15 border border-[#C6A15B]/30 px-2.5 py-1 text-[11px] font-medium text-[#C6A15B] hover:bg-[#C6A15B]/25"
                    >
                      <UserPlus className="h-3 w-3" />
                      Converter
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteLeadAdmin(lead.id);
                        onRefresh();
                      }}
                      className="p-1.5 rounded border border-white/10 text-[#A19E95] hover:text-red-400"
                      title="Excluir lead"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#A19E95]">
                  Nenhum lead encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 4. CLIENTS & INTERACTIONS ---

export function ClientsPanel({
  clients,
  adminEmail,
  onRefresh,
}: {
  clients: Client[];
  adminEmail: string;
  onRefresh: () => void;
}) {
  const [selected, setSelected] = useState<Client | null>(null);
  const [interactions, setInteractions] = useState<ClientInteraction[]>([]);
  const [intType, setIntType] = useState<ClientInteraction['type']>('nota');
  const [intSummary, setIntSummary] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const openClient = async (c: Client) => {
    setSelected(c);
    const list = await fetchClientInteractions(c.id);
    setInteractions(list);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    await saveClient({ name: newName, phone: newPhone, email: newEmail });
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    onRefresh();
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !intSummary.trim()) return;
    await addClientInteraction(selected.id, {
      type: intType,
      summary: intSummary,
      authorEmail: adminEmail,
    });
    setIntSummary('');
    const list = await fetchClientInteractions(selected.id);
    setInteractions(list);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-4">
        <form onSubmit={handleAddClient} className="rounded-xl border border-white/10 bg-[#131317] p-4 grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do cliente"
            className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
          <input
            type="text"
            required
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="WhatsApp"
            className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="E-mail"
            className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#C6A15B] px-3 py-2 text-xs font-semibold text-[#0B0B0D]"
          >
            Cadastrar
          </button>
        </form>

        <div className="rounded-xl border border-white/10 bg-[#131317] divide-y divide-white/5">
          {clients.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => openClient(c)}
              className={`w-full text-left p-4 flex items-center justify-between hover:bg-white/[0.02] ${
                selected?.id === c.id ? 'bg-[#1A1A20]' : ''
              }`}
            >
              <div>
                <p className="text-sm font-medium text-[#F5F2EB]">{c.name}</p>
                <p className="text-xs text-[#A19E95] font-mono-tabular">
                  {c.phone} {c.email ? `· ${c.email}` : ''}
                </p>
              </div>
              <span className="text-xs text-[#C6A15B]">Abrir ficha</span>
            </button>
          ))}
          {clients.length === 0 && (
            <div className="p-8 text-center text-xs text-[#A19E95]">
              <Users className="h-6 w-6 mx-auto mb-2 opacity-60" />
              Nenhum cliente cadastrado ainda. Converta um lead ou cadastre manualmente.
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-6">
        {selected ? (
          <div className="rounded-xl border border-white/10 bg-[#131317] p-5 space-y-5">
            <div className="border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl font-semibold text-[#F5F2EB]">{selected.name}</h3>
              <p className="text-xs text-[#A19E95] font-mono-tabular">
                {selected.phone} · Origem: {selected.origin || 'Direto'}
              </p>
            </div>

            <form onSubmit={handleAddInteraction} className="space-y-2.5">
              <div className="flex gap-2">
                <select
                  value={intType}
                  onChange={(e) => setIntType(e.target.value as ClientInteraction['type'])}
                  className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="ligacao">Ligação</option>
                  <option value="visita">Visita</option>
                  <option value="proposta">Proposta</option>
                  <option value="email">E-mail</option>
                  <option value="nota">Nota interna</option>
                </select>
                <input
                  type="text"
                  required
                  value={intSummary}
                  onChange={(e) => setIntSummary(e.target.value)}
                  placeholder="Registrar histórico de atendimento..."
                  className="flex-1 rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#C6A15B] px-3.5 py-2 text-xs font-semibold text-[#0B0B0D]"
                >
                  Salvar
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-80 overflow-auto">
              {interactions.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-[#0B0B0D] p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[#C6A15B]">
                    <span className="uppercase font-medium">{item.type}</span>
                    <span className="font-mono-tabular text-[#A19E95]">{formatDateTimeBR(item.createdAt)}</span>
                  </div>
                  <p className="text-[#F5F2EB]/90">{item.summary}</p>
                </div>
              ))}
              {interactions.length === 0 && (
                <p className="text-xs text-[#A19E95]">Nenhuma interação registrada nesta ficha.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-[#131317] p-10 text-center text-xs text-[#A19E95]">
            Selecione um cliente à esquerda para visualizar histórico de interações e imóveis de interesse.
          </div>
        )}
      </div>
    </div>
  );
}

// --- 5. VISITS & TASKS ---

export function VisitsTasksPanel({
  visits,
  tasks,
  onRefresh,
}: {
  visits: Visit[];
  tasks: Task[];
  onRefresh: () => void;
}) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('alta');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await saveTask({
      title: taskTitle,
      dueDate: taskDue,
      priority: taskPriority,
      completed: false,
    });
    setTaskTitle('');
    setTaskDue('');
    onRefresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-white/10 bg-[#131317] p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F2EB]">
          <Calendar className="h-4 w-4 text-[#C6A15B]" />
          <span>Agenda de Visitas</span>
        </div>

        <div className="space-y-3">
          {visits.map((v) => (
            <div key={v.id} className="rounded-lg border border-white/10 bg-[#0B0B0D] p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#F5F2EB]">{v.clientName}</span>
                <span className="font-mono-tabular text-[#C6A15B]">
                  {v.scheduledDate} · {v.scheduledTime || 'A confirmar'}
                </span>
              </div>
              <p className="text-[#A19E95]">
                {v.propertyTitle || 'Imóvel a confirmar'} · Tel: {v.clientPhone}
              </p>
              <div className="flex items-center justify-between gap-2 pt-1">
                <select
                  value={v.status}
                  onChange={async (e) => {
                    await saveVisitAdmin({ ...v, status: e.target.value as Visit['status'] });
                    onRefresh();
                  }}
                  className="rounded border border-white/10 bg-[#131317] px-2.5 py-1 text-xs text-[#F5F2EB]"
                >
                  <option value="solicitada">Solicitada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="realizada">Realizada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
                <label className="inline-flex items-center gap-1.5 text-[11px] text-[#A19E95] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(v.reminderSent)}
                    onChange={async (e) => {
                      await saveVisitAdmin({ ...v, reminderSent: e.target.checked });
                      onRefresh();
                    }}
                    className="accent-[#C6A15B]"
                  />
                  Lembrete enviado
                </label>
              </div>
            </div>
          ))}
          {visits.length === 0 && (
            <p className="text-xs text-[#A19E95] py-4 text-center">Nenhuma visita agendada.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#131317] p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F2EB]">
          <CheckSquare className="h-4 w-4 text-[#C6A15B]" />
          <span>Tarefas & Follow-ups</span>
        </div>

        <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            type="text"
            required
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Novo follow-up..."
            className="sm:col-span-2 rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
          <input
            type="date"
            value={taskDue}
            onChange={(e) => setTaskDue(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0B0B0D] px-2.5 py-2 text-xs text-[#F5F2EB]"
          />
          <div className="flex gap-1.5">
            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as Task['priority'])}
              className="rounded-lg border border-white/10 bg-[#0B0B0D] px-2 py-2 text-xs text-[#F5F2EB]"
            >
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-[#C6A15B] px-3 py-2 text-xs font-semibold text-[#0B0B0D]"
            >
              +
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-xs"
            >
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={async (e) => {
                    await saveTask({ ...t, completed: e.target.checked });
                    onRefresh();
                  }}
                  className="accent-[#C6A15B]"
                />
                <span className={t.completed ? 'line-through text-[#A19E95]' : 'text-[#F5F2EB]'}>
                  {t.title}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#C6A15B] capitalize">{t.priority}</span>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteTask(t.id);
                    onRefresh();
                  }}
                  className="text-[#A19E95] hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-xs text-[#A19E95] py-4 text-center">Nenhuma tarefa pendente.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 6. PROPOSALS & DOCUMENTS ---

export function ProposalsPanel({
  proposals,
  onRefresh,
}: {
  proposals: Proposal[];
  onRefresh: () => void;
}) {
  const [clientName, setClientName] = useState('');
  const [propertyTitle, setPropertyTitle] = useState('');
  const [proposedValue, setProposedValue] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUploadDoc = async (file: File) => {
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const res = await fetch('/api/blob/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            base64Data: reader.result,
          }),
        });
        const data = (await res.json()) as { url?: string };
        if (data.url) setDocUrl(data.url);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !propertyTitle.trim()) return;
    await saveProposal({
      clientName,
      propertyTitle,
      proposedValue: Number(proposedValue || 0),
      paymentTerms,
      documentUrl: docUrl,
      status: 'enviada',
    });
    setClientName('');
    setPropertyTitle('');
    setProposedValue('');
    setPaymentTerms('');
    setDocUrl('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-[#131317] p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <input
          type="text"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Nome do cliente *"
          className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
        />
        <input
          type="text"
          required
          value={propertyTitle}
          onChange={(e) => setPropertyTitle(e.target.value)}
          placeholder="Imóvel da proposta *"
          className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
        />
        <input
          type="number"
          required
          value={proposedValue}
          onChange={(e) => setProposedValue(e.target.value)}
          placeholder="Valor proposto (R$) *"
          className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
        />
        <input
          type="text"
          value={paymentTerms}
          onChange={(e) => setPaymentTerms(e.target.value)}
          placeholder="Condições de pagamento"
          className="rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="URL do documento ou anexe PDF"
            className="flex-1 rounded-lg border border-white/10 bg-[#0B0B0D] px-3 py-2 text-xs text-[#F5F2EB]"
          />
          <label className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-xs text-[#C6A15B] hover:bg-white/5 whitespace-nowrap">
            {uploading ? 'Enviando...' : 'Anexar'}
            <input
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUploadDoc(e.target.files[0])}
            />
          </label>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[#C6A15B] px-4 py-2 text-xs font-semibold text-[#0B0B0D]"
        >
          Registrar Proposta
        </button>
      </form>

      <div className="rounded-xl border border-white/10 bg-[#131317] divide-y divide-white/5">
        {proposals.map((p) => (
          <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-[#F5F2EB]">
                {p.clientName} · {p.propertyTitle}
              </p>
              <p className="text-[#A19E95]">
                Valor: <span className="font-mono-tabular text-[#C6A15B]">{formatBRL(p.proposedValue, true)}</span>
                {p.paymentTerms ? ` · ${p.paymentTerms}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {p.documentUrl && (
                <a
                  href={p.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#C6A15B] hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Documento
                </a>
              )}
              <select
                value={p.status}
                onChange={async (e) => {
                  await saveProposal({ ...p, status: e.target.value as Proposal['status'] });
                  onRefresh();
                }}
                className="rounded border border-white/10 bg-[#0B0B0D] px-2.5 py-1.5 text-xs text-[#F5F2EB]"
              >
                <option value="rascunho">Rascunho</option>
                <option value="enviada">Enviada</option>
                <option value="em_analise">Em Análise</option>
                <option value="aceita">Aceita</option>
                <option value="recusada">Recusada</option>
              </select>
            </div>
          </div>
        ))}
        {proposals.length === 0 && (
          <p className="p-8 text-center text-xs text-[#A19E95]">Nenhuma proposta registrada.</p>
        )}
      </div>
    </div>
  );
}
