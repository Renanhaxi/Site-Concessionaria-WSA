'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, KeyRound, ArrowRight, Handshake } from 'lucide-react';

interface CustomOrderSectionProps {
  onOpenModal: (prefilledNote?: string) => void;
  onOpenConsignacaoModal?: () => void;
}

const POPULAR_HUNTS = [
  'Toyota Hilux SRX',
  'Honda Civic Touring',
  'Corolla XEi / Altis',
  'Jeep Compass T270',
  'Chevrolet Onix Premier',
  'BMW 320i M Sport',
];

export default function CustomOrderSection({
  onOpenModal,
  onOpenConsignacaoModal,
}: CustomOrderSectionProps) {
  const steps = [
    {
      step: '01',
      title: 'Especificação sob medida',
      desc: 'Você define modelo, ano, motorização, faixa de quilometragem e orçamento ideal.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Curadoria e perícia cautelar',
      desc: 'Rastreamos exemplares selecionados e validamos estrutura, histórico e mecânica.',
      icon: ShieldCheck,
    },
    {
      step: '03',
      title: 'Entrega garantida em Belém',
      desc: 'O veículo chega revisado, higienizado e com garantia contratual no nosso showroom.',
      icon: KeyRound,
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header + Popular Models */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 space-y-3.5">
            <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.15em] text-wsa-champagne">
              <span className="w-5 h-px bg-wsa-red" />
              <span>Captação Ativa · Car Hunter WSA</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-display font-bold tracking-[-0.03em] text-[#F5F5F7] leading-[1.12]">
              Não encontrou o modelo exato no pátio? Nós localizamos para você.
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-sm text-zinc-400 leading-relaxed">
              Do hatch turbo econômico ao sedã ou SUV premium: nossa equipe busca o veículo em todo o país com blindagem contra carros de leilão ou sinistrados.
            </p>
          </div>
        </div>

        {/* 3-Step Architectural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="card-machined rounded-2xl p-6 flex flex-col justify-between gap-6"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-200">
                    <Icon className="w-4 h-4 text-wsa-red" strokeWidth={1.8} />
                  </div>
                  <span className="font-mono text-xs font-semibold tracking-widest text-zinc-500">
                    ETAPA {item.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-display font-semibold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Quick-Request Chips + Dual Action */}
        <div className="rounded-2xl bg-[#0D0D11] border border-white/[0.06] p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <span className="text-xs font-mono uppercase tracking-[0.12em] text-zinc-400 block">
              Pedidos frequentes — toque para encomendar:
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_HUNTS.map((car) => (
                <button
                  key={car}
                  type="button"
                  onClick={() => onOpenModal(`Tenho interesse em encomendar: ${car}`)}
                  className="px-3 py-1.5 rounded-lg bg-[#141419] hover:bg-[#1C1C23] border border-white/[0.07] hover:border-white/[0.18] text-xs text-zinc-300 hover:text-white transition-all"
                >
                  {car}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => onOpenModal()}
              className="h-11 px-6 rounded-xl bg-wsa-red hover:bg-wsa-redDark text-white font-semibold text-xs sm:text-sm transition-all shadow-crimson-subtle inline-flex items-center justify-center gap-2"
            >
              <span>Encomendar veículo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/encomenda"
              className="h-11 px-5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 hover:text-white font-medium text-xs sm:text-sm transition-colors inline-flex items-center justify-center"
            >
              Ficha detalhada
            </Link>
          </div>
        </div>

        {/* Consignação Segura Strip */}
        {onOpenConsignacaoModal && (
          <div className="rounded-2xl card-machined p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-wsa-champagne/10 border border-wsa-champagne/25 flex items-center justify-center text-wsa-champagne flex-shrink-0">
                <Handshake className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-display font-semibold text-white tracking-tight">
                  Quer vender seu carro com segurança e visibilidade?
                </h3>
                <p className="text-xs sm:text-[13.5px] text-zinc-400 max-w-2xl leading-relaxed">
                  Aceitamos veículos consignados em nosso showroom iluminado em Belém. Cuidamos das fotos, financiamento para o comprador e segurança financeira total na transferência.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenConsignacaoModal}
              className="h-11 px-5 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.12] text-white font-semibold text-xs sm:text-[13px] whitespace-nowrap transition-colors flex-shrink-0"
            >
              Consignar meu carro
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
