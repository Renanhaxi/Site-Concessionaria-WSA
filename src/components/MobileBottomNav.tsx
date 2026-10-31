'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, ArrowLeftRight, Compass, MessageSquareText } from 'lucide-react';
import LeadCaptureModal from './LeadCaptureModal';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [contactOpen, setContactOpen] = useState(false);

  // Hide on admin routes and vehicle detail page (which has its own dedicated conversion dock)
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/veiculo/')) {
    return null;
  }

  const navItems = [
    {
      label: 'Estoque',
      href: '/#estoque',
      active: pathname === '/',
      icon: Car,
    },
    {
      label: 'Troca FIPE',
      href: '/fipe-troca',
      active: pathname === '/fipe-troca',
      icon: ArrowLeftRight,
    },
    {
      label: 'Sob Medida',
      href: '/encomenda',
      active: pathname === '/encomenda',
      icon: Compass,
    },
  ];

  return (
    <>
      <nav
        aria-label="Navegação rápida mobile"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-dock pb-safe"
      >
        <div className="grid grid-cols-4 h-16 px-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  item.active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 ${item.active ? 'text-wsa-red' : ''}`}
                    strokeWidth={item.active ? 2.1 : 1.75}
                  />
                </div>
                <span className="text-[10px] font-medium tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-zinc-200 active:scale-95 transition-transform"
          >
            <div className="w-8 h-6 rounded-full bg-wsa-red/15 border border-wsa-red/40 flex items-center justify-center text-wsa-red">
              <MessageSquareText className="w-4 h-4" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-semibold tracking-tight text-white">
              Consultor
            </span>
          </button>
        </div>
      </nav>

      <LeadCaptureModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        intentType="compra_estoque"
        customTitle="Atendimento Prioritário WSA"
        customSubtitle="Informe seu nome e WhatsApp para iniciar seu atendimento com protocolo exclusivo."
      />
    </>
  );
}
