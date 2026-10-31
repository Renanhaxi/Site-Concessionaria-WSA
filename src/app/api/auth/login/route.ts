import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  getAuthSupabase,
  getSupabaseConfig,
} from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Informe e-mail e senha.' },
        { status: 400 }
      );
    }

    const { isConfigured } = getSupabaseConfig();

    if (isConfigured) {
      const authClient = getAuthSupabase();
      if (!authClient) {
        return NextResponse.json(
          { error: 'Configuração de autenticação indisponível.' },
          { status: 500 }
        );
      }

      const { data, error } = await authClient.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data?.session) {
        return NextResponse.json(
          {
            error:
              'Credenciais inválidas no Supabase Auth. Verifique o usuário cadastrado em Authentication -> Users.',
          },
          { status: 401 }
        );
      }

      const response = NextResponse.json({
        authenticated: true,
        email: data.user.email,
        mode: 'supabase',
      });

      response.cookies.set(ADMIN_COOKIE_NAME, data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: data.session.expires_in || 60 * 60 * 8,
      });

      return response;
    }

    // Fallback de demonstração local enquanto .env.local ainda não foi preenchido
    const validDemo =
      (email === 'admin@wsaveiculos.com.br' && password === 'wsa2024') ||
      password === 'admin123';

    if (!validDemo) {
      return NextResponse.json(
        { error: 'Credenciais inválidas no modo demonstração.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      authenticated: true,
      email: email.trim(),
      mode: 'demo',
    });

    response.cookies.set(ADMIN_COOKIE_NAME, `demo:${email.trim()}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Falha ao processar autenticação.' },
      { status: 500 }
    );
  }
}
