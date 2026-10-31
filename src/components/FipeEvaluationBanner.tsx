'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

interface FipeEvaluationBannerProps {
  onOpenModal: () => void;
}

export default function FipeEvaluationBanner({ onOpenModal }: FipeEvaluationBannerProps) {
  return (
    <section className="my-12 sm:my-20">
      <div className="relative overflow-hidden rounded-3xl card-machined p-6 sm:p-10 lg:p-12">
        {/* Subtle architectural grid accent on top-right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 showroom-grid opacity-50"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Editorial Copy */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.15em] text-wsa-champagne">
              <span className="w-5 h-px bg-wsa-champagne" />
              <span>Programa de Troca Inteligente</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-display font-bold tracking-[-0.03em] text-[#F5F5F7] leading-[1.12]">
              Seu usado vale até{' '}
              <span className="text-wsa-champagne">90% da Tabela FIPE</span> na troca por um carro da WSA.
            </h2>

            <p className="text-sm sm:text-[15px] text-zinc-400 leading-relaxed max-w-2xl">
              Elimine o risco de anunciar por conta própria ou perder valor em repasses comuns. Realizamos a pré-avaliação pelo WhatsApp, quitamos eventual financiamento em aberto e aplicamos seu crédito na hora.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2.5 pt-1 text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-wsa-champagne" strokeWidth={2.2} />
                Pré-avaliação digital rápida
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-wsa-champagne" strokeWidth={2.2} />
                Quitação de saldo devedor
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-wsa-champagne" strokeWidth={2.2} />
                Modalidade troca com troco
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenModal}
                className="h-12 px-6 rounded-xl bg-wsa-red hover:bg-wsa-redDark active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-crimson-subtle inline-flex items-center justify-center gap-2"
              >
                <span>Solicitar avaliação rápida</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/fipe-troca"
                className="h-12 px-5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 hover:text-white font-medium text-xs sm:text-sm transition-colors inline-flex items-center justify-center"
              >
                Preencher ficha do meu usado
              </Link>
            </div>
          </div>

          {/* Visual Benchmark Comparison Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#0A0A0D]/90 border border-white/[0.08] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
                <span className="text-xs font-medium text-zinc-300">
                  Comparativo de Valorização
                </span>
                <span className="font-mono text-[10.5px] text-zinc-500 uppercase tracking-wider">
                  Ref. FIPE Belém
                </span>
              </div>

              <div className="space-y-4">
                {/* Bar 1: Market Average */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Média de repasse comum</span>
                    <span className="font-mono text-zinc-400">72% a 78%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full w-[74%] rounded-full bg-zinc-600" />
                  </div>
                </div>

                {/* Bar 2: WSA Valuation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-white font-semibold">Troca na WSA Veículos</span>
                    <span className="font-mono font-bold text-wsa-champagne">Até 90% FIPE</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-wsa-red to-wsa-champagne" />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                <span>Sujeito a vistoria física no showroom</span>
                <span className="font-mono text-zinc-300">Laudo na hora</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
