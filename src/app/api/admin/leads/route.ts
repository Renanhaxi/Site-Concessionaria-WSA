import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, verifyAdminRequest } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ configured: false, leads: null });
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ configured: true, leads: data || [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ configured: false });
  }

  try {
    const { id, status, commission_status } = await request.json();

    const { data, error } = await supabase
      .from('leads')
      .update({ status, commission_status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ configured: true, lead: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro ao atualizar comissão.' },
      { status: 500 }
    );
  }
}
