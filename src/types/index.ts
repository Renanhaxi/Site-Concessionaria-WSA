export type VehicleStatus = 'disponivel' | 'reservado' | 'vendido';

export interface Vehicle {
  id: string;
  title: string;
  brand: string;
  model: string;
  version?: string;
  year_fab: number;
  year_model: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  color?: string;
  plate_end?: string;
  price: number;
  promotional_price?: number;
  down_payment_suggested?: number;
  installment_suggested?: string;
  features: string[];
  images: string[];
  is_featured?: boolean;
  is_black_friday?: boolean;
  status: VehicleStatus;
  created_at?: string;
}

export type LeadIntentType =
  | 'compra_estoque'
  | 'encomenda_personalizada'
  | 'troca_fipe'
  | 'consignacao'
  | 'simulacao_financiamento';

export type LeadStatus = 'novo' | 'em_negociacao' | 'fechado' | 'perdido';
export type CommissionStatus = 'pendente' | 'confirmada' | 'paga' | 'recusada';

export interface Lead {
  id: string;
  vehicle_id?: string;
  lead_code: string; // Ex: WSA-9421
  name: string;
  phone: string;
  intent_type: LeadIntentType;
  vehicle_title?: string;
  vehicle_price?: number;
  notes?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  referrer?: string;
  status: LeadStatus;
  commission_status: CommissionStatus;
  commission_value: number;
  created_at: string;
}

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
}
