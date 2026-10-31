import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSupabase } from '@/lib/supabase/server';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function generateSecureLeadCode(): string {
  const num = crypto.randomInt(1000, 9999);
  return `WSA-${num}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim().slice(0, 120);
    const phone = String(body.phone || '').trim().slice(0, 30);

    if (!name || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { error: 'Nome e WhatsApp válido são obrigatórios.' },
        { status: 400 }
      );
    }

    const lead_code = generateSecureLeadCode();
    const forwardedFor = request.headers.get('x-forwarded-for') || 'local';
    const ip_hash = crypto
      .createHash('sha256')
      .update(`wsa-salt:${forwardedFor.split(',')[0]}`)
      .digest('hex')
      .slice(0, 24);

    const supabase = getServerSupabase();

    if (supabase) {
      const validUuid =
        body.vehicle_id && UUID_REGEX.test(String(body.vehicle_id))
          ? String(body.vehicle_id)
          : null;

      const insertPayload = {
        lead_code,
        name,
        phone,
        intent_type: String(body.intent_type || 'compra_estoque').slice(0, 50),
        vehicle_id: validUuid,
        vehicle_title: body.vehicle_title
          ? String(body.vehicle_title).slice(0, 150)
          : null,
        vehicle_price: body.vehicle_price ? Number(body.vehicle_price) : null,
        notes: body.notes ? String(body.notes).slice(0, 1000) : null,
        utm_source: body.utms?.utm_source
          ? String(body.utms.utm_source).slice(0, 100)
          : null,
        utm_medium: body.utms?.utm_medium
          ? String(body.utms.utm_medium).slice(0, 100)
          : null,
        utm_campaign: body.utms?.utm_campaign
          ? String(body.utms.utm_campaign).slice(0, 100)
          : null,
        utm_term: body.utms?.utm_term
          ? String(body.utms.utm_term).slice(0, 100)
          : null,
        referrer: body.utms?.referrer
          ? String(body.utms.referrer).slice(0, 255)
          : null,
        ip_hash,
        status: 'novo',
        commission_status: 'pendente',
        commission_value: 1000.0,
      };

      const { data, error } = await supabase
        .from('leads')
        .insert([insertPayload])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json(
          { configured: true, success: true, lead: data },
          { status: 201 }
        );
      }

      console.error('Supabase POST /api/lead error:', error?.message);
    }

    // Fallback estruturado quando .env.local ainda não estiver conectado ao Supabase
    return NextResponse.json(
      {
        configured: false,
        success: true,
        lead: {
          id: `wsa-lead-${Date.now()}`,
          lead_code,
          name,
          phone,
          intent_type: body.intent_type || 'compra_estoque',
          vehicle_id: body.vehicle_id,
          vehicle_title: body.vehicle_title,
          vehicle_price: body.vehicle_price,
          notes: body.notes,
          utm_source: body.utms?.utm_source,
          utm_medium: body.utms?.utm_medium,
          utm_campaign: body.utms?.utm_campaign,
          utm_term: body.utms?.utm_term,
          referrer: body.utms?.referrer,
          status: 'novo',
          commission_status: 'pendente',
          commission_value: 1000.0,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API Lead Error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar protocolo de lead.' },
      { status: 500 }
    );
  }
}
