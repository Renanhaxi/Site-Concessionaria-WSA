'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Instagram, MapPin, ShieldCheck, Lock } from 'lucide-react';
import WsaLogo from './WsaLogo';
import LeadCaptureModal from './LeadCaptureModal';
import { WSA_PHONE_DISPLAY } from '@/lib/whatsapp';

export default function Footer() {
  const pathname = usePathname();
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <footer className="bg-[#070709] border-t border-white/[0.06] text-zinc-400 text-xs pt-14 pb-24 lg:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* Brand & Corporate Registry */}
            <div className="lg:col-span-5 space-y-4">
              <Link href="/" className="inline-block">
                <WsaLogo size="md" />
              </Link>

              <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed max-w-md">
                Showroom de seminovos selecionados em Belém do Pará. Compromisso com laudo cautelar aprovado, negociação transparente e valorização de até 90% da FIPE na troca.
              </p>

              <div className="pt-2 space-y-1 text-[11px] font-mono text-zinc-500">
                <p>WSA Comércio de Veículos Ltda</p>
                <p>CNPJ 52.255.211/0001-79 · Associada ASSOVEPA</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[11px] font-mono font-semibold text-zinc-200 uppercase tracking-[0.14em]">
                Catálogo
              </h4>
              <ul className="space-y-2.5 text-[13px]">
                <li>
                  <Link href="/#estoque" className="hover:text-white transition-colors">
                    Estoque atual
                  </Link>
                </li>
                <li>
                  <Link
                    href="/fipe-troca"
                    className="text-wsa-champagne hover:text-white transition-colors"
                  >
                    Troca até 90% FIPE
                  </Link>
                </li>
                <li>
                  <Link href="/encomenda" className="hover:text-white transition-colors">
                    Encomenda sob medida
                  </Link>
                </li>
                <li>
                  <Link href="/#localizacao" className="hover:text-white transition-colors">
                    Showroom Belém
                  </Link>
                </li>
              </ul>
            </div>

            {/* Guarantees */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[11px] font-mono font-semibold text-zinc-200 uppercase tracking-[0.14em]">
                Padrão WSA
              </h4>
              <ul className="space-y-2.5 text-[12.5px] text-zinc-400">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-wsa-champagne flex-shrink-0" />
                  <span>Laudo Cautelar 100%</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-wsa-champagne flex-shrink-0" />
                  <span>Garantia Motor e Câmbio</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-wsa-champagne flex-shrink-0" />
                  <span>Sem Leilão ou Sinistro</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-wsa-champagne flex-shrink-0" />
                  <span>Consignação Executiva</span>
                </li>
              </ul>
            </div>

            {/* Contact Channels */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-[11px] font-mono font-semibold text-zinc-200 uppercase tracking-[0.14em]">
                Atendimento
              </h4>
              <div className="space-y-2.5 text-[13px]">
                <button
                  type="button"
                  onClick={() => setLeadModalOpen(true)}
                  className="flex items-center gap-2 text-zinc-200 hover:text-white font-mono font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-wsa-red" />
                  <span>{WSA_PHONE_DISPLAY}</span>
                </button>

                <a
                  href="https://instagram.com/wsa_veiculos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-zinc-400" />
                  <span>@wsa_veiculos</span>
                </a>

                <p className="flex items-start gap-2 text-zinc-500 pt-1 text-xs leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Tv. Alferes Costa, 486 — Sacramenta, Belém/PA · 66123-030</span>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
            <p>© {new Date().getFullYear()} WSA Comércio de Veículos Ltda. Todos os direitos reservados.</p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Acesso Administrativo</span>
            </Link>
          </div>
        </div>
      </footer>

      <LeadCaptureModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        intentType="compra_estoque"
        customTitle="Atendimento Comercial WSA"
        customSubtitle="Identifique-se rapidamente para falar direto no WhatsApp da loja."
      />
    </>
  );
}
