'use client';

import React from 'react';
import { MapPin, Navigation, Clock, Phone, ArrowUpRight } from 'lucide-react';
import { WSA_PHONE_DISPLAY } from '@/lib/whatsapp';

export default function LocationMap() {
  const address = 'Tv. Alferes Costa, 486 — Sacramenta, Belém/PA';
  const cep = 'CEP 66123-030';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'WSA Veículos Tv Alferes Costa 486 Belém PA'
  )}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
    'Travessa Alferes Costa 486 Belém'
  )}&navigate=yes`;

  return (
    <section
      id="localizacao"
      className="py-16 sm:py-24 border-t border-white/[0.06] bg-[#0B0B0E]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Architectural Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.15em] text-wsa-champagne">
                <span className="w-5 h-px bg-wsa-red" />
                <span>Showroom Físico</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-display font-bold tracking-[-0.03em] text-[#F5F5F7] leading-tight">
                Visite nosso pátio em Belém.
              </h2>

              <p className="text-sm text-zinc-400 leading-relaxed">
                Estrutura coberta e iluminada na Travessa Alferes Costa para você avaliar cada detalhe do veículo com calma, transparência e segurança.
              </p>
            </div>

            <div className="rounded-2xl card-machined divide-y divide-white/[0.06]">
              <div className="p-4 flex items-start gap-3.5">
                <MapPin className="w-4 h-4 text-wsa-red flex-shrink-0 mt-1" strokeWidth={1.8} />
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Endereço
                  </span>
                  <p className="text-sm font-medium text-white mt-0.5">{address}</p>
                  <span className="text-xs text-zinc-400 font-mono">{cep}</span>
                </div>
              </div>

              <div className="p-4 flex items-start gap-3.5">
                <Clock
                  className="w-4 h-4 text-wsa-champagne flex-shrink-0 mt-1"
                  strokeWidth={1.8}
                />
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Expediente
                  </span>
                  <p className="text-xs sm:text-[13px] text-zinc-200 mt-0.5">
                    Segunda a Sexta: <span className="font-mono text-white">08h00 – 18h00</span>
                  </p>
                  <p className="text-xs sm:text-[13px] text-zinc-200">
                    Sábado: <span className="font-mono text-white">08h00 – 13h00</span>
                  </p>
                </div>
              </div>

              <div className="p-4 flex items-start gap-3.5">
                <Phone className="w-4 h-4 text-zinc-300 flex-shrink-0 mt-1" strokeWidth={1.8} />
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Central Comercial
                  </span>
                  <p className="text-sm font-mono font-semibold text-white mt-0.5">
                    {WSA_PHONE_DISPLAY}
                  </p>
                </div>
              </div>
            </div>

            {/* 1-Tap Mobile Navigation Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-4 rounded-xl bg-wsa-red hover:bg-wsa-redDark text-white font-semibold text-xs sm:text-[13px] transition-all shadow-crimson-subtle flex items-center justify-center gap-2"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </a>

              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] text-zinc-200 hover:text-white font-medium text-xs sm:text-[13px] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Abrir no Waze</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
              </a>
            </div>
          </div>

          {/* Right Map Frame */}
          <div className="lg:col-span-7 h-[340px] sm:h-[430px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#121215] relative shadow-machined">
            <iframe
              title="Localização WSA Veículos em Belém"
              src="https://maps.google.com/maps?q=Travessa+Alferes+Costa+486+Sacramenta+Belem+PA&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0 grayscale contrast-125 brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-500"
              allowFullScreen
              loading="lazy"
            />
            <div className="pointer-events-none absolute bottom-3.5 left-3.5 bg-[#09090B]/88 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-wsa-red" />
              <span className="font-medium text-white">WSA Veículos</span>
              <span className="text-zinc-500">·</span>
              <span className="text-zinc-400">Sacramenta, Belém</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
