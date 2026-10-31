'use client';

import React from 'react';
import { Search, X, ArrowUpDown, RotateCcw } from 'lucide-react';

export type SortOption = 'destaques' | 'menor-preco' | 'maior-preco' | 'menor-km' | 'mais-novos';

interface HeroSearchProps {
  selectedBrand: string;
  setSelectedBrand: (b: string) => void;
  priceFilter: string;
  setPriceFilter: (p: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onlyBlackFriday: boolean;
  setOnlyBlackFriday: (v: boolean) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  availableBrands: string[];
  totalResults: number;
}

const PRICE_RANGES = [
  { id: '', label: 'Qualquer valor' },
  { id: 'ate-75k', label: 'Até R$ 75 mil' },
  { id: '75k-100k', label: 'R$ 75 a 100 mil' },
  { id: '100k-150k', label: 'R$ 100 a 150 mil' },
  { id: 'acima-150k', label: 'Acima de R$ 150 mil' },
];

export default function HeroSearch({
  selectedBrand,
  setSelectedBrand,
  priceFilter,
  setPriceFilter,
  searchTerm,
  setSearchTerm,
  onlyBlackFriday,
  setOnlyBlackFriday,
  sortBy,
  setSortBy,
  availableBrands,
  totalResults,
}: HeroSearchProps) {
  const hasActiveFilters = Boolean(
    selectedBrand || priceFilter || searchTerm || onlyBlackFriday
  );

  const handleReset = () => {
    setSelectedBrand('');
    setPriceFilter('');
    setSearchTerm('');
    setOnlyBlackFriday(false);
  };

  return (
    <section className="relative pt-8 pb-10 sm:pt-14 sm:pb-16 overflow-hidden border-b border-white/[0.06]">
      {/* Architectural Showroom Ceiling Grid & Overhead Soft Light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 showroom-grid" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 showroom-spotlight" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Hero Header */}
        <div className="max-w-3xl space-y-3.5 sm:space-y-4">
          <div className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.15em] text-wsa-champagne">
            <span className="w-5 h-px bg-wsa-red" />
            <span>Showroom Belém · Tv. Alferes Costa, 486</span>
          </div>

          <h1 className="text-[30px] sm:text-5xl lg:text-[52px] font-bold tracking-[-0.03em] text-[#F5F5F7] font-display leading-[1.08]">
            Seminovos selecionados com procedência e garantia real.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
            Veículos periciados com laudo cautelar 100% aprovado, financiamento ágil e negociação transparente. Na troca, seu usado vale até{' '}
            <span className="text-zinc-100 font-semibold border-b border-wsa-champagne/40 pb-0.5">
              90% da Tabela FIPE
            </span>
            .
          </p>
        </div>

        {/* Tactile Command Search & Filter Console */}
        <div className="mt-7 sm:mt-10 card-machined rounded-2xl p-3.5 sm:p-5 space-y-4">
          {/* Top Bar: Instant Search + Clean Sort */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.75}
              />
              <input
                type="text"
                placeholder="Buscar por modelo, marca ou versão (ex: Civic, Onix, Corolla)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 sm:h-12 pl-10 pr-10 bg-[#0A0A0D] border border-white/[0.08] hover:border-white/[0.14] focus:border-white/[0.28] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-white bg-white/[0.05]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="relative sm:w-52">
              <ArrowUpDown
                className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.75}
              />
              <select
                aria-label="Ordenar veículos"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full h-11 sm:h-12 pl-9 pr-4 bg-[#0A0A0D] border border-white/[0.08] hover:border-white/[0.14] focus:border-white/[0.28] rounded-xl text-xs sm:text-[13px] font-medium text-zinc-200 focus:outline-none appearance-none cursor-pointer transition-colors"
              >
                <option value="destaques">Ordenar: Destaques</option>
                <option value="menor-preco">Menor valor</option>
                <option value="maior-preco">Maior valor</option>
                <option value="menor-km">Menor quilometragem</option>
                <option value="mais-novos">Ano mais recente</option>
              </select>
            </div>
          </div>

          {/* Middle Row: Thumb-Scrollable Brand & Offer Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
            <button
              type="button"
              onClick={() => {
                setSelectedBrand('');
                setOnlyBlackFriday(false);
              }}
              className={`h-8 px-3.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                !selectedBrand && !onlyBlackFriday
                  ? 'bg-[#F5F5F7] text-[#09090B] font-semibold shadow-sm'
                  : 'bg-[#0C0C0F] text-zinc-400 border border-white/[0.07] hover:text-zinc-200 hover:border-white/[0.14]'
              }`}
            >
              Todas as marcas
            </button>

            <button
              type="button"
              onClick={() => setOnlyBlackFriday(!onlyBlackFriday)}
              className={`h-8 px-3.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 ${
                onlyBlackFriday
                  ? 'bg-wsa-red text-white font-semibold shadow-crimson-subtle'
                  : 'bg-[#0C0C0F] text-zinc-300 border border-white/[0.07] hover:border-wsa-red/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  onlyBlackFriday ? 'bg-white' : 'bg-wsa-red'
                }`}
              />
              <span>Ofertas Black Friday</span>
            </button>

            <span className="h-4 w-px bg-white/[0.08] flex-shrink-0 mx-0.5" />

            {availableBrands.map((brand) => {
              const active = selectedBrand === brand;
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrand(active ? '' : brand)}
                  className={`h-8 px-3.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    active
                      ? 'bg-[#F5F5F7] text-[#09090B] font-semibold shadow-sm'
                      : 'bg-[#0C0C0F] text-zinc-400 border border-white/[0.07] hover:text-zinc-200 hover:border-white/[0.14]'
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>

          {/* Bottom Row: Tactile Price Range Pills + Live Result Count */}
          <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
              {PRICE_RANGES.map((range) => {
                const active = priceFilter === range.id;
                return (
                  <button
                    key={range.id || 'all'}
                    type="button"
                    onClick={() => setPriceFilter(active && range.id !== '' ? '' : range.id)}
                    className={`h-7 px-3 rounded-md text-[11.5px] whitespace-nowrap transition-colors flex-shrink-0 ${
                      active
                        ? 'bg-white/[0.11] text-white font-medium border border-white/[0.18]'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
              <span className="text-zinc-500 font-mono text-[11px]">
                <strong className="text-zinc-200 font-semibold">{totalResults}</strong>{' '}
                {totalResults === 1 ? 'veículo encontrado' : 'veículos disponíveis'}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs text-wsa-champagne hover:text-white font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
