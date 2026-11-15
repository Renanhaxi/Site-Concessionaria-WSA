import { NextRequest, NextResponse } from 'next/server';
import { getAuthSupabase, setAdminAuthCookies } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = String(body?.access_token || '').trim();
    const type = String(body?.type || 'magiclink').trim();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso ausente.' },
        { status: 400 }
      );
    }

    const authClient = getAuthSupabase();
    if (!authClient) {
      return NextResponse.json(
        { error: 'Configuração Supabase Auth indisponível.' },
        { status: 500 }
      );
    }

    const { data, error } = await authClient.auth.getUser(accessToken);
    if (error || !data?.user?.email) {
      return NextResponse.json(
        { error: 'Link expirado ou token inválido no Supabase Auth.' },
        { status: 401 }
      );
    }

    const email = data.user.email.toLowerCase();
    const response = NextResponse.json({
      authenticated: true,
      email,
      type,
      mode: 'supabase',
    });

    setAdminAuthCookies(response, request, email, accessToken);

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Falha ao validar token de acesso do Supabase.' },
      { status: 500 }
    );
  }
}
