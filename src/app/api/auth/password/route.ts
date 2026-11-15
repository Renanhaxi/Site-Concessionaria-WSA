import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthSupabase,
  isAuthorizedAdminEmail,
  setAdminAuthCookies,
  syncAdminUserInSupabase,
  verifyAdminRequest,
} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestedEmail = String(body?.email || '').trim().toLowerCase();
    const newPassword = String(body?.newPassword || '').trim();
    const bodyToken = String(body?.access_token || '').trim();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    let targetEmail = '';

    // 1. Sessão administrativa ativa via cookie HttpOnly (incluindo link de recuperação)
    const session = await verifyAdminRequest(request);
    if (session.authorized && session.email) {
      targetEmail = session.email.trim().toLowerCase();
      if (requestedEmail && isAuthorizedAdminEmail(requestedEmail)) {
        targetEmail = requestedEmail;
      }
    }

    // 2. Token JWT passado diretamente do hash de recuperação
    if (!targetEmail && bodyToken) {
      const authClient = getAuthSupabase();
      if (authClient) {
        const { data, error } = await authClient.auth.getUser(bodyToken);
        if (!error && data?.user?.email) {
          targetEmail = data.user.email.trim().toLowerCase();
        }
      }
    }

    // 3. Redefinição direta na tela de login para os administradores autorizados da WSA
    if (!targetEmail && requestedEmail && isAuthorizedAdminEmail(requestedEmail)) {
      targetEmail = requestedEmail;
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: 'Não autorizado a redefinir a senha para este e-mail.' },
        { status: 401 }
      );
    }

    const synced = await syncAdminUserInSupabase(targetEmail, newPassword);
    if (!synced.ok) {
      return NextResponse.json(
        { error: synced.error || 'Falha ao atualizar senha no Supabase Auth.' },
        { status: 500 }
      );
    }

    // Autentica imediatamente no Supabase Auth para gerar JWT e registrar último acesso
    let freshAccessToken: string | undefined;
    const authClient = getAuthSupabase();
    if (authClient) {
      const { data: loginData } = await authClient.auth.signInWithPassword({
        email: targetEmail,
        password: newPassword,
      });
      freshAccessToken = loginData?.session?.access_token;
    }

    const response = NextResponse.json({
      ok: true,
      authenticated: true,
      email: targetEmail,
      mode: 'supabase',
    });

    setAdminAuthCookies(response, request, targetEmail, freshAccessToken);

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Erro interno ao redefinir senha no Supabase Auth.' },
      { status: 500 }
    );
  }
}
