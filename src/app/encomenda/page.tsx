'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { captureUtmParams, getStoredUtmParams } from '@/lib/utmTracker';
import { registerLead } from '@/lib/store';
import { buildWhatsAppLink } from '@/lib/whatsapp';

const QUICK_MODELS = [
  'Toyota Hilux SRX',
  'Honda Civic Touring',
  'Toyota Corolla Altis',
  'Jeep Compass T270',
  'BMW 320i M Sport',
  'Chevrolet Onix Premier',
];

export default function EncomendaPage() {
  const [model, setModel] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

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
    if (!name.trim() || !phone.trim() || !model.trim()) return;

    setLoading(true);
    try {
      const utms = getStoredUtmParams();
      const orderNotes = `Encomenda Car Hunter: ${model}, Ano mín.: ${
        yearMin || 'A combinar'
      }, Orçamento: ${maxBudget || 'A combinar'}. Preferências: ${
        notes || 'Sem observações extras'
      }.`;

      const createdLead = await registerLead({
        name,
        phone,
        intent_type: 'encomenda_personalizada',
        notes: orderNotes,
        utms,
      });

      const link = buildWhatsAppLink({
        leadCode: createdLead.lead_code,
        customerName: name,
        intentType: 'encomenda_personalizada',
        notes: orderNotes,
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

        {/* Header */}
        <div className="space-y-3.5 max-w-2xl">
          <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.15em] text-wsa-champagne">
            <span className="w-5 h-px bg-wsa-red" />
            <span>Serviço Car Hunter WSA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-[-0.03em] text-[#F5F5F7] leading-[1.1]">
            Encomende seu próximo carro sob medida.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Nossa equipe rastreia, pericia com laudo cautelar completo e entrega o veículo revisado e garantido em Belém.
          </p>
        </div>

        {/* Form Card */}
        <div className="card-machined rounded-3xl p-6 sm:p-9">
          {!leadCode ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Quick Select Pills */}
              <div className="space-y-2 pb-4 border-b border-white/[0.06]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Sugestões rápidas — toque para preencher:
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_MODELS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setModel(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                        model === item
                          ? 'bg-white text-black border-white font-semibold'
                          : 'bg-[#09090B] text-zinc-300 border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Marca e modelo desejado
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jeep Compass Longitude / BMW 320i / Hilux SRX"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Ano mínimo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2021 em diante"
                    value={yearMin}
                    onChange={(e) => setYearMin(e.target.value)}
                    className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Faixa de investimento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Até R$ 140.000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full h-12 px-4 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Preferências (cor, teto solar, troca)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Preferência por cor branca ou cinza, único dono"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
                    <span>Registrando encomenda...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar busca personalizada no WhatsApp</span>
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
                Encomenda registrada com sucesso
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
                  <span>Abrir conversa com consultor</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
