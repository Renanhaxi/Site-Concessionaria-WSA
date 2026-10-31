'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import WsaLogo from '@/components/WsaLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 showroom-grid" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 showroom-spotlight" />

      <div className="relative z-10 w-full max-w-md card-machined rounded-3xl p-7 sm:p-9">
        <div className="text-center space-y-3 mb-7">
          <div className="flex justify-center">
            <WsaLogo size="md" />
          </div>

          <div className="pt-2">
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Portal do Lojista
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Autenticação protegida via cookie HttpOnly de servidor.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              E-mail corporativo
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="admin@wsaveiculos.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Senha de acesso
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#0A0A0D] border border-white/[0.06] text-[11px] text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-wsa-champagne flex-shrink-0" />
            <span>
              Conectado ao Supabase Auth (ou modo demonstração local antes de configurar o .env.local).
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
