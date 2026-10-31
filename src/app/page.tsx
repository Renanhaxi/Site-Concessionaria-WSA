'use client';

import React, { useState, useEffect, useMemo } from 'react';
import BlackFridayTicker from '@/components/BlackFridayTicker';
import HeroSearch, { SortOption } from '@/components/HeroSearch';
import VehicleCard from '@/components/VehicleCard';
import LeadCaptureModal from '@/components/LeadCaptureModal';
import FipeEvaluationBanner from '@/components/FipeEvaluationBanner';
import CustomOrderSection from '@/components/CustomOrderSection';
import TrustBadges from '@/components/TrustBadges';
import LocationMap from '@/components/LocationMap';
import { Vehicle, LeadIntentType } from '@/types';
import { fetchVehicles } from '@/lib/store';
import { captureUtmParams } from '@/lib/utmTracker';
import { SearchX, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyBlackFriday, setOnlyBlackFriday] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('destaques');

  // Lead Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [modalIntentType, setModalIntentType] = useState<LeadIntentType>('compra_estoque');
  const [customModalTitle, setCustomModalTitle] = useState<string | undefined>();
  const [customModalSubtitle, setCustomModalSubtitle] = useState<string | undefined>();
  const [modalInitialNotes, setModalInitialNotes] = useState<string>('');

  useEffect(() => {
    captureUtmParams();

    async function loadData() {
      try {
        const data = await fetchVehicles();
        setVehicles(data);
      } catch (err) {
        console.error('Erro ao carregar estoque:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const availableBrands = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.brand));
    return Array.from(set).sort();
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const filtered = vehicles.filter((v) => {
      if (selectedBrand && v.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      if (onlyBlackFriday && !v.is_black_friday) {
        return false;
      }

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchTitle = v.title.toLowerCase().includes(query);
        const matchBrand = v.brand.toLowerCase().includes(query);
        const matchModel = v.model.toLowerCase().includes(query);
        const matchVersion = v.version?.toLowerCase().includes(query);
        if (!matchTitle && !matchBrand && !matchModel && !matchVersion) return false;
      }

      const effectivePrice = v.promotional_price || v.price;
      if (priceFilter === 'ate-75k' && effectivePrice > 75000) return false;
      if (priceFilter === '75k-100k' && (effectivePrice < 75000 || effectivePrice > 100000))
        return false;
      if (priceFilter === '100k-150k' && (effectivePrice < 100000 || effectivePrice > 150000))
        return false;
      if (priceFilter === 'acima-150k' && effectivePrice <= 150000) return false;

      return true;
    });

    return [...filtered].sort((a, b) => {
      const priceA = a.promotional_price || a.price;
      const priceB = b.promotional_price || b.price;

      if (sortBy === 'menor-preco') return priceA - priceB;
      if (sortBy === 'maior-preco') return priceB - priceA;
      if (sortBy === 'menor-km') return a.mileage - b.mileage;
      if (sortBy === 'mais-novos') return b.year_model - a.year_model;

      // Default: Destaques & disponíveis primeiro
      if (a.status === 'disponivel' && b.status !== 'disponivel') return -1;
      if (a.status !== 'disponivel' && b.status === 'disponivel') return 1;
      return Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured));
    });
  }, [vehicles, selectedBrand, priceFilter, searchTerm, onlyBlackFriday, sortBy]);

  const handleOpenVehicleModal = (veh: Vehicle) => {
    setActiveVehicle(veh);
    setModalIntentType('compra_estoque');
    setCustomModalTitle(`Simular proposta — ${veh.model}`);
    setCustomModalSubtitle(
      'Receba cálculo de parcelas, avaliação na troca e atendimento prioritário no WhatsApp.'
    );
    setModalInitialNotes('');
    setIsModalOpen(true);
  };

  const handleOpenFipeModal = () => {
    setActiveVehicle(null);
    setModalIntentType('troca_fipe');
    setCustomModalTitle('Avaliar meu usado (Até 90% FIPE)');
    setCustomModalSubtitle(
      'Informe seu contato para iniciarmos a pré-avaliação do seu veículo.'
    );
    setModalInitialNotes('');
    setIsModalOpen(true);
  };

  const handleOpenOrderModal = (prefilledNote?: string) => {
    setActiveVehicle(null);
    setModalIntentType('encomenda_personalizada');
    setCustomModalTitle('Encomendar veículo sob medida');
    setCustomModalSubtitle(
      'Nossa equipe localiza o modelo desejado com laudo cautelar aprovado.'
    );
    setModalInitialNotes(prefilledNote || '');
    setIsModalOpen(true);
  };

  const handleOpenConsignacaoModal = () => {
    setActiveVehicle(null);
    setModalIntentType('consignacao');
    setCustomModalTitle('Consignação Executiva WSA');
    setCustomModalSubtitle(
      'Venda seu veículo com segurança jurídica, fotos de estúdio e vitrine qualificada em Belém.'
    );
    setModalInitialNotes('Desejo informações para consignar meu veículo na WSA.');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Editorial Campaign Strip */}
      <BlackFridayTicker />

      {/* Showroom Hero & Command Filter Console */}
      <HeroSearch
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onlyBlackFriday={onlyBlackFriday}
        setOnlyBlackFriday={setOnlyBlackFriday}
        sortBy={sortBy}
        setSortBy={setSortBy}
        availableBrands={availableBrands}
        totalResults={filteredVehicles.length}
      />

      {/* Architectural Provenance Pillars */}
      <TrustBadges />

      {/* Main Inventory Section */}
      <section
        id="estoque"
        className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-wsa-champagne block">
              Acervo Periciado
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-[-0.025em] text-[#F5F5F7]">
              Estoque disponível em Belém
            </h2>
          </div>

          <p className="text-xs font-mono text-zinc-400">
            Exibindo <span className="text-white font-semibold">{filteredVehicles.length}</span> de{' '}
            <span className="text-zinc-300">{vehicles.length}</span> veículos no pátio
          </p>
        </div>

        {loading ? (
          /* Tactile Skeleton Grid (Zero layout shift) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="rounded-2xl card-machined overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/10] bg-white/[0.04]" />
                <div className="p-5 space-y-4">
                  <div className="h-3 w-20 bg-white/[0.06] rounded" />
                  <div className="h-5 w-3/4 bg-white/[0.08] rounded" />
                  <div className="h-9 w-full bg-white/[0.04] rounded-xl" />
                  <div className="h-7 w-1/2 bg-white/[0.08] rounded" />
                  <div className="h-11 w-full bg-white/[0.06] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onOpenLeadModal={handleOpenVehicleModal}
              />
            ))}
          </div>
        ) : (
          <div className="p-10 sm:p-14 text-center rounded-3xl card-machined space-y-4 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
              <SearchX className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-display font-semibold text-white">
                Nenhum veículo corresponde aos filtros atuais
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Com o serviço Car Hunter WSA, localizamos o modelo exato que você deseja com vistoria cautelar completa.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenOrderModal(searchTerm ? `Procuro: ${searchTerm}` : '')}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-wsa-red hover:bg-wsa-redDark text-white font-semibold text-xs sm:text-sm transition-all shadow-crimson-subtle inline-flex items-center justify-center gap-2"
              >
                <span>Encomendar este modelo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('');
                  setPriceFilter('');
                  setSearchTerm('');
                  setOnlyBlackFriday(false);
                }}
                className="w-full sm:w-auto h-11 px-5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 text-xs sm:text-sm font-medium transition-colors"
              >
                Ver todo o estoque
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 90% FIPE Trade-In Benchmark Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FipeEvaluationBanner onOpenModal={handleOpenFipeModal} />
      </div>

      {/* Car Hunter & Consignação Section */}
      <CustomOrderSection
        onOpenModal={handleOpenOrderModal}
        onOpenConsignacaoModal={handleOpenConsignacaoModal}
      />

      {/* Physical Showroom & Navigation */}
      <LocationMap />

      {/* Mobile Bottom Sheet / Desktop Modal for Commission-Protected Lead Capture */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={activeVehicle}
        intentType={modalIntentType}
        customTitle={customModalTitle}
        customSubtitle={customModalSubtitle}
        initialNotes={modalInitialNotes}
      />
    </div>
  );
}
