'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Clock, Menu, X, Lock, ArrowUpRight, PhoneCall } from 'lucide-react';
import WsaLogo from './WsaLogo';
import LeadCaptureModal from './LeadCaptureModal';
import { WSA_PHONE_DISPLAY } from '@/lib/whatsapp';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { label: 'Estoque', href: '/#estoque', active: pathname === '/' },
    {
      label: 'Troca FIPE',
      href: '/fipe-troca',
      badge: 'Até 90%',
      active: pathname === '/fipe-troca',
    },
    { label: 'Sob Encomenda', href: '/encomenda', active: pathname === '/encomenda' },
    { label: 'Showroom', href: '/#localizacao', active: false },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#09090B]/88 backdrop-blur-xl border-b border-white/[0.07]">
        {/* Architectural Top Utility Strip (Desktop/Tablet) */}
        <div className="hidden sm:block bg-[#0C0C0F] border-b border-white/[0.05] px-4 lg:px-8 py-1.5 text-[11px] text-zinc-400">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-wsa-red" strokeWidth={1.75} />
                <span>Tv. Alferes Costa, 486 — Sacramenta, Belém/PA</span>
              </span>
              <span className="hidden md:inline-block h-3 w-px bg-white/10" />
              <span className="hidden md:flex items-center gap-1.5 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Associada Oficial ASSOVEPA</span>
              </span>
            </div>

            <div className="flex items-center gap-5">
              <span className="hidden lg:flex items-center gap-1.5 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.75} />
                <span>Seg a Sex: 08h–18h · Sáb: 08h–13h</span>
              </span>
              <Link
                href="/admin/login"
                className="text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-1 font-medium"
              >
                <Lock className="w-3 h-3" strokeWidth={1.75} />
                <span>Portal Lojista</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[74px]">
            {/* Official Vector Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 focus:outline-none group"
              aria-label="WSA Veículos - Página inicial"
            >
              <WsaLogo size="md" className="group-hover:opacity-95 transition-opacity" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-[13.5px] font-medium transition-all flex items-center gap-2 ${
                    item.active
                      ? 'text-white bg-white/[0.05]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-wsa-champagne/15 text-wsa-champagne border border-wsa-champagne/25">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setLeadModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#16161B] hover:bg-[#1D1D24] border border-white/[0.1] hover:border-white/[0.18] text-white text-xs font-semibold transition-all shadow-sm active:scale-[0.99]"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Consultor Online</span>
                <span className="hidden xl:inline text-zinc-400 font-mono font-normal pl-1 border-l border-white/10">
                  {WSA_PHONE_DISPLAY}
                </span>
              </button>

              {/* Mobile Quick Call / Menu */}
              <button
                type="button"
                onClick={() => setLeadModalOpen(true)}
                className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-wsa-red text-white text-xs font-semibold shadow-crimson-subtle active:scale-95 transition-transform"
              >
                <PhoneCall className="w-3.5 h-3.5" strokeWidth={2} />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors"
                aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Clean Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/[0.07] bg-[#0D0D10] px-4 pt-3 pb-5 space-y-1.5 animate-fade-in">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 px-3.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-white/[0.04]"
              >
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-wsa-champagne bg-wsa-champagne/10 border border-wsa-champagne/25">
                      {item.badge}
                    </span>
                  )}
                </span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500" />
              </Link>
            ))}

            <div className="pt-3 mt-2 border-t border-white/[0.06] px-3.5 space-y-2 text-xs text-zinc-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-wsa-red flex-shrink-0" />
                <span>Tv. Alferes Costa, 486 — Sacramenta, Belém/PA</span>
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-500">Seg–Sex 08h–18h · Sáb 08h–13h</span>
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Lojista
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <LeadCaptureModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        intentType="compra_estoque"
        customTitle="Falar com Consultor WSA"
        customSubtitle="Atendimento rápido pelo WhatsApp com protocolo exclusivo de negociação."
      />
    </>
  );
}
