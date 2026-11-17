import React, { useState } from 'react';
import { Calendar, CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { submitPublicLead, submitPublicVisitRequest } from '../../lib/firestoreService';
import { logAnalyticsEvent } from '../../lib/analytics';
import { buildWhatsAppUrl } from '../../lib/utils';

interface LeadCaptureFormProps {
  source: string;
  whatsappNumber: string;
  propertyId?: string;
  propertyTitle?: string;
  empreendimentoId?: string;
  landingPageId?: string;
  defaultVisitMode?: boolean;
  compact?: boolean;
  ctaLabel?: string;
}

export function LeadCaptureForm({
  source,
  whatsappNumber,
  propertyId,
  propertyTitle,
  empreendimentoId,
  landingPageId,
  defaultVisitMode = false,
  compact = false,
  ctaLabel,
}: LeadCaptureFormProps) {
  const [visitMode, setVisitMode] = useState(defaultVisitMode);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [message, setMessage] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Informe seu nome completo.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 8) {
      setError('Informe um telefone ou WhatsApp válido com DDD.');
      return;
    }
    if (!lgpdConsent) {
      setError('É necessário concordar com o aviso de privacidade (LGPD).');
      return;
    }
    if (visitMode && !scheduledDate) {
      setError('Selecione a data desejada para a visita.');
      return;
    }

    setSubmitting(true);
    try {
      if (visitMode) {
        await submitPublicVisitRequest({
          clientName: name,
          clientPhone: phone,
          clientEmail: email,
          propertyId,
          propertyTitle,
          empreendimentoId,
          scheduledDate,
          scheduledTime,
          notes: message,
        });
        await logAnalyticsEvent({
          eventType: 'visit_submit',
          path: window.location.pathname,
          targetId: propertyId || empreendimentoId,
          source,
        });
      } else {
        await submitPublicLead({
          name,
          phone,
          email,
          message,
          source,
          propertyId,
          propertyTitle,
          empreendimentoId,
          landingPageId,
          lgpdConsent,
        });
        await logAnalyticsEvent({
          eventType: 'lead_submit',
          path: window.location.pathname,
          targetId: propertyId || empreendimentoId || landingPageId,
          source,
        });
      }
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? 'Não foi possível enviar no momento. Você pode falar diretamente pelo WhatsApp abaixo.'
          : 'Erro ao registrar atendimento.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappDirectUrl = buildWhatsAppUrl(
    whatsappNumber,
    propertyTitle
      ? `Olá Bruno Diniz, sou ${name || 'cliente'} e tenho interesse em: ${propertyTitle}.`
      : `Olá Bruno Diniz, sou ${name || 'cliente'} e gostaria de atendimento consultivo.`
  );

  if (submitted) {
    return (
      <div className="rounded-xl border border-[#C6A15B]/40 bg-[#131317] p-6 space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-[#C6A15B] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-display text-xl font-semibold text-[#F5F2EB]">
              {visitMode ? 'Solicitação de visita registrada' : 'Contato recebido com sucesso'}
            </h4>
            <p className="text-sm text-[#A19E95]">
              Bruno Diniz retornará em breve para confirmar disponibilidade, documentação e detalhes técnicos.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#C6A15B] px-4 py-2.5 text-xs font-semibold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Agilizar no WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setMessage('');
            }}
            className="rounded-lg border border-white/15 px-4 py-2.5 text-xs font-medium text-[#F5F2EB] hover:bg-white/5"
          >
            Enviar nova mensagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-[#131317] p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0B0B0D] border border-white/10">
        <button
          type="button"
          onClick={() => setVisitMode(false)}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
            !visitMode ? 'bg-[#C6A15B] text-[#0B0B0D]' : 'text-[#A19E95] hover:text-[#F5F2EB]'
          }`}
        >
          Solicitar Informações
        </button>
        <button
          type="button"
          onClick={() => setVisitMode(true)}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${
            visitMode ? 'bg-[#C6A15B] text-[#0B0B0D]' : 'text-[#A19E95] hover:text-[#F5F2EB]'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Agendar Visita
        </button>
      </div>

      <div className={compact ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
        <div>
          <label className="block text-xs text-[#A19E95] mb-1">Nome completo *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F5F2EB] placeholder:text-[#A19E95]/50 focus:border-[#C6A15B] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-[#A19E95] mb-1">WhatsApp / Telefone *</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(81) 99999-9999"
            className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F5F2EB] placeholder:text-[#A19E95]/50 focus:border-[#C6A15B] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#A19E95] mb-1">E-mail (opcional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F5F2EB] placeholder:text-[#A19E95]/50 focus:border-[#C6A15B] focus:outline-none"
        />
      </div>

      {visitMode && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Data preferencial *</label>
            <input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A19E95] mb-1">Horário</label>
            <select
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
            >
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="14:00">14:00</option>
              <option value="15:30">15:30</option>
              <option value="17:00">17:00</option>
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-[#A19E95] mb-1">Mensagem / Preferências</label>
        <textarea
          rows={compact ? 2 : 3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            propertyTitle
              ? `Gostaria de confirmar detalhes sobre ${propertyTitle}...`
              : 'Conte o perfil de imóvel que você procura (Litoral, Médio ou Alto Padrão)...'
          }
          className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F5F2EB] placeholder:text-[#A19E95]/50 focus:border-[#C6A15B] focus:outline-none resize-none"
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs text-[#A19E95] cursor-pointer">
        <input
          type="checkbox"
          checked={lgpdConsent}
          onChange={(e) => setLgpdConsent(e.target.checked)}
          className="mt-0.5 rounded border-white/20 bg-[#0B0B0D] accent-[#C6A15B]"
        />
        <span>
          Concordo com o tratamento dos meus dados para atendimento imobiliário por Bruno Diniz (CRECI-PE 21512), conforme LGPD.
        </span>
      </label>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#C6A15B] px-4 py-2.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D8B573] disabled:opacity-60 transition-colors whitespace-nowrap"
        >
          <Send className="h-4 w-4" />
          {submitting
            ? 'Enviando...'
            : visitMode
            ? 'Confirmar Solicitação de Visita'
            : ctaLabel || 'Enviar Solicitação'}
        </button>

        <a
          href={whatsappDirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            logAnalyticsEvent({
              eventType: 'whatsapp_click',
              path: window.location.pathname,
              targetId: propertyId || empreendimentoId,
              source: `${source}_whatsapp`,
            })
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-[#F5F2EB] hover:border-[#C6A15B]/50 hover:text-[#C6A15B] transition-colors whitespace-nowrap"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </form>
  );
}
