'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  Check,
  Share2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';
import { Vehicle, LeadIntentType } from '@/types';
import { getVehicleById } from '@/lib/store';
import { captureUtmParams } from '@/lib/utmTracker';
import LeadCaptureModal from '@/components/LeadCaptureModal';

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params?.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Lead Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalIntent, setModalIntent] = useState<LeadIntentType>('compra_estoque');
  const [modalNotes, setModalNotes] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Financing Simulator State
  const [downPayment, setDownPayment] = useState<number>(15000);
  const [months, setMonths] = useState<number>(48);

  useEffect(() => {
    captureUtmParams();

    async function loadVehicle() {
      if (!vehicleId) return;
      const data = await getVehicleById(vehicleId);
      if (data) {
        setVehicle(data);
        if (data.down_payment_suggested) {
          setDownPayment(data.down_payment_suggested);
        } else {
          setDownPayment(Math.round((data.promotional_price || data.price) * 0.25));
        }
      }
      setLoading(false);
    }

    loadVehicle();
  }, [vehicleId]);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-9 w-36 bg-white/[0.05] rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 aspect-[16/10] bg-white/[0.04] rounded-2xl" />
          <div className="lg:col-span-5 h-96 bg-white/[0.04] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Catálogo WSA
        </span>
        <h2 className="text-2xl font-display font-bold text-white">
          Veículo não disponível
        </h2>
        <p className="text-sm text-zinc-400 max-w-md">
          Este exemplar pode ter sido comercializado recentemente. Confira outras opções periciadas no pátio.
        </p>
        <Link
          href="/#estoque"
          className="h-11 px-6 rounded-xl bg-wsa-red hover:bg-wsa-redDark text-white font-semibold text-sm inline-flex items-center justify-center transition-colors"
        >
          Ver estoque atual
        </Link>
      </div>
    );
  }

  const effectivePrice = vehicle.promotional_price || vehicle.price;
  const hasPromo = Boolean(
    vehicle.promotional_price && vehicle.promotional_price < vehicle.price
  );
  const isSold = vehicle.status === 'vendido';

  // Indicative financing calculation (approx 1.49% a.m.)
  const financedAmount = Math.max(0, effectivePrice - downPayment);
  const monthlyRate = 0.0149;
  const simulatedInstallment =
    financedAmount > 0
      ? Math.round(
          (financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
            (Math.pow(1 + monthlyRate, months) - 1)
        )
      : 0;

  const images =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images
      : [
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=85',
        ];

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${vehicle.title} — WSA Veículos`,
          url: window.location.href,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenLead = (mode: 'compra' | 'simulacao' | 'troca') => {
    if (mode === 'simulacao') {
      setModalIntent('compra_estoque');
      setModalTitle(`Análise de financiamento — ${vehicle.model}`);
      setModalNotes(
        `Simulação no site: Entrada de ${formatBRL(downPayment)} + ${months}x de aprox. ${formatBRL(simulatedInstallment)}.`
      );
    } else if (mode === 'troca') {
      setModalIntent('troca_fipe');
      setModalTitle(`Dar meu usado na troca — ${vehicle.model}`);
      setModalNotes(`Desejo avaliar meu usado (até 90% FIPE) na troca pelo ${vehicle.title}.`);
    } else {
      setModalIntent('compra_estoque');
      setModalTitle(`Negociar ${vehicle.title}`);
      setModalNotes('');
    }
    setIsModalOpen(true);
  };

  const specs = [
    { label: 'Ano Fab/Mod', value: `${vehicle.year_fab}/${vehicle.year_model}` },
    { label: 'Quilometragem', value: `${vehicle.mileage.toLocaleString('pt-BR')} km` },
    { label: 'Transmissão', value: vehicle.transmission },
    { label: 'Combustível', value: vehicle.fuel_type },
    { label: 'Cor Externa', value: vehicle.color || 'Consulte' },
    { label: 'Final da Placa', value: vehicle.plate_end || '—' },
  ];

  return (
    <div className="min-h-screen py-6 sm:py-10 pb-28 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navigation & Share */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/#estoque"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors h-9 px-3.5 rounded-lg bg-white/[0.04] border border-white/[0.08]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Estoque</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white h-9 px-3.5 rounded-lg bg-white/[0.04] border border-white/[0.08] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link copiado' : 'Compartilhar'}</span>
          </button>
        </div>

        {/* Main 12-Col Showroom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Gallery, Technical Sheet & Equipment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Stage Gallery */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-[#0A0A0D] border border-white/[0.08] aspect-[16/10] shadow-machined">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                />

                {/* Top Badges */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  {vehicle.is_black_friday && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold bg-[#09090B]/85 backdrop-blur-md text-white border border-white/15">
                      <span className="w-1.5 h-1.5 rounded-full bg-wsa-red" />
                      Oferta Black Friday
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium bg-[#09090B]/80 backdrop-blur-md text-zinc-200 border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Laudo Cautelar Aprovado
                  </span>
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-3.5 right-3.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 font-mono text-[11px] text-zinc-200">
                  {activeImageIndex + 1} / {images.length}
                </div>

                {/* Prev / Next Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      aria-label="Foto anterior"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      aria-label="Próxima foto"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border transition-all ${
                        activeImageIndex === idx
                          ? 'border-white opacity-100 ring-1 ring-white/40'
                          : 'border-white/[0.08] opacity-55 hover:opacity-85'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${vehicle.title} foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Architectural Technical Spec Grid */}
            <div className="card-machined rounded-2xl p-6 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
                Especificações Técnicas
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                {specs.map((item) => (
                  <div
                    key={item.label}
                    className="p-3.5 rounded-xl bg-[#0A0A0D] border border-white/[0.05]"
                  >
                    <span className="text-[10.5px] font-mono uppercase tracking-wider text-zinc-500 block">
                      {item.label}
                    </span>
                    <strong className="text-sm font-mono font-semibold text-zinc-100 mt-1 block">
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment & Features Checklist */}
            <div className="card-machined rounded-2xl p-6 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400 block">
                Itens de Série & Destaques
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {vehicle.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-[13px] text-zinc-200"
                  >
                    <Check
                      className="w-3.5 h-3.5 text-wsa-champagne flex-shrink-0"
                      strokeWidth={2.2}
                    />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Provenance Guarantee Note */}
            <div className="rounded-2xl bg-[#0D0D11] border border-white/[0.06] p-5 sm:p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-wsa-champagne flex-shrink-0">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-display font-semibold text-white">
                  Certificação de Procedência WSA Veículos
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed">
                  Exemplar periciado com verificação completa de chassi, estrutura, motorização e histórico documental — sem passagem por leilão ou restrições.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Commercial Proposal & Financing Calculator */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            {/* Commercial Pricing Card */}
            <div className="card-machined rounded-2xl p-6 sm:p-7 space-y-5">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400 block mb-1.5">
                  {vehicle.brand} · {vehicle.version || vehicle.model}
                </span>
                <h1 className="text-2xl sm:text-[28px] font-display font-bold tracking-[-0.025em] text-[#F5F5F7] leading-tight">
                  {vehicle.title}
                </h1>
              </div>

              <div className="pt-4 border-t border-white/[0.07]">
                {hasPromo && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-zinc-500 line-through">
                      De {formatBRL(vehicle.price)}
                    </span>
                    <span className="text-[10.5px] font-mono font-medium text-wsa-champagne bg-wsa-champagne/10 px-1.5 py-0.5 rounded">
                      Economia de {formatBRL(vehicle.price - effectivePrice)}
                    </span>
                  </div>
                )}

                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-3xl sm:text-[36px] font-display font-bold tracking-[-0.03em] tabular-nums text-white leading-none">
                    {formatBRL(effectivePrice)}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    À vista ou financiado
                  </span>
                </div>
              </div>

              {/* Primary Desktop/Inline Actions */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  disabled={isSold}
                  onClick={() => handleOpenLead('compra')}
                  className="w-full h-12 px-6 rounded-xl bg-wsa-red hover:bg-wsa-redDark active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-crimson-subtle flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <span>
                    {isSold ? 'Veículo vendido' : 'Negociar no WhatsApp'}
                  </span>
                  {!isSold && <ArrowRight className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  disabled={isSold}
                  onClick={() => handleOpenLead('troca')}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] text-zinc-200 hover:text-white font-medium text-xs sm:text-[13px] transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-wsa-champagne" />
                  <span>Dar meu usado na troca (até 90% FIPE)</span>
                </button>
              </div>
            </div>

            {/* Interactive Financing Calculator */}
            <div className="card-machined rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-wsa-champagne">
                  Simulador de Parcelas
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Cálculo imediato
                </span>
              </div>

              {/* Down Payment Slider + 1-Tap Presets */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-zinc-400">Entrada (ou seu usado):</span>
                  <strong className="text-base font-mono font-bold tabular-nums text-white">
                    {formatBRL(downPayment)}
                  </strong>
                </div>

                <input
                  type="range"
                  min={5000}
                  max={Math.round(effectivePrice * 0.85)}
                  step={1000}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  aria-label="Valor da entrada"
                  className="w-full"
                />

                {/* Quick Mobile Entry Presets */}
                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  {[
                    { label: '20% entrada', ratio: 0.2 },
                    { label: '30% entrada', ratio: 0.3 },
                    { label: '50% entrada', ratio: 0.5 },
                  ].map((preset) => {
                    const presetVal = Math.round((effectivePrice * preset.ratio) / 1000) * 1000;
                    const isClose = Math.abs(downPayment - presetVal) < 1500;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setDownPayment(presetVal)}
                        className={`py-1.5 rounded-lg text-[11px] font-mono transition-colors border ${
                          isClose
                            ? 'bg-white/[0.1] text-white border-white/20 font-semibold'
                            : 'bg-[#0A0A0D] text-zinc-400 border-white/[0.06] hover:text-zinc-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Term Selector */}
              <div className="space-y-2">
                <span className="text-xs text-zinc-400 block">Prazo do financiamento:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[24, 36, 48, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMonths(m)}
                      className={`h-9 rounded-lg text-xs font-mono font-medium border transition-all ${
                        months === m
                          ? 'bg-[#F5F5F7] text-[#09090B] border-white font-bold'
                          : 'bg-[#0A0A0D] text-zinc-400 border-white/[0.07] hover:text-white'
                      }`}
                    >
                      {m}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Result Box */}
              <div className="p-4 rounded-xl bg-[#0A0A0D] border border-white/[0.07] flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Parcela estimada
                  </span>
                  <span className="text-xl sm:text-2xl font-display font-bold tabular-nums text-white mt-0.5 block">
                    {months}x de {formatBRL(simulatedInstallment)}
                  </span>
                </div>
                <span className="text-[10.5px] text-zinc-500 text-right max-w-[110px] leading-tight">
                  Sujeito a análise bancária por CPF
                </span>
              </div>

              <button
                type="button"
                disabled={isSold}
                onClick={() => handleOpenLead('simulacao')}
                className="w-full h-11 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.12] text-white font-semibold text-xs sm:text-[13px] transition-colors"
              >
                Aprovar esta simulação no WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Mobile Sticky Conversion Bar (Thumb Zone) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-dock px-4 py-3 pb-safe">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="min-w-0">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              {months}x {formatBRL(simulatedInstallment)}
            </span>
            <span className="block text-lg font-display font-bold tabular-nums text-white leading-tight">
              {formatBRL(effectivePrice)}
            </span>
          </div>

          <button
            type="button"
            disabled={isSold}
            onClick={() => handleOpenLead('compra')}
            className="h-11 px-5 rounded-xl bg-wsa-red hover:bg-wsa-redDark active:scale-95 text-white font-semibold text-[13px] shadow-crimson-subtle flex items-center gap-2 flex-shrink-0 transition-transform disabled:opacity-40"
          >
            <span>Simular proposta</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Commission-Protected Lead Modal */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={vehicle}
        intentType={modalIntent}
        customTitle={modalTitle}
        initialNotes={modalNotes}
      />
    </div>
  );
}
