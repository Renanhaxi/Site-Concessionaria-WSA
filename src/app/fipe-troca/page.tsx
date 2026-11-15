'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { captureUtmParams, getStoredUtmParams } from '@/lib/utmTracker';
import { registerLead } from '@/lib/store';
import { buildWhatsAppLink } from '@/lib/whatsapp';

export default function FipeTrocaPage() {
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [carKm, setCarKm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [targetCar, setTargetCar] = useState('');

  const [loading, setLoading] = useState(false);
  const [leadCode, setLeadCode] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState('');

  useEffect(() => {
    captureUtmParams();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !carModel.trim()) return;

    setLoading(true);
    try {
      const utms = getStoredUtmParams();
      const notes = `Usado para avaliação: ${carModel}, Ano ${carYear || 'N/I'}, ${
        carKm ? `${carKm} km` : 'Km N/I'
      }. Interesse na troca: ${targetCar || 'Conferir opções do pátio'}.`;

      const createdLead = await registerLead({
        name,
        phone,
        intent_type: 'troca_fipe',
        notes,
        utms,
      });

      const link = buildWhatsAppLink({
        leadCode: createdLead.lead_code,
        customerName: name,
        intentType: 'troca_fipe',
        notes,
      });

      setLeadCode(createdLead.lead_code);
      setWhatsAppUrl(link);
      setLoading(false);

      const win = window.open(link, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.assign(link);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen py-10 sm:py-16 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 showroom-grid" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 showroom-spotlight" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors h-9 px-3.5 rounded-lg bg-white/[0.04] border border-white/[0.08]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao catálogo</span>
        </Link>

        {/* Editorial Header */}
        <div className="space-y-3.5 max-w-2xl">
          <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.15em] text-wsa-champagne">
            <span className="w-5 h-px bg-wsa-champagne" />
            <span>Avaliação Transparente Belém</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-[-0.03em] text-[#F5F5F7] leading-[1.1]">
            Seu seminovo vale até{' '}
            <span className="text-wsa-champagne">90% da Tabela FIPE</span> na troca.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Preencha os dados básicos do seu veículo para iniciarmos sua pré-avaliação digital com protocolo garantido.
          </p>
        </div>

        {/* Form Card */}
        <div className="card-machined rounded-3xl p-6 sm:p-9">
          {!leadCode ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-white/[0.06] pb-4">
                <h2 className="text-lg font-display font-semibold text-white">
                  Ficha de pré-avaliação do seu veículo
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Resposta rápida diretamente com o avaliador da WSA Veículos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Marca, modelo e versão do seu usado
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Hyundai HB20 1.6 Vision / Fiat Argo Drive 1.0"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Ano Fab / Modelo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2019/2020"
                    value={carYear}
                    onChange={(e) => setCarYear(e.target.value)}
                    className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Quilometragem aprox.
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 52.000"
                    value={carKm}
                    onChange={(e) => setCarKm(e.target.value)}
                    className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Qual modelo pretende levar na troca?
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Honda Civic, Corolla, SUV ou quero sugestões do estoque"
                    value={targetCar}
                    onChange={(e) => setTargetCar(e.target.value)}
                    className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Seu nome
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Seu WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(91) 98888-8888"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-wsa-red hover:bg-wsa-redDark active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-crimson-subtle flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registrando protocolo...</span>
                  </>
                ) : (
                  <>
                    <span>Receber pré-avaliação no WhatsApp</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <h3 className="text-2xl font-display font-bold text-white">
                Solicitação de avaliação registrada
              </h3>
              <div className="py-3 px-6 bg-[#09090B] border border-white/[0.09] rounded-xl inline-block">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                  Protocolo WSA
                </span>
                <span className="text-2xl font-mono font-bold text-wsa-champagne">
                  {leadCode}
                </span>
              </div>
              <div className="max-w-xs mx-auto pt-2">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 px-6 rounded-xl bg-wsa-red hover:bg-wsa-redDark text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-crimson-subtle"
                >
                  <span>Abrir WhatsApp agora</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Clean FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[
            {
              q: 'Como alcanço até 90% da FIPE?',
              a: 'O percentual considera conservação estrutural, histórico de manutenção, quilometragem e liquidez do modelo.',
            },
            {
              q: 'Aceitam carro financiado?',
              a: 'Sim. Quitamos o saldo devedor diretamente junto à instituição financeira e aplicamos a diferença na entrada.',
            },
            {
              q: 'Como funciona a vistoria?',
              a: 'Iniciamos com pré-análise por fotos no WhatsApp e concluímos presencialmente em 20 minutos na Tv. Alferes Costa, 486.',
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2"
            >
              <h3 className="text-sm font-display font-semibold text-white">{faq.q}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
