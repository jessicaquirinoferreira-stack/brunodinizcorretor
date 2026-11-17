import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { ArrowLeft, ExternalLink, KeyRound, Lock, ShieldAlert } from 'lucide-react';
import { auth, FIREBASE_PROJECT_ID, googleProvider } from '../../lib/firebase';
import { OFFICIAL_LOGO_URL } from '../../lib/seedData';

interface AdminLoginProps {
  onBackToSite: () => void;
  authErrorNotice?: string;
}

export function AdminLogin({ onBackToSite, authErrorNotice }: AdminLoginProps) {
  const [email, setEmail] = useState('admin@x.com');
  const [password, setPassword] = useState('admin4321');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsConsoleEnable, setNeedsConsoleEnable] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsConsoleEnable(false);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (
        (code === 'auth/user-not-found' || code === 'auth/invalid-credential') &&
        email.trim().toLowerCase() === 'admin@x.com' &&
        password === 'admin4321'
      ) {
        try {
          await createUserWithEmailAndPassword(auth, 'admin@x.com', 'admin4321');
          return;
        } catch (createErr: unknown) {
          const createCode = (createErr as { code?: string })?.code || '';
          if (createCode === 'auth/operation-not-allowed') {
            setNeedsConsoleEnable(true);
            setError(
              'O provedor E-mail/Senha ainda não foi ativado no Console do Firebase deste projeto. Ative-o no link abaixo ou entre imediatamente com o Google.'
            );
          } else {
            setError('Credenciais inválidas ou usuário não autorizado no Firebase Auth.');
          }
        }
      } else if (code === 'auth/operation-not-allowed') {
        setNeedsConsoleEnable(true);
        setError(
          'O provedor E-mail/Senha ainda não foi ativado no Console do Firebase. Ative-o no link abaixo ou entre com sua conta Google.'
        );
      } else {
        setError('Não foi possível autenticar com este e-mail e senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setNeedsConsoleEnable(false);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Falha no login Google: ${err.message}`
          : 'Não foi possível autenticar com Google.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F5F2EB] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs text-[#A19E95] hover:text-[#F5F2EB]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site público
        </button>

        <div className="rounded-xl border border-white/10 bg-[#131317] p-7 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={OFFICIAL_LOGO_URL}
                alt="Bruno Diniz Imóveis — Logotipo Oficial"
                referrerPolicy="no-referrer"
                className="h-12 w-auto max-w-[140px] object-contain brightness-110 contrast-110 drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]"
              />
              <span className="font-display text-2xl font-semibold tracking-[0.04em] text-[#F5F2EB]">
                Bruno Diniz
              </span>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#C6A15B]">
              <Lock className="h-3.5 w-3.5" />
              <span>Área Privada · CRECI-PE 21512</span>
            </div>
            <h1 className="font-display text-3xl font-semibold">
              Painel & CRM Bruno Diniz
            </h1>
            <p className="text-xs text-[#A19E95] leading-relaxed">
              Acesso exclusivo para gestão de imóveis, empreendimentos, landing page e pipeline comercial.
            </p>
          </div>

          {authErrorNotice && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span>{authErrorNotice}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#C6A15B] px-4 py-3 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D8B573] disabled:opacity-60 transition-colors"
          >
            <KeyRound className="h-4 w-4" />
            Entrar com Google (Acesso Proprietário)
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-white/10" />
            <span className="mx-3 text-[11px] uppercase tracking-wider text-[#A19E95]">
              ou E-mail e Senha
            </span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">E-mail administrativo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A19E95] mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0B0D] px-3.5 py-2.5 text-sm text-[#F5F2EB] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 space-y-2">
                <p>{error}</p>
                {needsConsoleEnable && (
                  <a
                    href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#C6A15B] hover:underline"
                  >
                    Abrir Firebase Authentication Providers
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-white/15 bg-[#1A1A20] px-4 py-2.5 text-sm font-medium text-[#F5F2EB] hover:border-[#C6A15B]/50 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Autenticando...' : 'Entrar com E-mail e Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
