import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, verifyAdminRequest } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ configured: false, vehicles: null });
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase GET /vehicles error:', error.message);
    return NextResponse.json(
      { configured: true, error: error.message, vehicles: null },
      { status: 500 }
    );
  }

  return NextResponse.json({ configured: true, vehicles: data || [] });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ configured: false, vehicle: null });
  }

  try {
    const body = await request.json();

    const insertPayload = {
      title: String(body.title || '').trim(),
      brand: String(body.brand || '').trim(),
      model: String(body.model || '').trim(),
      version: body.version ? String(body.version).trim() : null,
      year_fab: Number(body.year_fab),
      year_model: Number(body.year_model),
      mileage: Number(body.mileage || 0),
      fuel_type: body.fuel_type || 'Flex',
      transmission: body.transmission || 'Automático',
      color: body.color || null,
      plate_end: body.plate_end ? String(body.plate_end).slice(0, 2) : null,
      price: Number(body.price),
      promotional_price: body.promotional_price ? Number(body.promotional_price) : null,
      down_payment_suggested: body.down_payment_suggested
        ? Number(body.down_payment_suggested)
        : null,
      installment_suggested: body.installment_suggested || null,
      features: Array.isArray(body.features) ? body.features : [],
      images: Array.isArray(body.images) ? body.images : [],
      is_featured: Boolean(body.is_featured),
      is_black_friday: Boolean(body.is_black_friday),
      status: body.status || 'disponivel',
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ configured: true, vehicle: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro ao cadastrar veículo.' },
      { status: 500 }
    );
  }
}
