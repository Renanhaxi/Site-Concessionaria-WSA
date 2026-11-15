import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, verifyAdminRequest } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ configured: false, vehicle: null });
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { configured: true, vehicle: null },
      { status: 404 }
    );
  }

  return NextResponse.json({ configured: true, vehicle: data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updatePayload: Record<string, any> = {
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
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('vehicles')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ configured: true, vehicle: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro ao atualizar veículo.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ configured: false });
  }

  const { error } = await supabase.from('vehicles').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ configured: true, ok: true });
}
