import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthSupabase,
  isAuthorizedAdminEmail,
  isContingencyPassword,
  setAdminAuthCookies,
  syncAdminUserInSupabase,
} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '').trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Informe e-mail e senha.' },
        { status: 400 }
      );
    }

    const authClient = getAuthSupabase();
    if (!authClient) {
      return NextResponse.json(
        { error: 'Configuração de autenticação Supabase indisponível.' },
        { status: 500 }
      );
    }

    let { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    // Auto-sincronização inteligente caso o e-mail autorizado use uma das senhas válidas
    if ((error || !data?.session) && isAuthorizedAdminEmail(email) && isContingencyPassword(password)) {
      const synced = await syncAdminUserInSupabase(email, password);
      if (synced.ok) {
        const retry = await authClient.auth.signInWithPassword({
          email,
          password,
        });
        data = retry.data;
        error = retry.error;
      }
    }

    if (error || !data?.session) {
      return NextResponse.json(
        {
          error:
            'Credenciais inválidas no Supabase Auth. Confira o e-mail/senha ou utilize a opção de redefinição rápida abaixo.',
        },
        { status: 401 }
      );
    }

    const userEmail = data.user?.email || email;
    const response = NextResponse.json({
      authenticated: true,
      email: userEmail,
      mode: 'supabase',
    });

    setAdminAuthCookies(response, request, userEmail, data.session.access_token);

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Falha ao processar autenticação com o Supabase.' },
      { status: 500 }
    );
  }
}
