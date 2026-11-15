'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  Database,
} from 'lucide-react';
import WsaLogo from '@/components/WsaLogo';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isRecoveryParam = searchParams.get('recovery') === '1';
  const isExpiredParam = searchParams.get('expired') === '1';
  const paramEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(paramEmail || 'renantonyel020@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [resetMode, setResetMode] = useState(isRecoveryParam);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [supabaseOnline, setSupabaseOnline] = useState<boolean | null>(null);
  const [alreadyAuthenticated, setAlreadyAuthenticated] = useState(false);
  const [error, setError] = useState(
    isExpiredParam
      ? 'O link de e-mail expirou ou já foi utilizado. Entre com sua senha ou redefina abaixo.'
      : ''
  );
  const [successMsg, setSuccessMsg] = useState(
    isRecoveryParam
      ? 'Link validado pelo Supabase! Defina sua nova senha abaixo ou acesse o painel.'
      : ''
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isRecoveryParam) {
      setResetMode(true);
      setSuccessMsg(
        'Link validado pelo Supabase! Defina sua nova senha abaixo ou acesse o painel.'
      );
    }
    if (paramEmail) {
      setEmail(paramEmail);
    }
  }, [isRecoveryParam, paramEmail]);

  useEffect(() => {
    let cancelled = false;
    async function checkStatus() {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        setSupabaseOnline(Boolean(data.supabaseConnected));
        setAlreadyAuthenticated(Boolean(data.authenticated));
      } catch {
        if (!cancelled) setSupabaseOnline(false);
      }
    }
    checkStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.authenticated) {
        setError(data.error || 'Credenciais inválidas.');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Falha de comunicação com o servidor.');
      setLoading(false);
    }
  };

  const handleDirectPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: (email || 'renantonyel020@gmail.com').trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.authenticated) {
        setError(data.error || 'Não foi possível redefinir a senha.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Senha atualizada no Supabase Auth! Entrando no painel...');
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Falha de comunicação ao atualizar a senha.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 showroom-grid" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 showroom-spotlight" />

      <div className="relative z-10 w-full max-w-md card-machined rounded-3xl p-7 sm:p-9">
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center">
            <WsaLogo size="md" />
          </div>

          <div className="pt-2">
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Portal do Lojista
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Autenticação protegida via Supabase Auth & cookie HttpOnly.
            </p>
          </div>

          {/* Live Supabase Connection Badge */}
          <div className="flex justify-center pt-1">
            {supabaseOnline === null ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Verificando conexão Supabase...</span>
              </span>
            ) : supabaseOnline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase Auth Conectado Online</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
                <Database className="w-3 h-3" />
                <span>Conexão de servidor em verificação</span>
              </span>
            )}
          </div>
        </div>

        {alreadyAuthenticated && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Sessão ativa detectada.</span>
            </span>
            <Link
              href="/admin"
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-semibold whitespace-nowrap transition-colors"
            >
              Ir ao Painel →
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {resetMode ? (
          <form onSubmit={handleDirectPasswordReset} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                E-mail cadastrado no Supabase
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="renantonyel020@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Nova senha de acesso (mín. 6 caracteres)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Digite a nova senha desejada"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-12 pl-4 pr-11 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white transition-colors"
                  aria-label={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-wsa-red hover:bg-wsa-redDark text-white font-semibold text-sm transition-all shadow-crimson-subtle flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando no Supabase...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Salvar Nova Senha e Entrar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setResetMode(false);
                setError('');
              }}
              className="w-full text-center text-xs text-zinc-400 hover:text-white transition-colors py-1"
            >
              Voltar para login com senha atual
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                E-mail corporativo
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="renantonyel020@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Senha de acesso
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(true);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] text-wsa-champagne hover:text-white transition-colors"
                >
                  Redefinir / Trocar Senha no Supabase
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-4 pr-11 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0A0D] border border-white/[0.06] text-[11px] text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-wsa-champagne flex-shrink-0" />
              <span>
                Autenticação integrada diretamente ao Supabase Auth da WSA Veículos.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-wsa-red hover:bg-wsa-redDark text-white font-semibold text-sm transition-all shadow-crimson-subtle flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Acessar Painel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retornar à vitrine pública</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-wsa-red animate-spin" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
