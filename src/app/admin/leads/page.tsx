'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  Phone,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { Lead, CommissionStatus, LeadStatus } from '@/types';
import { fetchLeads, updateLeadStatus } from '@/lib/store';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [commissionFilter, setCommissionFilter] = useState<string>('todos');

  const loadLeads = async () => {
    setLoading(true);
    const data = await fetchLeads();
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: LeadStatus,
    commissionStatus: CommissionStatus
  ) => {
    await updateLeadStatus(id, status, commissionStatus);
    loadLeads();
  };

  const filtered = leads.filter((l) => {
    const matchesSearch =
      l.lead_code.toLowerCase().includes(search.toLowerCase()) ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      (l.vehicle_title && l.vehicle_title.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (commissionFilter !== 'todos' && l.commission_status !== commissionFilter) {
      return false;
    }

    return true;
  });

  const totalCommissionsValue = filtered.reduce(
    (acc, curr) => acc + (curr.commission_value || 1000),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
          Auditoria de Leads & Proteção de Comissões
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Rastreie a origem de cada cliente gerado pela plataforma digital e audite as comissões de venda fechadas no showroom.
        </p>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-surface-border">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código WSA-XXXX, nome, telefone ou carro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0B0B0E] border border-surface-border rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-wsa-red"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={commissionFilter}
            onChange={(e) => setCommissionFilter(e.target.value)}
            className="bg-[#0B0B0E] border border-surface-border rounded-xl text-white text-xs px-3 py-2.5 focus:border-wsa-red"
          >
            <option value="todos">Todas as Comissões</option>
            <option value="pendente">Apenas Pendentes</option>
            <option value="confirmada">Apenas Confirmadas</option>
            <option value="paga">Apenas Pagas</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#26262F] text-gray-400 uppercase tracking-wider bg-[#0E0E14]">
                <th className="py-3.5 px-4">Código Inviolável</th>
                <th className="py-3.5 px-4">Cliente & Contato</th>
                <th className="py-3.5 px-4">Interesse / Veículo</th>
                <th className="py-3.5 px-4">Atribuição de Marketing</th>
                <th className="py-3.5 px-4">Status da Comissão</th>
                <th className="py-3.5 px-4 text-right">Conciliação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F28] text-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Carregando leads...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Nenhum lead encontrado com estes filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#1A1A22] transition-colors">
                    {/* Código */}
                    <td className="py-4 px-4">
                      <div className="font-mono font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-2.5 py-1 rounded inline-block text-sm">
                        {lead.lead_code}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-white text-sm">{lead.name}</p>
                      <a
                        href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{lead.phone}</span>
                      </a>
                    </td>

                    {/* Interesse */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-semibold text-gray-200 truncate">
                        {lead.vehicle_title ||
                          (lead.intent_type === 'troca_fipe'
                            ? 'Troca de Usado 90% FIPE'
                            : 'Encomenda Hunter Personalizada')}
                      </p>
                      {lead.notes && (
                        <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5 italic">
                          "{lead.notes}"
                        </p>
                      )}
                    </td>

                    {/* Origem UTM */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        <span className="block text-gray-300">
                          <strong>Origem:</strong> {lead.utm_source || 'Direto'}
                        </span>
                        {lead.utm_campaign && (
                          <span className="block text-gray-400 text-[10px]">
                            Campanha: {lead.utm_campaign}
                          </span>
                        )}
                        {lead.referrer && (
                          <span className="block text-gray-500 text-[10px]">
                            Ref: {lead.referrer}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Comissão */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          lead.commission_status === 'paga'
                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/50'
                            : lead.commission_status === 'confirmada'
                            ? 'bg-blue-900/60 text-blue-300 border border-blue-500/50'
                            : 'bg-amber-900/50 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {lead.commission_status === 'paga' && '✓ Comissão Paga (R$ 1.000)'}
                        {lead.commission_status === 'confirmada' && '★ Venda Confirmada (R$ 1.000)'}
                        {lead.commission_status === 'pendente' && '⏳ Em Negociação (R$ 1.000)'}
                      </span>
                    </td>

                    {/* Ações de Conciliação */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lead.commission_status === 'pendente' && (
                          <button
                            onClick={() => handleUpdateStatus(lead.id, 'fechado', 'confirmada')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 border border-blue-500/50 text-blue-200 hover:text-white text-[10px] font-bold transition-all"
                            title="Confirmar que o cliente fechou negócio"
                          >
                            Confirmar Venda
                          </button>
                        )}

                        {lead.commission_status === 'confirmada' && (
                          <button
                            onClick={() => handleUpdateStatus(lead.id, 'fechado', 'paga')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/50 text-emerald-200 hover:text-white text-[10px] font-bold transition-all"
                            title="Registrar pagamento da comissão"
                          >
                            Marcar Paga
                          </button>
                        )}

                        {lead.commission_status === 'paga' && (
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Liquidado
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
