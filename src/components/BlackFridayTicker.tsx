'use client';

import React from 'react';

export default function BlackFridayTicker() {
  const highlights = [
    { label: 'CONDIÇÃO ESPECIAL', detail: 'Seu usado vale até 90% da Tabela FIPE na troca' },
    { label: 'BLACK FRIDAY WSA', detail: 'Taxas reduzidas e entrada facilitada em até 60x' },
    { label: 'PROCEDÊNCIA GARANTIDA', detail: '100% do pátio com Laudo Cautelar aprovado' },
    { label: 'CAR HUNTER BELÉM', detail: 'Não encontrou no estoque? Buscamos o modelo exato para você' },
  ];

  return (
    <div className="relative overflow-hidden bg-[#0D0D11] border-b border-white/[0.06] py-2.5 select-none">
      {/* Subtle edge vignette masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#0D0D11] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#0D0D11] to-transparent z-10" />

      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
        {[...highlights, ...highlights, ...highlights].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 mx-7 text-xs whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-wsa-red flex-shrink-0" />
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.12em] text-wsa-champagne uppercase">
              {item.label}
            </span>
            <span className="text-zinc-300 font-normal">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
