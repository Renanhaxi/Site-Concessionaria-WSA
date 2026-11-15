'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Upload,
  Loader2,
  ImagePlus,
} from 'lucide-react';
import { Vehicle, VehicleStatus } from '@/types';
import { fetchVehicles, saveVehicle, deleteVehicle } from '@/lib/store';

export default function AdminEstoquePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [yearFab, setYearFab] = useState<number>(new Date().getFullYear());
  const [yearModel, setYearModel] = useState<number>(new Date().getFullYear());
  const [mileage, setMileage] = useState<number>(0);
  const [transmission, setTransmission] = useState('Automático');
  const [fuelType, setFuelType] = useState('Flex');
  const [color, setColor] = useState('Prata');
  const [plateEnd, setPlateEnd] = useState('0');
  const [price, setPrice] = useState<number>(0);
  const [promoPrice, setPromoPrice] = useState<number | undefined>();
  const [downPayment, setDownPayment] = useState<number | undefined>();
  const [installment, setInstallment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBlackFriday, setIsBlackFriday] = useState(false);
  const [status, setStatus] = useState<VehicleStatus>('disponivel');
  const [saving, setSaving] = useState(false);

  const loadVehicles = async () => {
    setLoading(true);
    const data = await fetchVehicles();
    setVehicles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setTitle('');
    setBrand('');
    setModel('');
    setVersion('');
    setYearFab(2022);
    setYearModel(2022);
    setMileage(30000);
    setTransmission('Automático');
    setFuelType('Flex');
    setColor('Preto');
    setPlateEnd('5');
    setPrice(79900);
    setPromoPrice(undefined);
    setDownPayment(20000);
    setInstallment('48x de R$ 1.690');
    setImages([]);
    setManualImageUrl('');
    setUploadError('');
    setFeaturesText(
      'Ar-condicionado, Direção elétrica, Vidros elétricos, Câmera de ré, Rodas de liga'
    );
    setIsFeatured(false);
    setIsBlackFriday(false);
    setStatus('disponivel');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setTitle(v.title);
    setBrand(v.brand);
    setModel(v.model);
    setVersion(v.version || '');
    setYearFab(v.year_fab);
    setYearModel(v.year_model);
    setMileage(v.mileage);
    setTransmission(v.transmission);
    setFuelType(v.fuel_type);
    setColor(v.color || '');
    setPlateEnd(v.plate_end || '');
    setPrice(v.price);
    setPromoPrice(v.promotional_price);
    setDownPayment(v.down_payment_suggested);
    setInstallment(v.installment_suggested || '');
    setImages(v.images || []);
    setManualImageUrl('');
    setUploadError('');
    setFeaturesText((v.features || []).join(', '));
    setIsFeatured(Boolean(v.is_featured));
    setIsBlackFriday(Boolean(v.is_black_friday));
    setStatus(v.status);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploadingPhotos(true);
    setUploadError('');

    try {
      const formData = new FormData();
      Array.from(fileList).forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Erro ao enviar fotos.');
      } else if (Array.isArray(data.urls)) {
        setImages((prev) => [...prev, ...data.urls]);
      }
    } catch {
      setUploadError('Falha de rede ao enviar fotos para o Storage.');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleAddManualUrl = () => {
    const trimmed = manualImageUrl.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setManualImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !brand || !model || !price) return;

    setSaving(true);
    const featuresArray = featuresText
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const finalImages =
      images.length > 0
        ? images
        : manualImageUrl.trim()
        ? [manualImageUrl.trim()]
        : [
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=85',
          ];

    const vehicleData = {
      ...(editingVehicle ? { id: editingVehicle.id } : {}),
      title,
      brand,
      model,
      version,
      year_fab: Number(yearFab),
      year_model: Number(yearModel),
      mileage: Number(mileage),
      transmission,
      fuel_type: fuelType,
      color,
      plate_end: plateEnd,
      price: Number(price),
      promotional_price: promoPrice ? Number(promoPrice) : undefined,
      down_payment_suggested: downPayment ? Number(downPayment) : undefined,
      installment_suggested: installment,
      images: finalImages,
      features: featuresArray,
      is_featured: isFeatured,
      is_black_friday: isBlackFriday,
      status,
    };

    await saveVehicle(vehicleData as any);
    setSaving(false);
    setIsModalOpen(false);
    loadVehicles();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente remover este veículo do estoque?')) {
      await deleteVehicle(id);
      loadVehicles();
    }
  };

  const handleQuickStatusChange = async (v: Vehicle, newStatus: VehicleStatus) => {
    await saveVehicle({ ...v, status: newStatus });
    loadVehicles();
  };

  const filtered = vehicles.filter(
    (v) =>
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Gestão do Estoque
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Suba fotos direto da galeria para o Supabase Storage, ajuste preços e status em tempo real.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-wsa-red hover:bg-wsa-redDark text-white font-semibold text-xs shadow-crimson-subtle transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Veículo</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar no estoque por marca ou modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-white/[0.08] rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-white/25"
        />
      </div>

      {/* Vehicles Table */}
      <div className="card-machined rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.07] text-zinc-400 font-mono text-[10.5px] uppercase tracking-wider bg-[#0C0C0F]">
                <th className="py-3.5 px-4">Veículo</th>
                <th className="py-3.5 px-4">Ano / Km</th>
                <th className="py-3.5 px-4">Preço</th>
                <th className="py-3.5 px-4">Campanha</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Carregando estoque...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Nenhum veículo encontrado no estoque.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-black/50 flex-shrink-0 border border-white/10">
                          <img
                            src={v.images[0] || ''}
                            alt={v.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white line-clamp-1">
                            {v.title}
                          </p>
                          <span className="text-[10.5px] font-mono text-zinc-400 uppercase">
                            {v.brand} · {v.images.length} foto(s)
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      <div>
                        {v.year_fab}/{v.year_model}
                      </div>
                      <div className="text-[10.5px] text-zinc-500">
                        {v.mileage.toLocaleString('pt-BR')} km
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-white">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                        }).format(v.promotional_price || v.price)}
                      </div>
                      {v.promotional_price && (
                        <div className="text-[10.5px] text-zinc-500 line-through">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            maximumFractionDigits: 0,
                          }).format(v.price)}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {v.is_black_friday && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-wsa-red/20 text-red-300 border border-wsa-red/30">
                            Black Friday
                          </span>
                        )}
                        {v.is_featured && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-wsa-champagne/15 text-wsa-champagne border border-wsa-champagne/25">
                            Destaque
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={v.status}
                        onChange={(e) =>
                          handleQuickStatusChange(v, e.target.value as VehicleStatus)
                        }
                        className={`text-xs font-medium rounded-lg px-2.5 py-1 border bg-[#09090B] transition-colors ${
                          v.status === 'disponivel'
                            ? 'text-emerald-400 border-emerald-500/35'
                            : v.status === 'reservado'
                            ? 'text-wsa-champagne border-wsa-champagne/35'
                            : 'text-zinc-400 border-zinc-700'
                        }`}
                      >
                        <option value="disponivel">Disponível</option>
                        <option value="reservado">Reservado</option>
                        <option value="vendido">Vendido</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(v)}
                          className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-zinc-300 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v.id)}
                          className="p-2 rounded-lg bg-white/[0.04] hover:bg-red-950/50 text-zinc-400 hover:text-red-400 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="card-machined rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-display font-bold text-white mb-6">
              {editingVehicle ? 'Editar Veículo' : 'Cadastrar Veículo no Pátio'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Photo Upload Section */}
              <div className="p-4 rounded-2xl bg-[#09090B] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-wsa-champagne">
                    Galeria de Fotos ({images.length})
                  </span>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-wsa-red hover:bg-wsa-redDark text-white text-xs font-semibold cursor-pointer transition-colors">
                    {uploadingPhotos ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir fotos (Celular/PC)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      multiple
                      disabled={uploadingPhotos}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-400">{uploadError}</p>
                )}

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-24 h-16 rounded-lg overflow-hidden border border-white/15 flex-shrink-0 group"
                      >
                        <img
                          src={img}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center text-[10px]"
                          title="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional External URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Ou cole o link direto de uma imagem (https://...)"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#121215] border border-white/[0.08] rounded-xl text-white text-xs focus:outline-none focus:border-white/25"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] text-xs text-zinc-200 font-medium inline-flex items-center gap-1"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Título do anúncio
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Honda Civic LXR 2.0 i-VTEC"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs focus:outline-none focus:border-white/25"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Honda"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Civic"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Versão
                  </label>
                  <input
                    type="text"
                    placeholder="LXR 2.0 Flex"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Ano Fab.
                  </label>
                  <input
                    type="number"
                    value={yearFab}
                    onChange={(e) => setYearFab(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Ano Mod.
                  </label>
                  <input
                    type="number"
                    value={yearModel}
                    onChange={(e) => setYearModel(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Km
                  </label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Câmbio
                  </label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs"
                  >
                    <option value="Automático">Automático</option>
                    <option value="Manual">Manual</option>
                    <option value="Automático CVT">Automático CVT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Preço tabela (R$)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Preço promocional
                  </label>
                  <input
                    type="number"
                    placeholder="Opcional"
                    value={promoPrice || ''}
                    onChange={(e) =>
                      setPromoPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Entrada sugerida (R$)
                  </label>
                  <input
                    type="number"
                    value={downPayment || ''}
                    onChange={(e) =>
                      setDownPayment(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Texto da parcela
                  </label>
                  <input
                    type="text"
                    placeholder="48x de R$ 1.690"
                    value={installment}
                    onChange={(e) => setInstallment(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Cor
                  </label>
                  <input
                    type="text"
                    placeholder="Preto Cristal"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Final da placa
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="4"
                    value={plateEnd}
                    onChange={(e) => setPlateEnd(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Opcionais (separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Bancos em couro, Câmera de ré, Ar digital..."
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#09090B] border border-white/[0.08] rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-5 pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBlackFriday}
                    onChange={(e) => setIsBlackFriday(e.target.checked)}
                    className="rounded accent-wsa-red"
                  />
                  <span>Campanha Black Friday</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded accent-wsa-red"
                  />
                  <span>Destacar no topo</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-wsa-red hover:bg-wsa-redDark text-white font-semibold text-xs shadow-crimson-subtle disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
