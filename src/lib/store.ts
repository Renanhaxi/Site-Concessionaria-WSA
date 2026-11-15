import { Vehicle, Lead, UtmParams, LeadIntentType } from '@/types';
import { INITIAL_VEHICLES, INITIAL_LEADS } from './mockData';

const VEHICLES_KEY = 'wsa_local_vehicles_v2';
const LEADS_KEY = 'wsa_local_leads_v2';

function getLocalVehicles(): Vehicle[] {
  if (typeof window === 'undefined') return INITIAL_VEHICLES;
  try {
    const data = window.localStorage.getItem(VEHICLES_KEY);
    if (!data) {
      window.localStorage.setItem(VEHICLES_KEY, JSON.stringify(INITIAL_VEHICLES));
      return INITIAL_VEHICLES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_VEHICLES;
  }
}

function setLocalVehicles(vehicles: Vehicle[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  } catch {}
}

function getLocalLeads(): Lead[] {
  if (typeof window === 'undefined') return INITIAL_LEADS;
  try {
    const data = window.localStorage.getItem(LEADS_KEY);
    if (!data) {
      window.localStorage.setItem(LEADS_KEY, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_LEADS;
  }
}

function setLocalLeads(leads: Lead[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  } catch {}
}

// ----------------- VEÍCULOS (VIA API SEGURA DO SERVIDOR) -----------------

export async function fetchVehicles(): Promise<Vehicle[]> {
  try {
    const res = await fetch('/api/vehicles', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.configured && Array.isArray(json.vehicles)) {
        return json.vehicles as Vehicle[];
      }
    }
  } catch {}

  return getLocalVehicles();
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const res = await fetch(`/api/vehicles/${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json.configured && json.vehicle) {
        return json.vehicle as Vehicle;
      }
    }
  } catch {}

  const list = getLocalVehicles();
  return list.find((v) => v.id === id) || null;
}

export async function saveVehicle(
  vehicle: Partial<Vehicle> & {
    title: string;
    brand: string;
    model: string;
    price: number;
  }
): Promise<Vehicle> {
  const isUpdate = Boolean(vehicle.id);

  try {
    const res = await fetch(
      isUpdate
        ? `/api/vehicles/${encodeURIComponent(vehicle.id!)}`
        : '/api/vehicles',
      {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicle),
      }
    );

    if (res.ok) {
      const json = await res.json();
      if (json.configured && json.vehicle) {
        return json.vehicle as Vehicle;
      }
    }
  } catch {}

  // Fallback local
  const list = getLocalVehicles();
  if (isUpdate) {
    const updated = list.map((v) =>
      v.id === vehicle.id ? ({ ...v, ...vehicle } as Vehicle) : v
    );
    setLocalVehicles(updated);
    return updated.find((v) => v.id === vehicle.id)!;
  }

  const newVehicle: Vehicle = {
    id: `wsa-veh-${Date.now()}`,
    title: vehicle.title,
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version || '',
    year_fab: vehicle.year_fab || new Date().getFullYear(),
    year_model: vehicle.year_model || new Date().getFullYear(),
    mileage: vehicle.mileage || 0,
    fuel_type: vehicle.fuel_type || 'Flex',
    transmission: vehicle.transmission || 'Automático',
    color: vehicle.color || 'Prata',
    plate_end: vehicle.plate_end || '0',
    price: vehicle.price,
    promotional_price: vehicle.promotional_price,
    down_payment_suggested: vehicle.down_payment_suggested,
    installment_suggested: vehicle.installment_suggested,
    features: vehicle.features || [],
    images:
      vehicle.images && vehicle.images.length > 0
        ? vehicle.images
        : [
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=85',
          ],
    is_featured: vehicle.is_featured ?? false,
    is_black_friday: vehicle.is_black_friday ?? false,
    status: vehicle.status || 'disponivel',
    created_at: new Date().toISOString(),
  };

  list.unshift(newVehicle);
  setLocalVehicles(list);
  return newVehicle;
}

export async function deleteVehicle(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/vehicles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const json = await res.json();
      if (json.configured) return true;
    }
  } catch {}

  const list = getLocalVehicles();
  setLocalVehicles(list.filter((v) => v.id !== id));
  return true;
}

// ----------------- LEADS & COMISSÃO (ATÔMICO NO SERVIDOR) -----------------

export interface CreateLeadPayload {
  name: string;
  phone: string;
  intent_type: LeadIntentType;
  vehicle_id?: string;
  vehicle_title?: string;
  vehicle_price?: number;
  notes?: string;
  utms?: UtmParams;
}

export async function registerLead(payload: CreateLeadPayload): Promise<Lead> {
  const res = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Falha ao registrar protocolo de atendimento.');
  }

  const json = await res.json();
  const createdLead = json.lead as Lead;

  // Se o Supabase ainda não estiver conectado, também salva no armazenamento local de demonstração
  if (!json.configured) {
    const leads = getLocalLeads();
    leads.unshift(createdLead);
    setLocalLeads(leads);
  }

  return createdLead;
}

export async function fetchLeads(): Promise<Lead[]> {
  try {
    const res = await fetch('/api/admin/leads', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.configured && Array.isArray(json.leads)) {
        return json.leads as Lead[];
      }
    }
  } catch {}

  return getLocalLeads();
}

export async function updateLeadStatus(
  id: string,
  status: Lead['status'],
  commission_status: Lead['commission_status']
): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, commission_status }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.configured) return true;
    }
  } catch {}

  const leads = getLocalLeads();
  setLocalLeads(
    leads.map((l) => (l.id === id ? { ...l, status, commission_status } : l))
  );
  return true;
}
