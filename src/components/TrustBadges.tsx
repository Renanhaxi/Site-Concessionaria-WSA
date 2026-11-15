'use client';

import React from 'react';
import { Award, ShieldCheck, FileCheck2, ArrowLeftRight } from 'lucide-react';

export default function TrustBadges() {
  const pillars = [
    {
      index: '01',
      title: 'Associada ASSOVEPA',
      desc: 'Homologada pela Associação dos Revendedores do Pará.',
      icon: Award,
    },
    {
      index: '02',
      title: 'Laudo Cautelar 100%',
      desc: 'Perícia estrutural completa: zero leilão ou sinistro.',
      icon: FileCheck2,
    },
    {
      index: '03',
      title: 'Garantia Documentada',
      desc: 'Segurança contratual de motor, câmbio e procedência.',
      icon: ShieldCheck,
    },
    {
      index: '04',
      title: 'Até 90% da FIPE',
      desc: 'Valorização real do seu seminovo como parte do pagamento.',
      icon: ArrowLeftRight,
    },
  ];

  return (
    <section
      aria-label="Diferenciais WSA Veículos"
      className="bg-[#0C0C0F] border-b border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.index}
                className="py-5 sm:py-7 sm:px-6 first:sm:pl-0 last:sm:pr-0 flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-wsa-champagne flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-500">{item.index}</span>
                    <h3 className="text-[13.5px] font-display font-semibold text-[#F5F5F7] tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
