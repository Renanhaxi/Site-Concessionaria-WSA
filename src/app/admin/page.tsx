'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PlusCircle,
} from 'lucide-react';
import { Vehicle, Lead } from '@/types';
import { fetchVehicles, fetchLeads } from '@/lib/store';

export default function AdminDashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [vData, lData] = await Promise.all([fetchVehicles(), fetchLeads()]);
      setVehicles(vData);
      setLeads(lData);
      setLoading(false);
    }
    load();
  }, []);

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === 'disponivel').length;
  const totalLeads = leads.length;
  const pendingLeads = leads.filter((l) => l.commission_status === 'pendente').length;
  const confirmedLeads = leads.filter((l) => l.commission_status === 'confirmada' || l.commission_status === 'paga').length;
  const estimatedCommissions = totalLeads * 1000;
  const confirmedCommissions = confirmedLeads * 1000;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
            Painel Geral do Showroom
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Métricas de captação de leads, controle de estoque e proteção de comissões WSA.
          </p>
        </div>

        <Link
          href="/admin/estoque"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-wsa-red hover:bg-wsa-redDark text-white font-bold text-xs shadow-lg shadow-wsa-red/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Veículo</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Estoque */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Estoque Total</span>
            <Car className="w-4 h-4 text-wsa-red" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-display">{totalVehicles}</span>
            <span className="text-xs text-emerald-400 font-medium">
              ({availableVehicles} disponíveis)
            </span>
          </div>
          <p className="text-[11px] text-gray-500">Veículos ativos no catálogo online</p>
        </div>

        {/* Total Leads */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Leads Rastreados</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-display">{totalLeads}</span>
            <span className="text-xs text-wsa-gold font-medium">
              ({pendingLeads} em negociação)
            </span>
          </div>
          <p className="text-[11px] text-gray-500">Com protocolo único gerado</p>
        </div>

        {/* Comissões em Aberto */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Comissões em Aberto</span>
            <Clock className="w-4 h-4 text-wsa-gold" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-wsa-gold font-display">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                estimatedCommissions
              )}
            </span>
          </div>
          <p className="text-[11px] text-gray-500">Base: R$ 1.000 / lead gerado</p>
        </div>

        {/* Comissões Confirmadas */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Comissões Validadas</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                confirmedCommissions
              )}
            </span>
          </div>
          <p className="text-[11px] text-gray-500">{confirmedLeads} vendas com conciliação</p>
        </div>
      </div>

      {/* Recent Leads Table Overview */}
      <div className="bg-surface border border-surface-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              Últimos Leads Gerados com Protocolo
            </h3>
            <p className="text-xs text-gray-400">
              Cada lead possui código único inviolável para proteção da comissão de venda.
            </p>
          </div>

          <Link
            href="/admin/leads"
            className="text-xs text-wsa-red hover:underline font-semibold flex items-center gap-1"
          >
            <span>Ver Todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#26262F] text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-3">Protocolo</th>
                <th className="py-3 px-3">Cliente</th>
                <th className="py-3 px-3">WhatsApp</th>
                <th className="py-3 px-3">Interesse / Carro</th>
                <th className="py-3 px-3">Origem (UTM)</th>
                <th className="py-3 px-3">Comissão</th>
                <th className="py-3 px-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F28] text-gray-200">
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="hover:bg-[#1A1A22] transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded">
                      {lead.lead_code}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-white">{lead.name}</td>
                  <td className="py-3.5 px-3 text-gray-300">{lead.phone}</td>
                  <td className="py-3.5 px-3">
                    <span className="line-clamp-1 text-gray-300">
                      {lead.vehicle_title || (lead.intent_type === 'troca_fipe' ? 'Troca FIPE' : 'Encomenda Hunter')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-gray-400">
                    <span className="bg-[#121217] px-2 py-0.5 rounded border border-[#22222E]">
                      {lead.utm_source || 'Direto'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        lead.commission_status === 'confirmada' || lead.commission_status === 'paga'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-900/40 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {lead.commission_status === 'confirmada' || lead.commission_status === 'paga'
                        ? 'Confirmada (R$ 1k)'
                        : 'Pendente (R$ 1k)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-gray-400">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
