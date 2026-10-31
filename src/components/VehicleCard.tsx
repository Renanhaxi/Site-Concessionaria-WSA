'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Vehicle } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onOpenLeadModal: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, onOpenLeadModal }: VehicleCardProps) {
  const [imgIndex, setImgIndex] = useState(0);

  const isReserved = vehicle.status === 'reservado';
  const isSold = vehicle.status === 'vendido';
  const hasPromo = Boolean(
    vehicle.promotional_price && vehicle.promotional_price < vehicle.price
  );

  const effectivePrice = hasPromo ? vehicle.promotional_price! : vehicle.price;
  const discountAmount = hasPromo ? vehicle.price - vehicle.promotional_price! : 0;

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);

  const images =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images
      : [
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        ];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Compact transmission label for clean spec strip
  const shortTransmission = vehicle.transmission.includes('Automático')
    ? 'Automático'
    : vehicle.transmission;

  return (
    <article className="group card-machined-interactive rounded-2xl overflow-hidden flex flex-col">
      {/* Photo Frame (16:10 Automotive Aspect) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0A0A0D]">
        <Link href={`/veiculo/${vehicle.id}`} className="block w-full h-full">
          <img
            src={images[imgIndex]}
            alt={vehicle.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
          {/* Subtle bottom gradient for story indicator legibility */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </Link>

        {/* Top-Left Contextual Status Pill (Single, Restrained, Frosted) */}
        <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5">
          {isSold ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-medium tracking-wide bg-[#09090B]/85 backdrop-blur-md text-zinc-300 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              Vendido
            </span>
          ) : isReserved ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-medium tracking-wide bg-[#09090B]/85 backdrop-blur-md text-wsa-champagne border border-wsa-champagne/30">
              <span className="w-1.5 h-1.5 rounded-full bg-wsa-champagne" />
              Reservado
            </span>
          ) : vehicle.is_black_friday ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-semibold tracking-wide bg-[#09090B]/82 backdrop-blur-md text-white border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-wsa-red" />
              Oferta Black Friday
            </span>
          ) : vehicle.is_featured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-medium tracking-wide bg-[#09090B]/80 backdrop-blur-md text-zinc-200 border border-white/12">
              <span className="w-1.5 h-1.5 rounded-full bg-wsa-champagne" />
              Selecionado
            </span>
          ) : null}
        </div>

        {/* Top-Right Provenance Seal */}
        <div className="pointer-events-none absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-medium bg-[#09090B]/75 backdrop-blur-md text-zinc-200 border border-white/10">
            <ShieldCheck className="w-3 h-3 text-emerald-400" strokeWidth={2} />
            <span>Periciado</span>
          </span>
        </div>

        {/* Multi-Photo Navigation Controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Foto anterior"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Próxima foto"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Minimal Photo Progress Bars */}
            <div className="pointer-events-none absolute bottom-2.5 inset-x-4 flex items-center gap-1.5">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-[2px] flex-1 rounded-full transition-all ${
                    idx === imgIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          {/* Eyebrow + Title */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-mono uppercase tracking-[0.12em] text-zinc-400 font-medium">
                {vehicle.brand}
              </span>
              {vehicle.color && (
                <span className="text-zinc-500 text-[11px]">{vehicle.color}</span>
              )}
            </div>

            <Link href={`/veiculo/${vehicle.id}`} className="block group/title">
              <h3 className="text-[18px] font-display font-semibold tracking-[-0.02em] text-[#F5F5F7] group-hover/title:text-white leading-snug line-clamp-1">
                {vehicle.title}
              </h3>
            </Link>
          </div>

          {/* Architectural Technical Spec Strip */}
          <div className="grid grid-cols-3 items-center py-2 px-3 rounded-xl bg-[#0A0A0D]/80 border border-white/[0.05] text-xs">
            <div className="font-mono tabular-nums text-zinc-200 font-medium">
              {vehicle.year_fab}/{String(vehicle.year_model).slice(-2)}
            </div>
            <div className="font-mono tabular-nums text-zinc-300 text-center border-x border-white/[0.06] px-1">
              {(vehicle.mileage / 1000).toFixed(0)} mil km
            </div>
            <div className="text-zinc-300 text-right truncate pl-1.5 text-[11.5px]">
              {shortTransmission}
            </div>
          </div>
        </div>

        {/* Pricing & Conversion Block */}
        <div className="space-y-4 pt-1">
          <div>
            {hasPromo ? (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono tabular-nums text-zinc-500 line-through">
                  {formatBRL(vehicle.price)}
                </span>
                <span className="text-[10.5px] font-mono font-medium text-wsa-champagne bg-wsa-champagne/10 px-1.5 py-0.5 rounded">
                  -{formatBRL(discountAmount)}
                </span>
              </div>
            ) : (
              <div className="h-4" />
            )}

            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[24px] font-display font-bold tracking-[-0.025em] tabular-nums text-white leading-none">
                {formatBRL(effectivePrice)}
              </span>
            </div>

            {vehicle.installment_suggested && (
              <p className="text-[12px] text-zinc-400 mt-1.5">
                Entrada {formatBRL(vehicle.down_payment_suggested || 15000)} +{' '}
                <span className="text-zinc-200 font-medium">
                  {vehicle.installment_suggested}
                </span>
              </p>
            )}
          </div>

          {/* Dual Action Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenLeadModal(vehicle)}
              disabled={isSold}
              className="flex-1 h-11 px-4 rounded-xl bg-wsa-red hover:bg-wsa-redDark active:scale-[0.99] text-white text-[13px] font-semibold transition-all shadow-crimson-subtle disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center"
            >
              {isSold ? 'Veículo vendido' : 'Simular proposta'}
            </button>

            <Link
              href={`/veiculo/${vehicle.id}`}
              aria-label={`Ver ficha técnica de ${vehicle.title}`}
              className="h-11 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-zinc-200 hover:text-white text-[13px] font-medium transition-all flex items-center justify-center gap-1"
            >
              <span>Ficha</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
