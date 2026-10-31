'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { Vehicle, LeadIntentType } from '@/types';
import { getStoredUtmParams } from '@/lib/utmTracker';
import { registerLead } from '@/lib/store';
import { buildWhatsAppLink } from '@/lib/whatsapp';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  intentType?: LeadIntentType;
  customTitle?: string;
  customSubtitle?: string;
  initialNotes?: string;
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  vehicle,
  intentType = 'compra_estoque',
  customTitle,
  customSubtitle,
  initialNotes = '',
}: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);
  const [leadCode, setLeadCode] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLeadCode(null);
      setWhatsAppUrl('');
      setErrorMessage('');
      setNotes(initialNotes || '');
    }
  }, [isOpen, initialNotes]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
    if (!name.trim()) {
      setErrorMessage('Informe seu nome para gerar o atendimento.');
      return;
    }
    const rawDigits = phone.replace(/\D/g, '');
    if (rawDigits.length < 10) {
      setErrorMessage('Informe um número de WhatsApp válido com DDD.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const utms = getStoredUtmParams();

      const createdLead = await registerLead({
        name,
        phone,
        intent_type: intentType,
        vehicle_id: vehicle?.id,
        vehicle_title: vehicle?.title,
        vehicle_price: vehicle?.promotional_price || vehicle?.price,
        notes: notes || undefined,
        utms,
      });

      const link = buildWhatsAppLink({
        leadCode: createdLead.lead_code,
        customerName: name,
        vehicleTitle: vehicle?.title,
        vehiclePrice: vehicle?.promotional_price || vehicle?.price,
        intentType,
        notes: notes || undefined,
      });

      setLeadCode(createdLead.lead_code);
      setWhatsAppUrl(link);
      setLoading(false);

      // Immediate popup or mobile deep-link handoff
      const win = window.open(link, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.assign(link);
      }
    } catch (err) {
      console.error('Erro ao registrar atendimento:', err);
      setErrorMessage('Não foi possível concluir agora. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-[460px] bg-[#121216] border-t sm:border border-white/[0.1] rounded-t-3xl sm:rounded-2xl p-6 sm:p-7 pb-8 sm:pb-7 shadow-machined animate-sheet-up pb-safe"
      >
        {/* Mobile Bottom Sheet Handle */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-white/15 mx-auto mb-5" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] transition-colors"
          aria-label="Fechar janela"
        >
          <X className="w-4 h-4" />
        </button>

        {!leadCode ? (
          <div>
            <div className="inline-flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.15em] text-wsa-champagne mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-wsa-red" />
              <span>Atendimento Direto WSA</span>
            </div>

            <h3 className="text-xl sm:text-[22px] font-display font-bold tracking-[-0.02em] text-white pr-8 leading-snug">
              {customTitle ||
                (vehicle ? `Negociar ${vehicle.model}` : 'Falar com Consultor')}
            </h3>

            <p className="text-xs sm:text-[13.5px] text-zinc-400 mt-1.5 leading-relaxed">
              {customSubtitle ||
                'Preencha abaixo para gerar seu protocolo exclusivo e iniciar a conversa direto no WhatsApp da loja.'}
            </p>

            {/* Selected Vehicle Summary Card */}
            {vehicle && (
              <div className="mt-4 p-3 rounded-xl bg-[#0A0A0D] border border-white/[0.07] flex items-center gap-3">
                <div className="w-16 h-11 rounded-lg overflow-hidden bg-black flex-shrink-0">
                  <img
                    src={vehicle.images[0]}
                    alt={vehicle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-zinc-200 truncate">
                    {vehicle.title}
                  </h4>
                  <p className="text-sm font-display font-bold tabular-nums text-white mt-0.5">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      maximumFractionDigits: 0,
                    }).format(vehicle.promotional_price || vehicle.price)}
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Seu nome
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ex: Carlos Mendes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-3.5 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  WhatsApp com DDD
                </label>
                <input
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(91) 98888-8888"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full h-12 px-3.5 bg-[#09090B] border border-white/[0.09] focus:border-white/[0.28] rounded-xl text-base sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                  Observação (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tenho veículo na troca ou desejo simular entrada"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#09090B] border border-white/[0.08] focus:border-white/[0.25] rounded-xl text-base sm:text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 px-6 rounded-xl font-semibold text-sm text-white bg-wsa-red hover:bg-wsa-redDark active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-crimson-subtle disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gerando protocolo...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuar no WhatsApp</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                <span>Atendimento registrado com protocolo de segurança WSA.</span>
              </p>
            </form>
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-6 h-6" strokeWidth={2.2} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold text-white">
                Protocolo registrado
              </h3>
              <p className="text-xs text-zinc-400">
                Seu código exclusivo de atendimento foi vinculado ao consultor.
              </p>
            </div>

            <div className="py-3 px-6 bg-[#09090B] border border-white/[0.09] rounded-xl inline-block">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                Protocolo WSA
              </span>
              <span className="text-2xl font-mono font-bold text-wsa-champagne tracking-wider">
                {leadCode}
              </span>
            </div>

            <div className="pt-2 space-y-2.5">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setTimeout(onClose, 600)}
                className="w-full h-12 px-6 rounded-xl bg-wsa-red hover:bg-wsa-redDark text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-crimson-subtle transition-colors"
              >
                <span>Abrir conversa no WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Voltar ao catálogo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
