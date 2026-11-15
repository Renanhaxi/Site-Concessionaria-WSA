'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  Users,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Database,
  Menu,
  X,
} from 'lucide-react';
import WsaLogo from '@/components/WsaLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    async function verify() {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;

        if (!data.authenticated) {
          router.replace('/admin/login');
          return;
        }

        setUserEmail(data.email || 'gestor@wsaveiculos.com.br');
        setSupabaseConnected(Boolean(data.supabaseConnected));
        setChecking(false);
      } catch {
        if (!cancelled) router.replace('/admin/login');
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-wsa-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  const navItems = [
    { label: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
    { label: 'Gestão de Estoque', href: '/admin/estoque', icon: Car },
    { label: 'Leads & Comissões', href: '/admin/leads', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F5F5F7] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0D0D11] border-r border-white/[0.07] flex-shrink-0">
        <div className="p-6 border-b border-white/[0.06]">
          <Link href="/admin" className="inline-block">
            <WsaLogo size="sm" />
          </Link>
          <span className="block text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 mt-2">
            Backoffice & Auditoria
          </span>
        </div>

        {/* Active Operator & DB Connection Status */}
        <div className="p-3.5 mx-4 my-4 rounded-xl bg-[#09090B] border border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate font-mono text-[11px]">{userEmail}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <Database className="w-3 h-3 text-zinc-400" />
            {supabaseConnected ? (
              <span className="text-emerald-400 font-semibold">
                Supabase Ativo (Servidor)
              </span>
            ) : (
              <span className="text-wsa-champagne">
                Modo Local (.env pendente)
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-wsa-red text-white font-semibold shadow-crimson-subtle'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Utility */}
        <div className="p-4 border-t border-white/[0.06] space-y-1.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Vitrine Pública</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3.5 bg-[#0D0D11] border-b border-white/[0.07]">
        <Link href="/admin" className="flex items-center gap-2">
          <WsaLogo size="sm" />
        </Link>

        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-[#0D0D11] border-b border-white/[0.07] p-4 space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-xs font-medium text-zinc-200 hover:bg-white/[0.05]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            onClick={() => setMobileNavOpen(false)}
            className="block py-2.5 px-3 rounded-lg text-xs text-zinc-400 hover:text-white"
          >
            Abrir Vitrine Pública
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full text-left py-2.5 px-3 text-xs text-red-400 font-medium"
          >
            Encerrar Sessão
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
